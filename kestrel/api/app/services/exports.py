"""CSV, Excel and PDF exports with a provenance note on every file."""
from __future__ import annotations

import csv
import io
from datetime import datetime, timezone

from fastapi.responses import Response


def _cell(v):
    if v is None:
        return ""
    if isinstance(v, bool):
        return "yes" if v else "no"
    if isinstance(v, datetime):
        return v.isoformat()
    if isinstance(v, float):
        return round(v, 4)
    return v


def to_csv(cols, rows, note) -> bytes:
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow([c[0] for c in cols])
    for r in rows:
        w.writerow([_cell(r.get(k)) for _, k in cols])
    w.writerow([])
    w.writerow([f"# {note}"])
    w.writerow([f"# Exported {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} from Kestrel"])
    return buf.getvalue().encode("utf-8-sig")


def to_xlsx(title, cols, rows, note) -> bytes:
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Font, PatternFill
    from openpyxl.utils import get_column_letter
    wb = Workbook()
    ws = wb.active
    ws.title = title[:31]
    ws.append([c[0] for c in cols])
    for c in ws[1]:
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor="4F7CFF")
        c.alignment = Alignment(vertical="center")
    for r in rows:
        ws.append([_cell(r.get(k)) if not isinstance(r.get(k), datetime) else r.get(k).replace(tzinfo=None) for _, k in cols])
    ws.freeze_panes = "A2"
    for i, (h, k) in enumerate(cols, 1):
        width = max([len(str(h))] + [len(str(_cell(r.get(k)))) for r in rows[:300]])
        ws.column_dimensions[get_column_letter(i)].width = min(60, max(10, width + 2))
    ws.auto_filter.ref = ws.dimensions
    meta = wb.create_sheet("About")
    meta.append(["Report", title])
    meta.append(["Exported", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")])
    meta.append(["Notes", note])
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def to_pdf(title, cols, rows, note, subtitle="") -> bytes:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=landscape(A4), leftMargin=12 * mm, rightMargin=12 * mm, topMargin=12 * mm, bottomMargin=12 * mm, title=title)
    ss = getSampleStyleSheet()
    small = ss["BodyText"].clone("small", fontSize=7, leading=9)
    head = ss["BodyText"].clone("head", fontSize=7, leading=9, textColor=colors.white)
    story = [Paragraph(f"<b>{title}</b>", ss["Title"]), Paragraph(subtitle or f"Exported {datetime.now(timezone.utc).strftime('%d %b %Y %H:%M UTC')} · Kestrel", ss["BodyText"]), Spacer(1, 6)]
    max_cols = cols[:14]
    data = [[Paragraph(str(h), head) for h, _ in max_cols]]
    for r in rows[:500]:
        data.append([Paragraph(str(_cell(r.get(k)))[:120], small) for _, k in max_cols])
    t = Table(data, repeatRows=1)
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4F7CFF")), ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#D0D8E4")),
                           ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F3F6FA")]), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story += [t, Spacer(1, 8), Paragraph(f"<i>{note}</i>", small)]
    if len(rows) > 500:
        story.append(Paragraph(f"Showing the first 500 of {len(rows)} rows. Use CSV or Excel for the full set.", small))
    doc.build(story)
    return buf.getvalue()


def export_rows(title: str, cols, rows: list[dict], fmt: str = "csv", note: str = "", subtitle: str = "") -> Response:
    safe = "".join(ch if ch.isalnum() else "-" for ch in title.lower()).strip("-")
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    if fmt == "xlsx":
        body, mime, ext = to_xlsx(title, cols, rows, note), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"
    elif fmt == "pdf":
        body, mime, ext = to_pdf(title, cols, rows, note, subtitle), "application/pdf", "pdf"
    else:
        body, mime, ext = to_csv(cols, rows, note), "text/csv; charset=utf-8", "csv"
    return Response(body, media_type=mime, headers={"content-disposition": f'attachment; filename="{safe}-{stamp}.{ext}"'})
