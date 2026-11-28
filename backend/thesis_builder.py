# -*- coding: utf-8 -*-
"""
Thesis builder module for Le Dinh Nguyen - 2251220246 - 22CT5
Topic: HE THONG QUAN LY VA DAT LICH PHONG KHAM NHA KHOA TRUC TUYEN
Truong Dai hoc Kien truc Da Nang (DAU) - Khoa CNTT
Strict styling:
- Font: Times New Roman 100%
- Color: 100% BLACK (#000000)
- Chapter titles: 14pt Bold Centered, Word Outline Level 0, Bookmark
- Headings 1 (Mục 1, 1.1, 2.1...): 13pt Bold NOT italic, Left, Word Outline Level 1, Bookmark
- Headings 2 (Tiểu mục 1.1.1, 2.1.1...): 13pt Bold AND italic, Left, Word Outline Level 2, Bookmark
- Body text: 13pt Justified, 1.3 line spacing, 1.27cm indent
- Table content & headers: 13pt Times New Roman Black
- Margins: Left=3.0cm, Right=2.0cm, Top=2.5cm, Bottom=2.5cm
- Header & Footer from edge: 1.6cm
"""

import os
import docx
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

ARTIFACTS_DIR = r"C:\Users\Administrator\.gemini\antigravity\brain\7c066d36-0a8a-47ee-9f6b-f0187499eb65"
COLOR_BLACK = RGBColor(0, 0, 0)
_BOOKMARK_COUNTER = 0

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="7F7F7F", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def add_p(doc, text="", bold_prefix=None, indent=True, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=4, bold_all=False, italic=False, font_size=13):
    """Standardized academic paragraph: 13pt Times New Roman, Black, 1.3 lines"""
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    if indent:
        p.paragraph_format.first_line_indent = Cm(1.27)
    else:
        p.paragraph_format.first_line_indent = Cm(0)
        
    if bold_prefix:
        if text.startswith(bold_prefix):
            text = text[len(bold_prefix):].lstrip()
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Times New Roman'
        r_pre.font.size = Pt(font_size)
        r_pre.font.bold = True
        r_pre.font.italic = italic
        r_pre.font.color.rgb = COLOR_BLACK
        
    if text:
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(font_size)
        r.font.bold = bold_all
        r.font.italic = italic
        r.font.color.rgb = COLOR_BLACK
    return p

def add_bullet(doc, text, bold_prefix=None):
    """Academic bullet point: 13pt Times New Roman, Black, 1.3 lines"""
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Cm(1.27)
    p.paragraph_format.first_line_indent = Cm(-0.63)
    
    if bold_prefix:
        if text.startswith(bold_prefix):
            text = text[len(bold_prefix):].lstrip()
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Times New Roman'
        r_pre.font.size = Pt(13)
        r_pre.font.bold = True
        r_pre.font.color.rgb = COLOR_BLACK
    elif ":" in text and len(text.split(":")[0]) < 80:
        parts = text.split(":", 1)
        r_pre = p.add_run(parts[0] + ": ")
        r_pre.font.name = 'Times New Roman'
        r_pre.font.size = Pt(13)
        r_pre.font.bold = True
        r_pre.font.color.rgb = COLOR_BLACK
        text = parts[1].lstrip()
        
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.bold = False
    r.font.color.rgb = COLOR_BLACK
    return p

def add_chapter_title(doc, text, bookmark_name=None):
    """Chapter Title: 14pt, Bold, Centered, Black, Word Outline Level 0, Bookmark"""
    global _BOOKMARK_COUNTER
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(18)
    p.paragraph_format.keep_with_next = True
    
    # Word Outline Level 0 (TOC Level 1)
    pPr = p._p.get_or_add_pPr()
    outlineLvl = parse_xml(f'<w:outlineLvl {nsdecls("w")} w:val="0"/>')
    pPr.append(outlineLvl)
    
    if bookmark_name:
        _BOOKMARK_COUNTER += 1
        bm_id = str(_BOOKMARK_COUNTER)
        bm_start = parse_xml(f'<w:bookmarkStart {nsdecls("w")} w:id="{bm_id}" w:name="{bookmark_name}"/>')
        p._p.append(bm_start)
        
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = COLOR_BLACK
    
    if bookmark_name:
        bm_end = parse_xml(f'<w:bookmarkEnd {nsdecls("w")} w:id="{bm_id}"/>')
        p._p.append(bm_end)
        
    return p

def add_heading_1(doc, text, bookmark_name=None):
    """Section Heading (Mục 1, 1.1, 2.1...): 13pt, Bold, NOT italic, Black, Left, Word Outline Level 1, Bookmark"""
    global _BOOKMARK_COUNTER
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    
    # Word Outline Level 1 (TOC Level 2)
    pPr = p._p.get_or_add_pPr()
    outlineLvl = parse_xml(f'<w:outlineLvl {nsdecls("w")} w:val="1"/>')
    pPr.append(outlineLvl)
    
    if bookmark_name:
        _BOOKMARK_COUNTER += 1
        bm_id = str(_BOOKMARK_COUNTER)
        bm_start = parse_xml(f'<w:bookmarkStart {nsdecls("w")} w:id="{bm_id}" w:name="{bookmark_name}"/>')
        p._p.append(bm_start)
        
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.italic = False
    r.font.color.rgb = COLOR_BLACK
    
    if bookmark_name:
        bm_end = parse_xml(f'<w:bookmarkEnd {nsdecls("w")} w:id="{bm_id}"/>')
        p._p.append(bm_end)
        
    return p

def add_heading_2(doc, text, bookmark_name=None):
    """Sub-section Heading (Tiểu mục 1.1.1, 2.1.1...): 13pt, Bold AND Italic, Black, Left, Word Outline Level 2, Bookmark"""
    global _BOOKMARK_COUNTER
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    
    # Word Outline Level 2 (TOC Level 3)
    pPr = p._p.get_or_add_pPr()
    outlineLvl = parse_xml(f'<w:outlineLvl {nsdecls("w")} w:val="2"/>')
    pPr.append(outlineLvl)
    
    if bookmark_name:
        _BOOKMARK_COUNTER += 1
        bm_id = str(_BOOKMARK_COUNTER)
        bm_start = parse_xml(f'<w:bookmarkStart {nsdecls("w")} w:id="{bm_id}" w:name="{bookmark_name}"/>')
        p._p.append(bm_start)
        
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.italic = True
    r.font.color.rgb = COLOR_BLACK
    
    if bookmark_name:
        bm_end = parse_xml(f'<w:bookmarkEnd {nsdecls("w")} w:id="{bm_id}"/>')
        p._p.append(bm_end)
        
    return p

def add_toc_entry(doc, title, page_str, bookmark_name, level=1):
    """Hyperlinked Word TOC entry with dot leader at right margin (9071 dxa / 16.0cm)"""
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.2
    p.paragraph_format.space_before = Pt(3 if level == 1 else 0)
    p.paragraph_format.space_after = Pt(2)
    
    if level == 2:
        p.paragraph_format.left_indent = Cm(0.5)
    elif level == 3:
        p.paragraph_format.left_indent = Cm(1.0)
        
    pPr = p._p.get_or_add_pPr()
    tabs = parse_xml(f'<w:tabs {nsdecls("w")}><w:tab w:val="right" w:leader="dot" w:pos="9071"/></w:tabs>')
    pPr.append(tabs)
    
    hl = parse_xml(f'<w:hyperlink {nsdecls("w")} w:anchor="{bookmark_name}" w:history="1"/>')
    
    bold_tag = "<w:b/>" if level == 1 else ""
    italic_tag = "<w:i/>" if level == 3 else ""
    r_t = parse_xml(f'''<w:r {nsdecls("w")}>
        <w:rPr>
            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
            <w:color w:val="000000"/>
            <w:sz w:val="26"/>
            {bold_tag}
            {italic_tag}
        </w:rPr>
        <w:t>{title}</w:t>
    </w:r>''')
    hl.append(r_t)
    
    r_tab = parse_xml(f'<w:r {nsdecls("w")}><w:tab/></w:r>')
    hl.append(r_tab)
    
    r_pref = parse_xml(f'''<w:r {nsdecls("w")}>
        <w:rPr>
            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
            <w:color w:val="000000"/>
            <w:sz w:val="26"/>
            {bold_tag}
        </w:rPr>
        <w:fldChar w:fldCharType="begin"/>
    </w:r>''')
    hl.append(r_pref)
    
    r_pinstr = parse_xml(f'''<w:r {nsdecls("w")}>
        <w:rPr><w:sz w:val="26"/></w:rPr>
        <w:instrText xml:space="preserve"> PAGEREF {bookmark_name} \\h </w:instrText>
    </w:r>''')
    hl.append(r_pinstr)
    
    r_psep = parse_xml(f'<w:r {nsdecls("w")}><w:fldChar w:fldCharType="separate"/></w:r>')
    hl.append(r_psep)
    
    r_ptxt = parse_xml(f'''<w:r {nsdecls("w")}>
        <w:rPr>
            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
            <w:color w:val="000000"/>
            <w:sz w:val="26"/>
            {bold_tag}
        </w:rPr>
        <w:t>{page_str}</w:t>
    </w:r>''')
    hl.append(r_ptxt)
    
    r_pend = parse_xml(f'<w:r {nsdecls("w")}><w:fldChar w:fldCharType="end"/></w:r>')
    hl.append(r_pend)
    
    p._p.append(hl)
    return p

def add_code(doc, code_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl, color="CCCCCC", sz="4", val="single")
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "FAFAFA")
    set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
    p = cell.paragraphs[0]
    p.paragraph_format.line_spacing = 1.05
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(code_text.strip())
    r.font.name = 'Consolas'
    r.font.size = Pt(9.5)
    r.font.color.rgb = COLOR_BLACK
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(2)
    sp.paragraph_format.space_after = Pt(4)

def add_table_custom(doc, headers, rows_data, col_widths=None):
    """
    Standardized academic table:
    - ALL cells (headers & data) have 13pt Times New Roman Black font
    - Light gray header shading (#EAEAEA)
    - Clean borders
    """
    tbl = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl, color="7F7F7F", sz="4", val="single")
    
    hdr_cells = tbl.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], "EAEAEA")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(13)
            r.font.bold = True
            r.font.color.rgb = COLOR_BLACK

    for r_idx, row_values in enumerate(rows_data):
        row_cells = tbl.rows[r_idx + 1].cells
        for c_idx, val in enumerate(row_values):
            row_cells[c_idx].text = str(val)
            bg = "FAFAFA" if r_idx % 2 == 1 else "FFFFFF"
            set_cell_background(row_cells[c_idx], bg)
            set_cell_margins(row_cells[c_idx], top=100, bottom=100, left=140, right=140)
            p = row_cells[c_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if (c_idx == 0 and len(str(val)) <= 15) or (c_idx == len(row_values)-1 and len(str(val)) <= 8) else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(13)
                r.font.bold = (c_idx == 0) or (c_idx == len(row_values)-1 and str(val).isdigit())
                r.font.color.rgb = COLOR_BLACK

    if col_widths:
        for row in tbl.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = width

    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(2)
    sp.paragraph_format.space_after = Pt(6)
    return tbl

def add_figure_marker(doc, figure_id, figure_title, note_content, img_path=None, width_inch=5.8):
    """Standardized Figure insertion / marker block"""
    if img_path and os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=Inches(width_inch))
    else:
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl, color="000000", sz="6", val="dashed")
        cell = tbl.cell(0, 0)
        set_cell_background(cell, "F5F5F5")
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r1 = p.add_run(f"[VỊ TRÍ CHÈN {figure_id.upper()}: {figure_title.upper()}]\n")
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(13)
        r1.font.bold = True
        r1.font.color.rgb = COLOR_BLACK
        r2 = p.add_run(f"(Ghi chú: {note_content})")
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(13)
        r2.font.italic = True
        r2.font.color.rgb = COLOR_BLACK

    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(4)
    p_cap.paragraph_format.space_after = Pt(8)
    r_cap = p_cap.add_run(f"{figure_id}: {figure_title}")
    r_cap.font.name = 'Times New Roman'
    r_cap.font.size = Pt(13)
    r_cap.font.bold = False
    r_cap.font.color.rgb = COLOR_BLACK
    return p_cap

def add_table_marker(doc, table_id, table_title):
    """Standardized Table caption placed ABOVE the table"""
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(8)
    p_cap.paragraph_format.space_after = Pt(4)
    r_cap = p_cap.add_run(f"{table_id}: {table_title}")
    r_cap.font.name = 'Times New Roman'
    r_cap.font.size = Pt(13)
    r_cap.font.bold = True
    r_cap.font.italic = True
    r_cap.font.color.rgb = COLOR_BLACK
    return p_cap

print("thesis_builder ready.")
