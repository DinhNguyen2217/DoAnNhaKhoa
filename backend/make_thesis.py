# -*- coding: utf-8 -*-
"""
Main execution script to generate the standardized graduation thesis document (.docx)
for Le Dinh Nguyen - 2251220246 - 22CT5
"""

import os
import shutil
import docx
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from thesis_builder import add_p
from thesis_sections import (
    build_front_matter,
    build_toc_and_lists,
    build_introduction,
    build_chapter_1,
    build_chapter_2,
    build_chapter_3,
    build_conclusion_and_back_matter
)

def run():
    print("Initializing document...")
    doc = docx.Document()
    
    # Page setup - A4, margins: Top=2.0cm, Bottom=2.0cm, Left=3.0cm, Right=2.0cm
    sec = doc.sections[0]
    sec.page_width = Cm(21.0)
    sec.page_height = Cm(29.7)
    sec.top_margin = Cm(2.0)
    sec.bottom_margin = Cm(2.0)
    sec.left_margin = Cm(3.0)
    sec.right_margin = Cm(2.0)
    
    # Enable automatic field updates in Word upon opening
    settings = doc.settings.element
    update_fields = parse_xml(f'<w:updateFields {nsdecls("w")} w:val="true"/>')
    settings.append(update_fields)
    
    # Default Normal style: Times New Roman, 13pt, justified
    normal = doc.styles['Normal']
    normal.font.name = 'Times New Roman'
    normal.font.size = Pt(13)
    normal.font.color.rgb = RGBColor(0, 0, 0)
    normal.paragraph_format.line_spacing = 1.3
    normal.paragraph_format.space_after = Pt(4)
    normal.paragraph_format.space_before = Pt(0)
    
    # Heading 1: Times New Roman, 14pt, Bold, Navy Blue
    h1 = doc.styles['Heading 1']
    h1.font.name = 'Times New Roman'
    h1.font.size = Pt(14)
    h1.font.bold = True
    h1.font.color.rgb = RGBColor(0, 51, 102)
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    h1.paragraph_format.keep_with_next = True
    
    # Heading 2: Times New Roman, 13pt, Bold, Navy Blue
    h2 = doc.styles['Heading 2']
    h2.font.name = 'Times New Roman'
    h2.font.size = Pt(13)
    h2.font.bold = True
    h2.font.color.rgb = RGBColor(0, 51, 102)
    h2.paragraph_format.space_before = Pt(10)
    h2.paragraph_format.space_after = Pt(4)
    h2.paragraph_format.keep_with_next = True
    
    # Heading 3: Times New Roman, 13pt, Bold, Italic
    h3 = doc.styles['Heading 3']
    h3.font.name = 'Times New Roman'
    h3.font.size = Pt(13)
    h3.font.bold = True
    h3.font.italic = True
    h3.font.color.rgb = RGBColor(0, 0, 0)
    h3.paragraph_format.space_before = Pt(6)
    h3.paragraph_format.space_after = Pt(2)
    h3.paragraph_format.keep_with_next = True

    # Footer Page Number
    footer = sec.footer
    footer_p = footer.paragraphs[0]
    footer_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    f_run = footer_p.add_run()
    f_run.font.name = 'Times New Roman'
    f_run.font.size = Pt(10)
    fld1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instr = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
    fld2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fld3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    f_run._r.append(fld1)
    f_run._r.append(instr)
    f_run._r.append(fld2)
    f_run._r.append(fld3)

    print("Building Front Matter...")
    build_front_matter(doc)
    
    print("Building Table of Contents & Lists...")
    build_toc_and_lists(doc)
    
    print("Building Merged Introduction...")
    build_introduction(doc)
    
    print("Building Chapter 1: Co So Ly Thuyet Va Cong Nghe...")
    build_chapter_1(doc)
    
    print("Building Chapter 2: Phan Tich Va Thiet Ke He Thong...")
    build_chapter_2(doc)
    
    print("Building Chapter 3: Xay Dung Va Kiem Thu He Thong...")
    build_chapter_3(doc)
    
    print("Building Conclusion, Note Table, References & Appendix...")
    build_conclusion_and_back_matter(doc)
    
    # Target output paths
    out_repo = r"C:\Users\Administrator\dental-clinic\Bao_Cao_Do_An_Tot_Nghiep_Nha_Khoa.docx"
    out_desktop = r"C:\Users\Administrator\Desktop\Bao_Cao_Do_An_Tot_Nghiep_Nha_Khoa_Moi_Nhat.docx"
    out_artifact = r"C:\Users\Administrator\.gemini\antigravity\brain\7c066d36-0a8a-47ee-9f6b-f0187499eb65\Bao_Cao_Do_An_Tot_Nghiep_Nha_Khoa.docx"
    
    doc.save(out_repo)
    print(f"Saved successfully to: {out_repo}")
    
    try:
        shutil.copy2(out_repo, out_desktop)
        print(f"Copied successfully to Desktop: {out_desktop}")
    except Exception as e:
        print(f"Desktop copy notice: {e}")
        
    try:
        shutil.copy2(out_repo, out_artifact)
        print(f"Copied successfully to Artifacts: {out_artifact}")
    except Exception as e:
        print(f"Artifact copy notice: {e}")

if __name__ == '__main__':
    run()
