#!/usr/bin/env python3
"""
读取最新 trade-leads CSV（旧英文格式），按新12分制中文格式重新输出。
新增「开发信预览」列：对意向分≥7 且有邮箱的线索自动生成开发信。
"""
import csv
import os
import re
import sys
import glob
from urllib.parse import quote

# 加载项目根目录 .env（简单解析，不依赖第三方库）
_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(_env_path):
    with open(_env_path) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _, _v = _line.partition("=")
                os.environ.setdefault(_k.strip(), _v.strip())

EXPORT_DIR = os.path.expanduser("~/Desktop/矿机客户线索")
B_END_TYPES = {"distributor", "dealer", "reseller", "trader"}
SPANISH_MARKETS = {"Peru", "Chile", "Colombia", "Mexico", "México",
                   "Bolivia", "Ecuador", "Venezuela", "Argentina"}

INVENTORY_ES = (
    "• Trituradora de mandíbula PE600×900 (alimentación máx. 500 mm, capacidad 50–180 t/h)\n"
    "• Trituradora de cono Symons (fina/media/gruesa, capacidad 36–600 t/h)"
)
INVENTORY_EN = (
    "• PE600×900 jaw crusher (max feed 500 mm, capacity 50–180 t/h)\n"
    "• Symons cone crusher (fine/medium/coarse, capacity 36–600 t/h)"
)

LATIN_WORDS = re.compile(r'trituradora|mandíbula|cono|molino|chancadora|zaranda', re.IGNORECASE)

_WA  = os.getenv("MAIL_WHATSAPP", "+8613800000000")
_WEB = os.getenv("MAIL_WEBSITE",  "www.example.com")
SENDER_FOOTER_ES = f"Linda\nMINA SC – Maquinaria Industrial para Minería\nWhatsApp: {_WA}\nWeb: {_WEB}"
SENDER_FOOTER_EN = f"Linda\nMINA SC – Industrial Machinery for Mining\nWhatsApp: {_WA}\nWeb: {_WEB}"


# ─── 评分 ──────────────────────────────────────────────────────
def intent_score(ai_score: int, is_price_inquiry: bool) -> int:
    return min(12, ai_score + (2 if is_price_inquiry else 0))


def intent_level(score: int) -> str:
    if score >= 10: return "🔴极高"
    if score >= 7:  return "🟠高"
    if score >= 4:  return "🟡中"
    return "🟢低"


# ─── 标记 ──────────────────────────────────────────────────────
def special_flags(row: dict, score12: int) -> str:
    flags = []
    if (row.get("Price Inquiry") or "").upper() == "YES":
        flags.append("🔥价格询盘")
    ct = (row.get("Company Type") or "").lower()
    if ct in B_END_TYPES:
        flags.append("⭐经销商")
    if (row.get("Source") or "").lower() == "tender":
        flags.append("📋招标")
    if (row.get("Source") or "").lower() == "project":
        flags.append("🏗️项目")
    if (row.get("Emails") or "").strip():
        flags.append("📧有邮箱")
    if (row.get("WhatsApp") or "").strip():
        flags.append("💬有WA")
    return " ".join(flags)


def client_segment(ct: str) -> str:
    return "B端" if ct.lower() in B_END_TYPES else "C端"


def follow_priority(ct: str, score12: int) -> str:
    if ct.lower() in B_END_TYPES: return "🟡 经销商"
    if score12 >= 10: return "🔴 极优先"
    if score12 >= 7:  return "🔴 优先"
    if score12 >= 5:  return "🟠 跟进"
    return "🟢 普通"


# ─── 链接格式化 ────────────────────────────────────────────────
def format_whatsapp_links(raw: str) -> str:
    if not (raw or "").strip():
        return ""
    links = []
    for part in raw.split("|"):
        digits = "".join(c for c in part if c.isdigit())
        if len(digits) >= 8:
            links.append(f"https://wa.me/{digits}")
    return " | ".join(links)


def linkedin_url(company: str) -> str:
    if not company or company.lower() in ("unknown", ""):
        return ""
    return f"https://www.linkedin.com/search/results/people/?keywords={quote(company + ' mining equipment')}"


def google_osint_url(company: str, market: str) -> str:
    if not company or company.lower() in ("unknown", ""):
        return ""
    return f"https://www.google.com/search?q={quote(chr(34) + company + chr(34) + ' ' + market + ' mining')}"


# ─── 开发信生成 ────────────────────────────────────────────────
def clean_product(raw: str, lang: str) -> str:
    """过滤 unknown 和语言错配的产品词。"""
    if not raw or raw.lower() == "unknown":
        return "equipo de trituración" if lang == "es" else "crushing equipment"
    if lang == "en" and LATIN_WORDS.search(raw):
        return "crushing equipment"
    return raw


def compose_email(company: str, market: str, needs: str, product_match: str, to_email: str) -> str:
    lang = "es" if market in SPANISH_MARKETS else "en"
    co   = company if company and company.lower() not in ("unknown", "") else (
           "su empresa" if lang == "es" else "your company")
    prod = clean_product(product_match, lang)
    item = needs or prod

    if lang == "es":
        subject = f"Oferta: {prod} disponible para entrega inmediata – MINA SC"
        body = (
            f"Estimado equipo de {co},\n\n"
            f"Me pongo en contacto desde MINA SC, especialistas en maquinaria para minería y canteras.\n\n"
            f"Hemos identificado que {co} opera en el sector minero en {market} y podría estar evaluando "
            f"soluciones para {item}. Por ello, me permito compartirles nuestra disponibilidad de stock actual:\n\n"
            f"{INVENTORY_ES}\n\n"
            f"Ambos equipos están disponibles para envío inmediato, con documentación técnica completa y "
            f"soporte post-venta. Ofrecemos precios competitivos FOB y podemos coordinar el transporte hasta su destino.\n\n"
            f"¿Le gustaría recibir nuestra cotización detallada o las fichas técnicas? "
            f"Podemos agendar una llamada esta semana a su conveniencia.\n\n"
            f"Quedo a su entera disposición.\n\n"
            f"Saludos cordiales,\n"
            f"{SENDER_FOOTER_ES}"
        )
    else:
        subject = f"In-stock offer: {prod} – ready to ship | MINA SC"
        body = (
            f"Dear {co} team,\n\n"
            f"I'm reaching out from MINA SC, a specialist supplier of mining and quarry machinery.\n\n"
            f"We noticed that {co} is active in the mining sector in {market} and may be evaluating "
            f"options for {item}. I wanted to share our current in-stock availability:\n\n"
            f"{INVENTORY_EN}\n\n"
            f"Both units are ready to ship immediately, with full technical documentation and after-sales support. "
            f"We offer competitive FOB pricing and can arrange freight to your destination.\n\n"
            f"Would you like a detailed quotation or technical datasheets? "
            f"We're happy to schedule a call this week at your convenience.\n\n"
            f"Looking forward to hearing from you.\n\n"
            f"Best regards,\n"
            f"{SENDER_FOOTER_EN}"
        )

    return f"【主题】{subject}\n\n{body}"


# ─── 文件查找 ───────────────────────────────────────────────────
def find_latest_csv(directory: str) -> str:
    pattern = os.path.join(directory, "trade-leads-*.csv")
    files = [f for f in glob.glob(pattern) if "_重新分析" not in f]
    if not files:
        print(f"ERROR: 找不到 CSV 文件 in {directory}")
        sys.exit(1)
    return max(files, key=os.path.getmtime)


# ─── 主转换逻辑 ────────────────────────────────────────────────
def reformat(src_path: str) -> str:
    basename = os.path.splitext(os.path.basename(src_path))[0]
    dst_path = os.path.join(EXPORT_DIR, f"{basename}_重新分析.csv")

    out_rows = []
    email_preview_count = 0

    with open(src_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f, restval="")
        for row in reader:
            try:
                ai_score = int(float(row.get("AI Score") or 0))
            except (ValueError, TypeError):
                ai_score = 0

            is_pi   = (row.get("Price Inquiry") or "").upper() == "YES"
            score12 = intent_score(ai_score, is_pi)
            company = (row.get("Company Name") or "").strip()
            ct      = (row.get("Company Type") or "").strip()
            market  = (row.get("Market") or "").strip()
            emails  = (row.get("Emails") or "").strip()
            needs   = (row.get("Needs Identified") or "").strip()
            prod    = (row.get("Product Match") or "").strip()

            # 生成开发信预览（仅意向分≥7 且有邮箱）
            first_email = emails.split("|")[0].strip() if emails else ""
            if score12 >= 7 and first_email:
                email_preview = compose_email(company, market, needs, prod, first_email)
                email_preview_count += 1
            else:
                email_preview = ""

            out_rows.append({
                "意向分":           score12,
                "意向等级":         intent_level(score12),
                "特殊标记":         special_flags(row, score12),
                "姓名":             "",
                "公司名":           company,
                "邮箱":             emails,
                "电话":             (row.get("Phones") or "").strip(),
                "WhatsApp链接":     format_whatsapp_links(row.get("WhatsApp") or ""),
                "LinkedIn搜索链接": linkedin_url(company),
                "Google OSINT":    google_osint_url(company, market),
                "市场":             market,
                "客户类型":         client_segment(ct),
                "跟进优先级":       follow_priority(ct, score12),
                "设备需求":         needs,
                "产品匹配":         prod,
                "开发建议":         (row.get("Suggested Approach") or "").strip(),
                "意向原因":         (row.get("Intent Reason") or "").strip(),
                "来源关键词":       (row.get("Keyword") or "").strip(),
                "URL":              (row.get("URL") or "").strip(),
                "摘要":             (row.get("Snippet") or "").strip(),
                "发现时间":         (row.get("First Seen") or row.get("Timestamp") or "").strip(),
                "开发信预览":       email_preview,
            })

    if not out_rows:
        print("WARNING: 源文件为空，未写入任何数据")
        return dst_path

    fieldnames = list(out_rows[0].keys())
    with open(dst_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(out_rows)

    return dst_path, email_preview_count


if __name__ == "__main__":
    src = find_latest_csv(EXPORT_DIR)
    print(f"读取: {src}")
    dst, email_count = reformat(src)
    print(f"输出: {dst}")

    with open(dst, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    total  = len(rows)
    high   = sum(1 for r in rows if int(r["意向分"]) >= 10)
    mid    = sum(1 for r in rows if 7 <= int(r["意向分"]) < 10)
    wa     = sum(1 for r in rows if r["WhatsApp链接"])
    email  = sum(1 for r in rows if r["邮箱"])

    print(f"\n共 {total} 条线索")
    print(f"  🔴极高(10-12分): {high} 条")
    print(f"  🟠高(7-9分):     {mid} 条")
    print(f"  📧 有邮箱:        {email} 条")
    print(f"  💬 有WhatsApp:    {wa} 条")
    print(f"  ✉️  生成开发信:    {email_count} 封（意向分≥7 且有邮箱）")
