# -*- coding: utf-8 -*-
import docx

doc_path = r"C:\Users\Administrator\dental-clinic\Bao_Cao_Do_An_Tot_Nghiep_Nha_Khoa.docx"
doc = docx.Document(doc_path)

bookmarks = []
outline_lvls = {0: 0, 1: 0, 2: 0}

for p in doc.paragraphs:
    xml = p._p.xml
    if "outlineLvl" in xml:
        for lvl in [0, 1, 2]:
            if f'w:val="{lvl}"' in xml:
                outline_lvls[lvl] += 1
    if "bookmarkStart" in xml:
        import re
        bms = re.findall(r'w:name="([^"]+)"', xml)
        bookmarks.extend(bms)

print(f"Total Bookmarks Found: {len(bookmarks)}")
print("Bookmarks Sample (first 15):", bookmarks[:15])
print("Bookmarks Sample (last 10):", bookmarks[-10:])
print(f"Outline Levels Count: {outline_lvls}")

# Check Table of Contents paras
print("\n--- TOC Paras Sample ---")
toc_paras = [p for p in doc.paragraphs if "hyperlink" in p._p.xml and "_Toc" in p._p.xml]
print(f"Total TOC Hyperlink Paras: {len(toc_paras)}")
for p in toc_paras[:8]:
    print("  ", p.text)
for p in toc_paras[-6:]:
    print("  ", p.text)

# Check List of Tables & Figures Tables
print("\n--- Scientific Tables for Lists ---")
print("Table 1 (Danh mục bảng biểu):", doc.tables[2].rows[0].cells[0].text, "|", doc.tables[2].rows[0].cells[1].text, "|", doc.tables[2].rows[0].cells[2].text)
print("  Total rows in Table List:", len(doc.tables[2].rows))
print("Table 2 (Danh mục hình vẽ):", doc.tables[3].rows[0].cells[0].text, "|", doc.tables[3].rows[0].cells[1].text, "|", doc.tables[3].rows[0].cells[2].text)
print("  Total rows in Figure List:", len(doc.tables[3].rows))
