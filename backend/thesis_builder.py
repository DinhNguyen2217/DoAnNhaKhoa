# -*- coding: utf-8 -*-
"""
Thesis builder module for Le Dinh Nguyen - 2251220246 - 22CT5
Topic: HE THONG QUAN LY VA DAT LICH PHONG KHAM NHA KHOA TRUC TUYEN
Truong Dai hoc Kien truc Da Nang (DAU) - Khoa CNTT
Strict styling:
- Font: Times New Roman 100%
- Color: 100% BLACK (#000000)
- Chapter titles: 14pt Bold Centered
- Headings (1, 1.1, 2.1...): 13pt Bold NOT italic
- Sub-headings (1.1.1, 2.1.1...): 13pt Bold AND italic
- Body text: 13pt Justified, 1.3 line spacing, 1.27cm indent
- Table content & headers: 13pt
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
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(0)
    if indent and align == WD_ALIGN_PARAGRAPH.JUSTIFY:
        p.paragraph_format.first_line_indent = Cm(1.27)
    
    if bold_prefix:
        # Prevent any duplication if text already begins with bold_prefix
        if text.startswith(bold_prefix):
            text = text[len(bold_prefix):].lstrip()
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = 'Times New Roman'
        r_bold.font.size = Pt(font_size)
        r_bold.font.bold = True
        r_bold.font.color.rgb = COLOR_BLACK
            
    if text:
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(font_size)
        r.font.bold = bold_all
        r.font.italic = italic
        r.font.color.rgb = COLOR_BLACK
    return p

def add_bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Cm(1.27)
    p.paragraph_format.first_line_indent = Cm(-0.63)
    
    r_bullet = p.add_run("- ")
    r_bullet.font.name = 'Times New Roman'
    r_bullet.font.size = Pt(13)
    r_bullet.font.bold = True
    r_bullet.font.color.rgb = COLOR_BLACK
    
    if bold_prefix:
        if text.startswith(bold_prefix):
            text = text[len(bold_prefix):].lstrip()
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = 'Times New Roman'
        r_bold.font.size = Pt(13)
        r_bold.font.bold = True
        r_bold.font.color.rgb = COLOR_BLACK
        
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_BLACK
    return p

def add_chapter_title(doc, text):
    """Chapter Title: 14pt, Bold, Centered, Black, 2 blank lines before text"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing = 1.3
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(18) # 2 blank lines
    p.paragraph_format.keep_with_next = True
    
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = COLOR_BLACK
    return p

def add_heading_1(doc, text):
    """Section Heading (Mục 1.1, 2.1...): 13pt, Bold, NOT italic, Black, Left"""
    h = doc.add_heading(text, level=2)
    h.alignment = WD_ALIGN_PARAGRAPH.LEFT
    h.paragraph_format.space_before = Pt(10)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    for r in h.runs:
        r.font.name = 'Times New Roman'
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.italic = False
        r.font.color.rgb = COLOR_BLACK
    return h

def add_heading_2(doc, text):
    """Sub-section Heading (Tiểu mục 1.1.1, 2.1.1...): 13pt, Bold AND Italic, Black, Left"""
    h = doc.add_heading(text, level=3)
    h.alignment = WD_ALIGN_PARAGRAPH.LEFT
    h.paragraph_format.space_before = Pt(6)
    h.paragraph_format.space_after = Pt(2)
    h.paragraph_format.keep_with_next = True
    for r in h.runs:
        r.font.name = 'Times New Roman'
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.italic = True
        r.font.color.rgb = COLOR_BLACK
    return h

def add_code(doc, code_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl, color="B0C4DE", sz="4", val="single")
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
    
    p = cell.paragraphs[0]
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(2)
    
    r = p.add_run(code_text)
    r.font.name = 'Consolas'
    r.font.size = Pt(9.5)
    r.font.color.rgb = COLOR_BLACK
    
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(2)
    sp.paragraph_format.space_after = Pt(4)

def add_table_custom(doc, headers, rows_data, col_widths=None):
    """Creates table where ALL text inside is strictly 13pt, Black, Times New Roman"""
    table = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table, color="7F7F7F", sz="4", val="single")
    
    # Headers
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], "F2F2F2")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(13) # Strictly 13pt
            r.font.bold = True
            r.font.color.rgb = COLOR_BLACK
            
    # Body rows
    for row_idx, row_data in enumerate(rows_data):
        row_cells = table.rows[row_idx + 1].cells
        bg_color = "FFFFFF" if row_idx % 2 == 0 else "FAFAFA"
        for col_idx, cell_value in enumerate(row_data):
            row_cells[col_idx].text = str(cell_value)
            set_cell_background(row_cells[col_idx], bg_color)
            set_cell_margins(row_cells[col_idx], top=90, bottom=90, left=100, right=100)
            p = row_cells[col_idx].paragraphs[0]
            if col_idx == 0 or len(str(cell_value)) < 15:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(13) # Strictly 13pt
                r.font.color.rgb = COLOR_BLACK
                
    if col_widths:
        for row in table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = width

    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(2)
    sp.paragraph_format.space_after = Pt(4)

def add_figure_marker(doc, figure_id, figure_title, note_content, img_path=None, width_inch=5.8):
    """Standardized Figure insertion / marker block"""
    # Caption above or image
    if img_path and os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=Inches(width_inch))
    else:
        # Prominent marker box
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

    # Caption BELOW figure: "Hình 1.1: Tên hình" (Center, 13pt, Regular/Italic, Black)
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(4)
    p_cap.paragraph_format.space_after = Pt(8)
    r_cap = p_cap.add_run(f"{figure_id}: {figure_title}")
    r_cap.font.name = 'Times New Roman'
    r_cap.font.size = Pt(13)
    r_cap.font.bold = False
    r_cap.font.color.rgb = COLOR_BLACK

def add_table_marker(doc, table_id, table_title):
    """Caption ABOVE table: "Bảng 1.1: Tên bảng" (Center, 13pt, Regular, Black)"""
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(8)
    p_cap.paragraph_format.space_after = Pt(4)
    r_cap = p_cap.add_run(f"{table_id}: {table_title}")
    r_cap.font.name = 'Times New Roman'
    r_cap.font.size = Pt(13)
    r_cap.font.bold = False
    r_cap.font.color.rgb = COLOR_BLACK

print("thesis_builder ready.")
