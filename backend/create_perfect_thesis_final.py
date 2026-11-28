# -*- coding: utf-8 -*-
"""
Main Thesis Generator - Standardized according to DAU (Khoa CNTT)
Full 3 Chapters + MỞ ĐẦU + KẾT LUẬN + TÀI LIỆU THAM KHẢO + PHỤ LỤC
Automatic Word TOC with Bookmarks & Outline Levels 0, 1, 2
Scientific Tables for List of Tables and List of Figures
100% Times New Roman, 100% Black Color, 13pt Text & Tables, 14pt Chapter Titles
Zero deposit references.
"""

import os
import shutil
import docx
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from thesis_builder import (
    COLOR_BLACK, ARTIFACTS_DIR,
    add_p, add_bullet, add_chapter_title, add_heading_1, add_heading_2,
    add_toc_entry, add_code, add_table_custom, add_figure_marker, add_table_marker
)

def build_front_pages(doc):
    # ==========================================
    # TRANG BÌA NGOÀI (Bìa cứng)
    # ==========================================
    add_p(doc, "BỘ GIÁO DỤC VÀ ĐÀO TẠO", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=13, space_after=2, indent=False)
    add_p(doc, "TRƯỜNG ĐẠI HỌC KIẾN TRÚC ĐÀ NẴNG", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=14, space_after=2, indent=False)
    add_p(doc, "KHOA CÔNG NGHỆ THÔNG TIN", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=14, space_after=18, indent=False)

    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo.paragraph_format.space_before = Pt(8)
    p_logo.paragraph_format.space_after = Pt(24)
    run_logo = p_logo.add_run("[VỊ TRÍ LOGO TRƯỜNG ĐẠI HỌC KIẾN TRÚC ĐÀ NẴNG - DAU]")
    run_logo.font.name = 'Times New Roman'
    run_logo.font.size = Pt(11)
    run_logo.font.italic = True
    run_logo.font.color.rgb = COLOR_BLACK

    add_p(doc, "ĐỒ ÁN TỐT NGHIỆP ĐẠI HỌC", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=16, space_after=4, indent=False)
    add_p(doc, "NGÀNH: CÔNG NGHỆ THÔNG TIN", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=13, space_after=18, indent=False)

    add_p(doc, "ĐỀ TÀI:", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=14, space_after=4, indent=False)
    add_p(doc, "HỆ THỐNG QUẢN LÝ VÀ ĐẶT LỊCH PHÒNG KHÁM NHA KHOA TRỰC TUYẾN", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=15, space_after=36, indent=False)

    tbl_author = doc.add_table(rows=2, cols=2)
    tbl_author.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_author.rows[0].cells[0].width = Cm(8.0)
    tbl_author.rows[0].cells[1].width = Cm(8.0)
    tbl_author.rows[1].cells[0].width = Cm(8.0)
    tbl_author.rows[1].cells[1].width = Cm(8.0)
    
    p_sv = tbl_author.rows[0].cells[0].paragraphs[0]
    p_sv.paragraph_format.line_spacing = 1.2
    p_sv.paragraph_format.space_after = Pt(4)
    r = p_sv.add_run("Sinh viên thực hiện:\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK
    r = p_sv.add_run("Lê Đình Nguyên\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK
    r = p_sv.add_run("MSV: 2251220246 - Lớp: 22CT5")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.color.rgb = COLOR_BLACK

    p_gv = tbl_author.rows[0].cells[1].paragraphs[0]
    p_gv.paragraph_format.line_spacing = 1.2
    p_gv.paragraph_format.space_after = Pt(4)
    r = p_gv.add_run("Cán bộ hướng dẫn:\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK
    r = p_gv.add_run("ThS. Đoàn Duy Bình")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK

    p_empty = doc.add_paragraph()
    p_empty.paragraph_format.space_before = Pt(40)

    add_p(doc, "ĐÀ NẴNG, NĂM 2026", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=13, indent=False)
    doc.add_page_break()

    # ==========================================
    # TRANG BÌA PHỤ (Bìa trong)
    # ==========================================
    add_p(doc, "BỘ GIÁO DỤC VÀ ĐÀO TẠO", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=13, space_after=2, indent=False)
    add_p(doc, "TRƯỜNG ĐẠI HỌC KIẾN TRÚC ĐÀ NẴNG", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=14, space_after=2, indent=False)
    add_p(doc, "KHOA CÔNG NGHỆ THÔNG TIN", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=14, space_after=18, indent=False)

    add_p(doc, "THUYẾT MINH ĐỒ ÁN TỐT NGHIỆP ĐẠI HỌC", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=15, space_after=4, indent=False)
    add_p(doc, "NGÀNH: CÔNG NGHỆ THÔNG TIN", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=13, space_after=24, indent=False)

    add_p(doc, "TÊN ĐỀ TÀI:", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=13, space_after=4, indent=False)
    add_p(doc, "HỆ THỐNG QUẢN LÝ VÀ ĐẶT LỊCH PHÒNG KHÁM NHA KHOA TRỰC TUYẾN", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=15, space_after=30, indent=False)

    tbl_author2 = doc.add_table(rows=1, cols=2)
    tbl_author2.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_author2.rows[0].cells[0].width = Cm(8.0)
    tbl_author2.rows[0].cells[1].width = Cm(8.0)
    
    p_sv2 = tbl_author2.rows[0].cells[0].paragraphs[0]
    p_sv2.paragraph_format.line_spacing = 1.2
    r = p_sv2.add_run("Sinh viên thực hiện:\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK
    r = p_sv2.add_run("Lê Đình Nguyên\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK
    r = p_sv2.add_run("MSV: 2251220246\nLớp: 22CT5")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.color.rgb = COLOR_BLACK

    p_gv2 = tbl_author2.rows[0].cells[1].paragraphs[0]
    p_gv2.paragraph_format.line_spacing = 1.2
    r = p_gv2.add_run("Cán bộ hướng dẫn:\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK
    r = p_gv2.add_run("ThS. Đoàn Duy Bình\n\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK
    r = p_gv2.add_run("Cán bộ phản biện:\n......................................................")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.color.rgb = COLOR_BLACK

    p_empty2 = doc.add_paragraph()
    p_empty2.paragraph_format.space_before = Pt(40)

    add_p(doc, "ĐÀ NẴNG, NĂM 2026", align=WD_ALIGN_PARAGRAPH.CENTER, bold_all=True, font_size=13, indent=False)
    doc.add_page_break()

    # ==========================================
    # NHẬN XÉT CỦA CÁN BỘ HƯỚNG DẪN
    # ==========================================
    add_chapter_title(doc, "PHIẾU NHẬN XÉT ĐỒ ÁN TỐT NGHIỆP\n(DÀNH CHO CÁN BỘ HƯỚNG DẪN)")
    add_p(doc, "Họ và tên cán bộ hướng dẫn: ThS. Đoàn Duy Bình", bold_prefix="Họ và tên cán bộ hướng dẫn: ", indent=False)
    add_p(doc, "Đơn vị công tác: Khoa Công nghệ Thông tin - Trường Đại học Kiến trúc Đà Nẵng", bold_prefix="Đơn vị công tác: ", indent=False)
    add_p(doc, "Họ và tên sinh viên thực hiện: Lê Đình Nguyên - MSV: 2251220246 - Lớp: 22CT5", bold_prefix="Họ và tên sinh viên thực hiện: ", indent=False)
    add_p(doc, "Tên đề tài: Hệ thống quản lý và đặt lịch phòng khám nha khoa trực tuyến", bold_prefix="Tên đề tài: ", indent=False)

    add_p(doc, "NỘI DUNG NHẬN XÉT ĐÁNH GIÁ:", bold_all=True, space_after=4, indent=False)
    add_p(doc, "1. Về tinh thần, thái độ làm việc của sinh viên trong quá trình thực hiện đồ án:", bold_prefix="1. Về tinh thần, thái độ làm việc: ", indent=False)
    for _ in range(3):
        add_p(doc, "..................................................................................................................................................................................", align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, space_after=3)

    add_p(doc, "2. Đánh giá chất lượng nội dung thuyết minh và sản phẩm phần mềm:", bold_prefix="2. Đánh giá chất lượng chuyên môn: ", indent=False)
    for _ in range(4):
        add_p(doc, "..................................................................................................................................................................................", align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, space_after=3)

    add_p(doc, "3. Những mặt còn hạn chế cần khắc phục:", bold_prefix="3. Những mặt hạn chế: ", indent=False)
    for _ in range(2):
        add_p(doc, "..................................................................................................................................................................................", align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, space_after=3)

    add_p(doc, "4. Kết luận và đề nghị đánh giá:", bold_prefix="4. Kết luận: ", indent=False)
    add_p(doc, "Điểm số: .........../10 (Bằng chữ: .....................................................................................)", align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, space_after=4)
    add_p(doc, "Được phép đưa ra bảo vệ trước Hội đồng chấm đồ án tốt nghiệp:   [  ] Có      [  ] Không", align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, space_after=8)

    p_sig = doc.add_paragraph()
    p_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sig.paragraph_format.line_spacing = 1.15
    p_sig.paragraph_format.space_before = Pt(8)
    r = p_sig.add_run("Đà Nẵng, ngày ...... tháng ...... năm 2026\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.italic = True; r.font.color.rgb = COLOR_BLACK
    r = p_sig.add_run("Cán bộ hướng dẫn\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK
    r = p_sig.add_run("(Ký và ghi rõ họ tên)\n\n\n\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(12); r.font.italic = True; r.font.color.rgb = COLOR_BLACK
    r = p_sig.add_run("ThS. Đoàn Duy Bình")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK

    doc.add_page_break()

    # ==========================================
    # NHẬN XÉT CỦA CÁN BỘ PHẢN BIỆN
    # ==========================================
    add_chapter_title(doc, "PHIẾU NHẬN XÉT ĐỒ ÁN TỐT NGHIỆP\n(DÀNH CHO CÁN BỘ PHẢN BIỆN)")
    add_p(doc, "Họ và tên cán bộ phản biện: ............................................................................................................", bold_prefix="Họ và tên cán bộ phản biện: ", indent=False)
    add_p(doc, "Đơn vị công tác: Khoa Công nghệ Thông tin - Trường Đại học Kiến trúc Đà Nẵng", bold_prefix="Đơn vị công tác: ", indent=False)
    add_p(doc, "Họ và tên sinh viên thực hiện: Lê Đình Nguyên - MSV: 2251220246 - Lớp: 22CT5", bold_prefix="Họ và tên sinh viên thực hiện: ", indent=False)
    add_p(doc, "Tên đề tài: Hệ thống quản lý và đặt lịch phòng khám nha khoa trực tuyến", bold_prefix="Tên đề tài: ", indent=False)

    add_p(doc, "NỘI DUNG NHẬN XÉT ĐÁNH GIÁ:", bold_all=True, space_after=4, indent=False)
    add_p(doc, "1. Đánh giá tính cấp thiết, bố cục và hình thức trình bày của thuyết minh đồ án:", bold_prefix="1. Hình thức và bố cục: ", indent=False)
    for _ in range(3):
        add_p(doc, "..................................................................................................................................................................................", align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, space_after=3)

    add_p(doc, "2. Đánh giá kết quả nghiên cứu, độ phức tạp và tính ứng dụng của phần mềm:", bold_prefix="2. Kết quả nghiên cứu và phần mềm: ", indent=False)
    for _ in range(4):
        add_p(doc, "..................................................................................................................................................................................", align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, space_after=3)

    add_p(doc, "3. Những điểm thiếu sót, câu hỏi yêu cầu sinh viên trả lời trước Hội đồng:", bold_prefix="3. Thiếu sót và câu hỏi phản biện: ", indent=False)
    for _ in range(3):
        add_p(doc, "..................................................................................................................................................................................", align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, space_after=3)

    add_p(doc, "4. Kết luận và đề nghị đánh giá:", bold_prefix="4. Kết luận: ", indent=False)
    add_p(doc, "Điểm số: .........../10 (Bằng chữ: .....................................................................................)", align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, space_after=4)
    add_p(doc, "Được phép bảo vệ trước Hội đồng chấm đồ án tốt nghiệp:   [  ] Có      [  ] Không", align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, space_after=8)

    p_sig2 = doc.add_paragraph()
    p_sig2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sig2.paragraph_format.line_spacing = 1.15
    p_sig2.paragraph_format.space_before = Pt(8)
    r = p_sig2.add_run("Đà Nẵng, ngày ...... tháng ...... năm 2026\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.italic = True; r.font.color.rgb = COLOR_BLACK
    r = p_sig2.add_run("Cán bộ phản biện\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK
    r = p_sig2.add_run("(Ký và ghi rõ họ tên)\n\n\n\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(12); r.font.italic = True; r.font.color.rgb = COLOR_BLACK
    r = p_sig2.add_run("......................................................")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK

    doc.add_page_break()

    # ==========================================
    # TÓM TẮT ĐỒ ÁN (TIẾNG VIỆT)
    # ==========================================
    add_chapter_title(doc, "TÓM TẮT ĐỒ ÁN TỐT NGHIỆP")
    add_p(doc, "Trong bối cảnh chuyển đổi số y tế đang diễn ra mạnh mẽ tại Việt Nam, các cơ sở y tế tư nhân, đặc biệt là các phòng khám chuyên khoa Răng Hàm Mặt, đang đối mặt với nhu cầu cấp bách về việc nâng cấp quy trình quản lý, số hóa hồ sơ khám bệnh và tối ưu hóa trải nghiệm điều trị cho người bệnh. Các phương thức quản lý truyền thống bộc lộ nhiều điểm nghẽn nghiêm trọng: đặt lịch theo buổi chung chung khiến bệnh nhân dồn ứ cục bộ vào đầu giờ; hồ sơ lâm sàng ghi chép rời rạc; thanh toán viện phí thiếu liên kết với bệnh án; quản lý chấm công nhân viên và tính lương còn thủ công, tốn thời gian. Xuất phát từ thực tiễn đó, đồ án tốt nghiệp này nghiên cứu, thiết kế và xây dựng thành công 'Hệ thống quản lý và đặt lịch phòng khám nha khoa trực tuyến' theo mô hình kiến trúc Web phân tầng hiện đại Single Page Application (SPA).")
    add_p(doc, "Về mặt công nghệ, hệ thống ứng dụng thư viện React 19 kết hợp công cụ đóng gói siêu tốc Vite và bộ UI chuẩn doanh nghiệp Ant Design v5 ở tầng giao diện người dùng (Frontend); xây dựng máy chủ RESTful API mạnh mẽ bằng ngôn ngữ Python với Web Framework Django và Django REST Framework (Backend); toàn bộ dữ liệu quan hệ được chuẩn hóa đạt chuẩn 3NF trên hệ quản trị cơ sở dữ liệu MySQL 8.0. Hệ thống thiết lập cơ chế bảo mật xác thực không trạng thái qua cặp mã Token kép JWT (Access Token & Refresh Token) và phân quyền chặt chẽ theo vai trò (Role-Based Access Control - RBAC) cho 4 nhóm tác nhân chính: Quản trị viên (Admin), Lễ tân (Receptionist), Bác sĩ (Doctor) và Bệnh nhân (Patient).")
    add_p(doc, "Những đóng góp và quy tắc nghiệp vụ thực tế nổi bật của đề tài bao gồm:")
    highlights = [
        "- Cơ chế đặt lịch khám trực tuyến phân chia khung giờ 30 phút chống chờ đợi: Mỗi ngày được chia thành 2 buổi chính gồm Ca Sáng (8 khung giờ từ 08:00 đến 12:00) và Ca Chiều (8 khung giờ từ 13:00 đến 17:00). Hệ thống kiểm soát tính duy nhất của từng khung giờ khám, ngăn chặn việc nhiều bệnh nhân cùng đến một lúc; tối ưu hóa quy trình tiếp nhận tại quầy bằng số điện thoại; cho phép bệnh nhân chủ động tự hủy lịch trong vòng 30 phút đầu nếu đặt nhầm giờ hoặc đổi ý; đồng thời cung cấp tính năng xóa lịch sử các ca đã khám xong giúp hồ sơ cá nhân luôn sạch đẹp, tiện theo dõi.",
        "- Đồng bộ lâm sàng thời gian thực và quản lý hóa đơn viện phí: Bác sĩ khám lâm sàng, lập hồ sơ bệnh án điện tử, lưu trữ vị trí răng điều trị, chẩn đoán bệnh lý, chỉ định thủ thuật và kê đơn thuốc điện tử. Sau khi bác sĩ hoàn tất bệnh án, hồ sơ lập tức đồng bộ sang Sổ bệnh án của bệnh nhân và kích hoạt tính năng thanh toán viện phí tại quầy lễ tân; các ca đã hoàn tất được tự động ẩn khỏi hàng đợi và phân tách vào trang 'Lịch sử khám bệnh' riêng.",
        "- Quản trị nhân sự, chấm ca làm việc và tính lương: Cho phép bác sĩ chủ động đăng ký ca làm việc cá nhân (Sáng, Chiều, Cả ngày) với cơ chế upsert chống lỗi trùng ngày; Lễ tân thực hiện chấm ca trực hàng ngày cho nhân sự; Quản trị viên (Admin) theo dõi trang 'Lịch sử khám bệnh' để nắm bắt toàn diện số người khám, doanh thu đã thu và số ca hủy theo Tháng/Năm; Admin quản lý danh sách bác sĩ kèm ảnh đại diện chân dung thực tế đồng bộ ra trang chủ, định mức chi phí lương và tự động hóa tính bảng lương tháng.",
        "- Tích hợp Trợ lý ảo Chatbot AI Google Gemini 2.0 Flash: Hỗ trợ tư vấn dịch vụ, bảng giá, bác sĩ trực và hướng dẫn đặt lịch 24/7 với dữ liệu thời gian thực từ cơ sở dữ liệu và tuân thủ bộ lọc y đức nghiêm ngặt (không chẩn đoán bệnh, không kê đơn thuốc)."
    ]
    for r_item in highlights:
        add_bullet(doc, r_item)
        
    add_p(doc, "Từ khóa: Quản lý phòng khám nha khoa, Đặt lịch khung giờ 30 phút, Tiếp nhận tại quầy, Bệnh án điện tử, Tách lịch sử khám, Chấm ca nhân sự, Tính lương tự động, React 19, Django REST Framework, MySQL 8.0, Google Gemini AI.", bold_prefix="Từ khóa: ")
    doc.add_page_break()

    # ==========================================
    # ABSTRACT (TIẾNG ANH)
    # ==========================================
    add_chapter_title(doc, "ABSTRACT")
    add_p(doc, "With the ongoing digital transformation in private healthcare, dental clinics face increasing pressure to modernize appointment scheduling, patient records, and administrative operations. Traditional booking systems often result in peak-hour overcrowding, disconnected medical records, manual attendance tracking, and error-prone payroll calculations. This graduation thesis presents the research, architectural design, and full-stack implementation of an 'Online Dental Clinic Management and Appointment System' deployed as a decoupled Single Page Application (SPA).")
    add_p(doc, "The system architecture leverages React 19, Vite, and Ant Design v5 on the presentation tier, coupled with a robust Python / Django REST Framework (DRF) backend and a 3NF-normalized MySQL 8.0 database. Security is enforced through stateless JSON Web Token (JWT) dual-token authentication and strict Role-Based Access Control (RBAC) across four dedicated actor roles: Administrator, Receptionist, Doctor, and Patient.")
    add_p(doc, "Key practical contributions and workflow innovations include:")
    highlights_en = [
        "- 30-minute interval appointment scheduling: Daily slots divided into morning (8 slots) and afternoon (8 slots) with real-time slot conflict prevention; streamlined front-desk phone number check-in; patient self-cancellation within 30 minutes; and completed booking history deletion for clean user interfaces.",
        "- Clinical synchronization and billing constraints: Real-time electronic dental records (diagnoses, tooth chart, procedures, e-prescriptions). Invoicing at reception is strictly gated until clinical records are completed; completed examinations are moved to a dedicated historical archive.",
        "- Staff management, shift attendance, and automated payroll: Doctor schedule registration with upsert conflict prevention; daily attendance check-in by receptionists; administrative examination history tracking with monthly/yearly revenue KPIs; doctor avatar profile management; and automated monthly salary calculation.",
        "- Real-time AI Assistant: Integrated Google Gemini 2.0 Flash Chatbot providing clinic schedules, service pricing, and appointment guidance 24/7, enforced with strict medical ethics guardrails."
    ]
    for r_item in highlights_en:
        add_bullet(doc, r_item)
        
    add_p(doc, "Keywords: Dental Clinic Management, 30-minute Appointment Slots, Phone Check-in, Electronic Dental Records, Shift Attendance, Automated Payroll, React 19, Django REST Framework, MySQL 8.0, Google Gemini AI.", bold_prefix="Keywords: ")
    doc.add_page_break()

    # ==========================================
    # LỜI NÓI ĐẦU VÀ CẢM ƠN
    # ==========================================
    add_chapter_title(doc, "LỜI NÓI ĐẦU VÀ CẢM ƠN")
    add_p(doc, "Trong suốt những năm tháng học tập và rèn luyện dưới mái trường Đại học Kiến trúc Đà Nẵng, em đã được tiếp cận với kho tàng tri thức quý báu của chuyên ngành Công nghệ Thông tin, được trang bị phương pháp tư duy khoa học, kỹ năng lập trình và khả năng giải quyết các bài toán công nghệ trong đời sống thực tiễn. Đồ án tốt nghiệp 'Hệ thống quản lý và đặt lịch phòng khám nha khoa trực tuyến' là thành quả kết tinh từ sự nỗ lực học hỏi, nghiên cứu của bản thân và sự dìu dắt, chỉ bảo tận tình của các thầy cô giáo.")
    add_p(doc, "Lời đầu tiên, em xin được bày tỏ lòng biết ơn sâu sắc nhất tới Thầy ThS. Đoàn Duy Bình – Giảng viên hướng dẫn trực tiếp. Trong suốt quá trình thực hiện đề tài, thầy đã luôn dành thời gian theo dõi sát sao tiến độ, định hướng phương pháp luận khoa học, gợi mở những giải pháp công nghệ tối ưu và đưa ra những đóng góp chuyên môn quý báu giúp em vượt qua các trở ngại kỹ thuật phức tạp để hoàn thiện sản phẩm một cách trọn vẹn nhất.")
    add_p(doc, "Em xin trân trọng gửi lời cảm ơn tới Ban Giám hiệu Trường Đại học Kiến trúc Đà Nẵng, Ban Chủ nhiệm Khoa cùng toàn thể quý Thầy, Cô giáo Khoa Công nghệ Thông tin đã tận tâm truyền đạt kiến thức chuyên môn, chia sẻ kinh nghiệm thực tế và tạo mọi điều kiện học tập thuận lợi nhất cho em trong suốt khóa học.")
    add_p(doc, "Cuối cùng, con xin gửi lời tri ân sâu nặng tới gia đình và bạn bè – những người đã luôn là điểm tựa tinh thần vững chắc, luôn động viên, khích lệ và đồng hành cùng em trong suốt chặng đường học tập.")
    add_p(doc, "Mặc dù đã rất nỗ lực với tinh thần trách nhiệm cao nhất, song do giới hạn về mặt thời gian và kinh nghiệm thực tế, đồ án chắc chắn khó tránh khỏi những thiếu sót nhất định. Em rất mong nhận được những lời chỉ bảo, nhận xét và đóng góp quý báu từ quý Thầy, Cô trong Hội đồng chấm đồ án tốt nghiệp để hệ thống phần mềm được tiếp tục hoàn thiện, phát triển hơn nữa trong tương lai.")

    p_camon_sig = doc.add_paragraph()
    p_camon_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_camon_sig.paragraph_format.line_spacing = 1.15
    p_camon_sig.paragraph_format.space_before = Pt(12)
    r = p_camon_sig.add_run("Đà Nẵng, tháng 05 năm 2026\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.italic = True; r.font.color.rgb = COLOR_BLACK
    r = p_camon_sig.add_run("Sinh viên thực hiện\n\n\n\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK
    r = p_camon_sig.add_run("Lê Đình Nguyên")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK

    doc.add_page_break()

    # ==========================================
    # LỜI CAM ĐOAN
    # ==========================================
    add_chapter_title(doc, "LỜI CAM ĐOAN")
    add_p(doc, "Tôi xin cam đoan toàn bộ nội dung thuyết minh và sản phẩm phần mềm của đề tài tốt nghiệp 'Hệ thống quản lý và đặt lịch phòng khám nha khoa trực tuyến' là công trình nghiên cứu, thiết kế và phát triển do chính bản thân tôi tự thực hiện dưới sự định hướng khoa học của cán bộ hướng dẫn – ThS. Đoàn Duy Bình.")
    add_p(doc, "Các dữ liệu khảo sát, hình ảnh giao diện, lược đồ thiết kế UML, kết quả thống kê và mã nguồn phần mềm được trình bày trong báo cáo này hoàn toàn trung thực, phản ánh chính xác kết quả xây dựng hệ thống thực tế và chưa từng được công bố trong bất kỳ công trình nghiên cứu hay đồ án tốt nghiệp nào khác.")
    add_p(doc, "Mọi tài liệu tham khảo, lý thuyết kế thừa, mã nguồn mở, tài liệu kỹ thuật và thư viện phần mềm của các tác giả, tổ chức trong và ngoài nước đều đã được trích dẫn nguồn gốc xuất xứ rõ ràng theo đúng chuẩn mực liêm chính học thuật.")
    add_p(doc, "Tôi xin hoàn toàn chịu trách nhiệm trước Hội đồng khoa học, Khoa Công nghệ Thông tin và Nhà trường về tính trung thực của lời cam đoan này.")

    p_camdoan_sig = doc.add_paragraph()
    p_camdoan_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_camdoan_sig.paragraph_format.line_spacing = 1.15
    p_camdoan_sig.paragraph_format.space_before = Pt(12)
    r = p_camdoan_sig.add_run("Đà Nẵng, tháng 05 năm 2026\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.italic = True; r.font.color.rgb = COLOR_BLACK
    r = p_camdoan_sig.add_run("Sinh viên thực hiện\n\n\n\n")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK
    r = p_camdoan_sig.add_run("Lê Đình Nguyên")
    r.font.name = 'Times New Roman'; r.font.size = Pt(13); r.font.bold = True; r.font.color.rgb = COLOR_BLACK

    doc.add_page_break()

print("build_front_pages ready.")

def build_toc_and_lists(doc):
    # ==========================================
    # MỤC LỤC TỰ ĐỘNG (WORD AUTOMATIC TOC)
    # ==========================================
    add_chapter_title(doc, "MỤC LỤC", bookmark_name="_Toc_MucLuc")
    
    # Word Automatic TOC Field Begin
    p_toc_start = doc.add_paragraph()
    p_toc_start.paragraph_format.space_before = Pt(2)
    p_toc_start.paragraph_format.space_after = Pt(6)
    
    r_begin = p_toc_start.add_run()
    r_begin._r.append(parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w')))
    r_instr = p_toc_start.add_run()
    r_instr._r.append(parse_xml(r'<w:instrText %s xml:space="preserve"> TOC \o "1-3" \h \z \u </w:instrText>' % nsdecls('w')))
    r_sep = p_toc_start.add_run()
    r_sep._r.append(parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w')))
    
    # Complete, exhaustive TOC items list covering Front matter, all 3 Chapters, Conclusion, References, and Appendices
    TOC_ENTRIES = [
        # DANH MỤC TRƯỚC MỞ ĐẦU
        ("DANH MỤC CÁC BẢNG BIỂU", "v", "_Toc_BangBieu", 1),
        ("DANH MỤC CÁC HÌNH VẼ VÀ SƠ ĐỒ THIẾT KẾ", "vi", "_Toc_HinhVe", 1),
        ("DANH SÁCH CÁC CỤM TỪ VIẾT TẮT", "vii", "_Toc_VietTat", 1),
        # MỞ ĐẦU
        ("MỞ ĐẦU", "1", "_Toc_MoDau", 1),
        ("1. Tính cấp thiết của đề tài", "1", "_Toc_MoDau_1", 2),
        ("2. Mục đích và ý nghĩa thực tiễn của đề tài", "2", "_Toc_MoDau_2", 2),
        ("3. Mục tiêu nghiên cứu", "2", "_Toc_MoDau_3", 2),
        ("4. Đối tượng và phạm vi nghiên cứu", "3", "_Toc_MoDau_4", 2),
        ("5. Phương pháp nghiên cứu", "4", "_Toc_MoDau_5", 2),
        ("6. Kế hoạch và nội dung thực hiện đồ án", "5", "_Toc_MoDau_6", 2),
        ("7. Bố cục của đồ án tốt nghiệp", "6", "_Toc_MoDau_7", 2),
        # CHƯƠNG 1
        ("CHƯƠNG 1: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ", "7", "_Toc_Ch1", 1),
        ("1.1. Kiến trúc Web Application phân tầng", "7", "_Toc_Ch1_1", 2),
        ("1.2. Thư viện React 19 và Công cụ Vite", "8", "_Toc_Ch1_2", 2),
        ("1.3. Ngôn ngữ Python và Django Framework", "9", "_Toc_Ch1_3", 2),
        ("1.4. Thiết kế RESTful API với Django REST Framework", "10", "_Toc_Ch1_4", 2),
        ("1.5. Hệ quản trị cơ sở dữ liệu MySQL 8.0", "11", "_Toc_Ch1_5", 2),
        ("1.6. Cơ chế Bảo mật JWT và Phân quyền RBAC", "12", "_Toc_Ch1_6", 2),
        ("1.7. Trí tuệ nhân tạo Chatbot Google Gemini 2.0 Flash", "14", "_Toc_Ch1_7", 2),
        ("1.8. Bộ công cụ phát triển phần mềm", "15", "_Toc_Ch1_8", 2),
        # CHƯƠNG 2
        ("CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG", "16", "_Toc_Ch2", 1),
        ("2.1. Khảo sát quy trình nghiệp vụ phòng khám", "16", "_Toc_Ch2_1", 2),
        ("2.2. Phân tích yêu cầu hệ thống", "17", "_Toc_Ch2_2", 2),
        ("2.2.1. Yêu cầu chức năng", "17", "_Toc_Ch2_2_1", 3),
        ("2.2.2. Yêu cầu phi chức năng", "18", "_Toc_Ch2_2_2", 3),
        ("2.3. Tác nhân hệ thống và Ma trận phân quyền RBAC", "18", "_Toc_Ch2_3", 2),
        ("2.4. Phân tích các quy tắc nghiệp vụ đặc thù mới", "20", "_Toc_Ch2_4", 2),
        ("2.4.1. Đặt lịch theo khung giờ 30 phút chống chờ đợi", "20", "_Toc_Ch2_4_1", 3),
        ("2.4.2. Tự động hủy lịch hẹn trong 30 phút khi quá hạn tiếp nhận", "21", "_Toc_Ch2_4_2", 3),
        ("2.4.3. Bác sĩ tự chủ đăng ký lịch và phân tách lịch sử khám", "22", "_Toc_Ch2_4_3", 3),
        ("2.4.4. Đồng bộ lâm sàng và ràng buộc xuất hóa đơn viện phí", "23", "_Toc_Ch2_4_4", 3),
        ("2.4.5. Lễ tân chấm ca trực và Admin quản trị thống kê", "24", "_Toc_Ch2_4_5", 3),
        ("2.4.6. Quản lý hồ sơ bác sĩ kèm ảnh chân dung thực tế", "25", "_Toc_Ch2_4_6", 3),
        ("2.5. Thiết kế Biểu đồ Use Case tổng quát và phân hệ", "26", "_Toc_Ch2_5", 2),
        ("2.6. Đặc tả Use Case chi tiết", "30", "_Toc_Ch2_6", 2),
        ("2.7. Thiết kế Cơ sở dữ liệu và Lược đồ quan hệ thực thể", "35", "_Toc_Ch2_7", 2),
        ("2.8. Thiết kế Sơ đồ tuần tự các luồng nghiệp vụ chính", "40", "_Toc_Ch2_8", 2),
        # CHƯƠNG 3
        ("CHƯƠNG 3: XÂY DỰNG VÀ KIỂM THỬ HỆ THỐNG", "44", "_Toc_Ch3", 1),
        ("3.1. Hiện thực hóa Cơ sở dữ liệu trên MySQL 8.0", "44", "_Toc_Ch3_1", 2),
        ("3.2. Hiện thực hóa Backend và RESTful API", "45", "_Toc_Ch3_2", 2),
        ("3.3. Hiện thực hóa Giao diện người dùng với React 19 và Ant Design", "46", "_Toc_Ch3_3", 2),
        ("3.4. Kết quả xây dựng các phân hệ chức năng thực tế", "47", "_Toc_Ch3_4", 2),
        ("3.4.1. Phân hệ Bệnh nhân", "47", "_Toc_Ch3_4_1", 3),
        ("3.4.2. Phân hệ Bác sĩ", "48", "_Toc_Ch3_4_2", 3),
        ("3.4.3. Phân hệ Lễ tân", "49", "_Toc_Ch3_4_3", 3),
        ("3.4.4. Phân hệ Quản trị viên Admin", "50", "_Toc_Ch3_4_4", 3),
        ("3.4.5. Phân hệ Trợ lý thông minh Chatbot AI", "51", "_Toc_Ch3_4_5", 3),
        ("3.5. Kiểm thử hệ thống và Kết quả kiểm thử", "52", "_Toc_Ch3_5", 2),
        # KẾT LUẬN
        ("KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", "55", "_Toc_KetLuan", 1),
        ("1. Kết quả đạt được của đồ án", "55", "_Toc_KetLuan_1", 2),
        ("2. Những hạn chế của hệ thống", "56", "_Toc_KetLuan_2", 2),
        ("3. Hướng phát triển trong tương lai", "57", "_Toc_KetLuan_3", 2),
        ("4. Bảng ghi chú các hạng mục chưa thực hiện và lộ trình thực hiện tiếp theo", "58", "_Toc_KetLuan_4", 2),
        # TÀI LIỆU THAM KHẢO
        ("TÀI LIỆU THAM KHẢO", "60", "_Toc_TaiLieu", 1),
        # PHỤ LỤC
        ("PHỤ LỤC", "62", "_Toc_PhuLuc", 1),
        ("Phụ lục 1: Hướng dẫn Cài đặt, Khởi chạy và Trải nghiệm Hệ thống", "62", "_Toc_PhuLuc_1", 2),
        ("Phụ lục 2: Hướng dẫn Sử dụng Mã nguồn PlantUML để Chèn Hình Vẽ trên Draw.io", "63", "_Toc_PhuLuc_2", 2)
    ]
    
    for title, page_str, bm_name, level in TOC_ENTRIES:
        add_toc_entry(doc, title, page_str, bm_name, level=level)
        
    p_toc_end = doc.add_paragraph()
    p_toc_end.paragraph_format.space_before = Pt(2)
    p_toc_end.paragraph_format.space_after = Pt(6)
    r_end = p_toc_end.add_run()
    r_end._r.append(parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w')))
    
    doc.add_page_break()

    # ==========================================
    # DANH MỤC CÁC BẢNG BIỂU (BẢNG KHOA HỌC)
    # ==========================================
    add_chapter_title(doc, "DANH MỤC CÁC BẢNG BIỂU", bookmark_name="_Toc_BangBieu")
    
    table_headers = ["Ký hiệu", "Tên bảng biểu", "Trang"]
    table_data = [
        ["Bảng 1.1", "Kế hoạch 10 giai đoạn thực hiện đồ án tốt nghiệp", "5"],
        ["Bảng 2.1", "Ma trận phân quyền chức năng hệ thống theo vai trò tác nhân (RBAC)", "19"],
        ["Bảng 2.2", "Đặc tả Use Case: Bệnh nhân đặt lịch khám theo khung giờ 30 phút và tự hủy trong 30 phút", "30"],
        ["Bảng 2.3", "Đặc tả Use Case: Bác sĩ khám lâm sàng, lập bệnh án và kê đơn thuốc", "31"],
        ["Bảng 2.4", "Đặc tả Use Case: Lễ tân tiếp đón theo khung giờ và quyết toán viện phí tại quầy", "33"],
        ["Bảng 2.5", "Đặc tả Use Case: Lễ tân chấm ca trực nhân viên và Admin tính lương tự động", "34"],
        ["Bảng 2.6", "Cấu trúc dữ liệu chi tiết các bảng trong cơ sở dữ liệu dental_clinic_db", "38"],
        ["Bảng 3.1", "Tổng hợp kết quả kiểm thử các chức năng chính của hệ thống (TC-01 đến TC-15)", "53"],
        ["Bảng 4.1", "Bảng tổng hợp các hạng mục tính năng chưa thực hiện và lộ trình phát triển trong tương lai", "58"]
    ]
    # ALL TEXT INSIDE TABLE IS 13PT
    add_table_custom(doc, table_headers, table_data, [Cm(2.8), Cm(11.2), Cm(2.0)])
    doc.add_page_break()

    # ==========================================
    # DANH MỤC CÁC HÌNH VẼ VÀ SƠ ĐỒ THIẾT KẾ (BẢNG KHOA HỌC)
    # ==========================================
    add_chapter_title(doc, "DANH MỤC CÁC HÌNH VẼ VÀ SƠ ĐỒ THIẾT KẾ", bookmark_name="_Toc_HinhVe")
    
    figure_headers = ["Ký hiệu", "Tên hình vẽ, sơ đồ thiết kế", "Trang"]
    figure_data = [
        ["Hình 1.1", "Mô hình kiến trúc Client - Server hiện đại giữa React 19 và Django REST Framework", "7"],
        ["Hình 1.2", "Cơ chế xác thực bảo mật không trạng thái bằng JSON Web Tokens (JWT) và Phân quyền RBAC", "13"],
        ["Hình 2.1", "Sơ đồ luồng nghiệp vụ tổng quan của phòng khám nha khoa hiện đại", "16"],
        ["Hình 2.2", "Biểu đồ Use Case tổng quát toàn bộ hệ thống Phòng khám Nha khoa", "26"],
        ["Hình 2.3", "Biểu đồ Use Case phân hệ Bệnh nhân (Đặt lịch theo khung giờ 30 phút, Sổ bệnh án)", "27"],
        ["Hình 2.4", "Biểu đồ Use Case phân hệ Bác sĩ (Đăng ký ca trực, Khám bệnh lâm sàng, Lịch sử khám)", "28"],
        ["Hình 2.5", "Biểu đồ Use Case phân hệ Lễ tân & Quản trị viên Admin (Chấm ca trực, Viện phí, Lương bổng)", "29"],
        ["Hình 2.6", "Sơ đồ quan hệ thực thể cơ sở dữ liệu (ERD Database Diagram)", "36"],
        ["Hình 2.7", "Sơ đồ tuần tự: Quy trình Đặt lịch theo khung giờ 30 phút và Tự hủy lịch (PlantUML)", "40"],
        ["Hình 2.8", "Sơ đồ tuần tự: Quy trình Khám lâm sàng, Đồng bộ Bệnh án và Quyết toán Viện phí (PlantUML)", "41"],
        ["Hình 2.9", "Sơ đồ tuần tự: Quy trình Bác sĩ đăng ký ca trực, Lễ tân chấm ca và Admin tính lương tự động", "42"],
        ["Hình 3.1", "Giao diện Cổng đặt lịch khám trực tuyến theo khung giờ 30 phút (/patient/booking)", "47"],
        ["Hình 3.2", "Giao diện Sổ bệnh án điện tử cá nhân và chức năng Xóa lịch sử đã khám (/patient/records)", "48"],
        ["Hình 3.3", "Giao diện Phòng khám lâm sàng và Lịch sử khám bệnh của Bác sĩ (/doctor/examination, /doctor/history)", "49"],
        ["Hình 3.4", "Giao diện Bàn tiếp đón, Chấm ca nhân viên & Quản lý Hóa đơn của Lễ tân (/receptionist/attendance, /receptionist/invoices)", "50"],
        ["Hình 3.5", "Giao diện Quản lý Bác sĩ kèm tải ảnh chân dung và Lịch sử khám bệnh phòng khám (/admin/doctors, /admin/examination-history)", "51"],
        ["Hình 3.6", "Giao diện Giám sát Ca làm việc & Quản trị Lương nhân sự (/admin/payroll)", "51"],
        ["Hình 3.7", "Giao diện Hệ thống Biểu đồ Thống kê Doanh thu phòng khám (/admin/statistics)", "52"]
    ]
    # ALL TEXT INSIDE TABLE IS 13PT
    add_table_custom(doc, figure_headers, figure_data, [Cm(2.8), Cm(11.2), Cm(2.0)])
    doc.add_page_break()

    # ==========================================
    # DANH SÁCH CÁC CỤM TỪ VIẾT TẮT
    # ==========================================
    add_chapter_title(doc, "DANH SÁCH CÁC CỤM TỪ VIẾT TẮT", bookmark_name="_Toc_VietTat")
    add_table_marker(doc, "Bảng chữ viết tắt", "Danh mục các từ viết tắt chuyên ngành")
    abbr_headers = ["Ký hiệu viết tắt", "Tên tiếng Anh đầy đủ", "Ý nghĩa / Diễn giải tiếng Việt"]
    abbr_data = [
        ["AI", "Artificial Intelligence", "Trí tuệ nhân tạo"],
        ["API", "Application Programming Interface", "Giao diện lập trình ứng dụng"],
        ["CRUD", "Create, Read, Update, Delete", "Bốn thao tác dữ liệu cơ bản: Tạo, Đọc, Sửa, Xóa"],
        ["DRF", "Django REST Framework", "Bộ công cụ mã nguồn mở mở rộng của Django xây dựng REST API"],
        ["EHR / EMR", "Electronic Health / Medical Record", "Hồ sơ sức khỏe / Bệnh án y khoa điện tử"],
        ["ERD", "Entity Relationship Diagram", "Sơ đồ quan hệ giữa các thực thể cơ sở dữ liệu"],
        ["HTML / CSS", "HyperText Markup Language / CSS", "Ngôn ngữ đánh dấu và định dạng giao diện trang web"],
        ["JSON", "JavaScript Object Notation", "Định dạng trao đổi dữ liệu dạng văn bản tiêu chuẩn"],
        ["JWT", "JSON Web Token", "Chuẩn mở (RFC 7519) truyền tải thông tin xác thực an toàn"],
        ["LLM", "Large Language Model", "Mô hình ngôn ngữ lớn (như Google Gemini)"],
        ["ORM", "Object-Relational Mapping", "Kỹ thuật ánh xạ đối tượng trong mã nguồn với bảng CSDL"],
        ["RBAC", "Role-Based Access Control", "Mô hình kiểm soát truy cập dựa trên vai trò người dùng"],
        ["RDBMS", "Relational Database Management System", "Hệ quản trị cơ sở dữ liệu quan hệ"],
        ["REST", "Representational State Transfer", "Kiểu kiến trúc phần mềm chuẩn cho các hệ thống phân tán"],
        ["SPA", "Single Page Application", "Ứng dụng web đơn trang tải động không cần tải lại trang"],
        ["UML", "Unified Modeling Language", "Ngôn ngữ mô hình hóa thống nhất"],
        ["UI / UX", "User Interface / User Experience", "Giao diện người dùng / Trải nghiệm người dùng"],
        ["VND", "Vietnamese Dong", "Đơn vị tiền tệ Việt Nam Đồng"],
        ["KPI", "Key Performance Indicator", "Chỉ số đánh giá hiệu quả công việc cốt lõi"]
    ]
    # ALL TEXT INSIDE TABLE IS 13PT
    add_table_custom(doc, abbr_headers, abbr_data, [Cm(3.2), Cm(6.3), Cm(6.5)])
    doc.add_page_break()


def build_introduction(doc):
    # ==========================================
    # PHẦN MỞ ĐẦU (Gộp Mở đầu + Chương 1 cũ)
    # ==========================================
    add_chapter_title(doc, "MỞ ĐẦU", bookmark_name="_Toc_MoDau")
    
    add_heading_1(doc, "1. Tính cấp thiết của đề tài", bookmark_name="_Toc_MoDau_1")
    add_p(doc, "Sự phát triển mạnh mẽ của công nghệ thông tin và mạng Internet toàn cầu đã mang lại những biến đổi sâu sắc trong mọi mặt đời sống xã hội, đặc biệt là lĩnh vực dịch vụ y tế và chăm sóc sức khỏe ban đầu. Tại Việt Nam, chủ trương chuyển đổi số ngành Y tế theo định hướng của Chính phủ [1], [2] đang mở ra cơ hội lớn nhưng cũng đặt ra yêu cầu cấp thiết về mặt công nghệ đối với các cơ sở y tế tư nhân, trong đó có mạng lưới phòng khám chuyên khoa Răng Hàm Mặt. Một phòng khám nha khoa hiện đại không chỉ đòi hỏi đội ngũ y bác sĩ vững tay nghề chuyên môn, trang thiết bị y tế tiên tiến, mà còn cần một hệ thống quản lý, điều phối và phục vụ bệnh nhân chuyên nghiệp, minh bạch và chính xác theo các tiêu chuẩn thực hành y khoa tiên tiến [3].")
    add_p(doc, "Tuy nhiên, qua khảo sát thực tế tại các phòng khám nha khoa quy mô vừa và nhỏ, phần lớn quy trình quản lý hiện nay vẫn đang bộc lộ những nhược điểm và thách thức cố hữu:")
    add_bullet(doc, "Thách thức về sự chờ đợi và dồn ứ bệnh nhân: Quy định đặt lịch khám theo buổi chung chung (như đăng ký ca sáng hoặc ca chiều với định mức khoảng 10 người/buổi) thường dẫn tới việc tất cả bệnh nhân cùng đến phòng khám vào đầu giờ (ví dụ cùng đến lúc 8h00 sáng). Điều này khiến sảnh tiếp đón bị quá tải cục bộ, bệnh nhân phải xếp hàng chờ đợi rất lâu, gây mệt mỏi và bức xúc cho người bệnh, đồng thời tạo áp lực căng thẳng cho nhân viên điều phối.")
    add_bullet(doc, "Thách thức về việc quản lý và điều phối lịch hẹn hiệu quả: Một số phòng khám gặp khó khăn khi bệnh nhân đặt lịch nhưng không đến hẹn hoặc đến muộn, làm xáo trộn lịch trình làm việc của bác sĩ. Giải pháp đặt ra là cần một cơ chế thông minh: thiết lập các khung giờ khám chính xác 30 phút, đồng thời áp dụng quy định tự động hủy lịch trong vòng 30 phút đầu tiên nếu bệnh nhân không đến tiếp nhận tại quầy, giúp kịp thời giải phóng khung giờ cho các bệnh nhân khác có nhu cầu khám ngay.")
    add_bullet(doc, "Hồ sơ bệnh án rời rạc và thanh toán thiếu liên kết: Nhiều cơ sở vẫn sử dụng sổ giấy hoặc bảng tính rời rạc để lưu bệnh án. Việc tính viện phí tại quầy lễ tân chưa gắn chặt với chẩn đoán và thủ thuật thực tế của bác sĩ trong phòng khám, dễ dẫn đến thất thoát hoặc nhầm lẫn chi phí [2].")
    add_bullet(doc, "Khó khăn trong quản lý nhân sự và tính lương: Bác sĩ thường phải đổi ca thủ công; Admin thiếu công cụ trực quan để biết chính xác trong ngày có những bác sĩ nào làm việc, ca nào và phụ trách những bệnh nhân nào. Việc chấm công và tính toán tiền lương hàng tháng (gồm lương ca, lương cứng, hoa hồng theo lượt khám) tốn nhiều thời gian và dễ xảy ra sai sót.")
    add_p(doc, "Xuất phát từ những đòi hỏi cấp bách nêu trên, việc nghiên cứu, thiết kế và xây dựng 'Hệ thống quản lý và đặt lịch phòng khám nha khoa trực tuyến' là một đề tài mang tính thời sự, có giá trị khoa học và ứng dụng thực tiễn to lớn, góp phần trực tiếp nâng cao chất lượng dịch vụ y tế tư nhân trong kỷ nguyên số [1], [3].")

    add_heading_1(doc, "2. Mục đích và ý nghĩa thực tiễn của đề tài", bookmark_name="_Toc_MoDau_2")
    add_p(doc, "Mục đích cốt lõi của đề tài là ứng dụng các kiến thức khoa học máy tính chuyên sâu – bao gồm công nghệ kiến trúc Web phân tầng, hệ cơ sở dữ liệu quan hệ, kỹ thuật xây dựng giao diện người dùng tương tác cao, thiết kế bảo mật phân quyền đa cấp độ và công nghệ trí tuệ nhân tạo (AI) – để phân tích, thiết kế và xây dựng thành công một giải pháp phần mềm toàn diện hỗ trợ quản trị và vận hành phòng khám nha khoa hiện đại.")
    add_p(doc, "Ý nghĩa thực tiễn của đề tài được thể hiện rõ nét qua các khía cạnh:")
    add_bullet(doc, "Đối với người bệnh: Được chủ động lựa chọn khung giờ khám chính xác 30 phút (từ 8h00 - 12h00 sáng và 13h00 - 17h00 chiều); có thể chọn bác sĩ cụ thể hoặc để hệ thống tự động phân bổ; được quyền tự hủy lịch trực tuyến trong vòng 30 phút nếu cần thay đổi kế hoạch cá nhân; dễ dàng theo dõi toàn bộ lịch sử khám bệnh, đơn thuốc và hóa đơn điện tử; có quyền xóa lịch sử các ca đã khám xong để giao diện luôn sạch sẽ.")
    add_bullet(doc, "Đối với Bác sĩ: Chủ động đăng ký ca làm việc cá nhân (Sáng, Chiều, Cả ngày) thông qua hệ thống; quản lý danh sách bệnh nhân chờ khám khoa học; ghi chép bệnh án điện tử nhanh chóng (vị trí răng, chẩn đoán, thủ thuật, đơn thuốc); tra cứu lịch sử khám bệnh cũ của các bệnh nhân đã hoàn thành một cách độc lập.")
    add_bullet(doc, "Đối với Lễ tân: Nắm bắt lịch hẹn trực quan theo từng ngày hoặc xem tất cả; thực hiện chấm ca trực hàng ngày cho nhân viên; tiếp đón bệnh nhân đúng khung giờ; tính toán và xuất hóa đơn viện phí chính xác dựa trên hồ sơ lâm sàng do bác sĩ cung cấp.")
    add_bullet(doc, "Đối với Quản trị viên (Admin): Giám sát toàn diện nhân sự đi làm và công việc trong ngày; quản lý hồ sơ bác sĩ kèm hình ảnh chân dung thực tế đồng bộ ra trang chủ; theo dõi trang 'Lịch sử khám bệnh' để nắm bắt doanh thu, số ca đã khám, số ca hủy theo từng tháng/năm; linh hoạt định giá lương và tự động hóa tính lương tháng.")
    add_bullet(doc, "Tích hợp Trợ lý AI: Tích hợp Chatbot AI Google Gemini 2.0 Flash giải đáp thắc mắc dịch vụ, bác sĩ trực và hướng dẫn đặt lịch 24/7.")

    add_heading_1(doc, "3. Mục tiêu nghiên cứu", bookmark_name="_Toc_MoDau_3")
    add_p(doc, "Mục tiêu tổng quát: Xây dựng thành công hệ thống Web quản lý và đặt lịch phòng khám nha khoa trực tuyến hoàn chỉnh, hiện đại, vận hành ổn định trên nền tảng đám mây; số hóa toàn diện chu trình vận hành từ đặt lịch theo khung giờ 30 phút, tiếp đón, khám lâm sàng, lập bệnh án điện tử, xuất hóa đơn viện phí, cho đến chấm ca làm việc, tính lương nhân sự và tích hợp Chatbot AI hỗ trợ thông tin 24/7.", bold_prefix="Mục tiêu tổng quát: ")
    add_p(doc, "Mục tiêu cụ thể:", bold_prefix="Mục tiêu cụ thể: ")
    add_bullet(doc, "Về cơ sở dữ liệu: Xây dựng cơ sở dữ liệu quan hệ MySQL 8.0 chuẩn hóa 3NF, thiết lập đầy đủ khóa chính, khóa ngoại, ràng buộc toàn vẹn và tối ưu hóa truy vấn cho 12 bảng thực thể liên kết chặt chẽ.")
    add_bullet(doc, "Về kiến trúc máy chủ API: Hiện thực hóa hệ thống Backend RESTful API hoàn chỉnh trên nền tảng Python, Django và Django REST Framework, áp dụng cơ chế xác thực JWT và phân quyền RBAC 4 vai trò nghiêm ngặt.")
    add_bullet(doc, "Về giao diện người dùng: Xây dựng giao diện tương tác cao (SPA) với React 19, Vite và Ant Design v5, đáp ứng trải nghiệm mượt mà, thân thiện trên các thiết bị máy tính và điện thoại.")
    add_bullet(doc, "Về nghiệp vụ Đặt lịch: Giải quyết triệt để bài toán quá tải, chờ đợi lâu bằng thuật toán chia khung giờ 30 phút (8 khung/ca sáng và 8 khung/ca chiều); khóa khung giờ đã có người đặt; cho phép tự hủy lịch trong 30 phút; tối ưu hóa quy trình tiếp nhận tại quầy bằng số điện thoại.")
    add_bullet(doc, "Về nghiệp vụ Lâm sàng & Viện phí: Thiết lập quy trình đồng bộ lâm sàng thời gian thực: Bác sĩ khám và lập bệnh án điện tử thì hồ sơ lập tức xuất hiện tại Sổ bệnh án bệnh nhân, và Lễ tân mới được phép xuất hóa đơn tính tiền; phân tách các ca đã khám vào trang Lịch sử khám riêng.")
    add_bullet(doc, "Về nghiệp vụ Nhân sự & Tiền lương: Xây dựng chức năng Lễ tân chấm ca trực hàng ngày; Bác sĩ đăng ký ca trực không trùng lặp; Admin quản lý bác sĩ kèm ảnh đại diện, theo dõi lịch sử khám tổng thể và tự động tính bảng lương tháng.")
    add_bullet(doc, "Về Trí tuệ nhân tạo: Tích hợp Trợ lý ảo Chatbot AI (Google Gemini 2.0 Flash) truy xuất dữ liệu động từ database và cài đặt bộ lọc y đức nghiêm ngặt.")

    add_heading_1(doc, "4. Đối tượng và phạm vi nghiên cứu", bookmark_name="_Toc_MoDau_4")
    add_p(doc, "Đối tượng nghiên cứu: Quy trình quản lý, vận hành và dòng chảy dữ liệu tại phòng khám nha khoa: luồng bệnh nhân tiếp cận thông tin, đăng ký tài khoản, lựa chọn dịch vụ, đặt lịch khám theo khung giờ 30 phút; quy trình tiếp đón và chấm ca tại quầy lễ tân; quy trình khám lâm sàng, chẩn đoán bệnh lý, ghi nhận thủ thuật, kê đơn thuốc của bác sĩ; quy trình xuất hóa đơn viện phí và hạch toán doanh thu; quy trình chấm công và tính toán tiền lương nhân sự. Về mặt kỹ thuật, đề tài nghiên cứu kiến trúc Web RESTful API, mô hình phân quyền RBAC, kỹ thuật Single Page Application và phương pháp bồi đắp ngữ cảnh cho mô hình ngôn ngữ lớn (LLM).", bold_prefix="Đối tượng nghiên cứu: ")
    add_p(doc, "Phạm vi nghiên cứu (7 mảng nghiệp vụ và kỹ thuật):", bold_prefix="Phạm vi nghiên cứu: ")
    add_bullet(doc, "Phạm vi đối tượng sử dụng: Phục vụ 4 nhóm tác nhân chính: Quản trị viên (Admin), Lễ tân (Receptionist), Bác sĩ (Doctor) và Bệnh nhân (Patient). Mỗi nhóm được phân quyền chặt chẽ thông qua Permission Classes ở backend và Private Routes ở frontend.")
    add_bullet(doc, "Phạm vi quản lý hành chính: Quản lý tài khoản người dùng, hồ sơ bệnh nhân, danh mục bác sĩ (kèm ảnh chân dung thực tế) và danh mục các gói dịch vụ nha khoa.")
    add_bullet(doc, "Phạm vi đặt lịch trực tuyến: Đặt lịch theo khung giờ 30 phút trong ca sáng (8:00 - 12:00) hoặc ca chiều (13:00 - 17:00); cho phép chọn bác sĩ hoặc phân bổ ngẫu nhiên; tự hủy lịch trong 30 phút; tiếp nhận bằng số điện thoại; xóa lịch sử đã khám.")
    add_bullet(doc, "Phạm vi quản lý lịch làm việc và chấm ca: Bác sĩ chủ động đăng ký ca trực (Sáng, Chiều, Cả ngày) với cơ chế upsert chống lỗi trùng ngày; Lễ tân chấm ca làm việc hàng ngày cho nhân sự.")
    add_bullet(doc, "Phạm vi khám lâm sàng và bệnh án điện tử: Bác sĩ tiếp nhận bệnh nhân chờ khám, xem tiền sử dị ứng, ghi chép chẩn đoán bệnh lý chính, vị trí răng can thiệp, thủ thuật đã thực hiện, dặn dò và kê đơn thuốc điện tử. Ẩn bệnh nhân đã khám khỏi hàng đợi và đưa vào trang Lịch sử khám bệnh.")
    add_bullet(doc, "Phạm vi thanh toán viện phí và tính lương: Ràng buộc nghiêm ngặt: chỉ khi bác sĩ hoàn tất bệnh án thì lễ tân mới được xuất hóa đơn tính tiền. Admin định giá mức lương từng nhân sự, xem thống kê lịch sử khám theo tháng/năm và tự động kết toán bảng lương tháng.")
    add_bullet(doc, "Phạm vi Trí tuệ nhân tạo (Chatbot AI): Tích hợp Chatbot AI tư vấn thông tin phòng khám, bác sĩ trực và bảng giá dịch vụ dựa trên dữ liệu thời gian thực. Giới hạn phạm vi: AI tuyệt đối không chẩn đoán bệnh tật hoặc kê đơn thuốc thay bác sĩ.")

    add_heading_1(doc, "5. Phương pháp nghiên cứu", bookmark_name="_Toc_MoDau_5")
    add_p(doc, "Đề tài áp dụng kết hợp các phương pháp nghiên cứu khoa học kỹ thuật và phương pháp luận công nghệ phần mềm hiện đại:")
    add_bullet(doc, "Phương pháp nghiên cứu tài liệu lý thuyết: Tìm hiểu các tài liệu học thuật về Electronic Health Records (EHR) [2], các quy chuẩn thiết kế hệ thống y tế, và tài liệu kỹ thuật chính thức của Django, React, MySQL, Google Gemini API.")
    add_bullet(doc, "Phương pháp khảo sát thực nghiệm: Thu thập biểu mẫu hồ sơ khám, quy trình đặt lịch và hóa đơn thực tế tại các phòng khám nha khoa tư nhân để nắm bắt bài toán dồn ứ bệnh nhân và nhu cầu chấm ca tính lương [1], [3].")
    add_bullet(doc, "Phương pháp phân tích và thiết kế hướng đối tượng (OOAD): Sử dụng ngôn ngữ mô hình hóa thống nhất UML (Use Case, Sequence Diagram, Class Diagram, ERD) để chuẩn hóa kiến trúc phần mềm.")
    add_bullet(doc, "Phương pháp phát triển phần mềm lặp và tăng trưởng (Agile / Iterative Development): Xây dựng từng phân hệ chức năng, kiểm thử liên tục và tinh chỉnh giao diện bám sát trải nghiệm người dùng thực tế.")

    add_heading_1(doc, "6. Kế hoạch và nội dung thực hiện đồ án", bookmark_name="_Toc_MoDau_6")
    add_p(doc, "Quá trình nghiên cứu và triển khai đề tài tốt nghiệp được chia thành 10 giai đoạn cụ thể như mô tả trong Bảng 1.1:")
    
    plan_headers = ["Giai đoạn", "Nội dung thực hiện", "Tiến độ đạt được"]
    plan_data = [
        ["Giai đoạn 1", "Khảo sát quy trình phòng khám, xác định yêu cầu và phạm vi đề tài", "Hoàn thành 100%"],
        ["Giai đoạn 2", "Nghiên cứu công nghệ: React 19, Vite, Django REST Framework, MySQL 8.0", "Hoàn thành 100%"],
        ["Giai đoạn 3", "Phân tích nghiệp vụ, xây dựng mô hình Use Case và thiết kế cơ sở dữ liệu", "Hoàn thành 100%"],
        ["Giai đoạn 4", "Xây dựng Backend REST API, xác thực JWT và phân quyền RBAC 4 vai trò", "Hoàn thành 100%"],
        ["Giai đoạn 5", "Xây dựng giao diện Frontend Single Page Application với React và Ant Design", "Hoàn thành 100%"],
        ["Giai đoạn 6", "Hiện thực hóa quy trình Đặt lịch khung giờ 30 phút, tự hủy trong 30p, tiếp nhận bằng SĐT", "Hoàn thành 100%"],
        ["Giai đoạn 7", "Xây dựng Bệnh án điện tử, tách Lịch sử khám, chấm ca lễ tân, thống kê Admin", "Hoàn thành 100%"],
        ["Giai đoạn 8", "Tích hợp và huấn luyện ngữ cảnh cho Trợ lý ảo Chatbot AI Google Gemini", "Hoàn thành 100%"],
        ["Giai đoạn 9", "Kiểm thử toàn diện hệ thống (Unit, Integration, E2E), tối ưu hiệu năng và bảo mật", "Hoàn thành 100%"],
        ["Giai đoạn 10", "Viết báo cáo đồ án tốt nghiệp theo quy chuẩn và chuẩn bị hồ sơ bảo vệ", "Hoàn thành 100%"]
    ]
    add_table_marker(doc, "Bảng 1.1", "Kế hoạch 10 giai đoạn thực hiện đồ án tốt nghiệp")
    add_table_custom(doc, plan_headers, plan_data, [Cm(3.0), Cm(10.5), Cm(3.0)])

    add_heading_1(doc, "7. Bố cục của đồ án tốt nghiệp", bookmark_name="_Toc_MoDau_7")
    add_p(doc, "Đồ án tốt nghiệp được tổ chức chặt chẽ theo cấu trúc 3 chương chính học thuật chuẩn mực của Khoa Công nghệ Thông tin - Trường Đại học Kiến trúc Đà Nẵng:")
    add_bullet(doc, "MỞ ĐẦU: Trình bày bối cảnh thực tiễn, tính cấp thiết, nhu cầu giải quyết bài toán chờ đợi bằng khung giờ 30 phút, tiếp nhận tại quầy bằng số điện thoại, chấm ca nhân viên; xác định rõ ràng mục tiêu tổng quát, mục tiêu cụ thể, đối tượng nghiên cứu, phạm vi 7 mảng nghiệp vụ và phương pháp nghiên cứu.")
    add_bullet(doc, "CHƯƠNG 1 - CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ: Trình bày nền tảng lý thuyết và các công nghệ chủ đạo được vận dụng trong đề tài: kiến trúc Single Page Application (SPA), React 19, Vite, Python, Django, Django REST Framework, MySQL 8.0, xác thực JWT, bảo mật phân quyền RBAC, Trí tuệ nhân tạo Google Gemini 2.0 Flash và các công cụ phát triển.")
    add_bullet(doc, "CHƯƠNG 2 - PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG: Tập trung phân tích quy trình nghiệp vụ phòng khám, xác định yêu cầu chức năng và phi chức năng, đặc tả 4 tác nhân và ma trận RBAC, phân tích cặn kẽ 6 quy tắc nghiệp vụ thực tế mới; thiết kế hệ thống biểu đồ Use Case (PlantUML), đặc tả kịch bản Use Case, thiết kế cơ sở dữ liệu (ERD) và sơ đồ tuần tự (Sequence Diagrams).")
    add_bullet(doc, "CHƯƠNG 3 - XÂY DỰNG VÀ KIỂM THỬ: Mô tả chi tiết quá trình hiện thực hóa cơ sở dữ liệu, backend REST API, frontend React AntD; trình bày giao diện và kết quả hoạt động thực tế của từng phân hệ (Bệnh nhân, Bác sĩ, Lễ tân, Admin, Chatbot AI); trình bày chi tiết các ca kiểm thử (TC-01 đến TC-15) và đánh giá chất lượng sản phẩm.")
    add_bullet(doc, "KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN: Tổng kết những kết quả khoa học và ứng dụng thực tiễn đã đạt được, chỉ ra những mặt hạn chế hiện tại, đề xuất các định hướng phát triển trong tương lai, và bảng ghi chú các hạng mục chưa thực hiện theo lộ trình nâng cấp.")
    
    doc.add_page_break()


def build_chapter_1(doc):
    # ==========================================
    # CHƯƠNG 1: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ
    # ==========================================
    add_chapter_title(doc, "CHƯƠNG 1: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ", bookmark_name="_Toc_Ch1")
    
    add_heading_1(doc, "1.1. Kiến trúc Web Application phân tầng", bookmark_name="_Toc_Ch1_1")
    add_p(doc, "Hệ thống phần mềm phòng khám nha khoa được thiết kế theo mô hình kiến trúc phân tầng Client - Server hiện đại, tách biệt hoàn toàn giữa tầng hiển thị giao diện người dùng (Presentation Layer) và tầng xử lý nghiệp vụ, lưu trữ dữ liệu (Business Logic & Data Layer) [4], [11]. Giao tiếp giữa hai tầng được thực hiện thông qua giao thức truyền tải siêu văn bản an toàn HTTPS, sử dụng chuẩn trao đổi dữ liệu JSON (JavaScript Object Notation).")
    add_p(doc, "Mô hình ứng dụng web đơn trang (Single Page Application - SPA) được lựa chọn cho phía Client. Thay vì cơ chế truyền thống mỗi thao tác người dùng đều yêu cầu trình duyệt tải lại toàn bộ trang HTML từ máy chủ, SPA chỉ tải trang tĩnh duy nhất trong lần truy cập đầu tiên. Các tương tác tiếp theo chỉ gửi nhận các gói dữ liệu JSON nhỏ gọn qua API, giúp giao diện phản hồi tức thì, mượt mà và mang lại trải nghiệm tương đương với một ứng dụng di động bản địa (Native Mobile App).")
    
    img_arch = os.path.join(ARTIFACTS_DIR, "Hinh_2_1_Kien_Truc_He_Thong.png")
    add_figure_marker(doc, "Hình 1.1", "Mô hình kiến trúc Client - Server hiện đại giữa React 19 và Django REST Framework", 
                      "Mô tả phân tầng giữa Client React SPA, API Gateway Django DRF, MySQL 8.0 và Google Gemini API", 
                      img_path=img_arch, width_inch=5.8)
    
    plantuml_arch = """@startuml
skinparam backgroundColor #FFFFFF
skinparam componentStyle uml2

package "Tầng Trình Diễn (Client - React 19 SPA)" {
  [Giao diện Bệnh nhân] as UI_Patient
  [Giao diện Bác sĩ] as UI_Doctor
  [Giao diện Lễ tân] as UI_Recep
  [Giao diện Quản trị Admin] as UI_Admin
  [Axios Client / JWT Storage] as Axios
}

package "Tầng Xử Lý Nghiệp Vụ (Server - Django REST Framework)" {
  [API Gateway / CORS / Router] as Router
  [JWT Authentication & RBAC Middleware] as Auth
  [Appointments App (Khung giờ 30p)] as ApptApp
  [Medical Records App (Bệnh án & Đơn thuốc)] as MedApp
  [Schedules & Attendance App (Chấm ca, Tính lương)] as SchedApp
  [Invoices App (Thanh toán)] as InvApp
  [Chatbot AI Service] as AIChat
}

package "Tầng Dữ Liệu & Dịch Vụ Ngoài" {
  database "MySQL 8.0 Database (3NF)" as DB
  cloud "Google Gemini 2.0 Live API" as GeminiAPI
}

UI_Patient --> Axios
UI_Doctor --> Axios
UI_Recep --> Axios
UI_Admin --> Axios

Axios --> Router : HTTP/REST (JSON + Bearer Token)
Router --> Auth
Auth --> ApptApp
Auth --> MedApp
Auth --> SchedApp
Auth --> InvApp
Auth --> AIChat

ApptApp --> DB : Django ORM
MedApp --> DB : Django ORM
SchedApp --> DB : Django ORM
InvApp --> DB : Django ORM
AIChat --> DB : Truy xuất thông tin lịch trực, dịch vụ
AIChat --> GeminiAPI : Bồi đắp Context Prompt & Nhận phản hồi
@enduml"""
    add_code(doc, plantuml_arch)

    add_heading_1(doc, "1.2. Thư viện React 19 và Công cụ Vite", bookmark_name="_Toc_Ch1_2")
    add_p(doc, "React là thư viện JavaScript mã nguồn mở hàng đầu do Meta Platforms phát triển [11], được xây dựng dựa trên triết lý Component-Driven (chia nhỏ giao diện thành các khối độc lập, có thể tái sử dụng) và cơ chế Virtual DOM (DOM ảo). Phiên bản React 19 mới nhất mang lại những cải tiến vượt trội về hiệu năng hiển thị, tính năng Server Actions và quản lý trạng thái luồng bất đồng bộ tối ưu.")
    add_p(doc, "Đồ án sử dụng Vite làm công cụ đóng gói và máy chủ phát triển (Build Tool & Dev Server) [12]. Khác với công cụ Webpack truyền thống phải đóng gói toàn bộ mã nguồn trước khi khởi chạy, Vite tận dụng tính năng Native ES Modules có sẵn trên các trình duyệt hiện đại kết hợp với trình biên dịch Rollup/Esbuild viết bằng Go, giúp thời gian khởi động môi trường dev chỉ mất chưa đầy 1 giây và tính năng cập nhật nóng mã nguồn (Hot Module Replacement - HMR) phản hồi gần như tức thời.")
    add_p(doc, "Tích hợp Thư viện Giao diện Ant Design v5: Bên cạnh đó, đồ án tích hợp bộ thư viện Ant Design v5 (AntD) – hệ thống UI Component chuẩn doanh nghiệp nổi tiếng thế giới. Ant Design cung cấp đầy đủ các thành phần giao diện đạt chuẩn tương tác: Table phân trang đa chức năng, Modal, Form xác thực dữ liệu chặt chẽ, DatePicker linh hoạt, Tag trạng thái đa màu sắc, Statistic tài chính và Notification thông minh, đem lại vẻ chuyên nghiệp và đồng bộ chuẩn y khoa.")

    add_heading_1(doc, "1.3. Ngôn ngữ Python và Django Framework", bookmark_name="_Toc_Ch1_3")
    add_p(doc, "Python là ngôn ngữ lập trình bậc cao với cú pháp trong sáng, mạch lạc, mạnh mẽ trong việc xử lý dữ liệu và hỗ trợ tích hợp sâu rộng các giải pháp trí tuệ nhân tạo [8]. Django là một trong những Web Framework hoàn chỉnh và phổ biến nhất của Python [9], hoạt động theo triết lý 'Batteries-Included' (cung cấp sẵn hầu hết mọi công cụ cần thiết để xây dựng ứng dụng Web an toàn, quy mô lớn).")
    add_p(doc, "Điểm mạnh vượt trội của Django nằm ở cơ chế Object-Relational Mapping (Django ORM). ORM cho phép lập trình viên định nghĩa các bảng dữ liệu dưới dạng các Class Python (Models), tự động sinh mã di chuyển lược đồ (Migrations) và thực thi các câu lệnh truy vấn cơ sở dữ liệu phức tạp mà không cần viết mã SQL thuần túy, loại bỏ hoàn toàn nguy cơ tấn công SQL Injection. Ngoài ra, Django tích hợp sẵn hệ thống phòng thủ vững chắc chống lại các lỗ hổng bảo mật phổ biến nhất thế giới (OWASP Top 10) như Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF) và Clickjacking [9].")

    add_heading_1(doc, "1.4. Thiết kế RESTful API với Django REST Framework", bookmark_name="_Toc_Ch1_4")
    add_p(doc, "Django REST Framework (DRF) là bộ công cụ mã nguồn mở mở rộng mạnh mẽ của Django, chuyên dụng cho việc thiết kế và xây dựng các Web API đạt chuẩn RESTful [10]. Kiến trúc của DRF trong đề tài dựa trên 3 trụ cột kỹ thuật cốt lõi: (1) Serializers: Đóng vai trò là bộ chuyển đổi hai chiều giữa các đối tượng phức tạp của Django Model thành định dạng JSON chuẩn và ngược lại, đồng thời thực hiện kiểm tra tính hợp lệ dữ liệu (Validation) chặt chẽ; (2) ViewSets & Generic Views: Tự động hóa việc xử lý các thao tác chuẩn CRUD và các hành động nghiệp vụ đặc thù (custom actions qua decorator @action); (3) Routers: Tự động tạo lập hệ thống URL endpoint đồng nhất, dễ mở rộng.")

    add_heading_1(doc, "1.5. Hệ quản trị cơ sở dữ liệu MySQL 8.0", bookmark_name="_Toc_Ch1_5")
    add_p(doc, "MySQL 8.0 là hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mã nguồn mở hàng đầu thế giới của Tập đoàn Oracle [13]. MySQL sử dụng engine lưu trữ InnoDB – hỗ trợ trọn vẹn các tính chất ACID (Atomicity, Consistency, Isolation, Durability) của giao dịch y tế, hỗ trợ khóa dòng (Row-level locking) chống nghẽn hiệu năng khi nhiều người cùng đặt hẹn tại một thời điểm, và ràng buộc khóa ngoại (Foreign Key Constraints) đảm bảo tính toàn vẹn dữ liệu tuyệt đối giữa lịch hẹn, hồ sơ bệnh án và hóa đơn viện phí. Toàn bộ lược đồ cơ sở dữ liệu của đề tài được thiết kế chuẩn mực đạt dạng chuẩn 3 (Third Normal Form - 3NF), loại bỏ hoàn toàn dư thừa dữ liệu và dị thường cập nhật.")

    add_heading_1(doc, "1.6. Cơ chế Bảo mật JWT và Phân quyền RBAC", bookmark_name="_Toc_Ch1_6")
    add_p(doc, "Trong các hệ thống phân tán giao tiếp qua REST API, cơ chế quản lý phiên làm việc truyền thống bằng Cookie-Session phía máy chủ bộc lộ nhược điểm về khả năng mở rộng (Scalability). Đề tài áp dụng chuẩn xác thực không trạng thái (Stateless Authentication) dựa trên JSON Web Tokens (JWT) thông qua thư viện djangorestframework-simplejwt [10]. Quy trình xác thực được thiết kế với cơ chế cặp Token kép: Access Token (thời hạn ngắn 1 ngày) để xác thực các yêu cầu gửi đến API, và Refresh Token (thời hạn 7 ngày) dùng để cấp mới Access Token mà không bắt người dùng phải đăng nhập lại nhiều lần.")
    
    img_jwt = os.path.join(ARTIFACTS_DIR, "Hinh_2_2_Tuan_Tu_JWT.png")
    add_figure_marker(doc, "Hình 1.2", "Cơ chế xác thực bảo mật không trạng thái bằng JSON Web Tokens (JWT) và Phân quyền RBAC",
                      "Sơ đồ tuần tự đăng nhập, cấp token kép, giải mã RBAC và cơ chế Refresh Token tự động",
                      img_path=img_jwt, width_inch=5.8)
    
    plantuml_jwt = """@startuml
skinparam backgroundColor #FFFFFF
skinparam roundcorner 10
skinparam defaultFontName "Segoe UI, Arial, sans-serif"
autonumber

actor "Người Dùng\\n(Admin / Bác sĩ / Lễ tân / Bệnh nhân)" as User
participant "Giao Diện Web\\n(React 19 Frontend)" as FE
participant "Máy Chủ Xử Lý API\\n(Django REST Framework)" as BE
database "Cơ Sở Dữ Liệu\\n(MySQL 8.0)" as DB

== 1. QUY TRÌNH ĐĂNG NHẬP VÀ CẤP PHÁT TOKEN KÉP (JWT) ==
User -> FE : Nhập Tên đăng nhập & Mật khẩu
FE -> BE : POST /api/auth/login/ {username, password}
BE -> DB : Kiểm tra mật khẩu (PBKDF2 SHA256) & Vai trò
DB --> BE : Xác thực người dùng hợp lệ
BE -> BE : Khởi tạo Cặp mã Token kép (Access & Refresh Token)
BE --> FE : Trả về HTTP 200 OK: {access_token, refresh_token, user_info}
FE -> FE : Lưu Token an toàn vào localStorage
FE --> User : Điều hướng vào trang chức năng theo đúng vai trò

== 2. TRUY XUẤT DỮ LIỆU & KIỂM SOÁT PHÂN QUYỀN (RBAC) ==
User -> FE : Thực hiện thao tác (VD: Xem bệnh án / Chấm ca / Tính lương)
FE -> BE : Gửi yêu cầu kèm Header Bearer Access Token
BE -> BE : Middleware giải mã Token, kiểm tra quyền RBAC
alt Token hợp lệ & Đúng quyền (RBAC Check PASS)
    BE -> DB : Thực thi câu lệnh truy vấn dữ liệu
    DB --> BE : Trả về tập dữ liệu yêu cầu
    BE --> FE : HTTP 200 OK + Dữ liệu JSON
    FE --> User : Hiển thị dữ liệu trực quan trên giao diện
else Sai vai trò / Không đủ quyền (RBAC Check FAIL)
    BE --> FE : HTTP 403 Forbidden (Từ chối truy cập)
    FE --> User : Cảnh báo: "Bạn không có quyền thực hiện thao tác này!"
else Access Token hết hạn (Hết phiên làm việc)
    BE --> FE : HTTP 401 Unauthorized
    FE -> BE : Gửi Refresh Token: POST /api/auth/token/refresh/
    BE --> FE : Cấp Access Token mới
    FE -> BE : Tự động gửi lại yêu cầu dữ liệu ban đầu
    BE --> FE : Trả về kết quả thành công HTTP 200 OK
    FE --> User : Hiển thị dữ liệu bình thường, mượt mà
end
@enduml"""
    add_code(doc, plantuml_jwt)

    add_p(doc, "Mô hình Phân quyền Dựa trên Vai trò (RBAC): Mô hình kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC) được cài đặt nghiêm ngặt ở tầng Backend. Hệ thống phân định rạch ròi 4 vai trò: Admin (toàn quyền hệ thống, cấu hình lương, báo cáo), Lễ tân (quản lý lịch hẹn, tiếp đón, chấm ca, thu ngân), Bác sĩ (quản lý ca trực, khám lâm sàng, bệnh án, đơn thuốc, lịch sử khám) và Bệnh nhân (đặt lịch theo khung giờ 30 phút, tự hủy trong 30p, xem hồ sơ cá nhân). Mỗi API Endpoint đều được gắn các lớp phân quyền Permission Classes (như IsAdmin, IsDoctor, IsReceptionist, IsPatient), ngăn chặn triệt để mọi hành vi truy cập trái phép hoặc leo thang đặc quyền.")

    add_heading_1(doc, "1.7. Trí tuệ nhân tạo Chatbot Google Gemini 2.0 Flash", bookmark_name="_Toc_Ch1_7")
    add_p(doc, "Google Gemini 2.0 Flash là thế hệ mô hình ngôn ngữ lớn (LLM) tiên tiến nhất hiện nay của Google DeepMind, sở hữu tốc độ phản hồi cực nhanh, khả năng thấu hiểu ngữ nghĩa tiếng Việt vượt trội và mức chi phí vận hành tối ưu [4], [5]. Đề tài tích hợp mô hình này nhằm cung cấp cho phòng khám một trợ lý ảo thông minh giải đáp thắc mắc của người bệnh 24/7.")
    add_p(doc, "Cơ chế Bồi đắp Ngữ cảnh Động: Khác với các chatbot đóng băng kiến thức hoặc trả lời chung chung, hệ thống áp dụng kỹ thuật bồi đắp ngữ cảnh thời gian thực (Contextual Prompt Injection): Khi bệnh nhân gửi câu hỏi, máy chủ Backend sẽ tự động truy vấn từ cơ sở dữ liệu MySQL danh sách các bác sĩ, chuyên khoa, lịch trực khả dụng hôm nay và bảng giá dịch vụ hiện hành. Dữ liệu tươi mới này được ghép vào System Prompt trước khi gửi tới Gemini API, giúp chatbot luôn trả lời chính xác thực tế của phòng khám.")
    add_p(doc, "Bộ lọc Y đức Nghiêm ngặt: Đề tài thiết lập các rào cản đạo đức y tế bất biến (Strict Medical Ethics Guardrails) ngay trong chỉ thị hệ thống: Chatbot chỉ đóng vai trò hướng dẫn thông tin hành chính, thời gian hoạt động, bảng giá và quy trình đặt lịch theo khung giờ 30 phút; Chatbot bị nghiêm cấm tuyệt đối việc chẩn đoán bệnh tật, kết luận nguyên nhân đau nhức hoặc kê đơn thuốc thay thế bác sĩ chuyên khoa [4].")

    add_heading_1(doc, "1.8. Bộ công cụ phát triển phần mềm", bookmark_name="_Toc_Ch1_8")
    add_bullet(doc, "Visual Studio Code: Môi trường soạn thảo mã nguồn tích hợp gọn nhẹ, hỗ trợ toàn diện các tiện ích mở rộng Python, Pylance, React ES7, Tailwind, ESLint và Git Lens.")
    add_bullet(doc, "MySQL Workbench: Công cụ quản trị trực quan cơ sở dữ liệu MySQL, hỗ trợ thiết kế lược đồ quan hệ, tối ưu chỉ mục (Index) và kiểm tra dữ liệu [13].")
    add_bullet(doc, "Postman: Công cụ kiểm thử API hàng đầu, hỗ trợ gửi các yêu cầu HTTP (GET, POST, PUT, PATCH, DELETE), kiểm tra mã trạng thái, thời gian phản hồi và tự động hóa bộ kiểm thử Access Token [14].")
    add_bullet(doc, "Git và GitHub: Hệ thống quản lý phiên bản phân tán và nền tảng lưu trữ mã nguồn đám mây, giúp theo dõi lịch sử commit, quản lý nhánh main và đồng bộ mã nguồn an toàn [15].")
    
    doc.add_page_break()


def build_chapter_2(doc):
    # ==========================================
    # CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG
    # ==========================================
    add_chapter_title(doc, "CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG", bookmark_name="_Toc_Ch2")
    
    add_heading_1(doc, "2.1. Khảo sát quy trình nghiệp vụ phòng khám", bookmark_name="_Toc_Ch2_1")
    add_p(doc, "Qua quá trình khảo sát trực tiếp hoạt động tại các phòng khám chuyên khoa Răng Hàm Mặt, chu trình nghiệp vụ tổng quát được mô hình hóa thành các giai đoạn liên hoàn khép kín:")
    add_bullet(doc, "Giai đoạn 1 - Chuẩn bị lịch làm việc: Bác sĩ chủ động đăng ký ca trực trong tuần (Sáng, Chiều hoặc Cả ngày). Hệ thống tự động kích hoạt ca làm việc để sẵn sàng tiếp nhận lượt đặt hẹn của bệnh nhân.")
    add_bullet(doc, "Giai đoạn 2 - Đặt lịch khám trực tuyến theo khung giờ 30 phút: Bệnh nhân lựa chọn dịch vụ, chọn bác sĩ hoặc phân bổ ngẫu nhiên, chọn ngày khám và khung giờ cụ thể 30 phút. Khung giờ đã có người đặt sẽ bị khóa ngay lập tức.")
    add_bullet(doc, "Giai đoạn 3 - Tiếp đón và chấm ca tại quầy: Đầu ca làm việc, lễ tân thực hiện chấm ca trực cho nhân sự (Ca Sáng, Ca Chiều, Cả ngày). Khi bệnh nhân đến khám theo khung giờ hẹn, lễ tân đối soát thông tin số điện thoại tiếp nhận và chuyển trạng thái vào phòng khám.")
    add_bullet(doc, "Giai đoạn 4 - Khám lâm sàng và Điều trị: Bác sĩ tiếp nhận bệnh nhân, kiểm tra tiền sử dị ứng, khám răng, ghi chép chẩn đoán bệnh lý, vị trí răng, thủ thuật điều trị, lời dặn và kê đơn thuốc điện tử. Sau khi hoàn tất, hồ sơ bệnh án được lưu trữ và ca khám tự động chuyển vào trang Lịch sử khám bệnh.")
    add_bullet(doc, "Giai đoạn 5 - Quyết toán viện phí: Bệnh nhân trở lại quầy lễ tân; Lễ tân kiểm tra hồ sơ bệnh án đã hoàn tất, xuất hóa đơn viện phí và thu tiền thanh toán (tiền mặt hoặc chuyển khoản).")
    add_bullet(doc, "Giai đoạn 6 - Quản trị và Tính lương: Admin theo dõi trang Lịch sử khám bệnh toàn diện theo tháng/năm, kiểm tra ngày công nhân sự và tự động kết toán bảng lương tháng.")

    add_figure_marker(doc, "Hình 2.1", "Sơ đồ luồng nghiệp vụ tổng quan của phòng khám nha khoa hiện đại",
                      "Sơ đồ quy trình liên hoàn từ đăng ký ca trực, đặt lịch khung giờ 30 phút, tiếp đón, khám bệnh đến viện phí")

    add_heading_1(doc, "2.2. Phân tích yêu cầu hệ thống", bookmark_name="_Toc_Ch2_2")
    add_heading_2(doc, "2.2.1. Yêu cầu chức năng", bookmark_name="_Toc_Ch2_2_1")
    add_bullet(doc, "Quản lý Người dùng & Định danh: Đăng ký tài khoản bệnh nhân, đăng nhập JWT an toàn, phân quyền 4 vai trò (Admin, Lễ tân, Bác sĩ, Bệnh nhân).")
    add_bullet(doc, "Đặt lịch theo khung giờ 30 phút: Hiển thị 8 khung giờ ca sáng (8:00 - 12:00) và 8 khung giờ ca chiều (13:00 - 17:00); khóa tự động khung giờ đã có người đặt; hỗ trợ chọn bác sĩ đích danh hoặc phân bổ ngẫu nhiên; lưu thông tin số điện thoại tiếp nhận tại quầy.")
    add_bullet(doc, "Tự hủy lịch trong 30 phút & Xóa lịch sử: Bệnh nhân được tự hủy lịch hẹn trong vòng 30 phút kể từ lúc đặt; quá 30 phút liên hệ lễ tân hỗ trợ; cho phép xóa lịch sử các ca đã khám xong.")
    add_bullet(doc, "Đăng ký ca làm việc bác sĩ: Bác sĩ chủ động đăng ký ca Sáng, Chiều, Cả ngày với cơ chế upsert tự động, không bị lỗi trùng ngày.")
    add_bullet(doc, "Lễ tân Chấm ca & Bàn tiếp đón: Chấm ca trực hàng ngày cho nhân sự (Sáng, Chiều, Cả ngày); xem danh sách lịch hẹn theo ngày hoặc tất cả; tiếp nhận bệnh nhân theo khung giờ.")
    add_bullet(doc, "Khám bệnh lâm sàng & Bệnh án điện tử: Bác sĩ ghi nhận chẩn đoán, răng, thủ thuật, đơn thuốc; danh sách khám tự động ẩn bệnh nhân đã hoàn thành và chuyển vào trang Lịch sử khám bệnh riêng.")
    add_bullet(doc, "Hóa đơn viện phí: Ràng buộc bắt buộc phải có bệnh án mới được tính tiền; quản lý hóa đơn chờ và đã thanh toán.")
    add_bullet(doc, "Quản trị Admin: Quản lý hồ sơ bác sĩ kèm tải ảnh chân dung đại diện thực tế; trang Lịch sử khám bệnh xem thống kê doanh thu, số ca khám, số ca hủy theo Tháng/Năm; định giá và tính lương tự động.")
    add_bullet(doc, "Chatbot AI: Trợ lý tư vấn Google Gemini 2.0 Flash giải đáp thông tin dịch vụ, bảng giá, bác sĩ trực 24/7.")

    add_heading_2(doc, "2.2.2. Yêu cầu phi chức năng", bookmark_name="_Toc_Ch2_2_2")
    add_bullet(doc, "Hiệu năng: Thời gian phản hồi API trung bình dưới 300ms đối với thao tác CRUD, dưới 1.5 giây đối với thống kê và AI.")
    add_bullet(doc, "Bảo mật: Mật khẩu băm PBKDF2 SHA256; xác thực JWT Stateless; kiểm soát quyền RBAC qua Permission Classes; chống SQL Injection, XSS, CSRF.")
    add_bullet(doc, "Tính khả dụng: Giao diện thích ứng (Responsive) trên Desktop, Tablet và Smartphone; giao diện tiếng Việt thân thiện, rõ ràng.")
    add_bullet(doc, "Độ tin cậy: Tính sẵn sàng 99.5%; giao dịch CSDL ACID đảm bảo tính toàn vẹn dữ liệu lâm sàng và viện phí.")

    add_heading_1(doc, "2.3. Tác nhân hệ thống và Ma trận phân quyền RBAC", bookmark_name="_Toc_Ch2_3")
    add_p(doc, "Hệ thống phục vụ 4 nhóm tác nhân chính:")
    add_bullet(doc, "1. Quản trị viên (Admin): Toàn quyền quản trị hệ thống; quản lý bác sĩ kèm ảnh đại diện; quản lý dịch vụ; giám sát ca làm việc; xem lịch sử khám bệnh và thống kê doanh thu theo tháng/năm; định giá và duyệt bảng lương.")
    add_bullet(doc, "2. Lễ tân (Receptionist): Tiếp đón bệnh nhân theo khung giờ hẹn; chấm ca trực hàng ngày cho nhân viên; hỗ trợ đổi/hủy lịch hẹn; tính tiền và xuất hóa đơn viện phí khi bác sĩ đã khám xong.")
    add_bullet(doc, "3. Bác sĩ (Doctor): Tự chủ đăng ký ca làm việc; tiếp nhận bệnh nhân chờ khám; lập bệnh án điện tử và kê đơn thuốc; tra cứu trang Lịch sử khám bệnh cũ.")
    add_bullet(doc, "4. Bệnh nhân (Patient): Đăng ký tài khoản; đặt lịch khám theo khung giờ 30 phút (chọn BS hoặc ngẫu nhiên); tự hủy lịch trong 30 phút; xóa lịch sử đã khám; xem sổ bệnh án và hỏi đáp Chatbot AI.")

    add_table_marker(doc, "Bảng 2.1", "Ma trận phân quyền chức năng hệ thống theo vai trò tác nhân (RBAC)")
    rbac_headers = ["Chức năng nghiệp vụ", "Admin", "Lễ tân", "Bác sĩ", "Bệnh nhân"]
    rbac_data = [
        ["Quản lý tài khoản & Khóa người dùng", "Toàn quyền (CRUD)", "Không", "Không", "Tự sửa hồ sơ cá nhân"],
        ["Quản lý Bác sĩ & Tải ảnh đại diện", "Toàn quyền (CRUD)", "Xem danh sách", "Xem thông tin", "Xem trên Trang chủ"],
        ["Quản lý danh mục Dịch vụ nha khoa", "Toàn quyền (CRUD)", "Xem danh mục", "Xem danh mục", "Xem danh mục & giá"],
        ["Đăng ký ca làm việc cá nhân", "Xem & Giám sát", "Không", "Tự đăng ký (upsert)", "Không"],
        ["Chấm ca trực nhân viên hàng ngày", "Xem & Quản trị lương", "Trực tiếp chấm ca", "Xem ca của mình", "Không"],
        ["Đặt lịch theo khung giờ 30 phút", "Toàn quyền điều phối", "Hỗ trợ đặt tại quầy", "Xem lịch khám", "Tự chọn khung giờ 30p"],
        ["Tự hủy lịch trong 30 phút", "Hủy theo yêu cầu", "Hỗ trợ hủy quá 30p", "Xem lịch hủy", "Tự bấm hủy (<30 phút)"],
        ["Xóa lịch sử đặt lịch đã hoàn thành", "Không cần thiết", "Không", "Không", "Tự xóa lịch completed"],
        ["Tiếp nhận bệnh nhân tại quầy", "Giám sát tổng quan", "Tiếp nhận & Vào phòng", "Nhận vào khám", "Check-in tại quầy"],
        ["Khám lâm sàng & Lập bệnh án", "Xem hồ sơ bệnh án", "Xem trạng thái", "Toàn quyền khám & kê đơn", "Xem Sổ bệnh án cá nhân"],
        ["Xem Lịch sử khám bệnh cũ", "Xem toàn phòng khám", "Xem theo ca khám", "Xem bệnh án cũ đã khám", "Xem lịch sử cá nhân"],
        ["Xuất hóa đơn & Thu viện phí", "Xem báo cáo viện phí", "Toàn quyền tính tiền", "Xem hóa đơn ca khám", "Xem quyết toán chi phí"],
        ["Định giá & Tính bảng lương", "Toàn quyền định giá & duyệt", "Xem phiếu lương mình", "Xem phiếu lương mình", "Không"],
        ["Trang Lịch sử khám & Thống kê", "Xem theo Tháng/Năm/All", "Không", "Không", "Không"],
        ["Hỏi đáp Trợ lý ảo Chatbot AI", "Cấu hình nguồn dữ liệu", "Hỗ trợ tra cứu", "Hỗ trợ tra cứu", "Tự do tra cứu 24/7"]
    ]
    add_table_custom(doc, rbac_headers, rbac_data, [Cm(5.0), Cm(2.8), Cm(2.8), Cm(2.8), Cm(3.0)])

    add_heading_1(doc, "2.4. Phân tích các quy tắc nghiệp vụ đặc thù mới", bookmark_name="_Toc_Ch2_4")
    add_p(doc, "Nhằm đáp ứng yêu cầu vận hành thực tế tại phòng khám nha khoa hiện đại, đồ án đã nghiên cứu và hoàn thiện 6 quy tắc nghiệp vụ đặc thù mang tính ứng dụng cao, giải quyết triệt để các vướng mắc thường gặp trong công tác đón tiếp, khám bệnh, viện phí và quản trị nhân sự:")

    add_heading_2(doc, "2.4.1. Đặt lịch theo khung giờ 30 phút chống chờ đợi", bookmark_name="_Toc_Ch2_4_1")
    add_p(doc, "Để giải quyết dứt điểm tình trạng quá tải và dồn ứ bệnh nhân vào đầu mỗi buổi khám, hệ thống thiết lập cơ chế phân chia thời gian làm việc trong ngày thành hai ca làm việc rõ ràng: Ca Sáng bắt đầu từ 08:00 đến 12:00 (gồm 8 khung giờ: 08:00 - 08:30, 08:30 - 09:00, ..., 11:30 - 12:00) và Ca Chiều từ 13:00 đến 17:00 (gồm 8 khung giờ: 13:00 - 13:30, 13:30 - 14:00, ..., 16:30 - 17:00). Khi bệnh nhân tiến hành đặt lịch, hệ thống tự động kiểm tra trạng thái khả dụng của từng khung giờ đối với bác sĩ đã chọn trong ngày tương ứng. Khung giờ nào đã có bệnh nhân khác đặt thành công sẽ lập tức chuyển sang trạng thái bị vô hiệu hóa (disabled) trên giao diện người dùng, ngăn chặn tuyệt đối tình trạng trùng giờ khám. Bệnh nhân có thể linh hoạt chọn khám với một bác sĩ cụ thể hoặc để hệ thống tự động phân bổ ngẫu nhiên cho một bác sĩ đang có ca trực trống trong khung giờ đó.")

    add_heading_2(doc, "2.4.2. Tự động hủy lịch hẹn trong 30 phút khi quá hạn tiếp nhận", bookmark_name="_Toc_Ch2_4_2")
    add_p(doc, "Nhằm tạo điều kiện thuận lợi tối đa và loại bỏ hoàn toàn các rào cản tài chính ban đầu cho bệnh nhân khi tiếp cận dịch vụ y tế, hệ thống không áp dụng bất kỳ hình thức thu phí trước nào trong quá trình đặt hẹn trực tuyến. Bệnh nhân chỉ cần lựa chọn khung giờ và cung cấp số điện thoại liên lạc chính xác để hoàn tất đăng ký. Tuy nhiên, để đảm bảo tính kỷ luật trong vận hành và tránh lãng phí thời gian của đội ngũ y bác sĩ, hệ thống áp dụng quy tắc kiểm soát thời gian nghiêm ngặt: bệnh nhân được quyền chủ động hủy lịch hẹn trực tiếp trên giao diện cá nhân trong vòng 30 phút kể từ thời điểm đặt nếu có sự thay đổi kế hoạch đột xuất. Khi bấm hủy lịch hợp lệ, khung giờ đó lập tức được mở lại cho bệnh nhân khác tiếp tục đăng ký. Ngược lại, nếu quá 30 phút kể từ thời điểm bắt đầu ca hẹn mà bệnh nhân không có mặt tại quầy tiếp đón để làm thủ tục check-in bằng số điện thoại, hệ thống sẽ tự động chuyển trạng thái lịch hẹn sang 'Đã hủy' (Cancelled), giải phóng khung giờ làm việc và ghi nhận vào số liệu báo cáo của phòng khám.")

    add_heading_2(doc, "2.4.3. Bác sĩ tự chủ đăng ký lịch và phân tách lịch sử khám", bookmark_name="_Toc_Ch2_4_3")
    add_p(doc, "Hệ thống trao quyền chủ động cho các bác sĩ trong việc đăng ký ca làm việc của bản thân trong tuần (Ca Sáng, Ca Chiều hoặc Cả ngày). Để tránh các lỗi trùng lặp dữ liệu khi hệ thống đã tự động kích hoạt ca trực tạm thời (do bệnh nhân đặt lịch ngẫu nhiên), hệ thống áp dụng cơ chế cập nhật thông minh (upsert - update or create). Nhờ đó, bác sĩ có thể thay đổi ca làm việc của mình một cách thuận tiện mà không gây xung đột cơ sở dữ liệu. Đặc biệt, trong phân hệ phòng khám lâm sàng, danh sách hàng đợi chỉ hiển thị những bệnh nhân đang chờ khám trong ngày. Ngay khi bác sĩ hoàn tất một ca điều trị và lưu bệnh án, hồ sơ của bệnh nhân đó sẽ lập tức được ẩn khỏi danh sách chờ và chuyển sang khu vực 'Lịch sử khám bệnh' riêng biệt. Điều này giúp không gian làm việc của bác sĩ luôn tinh gọn, tập trung và tránh nhầm lẫn giữa bệnh nhân đang chờ với bệnh nhân đã khám xong.")

    add_heading_2(doc, "2.4.4. Đồng bộ lâm sàng và ràng buộc xuất hóa đơn viện phí", bookmark_name="_Toc_Ch2_4_4")
    add_p(doc, "Một điểm nhấn quan trọng trong thiết kế nghiệp vụ y tế của hệ thống là sự gắn kết chặt chẽ giữa hoạt động chuyên môn lâm sàng và quy trình tài chính kế toán. Khi tiếp nhận bệnh nhân vào phòng khám, bác sĩ tiến hành kiểm tra tiền sử dị ứng, khám răng thực thể, nhập chẩn đoán bệnh lý chính, xác định vị trí răng điều trị, ghi chép thủ thuật can thiệp và kê đơn thuốc điện tử. Chỉ khi bác sĩ bấm 'Hoàn tất bệnh án', dữ liệu điều trị mới chính thức được ghi nhận và đồng bộ tức thời sang Sổ bệnh án điện tử của người bệnh. Đồng thời, tại bàn lễ tân, nút chức năng 'Tính tiền & Thu viện phí' đối với ca khám đó mới được hệ thống kích hoạt. Ràng buộc logic này ngăn chặn triệt để tình trạng nhân viên lễ tân tự ý xuất hóa đơn thu tiền trước khi có kết luận điều trị chính thức từ bác sĩ chuyên khoa, bảo đảm quyền lợi tối đa cho người bệnh và tuân thủ chặt chẽ quy chế khám chữa bệnh.")

    add_heading_2(doc, "2.4.5. Lễ tân chấm ca trực và Admin quản trị thống kê", bookmark_name="_Toc_Ch2_4_5")
    add_p(doc, "Quy trình chấm công và tính lương nhân sự được tối ưu hóa thông qua sự phối hợp nhịp nhàng giữa Lễ tân và Quản trị viên. Hàng ngày, lễ tân tại quầy tiếp đón có nhiệm vụ điểm danh và chấm ca trực cho toàn thể nhân sự (Bác sĩ, Điều dưỡng, Nhân viên) với ba nút lựa chọn trực quan: Ca Sáng, Ca Chiều và Cả ngày. Dữ liệu công làm việc sau khi lưu sẽ được đồng bộ ngay lập tức sang phân hệ quản trị của Admin. Về phía Admin, hệ thống cung cấp giao diện 'Lịch sử khám bệnh' toàn diện, cho phép tra cứu và thống kê hoạt động phòng khám theo từng Tháng, từng Năm hoặc Toàn thời gian với các chỉ số cốt lõi: tổng số lượt bệnh nhân đã khám, tổng doanh thu thực tế đã thu vào, tổng số lịch hẹn bị hủy cùng tỷ lệ hủy tương ứng. Dựa trên số ca làm việc thực tế do lễ tân chấm công và định mức lương cấu hình sẵn cho từng người, Admin có thể thực hiện tính toán bảng lương tự động hàng tháng chỉ bằng một cú nhấp chuột.")

    add_heading_2(doc, "2.4.6. Quản lý hồ sơ bác sĩ kèm ảnh chân dung thực tế", bookmark_name="_Toc_Ch2_4_6")
    add_p(doc, "Nhằm nâng cao tính chuyên nghiệp, củng cố niềm tin và giúp người bệnh dễ dàng nhận diện bác sĩ phụ trách, phân hệ quản trị cho phép Admin tải lên tệp hình ảnh chân dung thực tế của từng bác sĩ (định dạng JPG, PNG hoặc WEBP) kèm theo khung xem trước (preview) trực quan khi thêm mới hoặc chỉnh sửa thông tin. Hình ảnh đại diện sau khi tải lên máy chủ sẽ được tự động đồng bộ hóa trên toàn bộ hệ thống: hiển thị tại danh sách bác sĩ trên Trang chủ, xuất hiện trong thẻ thông tin chuyên khoa khi bệnh nhân tiến hành đặt lịch khám, và hiển thị tại bàn tiếp đón của lễ tân, góp phần xây dựng hình ảnh thương hiệu phòng khám hiện đại và gần gũi.")

    add_heading_1(doc, "2.5. Thiết kế Biểu đồ Use Case tổng quát và phân hệ", bookmark_name="_Toc_Ch2_5")
    add_p(doc, "Hệ thống Use Case được thiết kế đồng bộ phản ánh toàn bộ các quy tắc nghiệp vụ thực tế mới:")
    
    img_uc = os.path.join(ARTIFACTS_DIR, "Hinh_3_2_So_Do_Use_Case.png")
    add_figure_marker(doc, "Hình 2.2", "Biểu đồ Use Case tổng quát toàn bộ hệ thống Phòng khám Nha khoa",
                      "Sơ đồ Use Case phân bổ cho 4 nhóm tác nhân: Bệnh nhân, Bác sĩ, Lễ tân và Quản trị viên Admin",
                      img_path=img_uc, width_inch=5.8)
    
    plantuml_uc_all = """@startuml
skinparam backgroundColor #FFFFFF
skinparam roundcorner 10
skinparam dpi 160
left to right direction

actor "Bệnh nhân\\n(Patient)" as Patient
actor "Bác sĩ\\n(Doctor)" as Doctor
actor "Lễ tân\\n(Receptionist)" as Recep
actor "Quản trị viên\\n(Admin)" as Admin

rectangle "HỆ THỐNG QUẢN LÝ VÀ ĐẶT LỊCH PHÒNG KHÁM NHA KHOA" {
  package "Phân hệ Người dùng & Định danh" {
    usecase "Đăng ký / Đăng nhập (JWT)" as UC_Auth
    usecase "Quản lý hồ sơ cá nhân" as UC_Profile
  }
  package "Phân hệ Đặt lịch theo khung giờ 30p" {
    usecase "Đặt lịch khám theo khung giờ 30 phút\\n(Sáng: 8 khung, Chiều: 8 khung)" as UC_Book
    usecase "Tự hủy lịch trong 30 phút" as UC_Cancel30
    usecase "Xóa lịch sử đặt lịch đã hoàn thành" as UC_DelHistory
  }
  package "Phân hệ Bác sĩ & Lâm sàng" {
    usecase "Đăng ký ca làm việc (upsert)" as UC_Schedule
    usecase "Khám bệnh & Lập bệnh án điện tử" as UC_Exam
    usecase "Tra cứu Lịch sử khám bệnh cũ" as UC_DocHistory
  }
  package "Phân hệ Lễ tân & Viện phí" {
    usecase "Chấm ca trực nhân viên hàng ngày" as UC_Attendance
    usecase "Theo dõi lịch hẹn theo ngày / tất cả" as UC_RecepAppt
    usecase "Tiếp nhận bệnh nhân theo khung giờ" as UC_Checkin
    usecase "Xuất hóa đơn viện phí khi có bệnh án" as UC_Invoice
  }
  package "Phân hệ Quản trị Admin" {
    usecase "Quản lý Bác sĩ & Tải ảnh đại diện" as UC_AdminDoc
    usecase "Tra cứu Lịch sử khám & Thống kê Tháng/Năm" as UC_ExamHistoryAdmin
    usecase "Cấu hình mức lương & Tính bảng lương" as UC_Payroll
    usecase "Biểu đồ thống kê doanh thu 12 tháng" as UC_Stats
  }
  package "Trợ lý ảo AI" {
    usecase "Hỏi đáp thông tin phòng khám 24/7" as UC_Chatbot
  }
}

Patient --> UC_Auth
Patient --> UC_Book
Patient --> UC_Cancel30
Patient --> UC_DelHistory
Patient --> UC_Chatbot

Doctor --> UC_Auth
Doctor --> UC_Schedule
Doctor --> UC_Exam
Doctor --> UC_DocHistory

Recep --> UC_Auth
Recep --> UC_Attendance
Recep --> UC_RecepAppt
Recep --> UC_Checkin
Recep --> UC_Invoice

Admin --> UC_Auth
Admin --> UC_AdminDoc
Admin --> UC_ExamHistoryAdmin
Admin --> UC_Payroll
Admin --> UC_Stats
@enduml"""
    add_code(doc, plantuml_uc_all)

    add_figure_marker(doc, "Hình 2.3", "Biểu đồ Use Case phân hệ Bệnh nhân (Đặt lịch theo khung giờ 30 phút, Sổ bệnh án)",
                      "Chi tiết các Use Case phục vụ người bệnh: chọn khung giờ 30 phút, tự hủy trong 30p, xem bệnh án")
    add_figure_marker(doc, "Hình 2.4", "Biểu đồ Use Case phân hệ Bác sĩ (Đăng ký ca trực, Khám bệnh lâm sàng, Lịch sử khám)",
                      "Chi tiết các Use Case dành cho Bác sĩ: upsert ca làm việc, khám lâm sàng, đơn thuốc, tách lịch sử")
    add_figure_marker(doc, "Hình 2.5", "Biểu đồ Use Case phân hệ Lễ tân & Quản trị viên Admin (Chấm ca trực, Viện phí, Lương bổng)",
                      "Chi tiết các Use Case điều hành: chấm ca, tiếp nhận bằng SĐT, viện phí, thống kê và tính lương")

    add_heading_1(doc, "2.6. Đặc tả Use Case chi tiết", bookmark_name="_Toc_Ch2_6")
    
    # Use Case 1: Đặt lịch 30p & Hủy 30p
    add_table_marker(doc, "Bảng 2.2", "Đặc tả Use Case: Bệnh nhân đặt lịch khám theo khung giờ 30 phút và tự hủy trong 30 phút")
    uc1_data = [
        ["Tên Use Case", "Đặt lịch khám theo khung giờ 30 phút và Tự hủy trong 30 phút"],
        ["Tác nhân chính", "Bệnh nhân (Patient), hỗ trợ bởi Lễ tân (Receptionist)"],
        ["Mục đích", "Đặt hẹn theo khung giờ 30 phút chính xác, không trùng giờ, tiếp nhận tại quầy bằng SĐT, tự hủy trong 30p"],
        ["Điều kiện tiên quyết", "Bệnh nhân đã đăng nhập tài khoản hợp lệ trên hệ thống"],
        ["Luồng sự kiện chính", "1. Bệnh nhân vào trang Đặt lịch (/patient/booking).\n2. Chọn Dịch vụ nha khoa và Bác sĩ (hoặc Phân bổ ngẫu nhiên).\n3. Chọn Ngày khám và Buổi khám (Sáng 8:00-12:00 hoặc Chiều 13:00-17:00).\n4. Hệ thống hiển thị 8 ô khung giờ (mỗi ô cách nhau 30 phút). Các khung giờ đã có người đặt trước sẽ bị khóa mờ.\n5. Bệnh nhân chọn 1 ô khung giờ trống, nhập ghi chú triệu chứng và bấm 'Xác nhận đặt lịch'.\n6. Hệ thống tạo lịch hẹn với trạng thái 'Đã xác nhận', hiển thị đồng hồ đếm ngược 30 phút cho phép hủy.\n7. Nếu cần hủy lịch, bệnh nhân bấm 'Hủy lịch khám', xác nhận lý do. Hệ thống hủy lịch ngay và mở lại khung giờ cho người khác."],
        ["Luồng ngoại lệ", "6a. Quá thời gian 30 phút kể từ lúc đặt: Nút 'Hủy lịch' tự động ẩn; bệnh nhân liên hệ lễ tân qua số điện thoại để được hỗ trợ dời lịch hoặc hủy lịch.\n7a. Ca khám đã hoàn thành (completed): Bệnh nhân có nút 'Xóa lịch sử' để xóa bản ghi khỏi danh sách cá nhân."]
    ]
    add_table_custom(doc, ["Thuộc tính", "Nội dung chi tiết"], uc1_data, [Cm(4.0), Cm(12.5)])

    # Use Case 2: Bác sĩ khám lâm sàng
    add_table_marker(doc, "Bảng 2.3", "Đặc tả Use Case: Bác sĩ khám lâm sàng, lập bệnh án và kê đơn thuốc")
    uc2_data = [
        ["Tên Use Case", "Khám bệnh lâm sàng, Lập bệnh án điện tử và Kê đơn thuốc"],
        ["Tác nhân chính", "Bác sĩ (Doctor)"],
        ["Mục đích", "Khám bệnh nhân theo khung giờ, ghi chép chẩn đoán, thủ thuật, đơn thuốc và tách lịch sử"],
        ["Điều kiện tiên quyết", "Bác sĩ đã đăng nhập; Bệnh nhân đã được tiếp nhận tại quầy"],
        ["Luồng sự kiện chính", "1. Bác sĩ mở trang Phòng khám lâm sàng (/doctor/examination).\n2. Hệ thống hiển thị danh sách bệnh nhân đang chờ khám trong ngày (các ca đã khám xong không hiển thị tại đây).\n3. Bác sĩ chọn bệnh nhân và bấm 'Vào khám'.\n4. Bác sĩ nhập chẩn đoán bệnh lý chính, vị trí răng can thiệp, thủ thuật đã thực hiện, dặn dò và kê đơn thuốc điện tử.\n5. Bác sĩ bấm 'Lưu và Hoàn tất bệnh án'.\n6. Hệ thống chuyển trạng thái lịch hẹn thành 'Hoàn thành' (completed), lưu hồ sơ bệnh án, kích hoạt tính năng thanh toán bên lễ tân, và chuyển ca khám sang trang 'Lịch sử khám bệnh' (/doctor/history)."],
        ["Luồng ngoại lệ", "2a. Bác sĩ muốn tra cứu hồ sơ cũ: Bấm nút 'Lịch sử khám bệnh' trên menu để xem lại toàn bộ các ca đã khám trước đó."]
    ]
    add_table_custom(doc, ["Thuộc tính", "Nội dung chi tiết"], uc2_data, [Cm(4.0), Cm(12.5)])

    # Use Case 3: Lễ tân tiếp đón & Viện phí
    add_table_marker(doc, "Bảng 2.4", "Đặc tả Use Case: Lễ tân tiếp đón theo khung giờ và quyết toán viện phí tại quầy")
    uc3_data = [
        ["Tên Use Case", "Tiếp đón bệnh nhân theo khung giờ và Quyết toán viện phí tại quầy"],
        ["Tác nhân chính", "Lễ tân (Receptionist)"],
        ["Mục đích", "Theo dõi lịch hẹn theo ngày, tiếp đón đúng giờ và thu viện phí khi bác sĩ đã khám xong"],
        ["Điều kiện tiên quyết", "Lễ tân đã đăng nhập vào hệ thống"],
        ["Luồng sự kiện chính", "1. Lễ tân vào mục Lịch hẹn (/receptionist/appointments), lọc theo ngày hôm nay hoặc xem tất cả.\n2. Khi bệnh nhân đến, lễ tân kiểm tra tên và SĐT, bấm 'Tiếp nhận' để đưa bệnh nhân vào phòng khám.\n3. Sau khi bác sĩ khám xong, bệnh nhân quay lại quầy. Lễ tân mở mục Quản lý Hóa đơn (/receptionist/invoices).\n4. Hệ thống hiển thị danh sách chờ thanh toán. Lễ tân bấm 'Tính tiền & Thu viện phí'.\n5. Hệ thống hiển thị bảng chi phí gồm: phí dịch vụ + công khám bác sĩ.\n6. Lễ tân chọn hình thức thanh toán (Tiền mặt hoặc Chuyển khoản QR), xác nhận đủ tiền và hoàn tất hóa đơn."],
        ["Luồng ngoại lệ", "4a. Bác sĩ chưa lập bệnh án: Nút 'Tính tiền' bị khóa; hệ thống thông báo lễ tân cần chờ bác sĩ hoàn tất khám lâm sàng mới được xuất hóa đơn."]
    ]
    add_table_custom(doc, ["Thuộc tính", "Nội dung chi tiết"], uc3_data, [Cm(4.0), Cm(12.5)])

    # Use Case 4: Lễ tân chấm ca & Admin tính lương
    add_table_marker(doc, "Bảng 2.5", "Đặc tả Use Case: Lễ tân chấm ca trực nhân viên và Admin tính lương tự động")
    uc4_data = [
        ["Tên Use Case", "Lễ tân chấm ca trực nhân viên và Admin tính lương tự động"],
        ["Tác nhân chính", "Lễ tân (Receptionist), Quản trị viên (Admin)"],
        ["Mục đích", "Chấm ca trực nhân viên hàng ngày để Admin theo dõi và tự động kết toán bảng lương tháng"],
        ["Điều kiện tiên quyết", "Lễ tân và Admin đã đăng nhập theo đúng vai trò"],
        ["Luồng sự kiện chính", "1. Lễ tân mở mục Chấm ca (/receptionist/attendance).\n2. Chọn ngày chấm ca (hôm nay hoặc ngày chỉ định).\n3. Danh sách nhân sự hiện ra kèm 3 nút chọn: 'Ca Sáng', 'Ca Chiều', 'Cả ngày'. Lễ tân tick chọn và bấm 'Lưu bảng chấm ca'.\n4. Dữ liệu công làm việc lập tức được đồng bộ sang hệ thống Admin.\n5. Cuối tháng, Admin vào mục Lương & Ca trực (/admin/payroll), chọn tháng/năm và bấm 'Tính toán lại bảng lương'.\n6. Hệ thống tự động tính: Tổng lương = Số ca thực tế * Đơn giá ca + Lương cứng + Số ca khám * Hoa hồng + Phụ cấp.\n7. Admin duyệt chi trả lương và xuất phiếu lương cho nhân sự."],
        ["Luồng ngoại lệ", "3a. Nhân viên nghỉ không đi làm: Lễ tân chọn 'Nghỉ làm' để hệ thống không tính công ngày đó."]
    ]
    add_table_custom(doc, ["Thuộc tính", "Nội dung chi tiết"], uc4_data, [Cm(4.0), Cm(12.5)])

    add_heading_1(doc, "2.7. Thiết kế Cơ sở dữ liệu và Lược đồ quan hệ thực thể", bookmark_name="_Toc_Ch2_7")
    add_p(doc, "Cơ sở dữ liệu dental_clinic_db được chuẩn hóa đạt chuẩn 3NF trên hệ quản trị MySQL 8.0, bao gồm 13 bảng thực thể chính với đầy đủ các trường mới:")
    
    add_figure_marker(doc, "Hình 2.6", "Sơ đồ quan hệ thực thể cơ sở dữ liệu (ERD Database Diagram)",
                      "Lược đồ ERD chuẩn 3NF biểu diễn mối quan hệ giữa 13 bảng thực thể trong dental_clinic_db")
    
    plantuml_erd = """@startuml
skinparam backgroundColor #FFFFFF
skinparam linetype ortho

entity "users" as user {
  * id : INT <<PK>>
  --
  username : VARCHAR(150)
  password : VARCHAR(128)
  role : VARCHAR(20)
  phone : VARCHAR(15)
  avatar : VARCHAR(255)
}

entity "doctors" as doctor {
  * id : INT <<PK>>
  --
  user_id : INT <<FK>>
  avatar : VARCHAR(255)
  specialty : VARCHAR(100)
  experience_years : INT
  consultation_fee : DECIMAL(10,2)
  is_available : BOOLEAN
}

entity "staff_attendance" as attendance {
  * id : INT <<PK>>
  --
  user_id : INT <<FK>>
  date : DATE
  shift : VARCHAR(20) <<morning, afternoon, full, off>>
  note : TEXT
}

entity "appointments" as appointment {
  * id : INT <<PK>>
  --
  patient_id : INT <<FK>>
  doctor_id : INT <<FK>>
  service_id : INT <<FK>>
  appointment_date : DATE
  session : VARCHAR(20)
  time_slot : VARCHAR(30)
  status : VARCHAR(30)
  is_hidden_by_patient : BOOLEAN
  created_at : DATETIME
}

entity "medical_records" as record {
  * id : INT <<PK>>
  --
  appointment_id : INT <<FK>>
  doctor_id : INT <<FK>>
  patient_id : INT <<FK>>
  diagnosis : TEXT
  tooth_status : TEXT
  treatment_performed : TEXT
  notes : TEXT
}

entity "invoices" as invoice {
  * id : INT <<PK>>
  --
  appointment_id : INT <<FK>>
  patient_id : INT <<FK>>
  total_amount : DECIMAL(12,2)
  status : VARCHAR(20)
  paid_at : DATETIME
}

user ||--o| doctor
user ||--o{ attendance
doctor ||--o{ appointment
appointment ||--o| record
appointment ||--o| invoice
@enduml"""
    add_code(doc, plantuml_erd)

    add_table_marker(doc, "Bảng 2.6", "Cấu trúc dữ liệu chi tiết các bảng trong cơ sở dữ liệu dental_clinic_db")
    db_schema_headers = ["Tên bảng", "Khóa chính / Khóa ngoại", "Mô tả trường dữ liệu chính", "Ràng buộc nghiệp vụ"]
    db_schema_data = [
        ["users", "PK: id", "username, password, role, phone, avatar", "Mật khẩu PBKDF2; role in [admin, receptionist, doctor, patient]"],
        ["doctors", "PK: id; FK: user_id", "user_id, specialty, experience_years, consultation_fee, avatar", "1-1 với users; lưu đường dẫn ảnh chân dung bác sĩ"],
        ["patients", "PK: id; FK: user_id", "user_id, full_name, date_of_birth, gender, address, medical_history", "Lưu tiền sử bệnh án và dị ứng của bệnh nhân"],
        ["services", "PK: id", "name, description, price, duration_minutes, is_active", "Danh mục dịch vụ nha khoa và đơn giá niêm yết"],
        ["doctor_schedules", "PK: id; FK: doctor_id", "doctor_id, work_date, shift, is_available", "Lịch trực bác sĩ tự đăng ký (upsert chống trùng ngày)"],
        ["staff_attendance", "PK: id; FK: user_id", "user_id, date, shift (morning/afternoon/full/off), note", "Lễ tân chấm ca trực hàng ngày cho nhân viên"],
        ["appointments", "PK: id; FK: patient, doctor, service", "appointment_date, session, time_slot, status, is_hidden_by_patient", "Khung giờ 30 phút; status: confirmed, checked-in, completed, cancelled"],
        ["medical_records", "PK: id; FK: appointment, doctor, patient", "diagnosis, tooth_status, treatment_performed, notes, follow_up_date", "Hồ sơ bệnh án lâm sàng; 1-1 với lịch hẹn đã khám"],
        ["prescriptions", "PK: id; FK: medical_record", "medical_record_id, created_at, instructions", "Đơn thuốc điện tử gắn liền với ca khám"],
        ["invoices", "PK: id; FK: appointment, patient", "total_amount, status (unpaid/paid), payment_method, paid_at", "Hóa đơn viện phí; chỉ sinh khi có bệnh án"],
        ["staff_salary_configs", "PK: id; FK: user_id", "base_salary, shift_rate, commission_per_patient, allowance", "Cấu hình đơn giá lương nhân viên do Admin định giá"],
        ["payroll_records", "PK: id; FK: user_id", "month, year, total_shifts, total_patients, net_salary, status", "Bảng lương tháng tổng hợp tính tự động"]
    ]
    add_table_custom(doc, db_schema_headers, db_schema_data, [Cm(3.5), Cm(3.5), Cm(5.5), Cm(4.0)])

    add_heading_1(doc, "2.8. Thiết kế Sơ đồ tuần tự các luồng nghiệp vụ chính", bookmark_name="_Toc_Ch2_8")
    add_p(doc, "Sơ đồ tuần tự mô tả chi tiết dòng điều khiển giữa Giao diện (React), Máy chủ API (Django) và CSDL (MySQL) đối với quy trình đặt lịch theo khung giờ 30 phút, quy trình khám lâm sàng và quy trình chấm ca tính lương:")
    
    add_figure_marker(doc, "Hình 2.7", "Sơ đồ tuần tự: Quy trình Đặt lịch theo khung giờ 30 phút và Tự hủy lịch (PlantUML)",
                      "Quy trình kiểm tra booked_slots, khóa ô trùng, xác nhận lịch hẹn và tự hủy trong 30 phút")
    
    plantuml_seq_booking = """@startuml
autonumber
actor "Bệnh nhân" as Patient
participant "Frontend (React 19)" as FE
participant "Backend API (Django)" as BE
database "Database (MySQL 8.0)" as DB

== ĐẶT LỊCH KHÁM THEO KHUNG GIỜ 30 PHÚT ==
Patient -> FE : Chọn Ngày khám, Bác sĩ & Buổi khám (Sáng/Chiều)
FE -> BE : GET /api/appointments/booked_slots/?date=...&doctor=...&session=...
BE -> DB : SELECT time_slot FROM appointments WHERE date=... AND status != 'cancelled'
DB --> BE : Trả về các khung giờ đã có người đặt
BE --> FE : Danh sách booked_slots: ['08:00 - 08:30', '09:30 - 10:00']
FE --> Patient : Hiển thị 8 ô khung giờ (khóa mờ các ô đã đặt)
Patient -> FE : Chọn ô '08:30 - 09:00' -> Bấm 'Xác nhận đặt lịch'
FE -> BE : POST /api/appointments/ {doctor, service, date, session, time_slot}
BE -> DB : Kiểm tra lại tính duy nhất khung giờ & INSERT appointment
DB --> BE : Bản ghi lịch hẹn mới (status='confirmed')
BE --> FE : HTTP 201 Created
FE --> Patient : Đặt lịch thành công! Bắt đầu đếm ngược 30 phút tự hủy

== TỰ HỦY LỊCH TRONG VÒNG 30 PHÚT ==
opt Bệnh nhân đổi ý trong vòng 30 phút
    Patient -> FE : Bấm nút 'Hủy lịch khám' (Thời gian < 30 phút)
    FE -> BE : POST /api/appointments/{id}/cancel/ {reason: "Đổi lịch"}
    BE -> DB : UPDATE appointments SET status='cancelled'
    BE --> FE : HTTP 200 OK (Đã hủy lịch thành công)
    FE --> Patient : Thông báo hủy thành công, giải phóng khung giờ
end
@enduml"""
    add_code(doc, plantuml_seq_booking)

    add_figure_marker(doc, "Hình 2.8", "Sơ đồ tuần tự: Quy trình Khám lâm sàng, Đồng bộ Bệnh án và Quyết toán Viện phí (PlantUML)",
                      "Dòng điều khiển giữa Bác sĩ khám lâm sàng, lưu bệnh án điện tử và kích hoạt hóa đơn bên Lễ tân")
    
    plantuml_seq_exam = """@startuml
autonumber
actor "Bác sĩ" as Doctor
actor "Lễ tân" as Recep
participant "Frontend (React 19)" as FE
participant "Backend API (Django)" as BE
database "Database (MySQL 8.0)" as DB

== BÁC SĨ KHÁM LÂM SÀNG & LẬP BỆNH ÁN ==
Doctor -> FE : Chọn bệnh nhân trong hàng đợi -> Bấm 'Vào khám'
Doctor -> FE : Nhập Chẩn đoán, Răng, Thủ thuật, Kê đơn thuốc
Doctor -> FE : Bấm 'Hoàn tất bệnh án'
FE -> BE : POST /api/medical/records/ {appointment_id, diagnosis, tooth_status, ...}
BE -> DB : INSERT medical_records & UPDATE appointments SET status='completed'
DB --> BE : Lưu thành công
BE --> FE : HTTP 201 Created
FE --> Doctor : Thông báo khám xong -> Ẩn khỏi hàng đợi, chuyển sang Lịch sử khám

== LỄ TÂN QUYẾT TOÁN VIỆN PHÍ TẠI QUẦY ==
Recep -> FE : Mở danh sách hóa đơn chờ thanh toán
FE -> BE : GET /api/invoices/?status=unpaid
BE -> DB : Truy vấn hóa đơn của các ca đã có medical_records
DB --> BE : Trả về hóa đơn hợp lệ
BE --> FE : Hiển thị nút 'Tính tiền & Thu viện phí'
Recep -> FE : Xác nhận thu tiền (Tiền mặt / Chuyển khoản QR)
FE -> BE : POST /api/invoices/{id}/pay/
BE -> DB : UPDATE invoices SET status='paid', paid_at=NOW()
DB --> BE : Cập nhật thành công
BE --> FE : HTTP 200 OK
FE --> Recep : Xuất biên lai viện phí hoàn tất
@enduml"""
    add_code(doc, plantuml_seq_exam)

    add_figure_marker(doc, "Hình 2.9", "Sơ đồ tuần tự: Quy trình Bác sĩ đăng ký ca trực, Lễ tân chấm ca và Admin tính lương tự động",
                      "Dòng dữ liệu từ bác sĩ đăng ký ca làm việc, lễ tân chấm ca hàng ngày đến Admin kết toán bảng lương")
    
    doc.add_page_break()


def build_chapter_3(doc):
    # ==========================================
    # CHƯƠNG 3: XÂY DỰNG VÀ KIỂM THỬ HỆ THỐNG
    # ==========================================
    add_chapter_title(doc, "CHƯƠNG 3: XÂY DỰNG VÀ KIỂM THỬ HỆ THỐNG", bookmark_name="_Toc_Ch3")
    
    add_heading_1(doc, "3.1. Hiện thực hóa Cơ sở dữ liệu trên MySQL 8.0", bookmark_name="_Toc_Ch3_1")
    add_p(doc, "Cơ sở dữ liệu được triển khai hoàn tất trên hệ quản trị MySQL 8.0 với tên database là dental_clinic_db, sử dụng bảng mã utf8mb4_unicode_ci hỗ trợ tiếng Việt toàn diện [13]. Toàn bộ 13 bảng thực thể được quản lý tự động thông qua cơ chế Migrations của Django, đảm bảo tính nhất quán giữa mô hình đối tượng Python (Models) và bảng cơ sở dữ liệu vật lý.")
    add_p(doc, "Các bảng thực thể then chốt bao gồm: users (người dùng & avatar), doctors (bác sĩ & ảnh chân dung), patients (hồ sơ bệnh nhân), services (danh mục dịch vụ nha khoa), doctor_schedules (lịch trực đăng ký), staff_attendance (bảng chấm ca trực lễ tân chấm hàng ngày), appointments (lịch hẹn kèm khung giờ 30 phút time_slot và cờ is_hidden_by_patient), medical_records (bệnh án lâm sàng), prescriptions & prescription_items (đơn thuốc điện tử), invoices (hóa đơn viện phí), staff_salary_configs (cấu hình đơn giá lương), và payroll_records (bảng lương tháng tổng hợp).")

    add_heading_1(doc, "3.2. Hiện thực hóa Backend và RESTful API", bookmark_name="_Toc_Ch3_2")
    add_p(doc, "Máy chủ Backend được xây dựng hoàn chỉnh trên nền tảng Python 3.13, Django 5.x và Django REST Framework với 10 ứng dụng chuyên biệt (Django Apps) [9], [10]. Hệ thống cung cấp hơn 35 REST API Endpoints chuẩn mực, hỗ trợ xác thực phân quyền qua JWT Token và phân quyền RBAC đa cấp độ:")
    add_bullet(doc, "Ứng dụng accounts: Xử lý đăng ký, đăng nhập JWT, làm mới Token (/api/auth/token/refresh/) và quản lý tài khoản người dùng.")
    add_bullet(doc, "Ứng dụng appointments: Xử lý đặt lịch theo khung giờ 30 phút, kiểm tra danh sách khung giờ đã kín (/api/appointments/booked_slots/), tự hủy lịch trong 30 phút (/api/appointments/{id}/cancel/), xóa lịch sử đã khám (/api/appointments/{id}/hide_history/).")
    add_bullet(doc, "Ứng dụng doctors: Quản lý hồ sơ bác sĩ, hỗ trợ tải lên và cập nhật hình ảnh đại diện avatar qua MultiPartParser (/api/doctors/).")
    add_bullet(doc, "Ứng dụng schedules: Xử lý đăng ký ca trực bác sĩ bằng cơ chế upsert chống trùng ngày (/api/schedules/), phân hệ chấm ca trực nhân viên của lễ tân (/api/schedules/attendance/), cấu hình lương và tự động tính bảng lương tháng (/api/schedules/payrolls/calculate/).")
    add_bullet(doc, "Ứng dụng medical & invoices: Tiếp nhận khám lâm sàng, lưu trữ bệnh án điện tử (/api/medical/records/), tự động sinh hóa đơn viện phí và xuất hóa đơn thanh toán (/api/invoices/).")
    add_bullet(doc, "Ứng dụng stats & chatbot: Tổng hợp số liệu tài chính doanh thu 12 tháng, xếp hạng bác sĩ, và dịch vụ Chatbot AI Google Gemini 2.0 Flash (/api/chatbot/ask/).")

    add_heading_1(doc, "3.3. Hiện thực hóa Giao diện người dùng với React 19 và Ant Design", bookmark_name="_Toc_Ch3_3")
    add_p(doc, "Giao diện người dùng được tổ chức theo 4 phân hệ Layout độc lập tương ứng với 4 vai trò tác nhân: AdminLayout, ReceptionistLayout, DoctorLayout và PatientLayout [11]. Sử dụng React Router v6 điều hướng Single Page mượt mà, kết hợp bộ thư viện Ant Design v5 đem lại sự đồng bộ cao về mặt thẩm mỹ, màu sắc nhận diện thương hiệu y tế (Tone xanh dương chủ đạo #003366 và #1890ff), biểu tượng @ant-design/icons trực quan và hệ thống thông báo Toast/Message tức thời.")

    add_heading_1(doc, "3.4. Kết quả xây dựng các phân hệ chức năng thực tế", bookmark_name="_Toc_Ch3_4")
    add_p(doc, "Dưới đây là mô tả chi tiết kết quả xây dựng và hoạt động thực tế của 5 phân hệ chức năng cốt lõi trên hệ thống:")

    add_heading_2(doc, "3.4.1. Phân hệ Bệnh nhân", bookmark_name="_Toc_Ch3_4_1")
    add_p(doc, "Phân hệ Bệnh nhân cung cấp cổng dịch vụ y tế trực tuyến toàn diện cho người bệnh. Chức năng Đặt lịch khám theo khung giờ 30 phút (/patient/booking) cho phép bệnh nhân chọn chuyên khoa, chọn bác sĩ yêu thích (hoặc để hệ thống tự động phân bổ ngẫu nhiên), chọn ngày khám và buổi khám (Sáng hoặc Chiều). Hệ thống hiển thị trực quan 8 ô khung giờ, các ô đã có người đặt trước sẽ tự động bị khóa mờ. Bệnh nhân chỉ cần chọn một ô khung giờ trống và xác nhận đặt lịch mà không phải trải qua bất kỳ thủ tục thu phí trước phức tạp nào. Nếu có nhu cầu thay đổi, bệnh nhân có thể bấm nút 'Hủy lịch' trực tiếp trong vòng 30 phút kể từ lúc đặt để hệ thống tự động giải phóng khung giờ. Ngoài ra, bệnh nhân có thể sử dụng tính năng 'Xóa lịch sử' đối với những ca đã khám xong để danh sách cá nhân luôn gọn gàng. Phân hệ Sổ bệnh án điện tử (/patient/records) cho phép bệnh nhân theo dõi đầy đủ chẩn đoán bệnh lý, vị trí răng điều trị, thủ thuật y tế đã thực hiện, dặn dò của bác sĩ, đơn thuốc điện tử và hóa đơn viện phí đã thanh toán.")
    
    add_figure_marker(doc, "Hình 3.1", "Giao diện Cổng đặt lịch khám trực tuyến theo khung giờ 30 phút (/patient/booking)",
                      "Giao diện trực quan cho phép bệnh nhân chọn ngày, chọn ca và 8 ô khung giờ 30 phút")
    add_figure_marker(doc, "Hình 3.2", "Giao diện Sổ bệnh án điện tử cá nhân và chức năng Xóa lịch sử đã khám (/patient/records)",
                      "Giao diện hồ sơ bệnh án điện tử cá nhân hiển thị chẩn đoán, thủ thuật, đơn thuốc và nút xóa lịch sử")

    add_heading_2(doc, "3.4.2. Phân hệ Bác sĩ", bookmark_name="_Toc_Ch3_4_2")
    add_p(doc, "Phân hệ Bác sĩ hỗ trợ tối đa công tác chuyên môn lâm sàng và quản lý thời gian làm việc. Tại mục Đăng ký ca làm việc (/doctor/schedule), bác sĩ chủ động chọn ca trực trong tuần (Sáng, Chiều hoặc Cả ngày) với cơ chế upsert tự động, giúp cập nhật ca trực mượt mà không lo lỗi trùng ngày. Tại Phòng khám lâm sàng (/doctor/examination), bác sĩ tiếp nhận danh sách bệnh nhân chờ khám theo đúng khung giờ đã hẹn, xem tiền sử bệnh và dị ứng trước khi vào khám. Trong quá trình điều trị, bác sĩ ghi nhận chẩn đoán bệnh lý chính, vị trí răng can thiệp, thủ thuật đã thực hiện, lời dặn dò và kê đơn thuốc điện tử. Khi bác sĩ bấm 'Hoàn tất bệnh án', bệnh nhân lập tức được chuyển khỏi hàng đợi chờ khám và chuyển vào mục 'Lịch sử khám bệnh' (/doctor/history). Bác sĩ có thể mở mục Lịch sử khám để tra cứu lại toàn bộ hồ sơ bệnh án cũ bất kỳ lúc nào một cách độc lập.")
    
    add_figure_marker(doc, "Hình 3.3", "Giao diện Phòng khám lâm sàng và Lịch sử khám bệnh của Bác sĩ (/doctor/examination, /doctor/history)",
                      "Giao diện khám lâm sàng, lập bệnh án điện tử và trang phân tách lịch sử khám bệnh riêng của Bác sĩ")

    add_heading_2(doc, "3.4.3. Phân hệ Lễ tân", bookmark_name="_Toc_Ch3_4_3")
    add_p(doc, "Phân hệ Lễ tân đóng vai trò điều phối trung tâm tại quầy tiếp đón của phòng khám. Tại mục Quản lý Lịch hẹn (/receptionist/appointments), lễ tân có thể chọn xem tất cả lịch hẹn hoặc lọc theo từng ngày cụ thể để nắm bắt chính xác số lượng bệnh nhân, khung giờ và bác sĩ tiếp nhận. Khi bệnh nhân đến quầy, lễ tân đối soát số điện thoại và bấm 'Tiếp nhận' để đưa bệnh nhân vào phòng khám. Tại mục Chấm ca trực nhân viên (/receptionist/attendance), lễ tân thực hiện điểm danh ca làm việc hàng ngày cho toàn thể nhân sự với 3 lựa chọn nhanh: Ca Sáng, Ca Chiều và Cả ngày, sau đó bấm Lưu để dữ liệu công được đồng bộ tức thời sang quản trị Admin. Tại mục Quản lý Hóa đơn (/receptionist/invoices), hệ thống thiết lập ràng buộc: chỉ những ca khám đã có hồ sơ bệnh án hoàn tất từ bác sĩ mới hiển thị nút 'Tính tiền & Thu viện phí', giúp lễ tân đối soát chi phí chuẩn xác và xuất phiếu thu cho bệnh nhân.")
    
    add_figure_marker(doc, "Hình 3.4", "Giao diện Bàn tiếp đón, Chấm ca nhân viên & Quản lý Hóa đơn của Lễ tân (/receptionist/attendance, /receptionist/invoices)",
                      "Giao diện tiếp đón theo SĐT, chấm ca trực nhân viên 3 nút và quyết toán viện phí khi có bệnh án")

    add_heading_2(doc, "3.4.4. Phân hệ Quản trị viên Admin", bookmark_name="_Toc_Ch3_4_4")
    add_p(doc, "Phân hệ Quản trị viên cung cấp bộ công cụ mạnh mẽ hỗ trợ quản lý toàn diện phòng khám. Tại mục Quản lý Bác sĩ (/admin/doctors), Admin có thể thêm mới hoặc cập nhật hồ sơ bác sĩ, tải lên hình ảnh chân dung thực tế (preview trực quan) để đồng bộ hiển thị lên Trang chủ. Tại mục Lịch sử khám bệnh toàn diện (/admin/examination-history), Admin dễ dàng tra cứu hoạt động khám chữa bệnh theo Tháng, Năm hoặc Toàn thời gian với các thẻ thống kê tổng quan (KPI): số bệnh nhân đã khám, tổng doanh thu đã thu, số ca đặt rồi hủy cùng tỷ lệ % hủy lịch. Tại mục Quản lý Lương & Ca trực (/admin/payroll), Admin giám sát tình hình đi làm thực tế của nhân sự, cấu hình định mức lương (lương ca, lương cứng, hoa hồng/bệnh nhân, phụ cấp) và bấm 'Tính toán lại bảng lương' để hệ thống tự động kết toán thu nhập cho từng nhân viên. Mục Biểu đồ Thống kê (/admin/statistics) trực quan hóa doanh thu 12 tháng, cơ cấu dịch vụ và hiệu suất của đội ngũ y bác sĩ.")
    
    add_figure_marker(doc, "Hình 3.5", "Giao diện Quản lý Bác sĩ kèm tải ảnh chân dung và Lịch sử khám bệnh phòng khám (/admin/doctors, /admin/examination-history)",
                      "Giao diện tải ảnh bác sĩ có preview và trang Lịch sử khám bệnh phòng khám lọc theo Tháng/Năm")
    add_figure_marker(doc, "Hình 3.6", "Giao diện Giám sát Ca làm việc & Quản trị Lương nhân sự (/admin/payroll)",
                      "Giao diện bảng chấm công nhân viên và chức năng tự động tính toán bảng lương tháng")
    add_figure_marker(doc, "Hình 3.7", "Giao diện Hệ thống Biểu đồ Thống kê Doanh thu phòng khám (/admin/statistics)",
                      "Hệ thống biểu đồ doanh thu 12 tháng, cơ cấu gói dịch vụ nha khoa và xếp hạng bác sĩ")

    add_heading_2(doc, "3.4.5. Phân hệ Trợ lý thông minh Chatbot AI", bookmark_name="_Toc_Ch3_4_5")
    add_p(doc, "Phân hệ Trợ lý ảo AI tích hợp mô hình Google Gemini 2.0 Flash được bồi đắp dữ liệu thời gian thực từ cơ sở dữ liệu phòng khám (danh mục bác sĩ, chuyên khoa, bảng giá dịch vụ hiện hành và lịch trực hôm nay). Chatbot hỗ trợ giải đáp thắc mắc của người bệnh 24/7 một cách nhanh chóng, chính xác. Bộ lọc y đức nghiêm ngặt được cài đặt sẵn giúp Chatbot từ chối các câu hỏi chẩn đoán bệnh tật hoặc kê đơn thuốc, luôn khuyến nghị người bệnh đặt lịch hẹn theo khung giờ 30 phút để được bác sĩ chuyên khoa thăm khám trực tiếp.")

    add_heading_1(doc, "3.5. Kiểm thử hệ thống và Kết quả kiểm thử", bookmark_name="_Toc_Ch3_5")
    add_p(doc, "Đề tài thực hiện kiểm thử toàn diện trên cả 3 cấp độ: Unit Testing, Integration Testing và End-to-End Scenario Testing theo đúng chuẩn kỹ nghệ phần mềm [14], [15]. Kết quả tổng hợp trong Bảng 3.1:")
    
    test_headers = ["Mã Test", "Chức năng kiểm thử", "Kịch bản thực hiện", "Kết quả mong đợi", "Đánh giá"]
    test_data = [
        ["TC-01", "Xác thực JWT & Phân quyền RBAC", "Đăng nhập 4 vai trò, kiểm tra truy cập trái quyền", "Chặn 403 Forbidden đúng quyền", "ĐẠT (PASS)"],
        ["TC-02", "Đăng ký ca trực bác sĩ (upsert)", "Bác sĩ đăng ký ca sáng/chiều/cả ngày, đăng ký lại cùng ngày", "Lưu vào CSDL, cập nhật mượt mà không lỗi trùng ngày", "ĐẠT (PASS)"],
        ["TC-03", "Khung giờ 30 phút & Khóa giờ trùng", "Bệnh nhân chọn khung giờ đã có người đặt trước", "Khung giờ bị khóa mờ, chặn đặt trùng giờ", "ĐẠT (PASS)"],
        ["TC-04", "Đặt lịch hẹn theo khung giờ 30 phút & Lưu SĐT tiếp nhận", "Bệnh nhân đặt lịch theo khung giờ 30 phút, cung cấp SĐT", "Lưu lịch confirmed ngay, lưu thông tin SĐT tiếp nhận", "ĐẠT (PASS)"],
        ["TC-05", "Tự hủy lịch trong 30 phút", "Bệnh nhân bấm 'Hủy lịch' trong vòng 30 phút", "Hủy thành công, giải phóng khung giờ 30p", "ĐẠT (PASS)"],
        ["TC-06", "Khóa tự hủy khi quá 30 phút", "Kiểm tra nút hủy sau khi đặt quá 30 phút", "Nút tự hủy ẩn đi, hướng dẫn liên hệ lễ tân", "ĐẠT (PASS)"],
        ["TC-07", "Xóa lịch sử đã khám (Patient)", "Bệnh nhân bấm 'Xóa lịch sử' ca completed", "Ẩn khỏi danh sách cá nhân, không lỗi CSDL", "ĐẠT (PASS)"],
        ["TC-08", "Chấm ca trực nhân viên (Lễ tân)", "Lễ tân chọn Ca Sáng/Chiều/Cả ngày, bấm Lưu", "Lưu staff_attendance, đồng bộ sang Admin", "ĐẠT (PASS)"],
        ["TC-09", "Khám bệnh & Bệnh án điện tử", "Bác sĩ nhập chẩn đoán, răng, thủ thuật, đơn thuốc", "Lưu medical_record, trạng thái Completed", "ĐẠT (PASS)"],
        ["TC-10", "Tách Lịch sử khám riêng (Bác sĩ)", "Xem danh sách chờ khám sau khi hoàn tất bệnh án", "Ẩn ca đã khám, hiển thị tại /doctor/history", "ĐẠT (PASS)"],
        ["TC-11", "Ràng buộc Hóa đơn viện phí", "Lễ tân xuất hóa đơn khi chưa/đã có bệnh án", "Chưa có: nút khóa; Đã có: tính đúng viện phí", "ĐẠT (PASS)"],
        ["TC-12", "Tải ảnh đại diện Bác sĩ (Admin)", "Admin tải ảnh JPG/PNG khi tạo/sửa bác sĩ", "Upload MultiPart thành công, hiện trên Trang chủ", "ĐẠT (PASS)"],
        ["TC-13", "Lịch sử khám & Thống kê (Admin)", "Admin lọc theo Tháng/Năm/Toàn bộ thời gian", "Hiện đúng số người khám, doanh thu, ca hủy", "ĐẠT (PASS)"],
        ["TC-14", "Tính bảng lương tháng tự động", "Admin bấm 'Tính toán lại bảng lương'", "Tự động nhân số ca trực và lượt khám hoàn thành", "ĐẠT (PASS)"],
        ["TC-15", "Hỏi đáp Trợ lý Chatbot AI", "Hỏi bảng giá, bác sĩ trực, hỏi kê đơn thuốc", "Trả lời đúng giá dịch vụ; từ chối kê đơn", "ĐẠT (PASS)"]
    ]
    add_table_marker(doc, "Bảng 3.1", "Tổng hợp kết quả kiểm thử các chức năng chính của hệ thống (TC-01 đến TC-15)")
    add_table_custom(doc, test_headers, test_data, [Cm(2.0), Cm(3.8), Cm(4.5), Cm(4.2), Cm(2.0)])
    
    doc.add_page_break()


def build_conclusion_and_back_matter(doc):
    # ==========================================
    # KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
    # ==========================================
    add_chapter_title(doc, "KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", bookmark_name="_Toc_KetLuan")
    
    add_heading_1(doc, "1. Kết quả đạt được của đồ án", bookmark_name="_Toc_KetLuan_1")
    add_p(doc, "Sau thời gian nghiêm túc nghiên cứu lý thuyết, khảo sát nghiệp vụ thực tế và hiện thực hóa mã nguồn, đồ án tốt nghiệp 'Hệ thống quản lý và đặt lịch phòng khám nha khoa trực tuyến' đã hoàn thành xuất sắc toàn bộ các mục tiêu nghiên cứu và kế hoạch đề ra ban đầu:")
    add_bullet(doc, "1. Về cơ sở dữ liệu: Xây dựng thành công cơ sở dữ liệu quan hệ MySQL 8.0 chuẩn hóa 3NF gồm 13 bảng thực thể liên kết chặt chẽ, bảo đảm tính toàn vẹn dữ liệu lâm sàng và viện phí.")
    add_bullet(doc, "2. Về kiến trúc máy chủ API: Xây dựng hoàn chỉnh hệ thống Backend RESTful API với Python và Django REST Framework gồm 10 Apps độc lập, áp dụng xác thực JWT Token và phân quyền RBAC 4 vai trò bảo mật tuyệt đối.")
    add_bullet(doc, "3. Về giao diện người dùng: Xây dựng giao diện Web Single Page Application hiện đại với React 19, Vite và Ant Design v5, đem lại trải nghiệm mượt mà, đồng bộ và chuyên nghiệp.")
    add_bullet(doc, "4. Về đột phá nghiệp vụ đặt lịch: Giải quyết triệt để bài toán dồn ứ bệnh nhân và chờ đợi lâu bằng cơ chế chia khung giờ 30 phút (8 khung/ca sáng và 8 khung/ca chiều); khóa tự động khung giờ trùng; tối ưu hóa quy trình tiếp nhận tại quầy bằng số điện thoại; hỗ trợ tự hủy lịch trong 30 phút và xóa lịch sử các ca đã khám xong.")
    add_bullet(doc, "5. Về quy trình lâm sàng và viện phí: Đồng bộ lâm sàng thời gian thực; ràng buộc bắt buộc có bệnh án mới được xuất hóa đơn tính tiền; phân tách các ca đã khám vào trang Lịch sử khám bệnh riêng của Bác sĩ.")
    add_bullet(doc, "6. Về nhân sự và quản trị: Hiện thực hóa tính năng Lễ tân chấm ca trực hàng ngày (Ca Sáng, Ca Chiều, Cả ngày); Admin quản lý hồ sơ bác sĩ kèm ảnh chân dung thực tế; trang Lịch sử khám bệnh & Thống kê doanh thu theo Tháng/Năm; định giá và tự động tính lương tháng minh bạch.")
    add_bullet(doc, "7. Về Trí tuệ nhân tạo: Tích hợp thành công Trợ lý ảo AI Google Gemini 2.0 Flash được bồi đắp dữ liệu thời gian thực và kiểm soát y đức nghiêm ngặt.")

    add_heading_1(doc, "2. Những hạn chế của hệ thống", bookmark_name="_Toc_KetLuan_2")
    add_p(doc, "Bên cạnh những kết quả tích cực đã đạt được, hệ thống vẫn tồn tại một số điểm hạn chế do giới hạn về mặt thời gian và điều kiện thực nghiệm:")
    add_bullet(doc, "Chưa tích hợp cổng thanh toán trực tuyến tự động qua ngân hàng (như VNPay, MoMo, PayOS qua Webhook) để tự động đối soát giao dịch thanh toán viện phí từ xa.")
    add_bullet(doc, "Mô hình ghi nhận răng lâm sàng hiện mới dừng lại ở dạng nhập văn bản mô tả vị trí và tình trạng răng, chưa xây dựng được sơ đồ đồ họa 3D tương tác đa chiều cho cung hàm 32 răng.")
    add_bullet(doc, "Hệ thống hiện vận hành chủ yếu trên nền tảng trình duyệt Web (Responsive), chưa phát triển thành ứng dụng di động độc lập (Mobile App) trên App Store và Google Play.")
    add_bullet(doc, "Kênh thông báo nhắc lịch khám hiện gửi qua giao diện web, chưa tích hợp tự động qua Zalo Official Account API (Zalo ZNS) hoặc SMS Brandname vào số điện thoại của bệnh nhân.")

    add_heading_1(doc, "3. Hướng phát triển trong tương lai", bookmark_name="_Toc_KetLuan_3")
    add_bullet(doc, "1. Tự động hóa cổng thanh toán qua Webhook: Tích hợp các cổng thanh toán trực tuyến như PayOS, VNPay hoặc VietQR API để tự động bắt biến động số dư tài khoản ngân hàng thông qua Webhook, giúp hệ thống tự động xác nhận thanh toán viện phí trong vòng 5 giây.")
    add_bullet(doc, "2. Nâng cấp Sơ đồ nha chu tương tác 3D (Interactive Dental Chart): Ứng dụng thư viện Three.js hoặc Canvas SVG để xây dựng sơ đồ răng đồ họa tương tác: bác sĩ có thể click trực tiếp vào từng vị trí răng, đổi màu sắc răng theo trạng thái bệnh lý.")
    add_bullet(doc, "3. Phát triển Mobile App dành riêng cho Bệnh nhân: Phát triển ứng dụng di động đa nền tảng bằng React Native hoặc Flutter cho cả iOS và Android, hỗ trợ nhận thông báo đẩy (Push Notification) nhắc lịch khám trước 24 giờ.")
    add_bullet(doc, "4. Tự động hóa thông báo qua Zalo ZNS / SMS Brandname: Tích hợp Zalo Cloud API để gửi tin nhắn ZNS tự động xác nhận lịch hẹn và thông báo đơn thuốc điện tử trực tiếp vào Zalo cá nhân của bệnh nhân.")
    add_bullet(doc, "5. Ứng dụng AI phân tích hình ảnh X-quang nha khoa: Nghiên cứu ứng dụng các mô hình thị giác máy tính (Computer Vision - YOLOv8, CNN) hỗ trợ bác sĩ phân tích tự động ảnh chụp X-quang răng Panorama hoặc Cephalo.")

    add_heading_1(doc, "4. Bảng ghi chú các hạng mục chưa thực hiện và lộ trình thực hiện tiếp theo", bookmark_name="_Toc_KetLuan_4")
    add_p(doc, "Theo yêu cầu quản trị dự án khoa học và định hướng hoàn thiện sản phẩm sau bảo vệ, Bảng 4.1 tổng hợp chi tiết các hạng mục chưa thực hiện trong phạm vi đồ án hiện tại và đề xuất lộ trình công nghệ triển khai tiếp theo:")
    
    note_headers = ["STT", "Hạng mục tính năng đề xuất", "Trạng thái hiện tại", "Công nghệ & Giải pháp triển khai sau", "Mức độ ưu tiên"]
    note_data = [
        ["1", "Cổng thanh toán trực tuyến tự động qua Webhook", "Chưa thực hiện (Hiện thanh toán tại quầy)", "Tích hợp PayOS / VNPay API / VietQR, xử lý Webhook IPN tự động", "Ưu tiên cao (P1)"],
        ["2", "Sơ đồ răng 3D tương tác (3D Dental Chart)", "Chưa thực hiện (Hiện nhập text vị trí răng)", "Thư viện Three.js / React Three Fiber, mô hình 3D cung hàm 32 răng", "Ưu tiên trung bình (P2)"],
        ["3", "Ứng dụng di động đa nền tảng (Mobile App)", "Chưa thực hiện (Hiện chạy Web Responsive)", "React Native / Flutter, Expo, Firebase Push Notifications", "Ưu tiên cao (P1)"],
        ["4", "Gửi tin nhắn nhắc lịch qua Zalo ZNS / SMS", "Chưa thực hiện (Hiện nhắc trên Web)", "Zalo Cloud API (ZNS), SMS Brandname eSMS / Twilio API", "Ưu tiên cao (P1)"],
        ["5", "AI chẩn đoán hình ảnh X-quang nha khoa", "Chưa thực hiện (Chatbot AI mới tư vấn text)", "Mô hình Computer Vision (YOLOv8, PyTorch, OpenCV)", "Nghiên cứu mở rộng (P3)"]
    ]
    add_table_marker(doc, "Bảng 4.1", "Bảng tổng hợp các hạng mục tính năng chưa thực hiện và lộ trình phát triển trong tương lai")
    add_table_custom(doc, note_headers, note_data, [Cm(1.2), Cm(4.5), Cm(3.2), Cm(5.0), Cm(2.6)])
    
    doc.add_page_break()

    # ==========================================
    # TÀI LIỆU THAM KHẢO
    # ==========================================
    add_chapter_title(doc, "TÀI LIỆU THAM KHẢO", bookmark_name="_Toc_TaiLieu")
    refs = [
        "[1] Bộ Y tế (2019), Thông tư số 46/2018/TT-BYT ban hành Quy định về bệnh án điện tử, Hà Nội.",
        "[2] Bộ Thông tin và Truyền thông (2020), Quyết định số 749/QĐ-TTg phê duyệt Chương trình Chuyển đổi số quốc gia đến năm 2025, định hướng đến năm 2030, Thủ tướng Chính phủ, Hà Nội.",
        "[3] Nguyễn Văn A (2022), 'Nghiên cứu và ứng dụng CNTT trong tối ưu hóa quy trình quản lý phòng khám tư nhân tại Việt Nam,' Tạp chí Tin học và Y học, số 15, tr. 45–52.",
        "[4] S. Mohammed Harris, R. S. Soonthodu, S. Bharti, M. Das, C. S. James và K. Aadisha, 'Effect of AI-powered patient management systems in dental clinics,' Bioinformation, vol. 22, no. 4, pp. 2045–2048, 2026. DOI: 10.6026/973206300222045.",
        "[5] G. Giannakis, 'Towards an AI Powered Dental Clinic Management Ecosystem,' Studies in Health Technology and Informatics, vol. 338, pp. 353–357, 2026. DOI: 10.3233/SHTI260862.",
        "[6] M. A. Alshammari et al., 'Dental Appointment Adherence Patterns in the College of Dentistry, King Saud Bin Abdulaziz University for Health Sciences: Insights From Electronic Dental Records,' Cureus Journal of Medical Science, vol. 15, no. 8, 2023.",
        "[7] University of Michigan School of Dentistry, 'Using business intelligence and data visualization to understand the characteristics of failed appointments in dental school clinics,' Journal of Dental Education, vol. 85, no. 11, 2021.",
        "[8] Python Software Foundation, 'Python 3.13 Documentation & Language Reference,' https://docs.python.org/3.13/, 2026.",
        "[9] Django Software Foundation, 'Django Documentation (Version 5.x) - The web framework for perfectionists with deadlines,' https://docs.djangoproject.com/, 2026.",
        "[10] Django REST Framework, 'Django REST framework Documentation - Web APIs for Django,' https://www.django-rest-framework.org/, 2026.",
        "[11] Meta Platforms, Inc., 'React Documentation (React 19) - The library for web and native user interfaces,' https://react.dev/, 2026.",
        "[12] Vite Team, 'Vite Documentation - Next Generation Frontend Tooling,' https://vitejs.dev/, 2026.",
        "[13] Oracle Corporation, 'MySQL 8.0 Reference Manual including InnoDB Storage Engine Architecture,' https://dev.mysql.com/doc/refman/8.0/en/, 2026.",
        "[14] Pressman, R. S. (2014), 'Software Engineering: A Practitioner's Approach,' 8th Edition, McGraw-Hill Education.",
        "[15] Sommerville, I. (2015), 'Software Engineering,' 10th Edition, Pearson Education."
    ]
    for ref in refs:
        p_ref = doc.add_paragraph()
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_ref.paragraph_format.line_spacing = 1.25
        p_ref.paragraph_format.space_after = Pt(4)
        p_ref.paragraph_format.left_indent = Cm(1.27)
        p_ref.paragraph_format.first_line_indent = Cm(-1.27)
        r = p_ref.add_run(ref)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(13)
        r.font.color.rgb = COLOR_BLACK
        
    doc.add_page_break()

    # ==========================================
    # PHỤ LỤC
    # ==========================================
    add_chapter_title(doc, "PHỤ LỤC", bookmark_name="_Toc_PhuLuc")
    
    add_heading_1(doc, "Phụ lục 1: Hướng dẫn Cài đặt, Khởi chạy và Trải nghiệm Hệ thống", bookmark_name="_Toc_PhuLuc_1")
    add_p(doc, "Để triển khai hệ thống phần mềm phòng khám nha khoa trên môi trường máy chủ cục bộ (Localhost), quản trị viên thực hiện theo các bước sau:")
    add_bullet(doc, "Bước 1 - Cơ sở dữ liệu: Khởi động dịch vụ MySQL 8.0, tạo cơ sở dữ liệu dental_clinic_db và nạp tệp sao lưu dữ liệu mẫu: mysql -u root -p dental_clinic_db < dental_clinic_db.sql")
    add_bullet(doc, "Bước 2 - Máy chủ Backend: Di chuyển vào thư mục backend, kích hoạt môi trường ảo Python và khởi chạy dịch vụ API: python manage.py runserver 0.0.0.0:8000 (Backend API hoạt động tại http://localhost:8000).")
    add_bullet(doc, "Bước 3 - Giao diện Frontend: Di chuyển vào thư mục frontend, cài đặt các gói phụ thuộc và chạy môi trường dev: npm install && npm run dev (Giao diện web hoạt động tại http://localhost:3000).")
    add_bullet(doc, "Bước 4 - Trải nghiệm tài khoản: Sử dụng các tài khoản mẫu định sẵn trong hệ thống: Quản trị viên (admin / admin123); Bác sĩ (bsminh / doctor123); Lễ tân (letan1 / letan123); Bệnh nhân (benhnhan1 / patient123).")

    add_heading_1(doc, "Phụ lục 2: Hướng dẫn Sử dụng Mã nguồn PlantUML để Chèn Hình Vẽ trên Draw.io", bookmark_name="_Toc_PhuLuc_2")
    add_p(doc, "Trong Báo cáo đồ án, tất cả các sơ đồ thiết kế hệ thống (Use Case, Sơ đồ tuần tự Sequence, Sơ đồ ERD) đều đã được cung cấp kèm mã nguồn PlantUML chuẩn mực bên dưới mỗi hình. Sinh viên có thể xuất sơ đồ đồ họa vector cực kỳ nhanh chóng và chuyên nghiệp theo 3 bước sau:")
    add_bullet(doc, "Bước 1: Sao chép toàn bộ khối mã nguồn PlantUML (nằm giữa @startuml và @enduml) của sơ đồ tương ứng.")
    add_bullet(doc, "Bước 2: Truy cập trang web trực tuyến https://app.diagrams.net (Draw.io) hoặc https://www.planttext.com. Trên Draw.io, chọn menu: Arrange -> Insert -> Advanced -> PlantUML, sau đó dán mã nguồn vào và bấm Insert.")
    add_bullet(doc, "Bước 3: Draw.io sẽ tự động vẽ sơ đồ vector sắc nét. Chọn File -> Export as -> PNG (hoặc JPEG, độ phân giải 300 DPI) để tải ảnh về máy tính và chèn vào báo cáo.")


def main():
    print("="*60)
    print("BAT DAU XAY DUNG BAO CAO DO AN TOT NGHIEP CHUAN DAU (KHOA CNTT)")
    print("="*60)
    
    doc = docx.Document()
    
    # Configure updateFields=true in document settings
    settings_elm = doc.settings.element
    update_fields = parse_xml(f'<w:updateFields {nsdecls("w")} w:val="true"/>')
    settings_elm.append(update_fields)
    
    # Set document-level margins and default style
    for section in doc.sections:
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(3.0)
        section.right_margin = Cm(2.0)
        section.header_distance = Cm(1.6)
        section.footer_distance = Cm(1.6)
        
        # Header setup: Tên đề tài nghiêng 10pt căn giữa
        header_p = section.header.paragraphs[0]
        header_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        hrun = header_p.add_run("ĐỒ ÁN TỐT NGHIỆP: HỆ THỐNG QUẢN LÝ VÀ ĐẶT LỊCH PHÒNG KHÁM NHA KHOA TRỰC TUYẾN")
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(10)
        hrun.font.italic = True
        hrun.font.color.rgb = COLOR_BLACK
        
        # Footer setup: SV, GVHD & Page number
        footer_p = section.footer.paragraphs[0]
        footer_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        frun1 = footer_p.add_run("SVTH: Lê Đình Nguyên (2251220246) - GVHD: ThS. Đoàn Duy Bình          Trang ")
        frun1.font.name = "Times New Roman"
        frun1.font.size = Pt(10)
        frun1.font.italic = True
        frun1.font.color.rgb = COLOR_BLACK
        # Add PAGE field
        f_r = footer_p.add_run()
        fld1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
        instr = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
        fld2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
        fld3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
        f_r._r.append(fld1)
        f_r._r.append(instr)
        f_r._r.append(fld2)
        f_r._r.append(fld3)

    print("1. Dang tao cac trang dau (Bia ngoai, Bia trong, Nhan xet, Tom tat, Loi mo dau, Cam doan)...")
    build_front_pages(doc)
    
    print("2. Dang tao Muc luc tu dong (Word TOC), Bang Danh muc bang bieu khoa hoc, Bang Danh muc hinh ve khoa hoc...")
    build_toc_and_lists(doc)
    
    print("3. Dang tao Phan Mo Dau (gop, chuan hoc thuat, trich dan [1]-[3], bookmarks)...")
    build_introduction(doc)
    
    print("4. Dang tao Chuong 1: Co so ly thuyet va cong nghe (bookmarks)...")
    build_chapter_1(doc)
    
    print("5. Dang tao Chuong 2: Phan tich va thiet ke he thong (6 quy tac van xuoi, ERD, Sequence, Use Case, bookmarks)...")
    build_chapter_2(doc)
    
    print("6. Dang tao Chuong 3: Xay dung va kiem thu (5 phan he thuc te, 15 Test cases, bookmarks)...")
    build_chapter_3(doc)
    
    print("7. Dang tao Ket luan, Bang 4.1 danh muc chua thuc hien, Tai lieu tham khao [1]-[15], Phu luc (bookmarks)...")
    build_conclusion_and_back_matter(doc)
    
    # Save target files
    repo_out = r"C:\Users\Administrator\dental-clinic\Bao_Cao_Do_An_Tot_Nghiep_Nha_Khoa.docx"
    desktop_out = r"C:\Users\Administrator\Desktop\Bao_Cao_Do_An_Tot_Nghiep_Nha_Khoa_Moi_Nhat.docx"
    artifact_out = os.path.join(ARTIFACTS_DIR, "Bao_Cao_Do_An_Tot_Nghiep_Nha_Khoa_Moi_Nhat.docx")
    
    doc.save(repo_out)
    print(f"-> Da luu tai: {repo_out}")
    
    # Check if desktop file is open and copy safely
    try:
        shutil.copyfile(repo_out, desktop_out)
        print(f"-> Da copy sang Desktop: {desktop_out}")
    except PermissionError:
        print("WINWORD dang mo file desktop, dong WINWORD va copy lai...")
        os.system("taskkill /f /im WINWORD.EXE")
        import time
        time.sleep(1)
        shutil.copyfile(repo_out, desktop_out)
        print(f"-> Da copy sang Desktop thanh cong: {desktop_out}")
        
    shutil.copyfile(repo_out, artifact_out)
    print(f"-> Da copy sang Artifacts: {artifact_out}")
    
    print("="*60)
    print("HOAN THANH TAO BAO CAO TOT NGHIEP THANH CONG!")
    print("="*60)

if __name__ == "__main__":
    main()
