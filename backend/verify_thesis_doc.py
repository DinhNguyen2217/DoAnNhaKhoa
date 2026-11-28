# -*- coding: utf-8 -*-
import docx

doc_path = r"C:\Users\Administrator\dental-clinic\Bao_Cao_Do_An_Tot_Nghiep_Nha_Khoa.docx"
doc = docx.Document(doc_path)

print(f"Total Paragraphs: {len(doc.paragraphs)}")
print(f"Total Tables: {len(doc.tables)}")

deposit_keywords = ["đặt cọc", "tiền cọc", "tiền đặt cọc", "dat coc", "tien coc"]
deposit_found = []

fonts = set()
font_sizes = set()
colors = set()

for i, p in enumerate(doc.paragraphs):
    text = p.text
    for kw in deposit_keywords:
        if kw in text.lower():
            deposit_found.append((f"p[{i}]", text[:80]))
    for r in p.runs:
        if r.font.name:
            fonts.add(r.font.name)
        if r.font.size:
            font_sizes.add(r.font.size.pt)
        if r.font.color and r.font.color.rgb:
            colors.add(str(r.font.color.rgb))

for t_idx, table in enumerate(doc.tables):
    for r_idx, row in enumerate(table.rows):
        for c_idx, cell in enumerate(row.cells):
            c_text = cell.text
            for kw in deposit_keywords:
                if kw in c_text.lower():
                    deposit_found.append((f"table[{t_idx}][{r_idx}][{c_idx}]", c_text[:80]))
            for p in cell.paragraphs:
                for r in p.runs:
                    if r.font.name:
                        fonts.add(r.font.name)
                    if r.font.size:
                        font_sizes.add(r.font.size.pt)
                    if r.font.color and r.font.color.rgb:
                        colors.add(str(r.font.color.rgb))

print("="*60)
print(f"DEPOSIT KEYWORDS FOUND: {len(deposit_found)}")
for loc, snippet in deposit_found:
    print(f"  {loc}: {snippet}")

print("="*60)
print(f"FONTS FOUND: {fonts}")
print(f"FONT SIZES FOUND: {sorted(list(font_sizes))}")
print(f"COLORS FOUND: {colors}")
print("="*60)
