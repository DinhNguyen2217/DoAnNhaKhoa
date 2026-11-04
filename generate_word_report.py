import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, fill_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_report():
    doc = docx.Document()

    # Standard A4 margins (Left 3cm, Right 2cm, Top 2cm, Bottom 2cm)
    for section in doc.sections:
        section.top_margin = Inches(0.79)      # 2.0 cm
        section.bottom_margin = Inches(0.79)   # 2.0 cm
        section.left_margin = Inches(1.18)     # 3.0 cm
        section.right_margin = Inches(0.79)    # 2.0 cm

    # Default font styling
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(13)
    font.color.rgb = RGBColor(30, 30, 30)

    # Helper functions for styling
    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(40, 40, 40)
        return p

    def add_main_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(14)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(16.5)
        run.font.color.rgb = RGBColor(0, 51, 102) # Navy Blue
        return p

    def add_heading1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(14.5)
        run.font.color.rgb = RGBColor(0, 51, 102)
        return p

    def add_heading2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(13.5)
        run.font.color.rgb = RGBColor(31, 78, 121)
        return p

    def add_heading3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.italic = True
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(46, 117, 182)
        return p

    def add_body(text, bold_prefix=None, space_after=6, italic=False):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.space_after = Pt(space_after)
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.bold = True
            r_bold.font.size = Pt(13)
        r = p.add_run(text)
        r.font.size = Pt(13)
        r.italic = italic
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.25
        p.paragraph_format.space_after = Pt(4)
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.bold = True
            r_bold.font.size = Pt(13)
        r = p.add_run(text)
        r.font.size = Pt(13)
        return p

    # --- COVER / HEADER ---
    add_title("TRƯỜNG ĐẠI HỌC KIẾN TRÚC ĐÀ NẴNG")
    add_title("KHOA CÔNG NGHỆ THÔNG TIN")
    p_div = doc.add_paragraph()
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_div = p_div.add_run("-------------------***-------------------")
    r_div.font.size = Pt(11)
    p_div.paragraph_format.space_after = Pt(10)

    add_main_title("BÁO CÁO HỌC THUẬT TỔNG HỢP\nCƠ CẤU CHỨC NĂNG, MÔ HÌNH THIẾT KẾ VÀ HIỆN TRẠNG TIẾN ĐỘ ĐỒ ÁN")

    # Metadata table
    t_meta = doc.add_table(rows=5, cols=2)
    t_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_info = [
        ("Tên đề tài:", "HỆ THỐNG QUẢN LÝ VÀ ĐẶT LỊCH PHÒNG KHÁM NHA KHOA TRỰC TUYẾN"),
        ("Giảng viên hướng dẫn:", "ThS. Đoàn Duy Bình"),
        ("Sinh viên thực hiện:", "Lê Đình Nguyên"),
        ("Mã số sinh viên - Lớp:", "2251220246  -  Lớp 22CT5"),
        ("Thời gian thực hiện:", "Tháng 10 / 2026")
    ]
    for i, (label, val) in enumerate(meta_info):
        row = t_meta.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.2)
        c1.width = Inches(4.3)
        p0 = c0.paragraphs[0]
        p0.add_run(label).bold = True
        p0.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p1 = c1.paragraphs[0]
        p1.add_run(val)
        p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
        set_cell_margins(c0, 60, 60, 80, 80)
        set_cell_margins(c1, 60, 60, 80, 80)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ========================================================
    # PHẦN 1: TỔNG QUAN VÀ Ý NGHĨA KHOA HỌC
    # ========================================================
    add_heading1("PHẦN 1. TỔNG QUAN VÀ MỤC TIÊU NGHIÊN CỨU")
    
    add_heading2("1.1. Bối cảnh và Tính cấp thiết của đề tài")
    add_body("Trong kỷ nguyên chuyển đổi số y tế, các cơ sở khám chữa bệnh tư nhân, đặc biệt là các phòng khám chuyên khoa Răng - Hàm - Mặt, đang đối mặt với nhiều thách thức trong công tác quản lý và vận hành. Các phương pháp quản lý thủ công truyền thống (sổ sách, bảng tính Excel rời rạc) bộc lộ nhiều điểm hạn chế nghiêm trọng: tỷ lệ bệnh nhân đặt lịch nhưng không đến khám (tình trạng 'No-show') gây lãng phí giờ trực của bác sĩ; việc phân ca làm việc cứng nhắc không tối ưu được nguồn lực nhân sự; hồ sơ bệnh án giấy dễ thất lạc làm gián đoạn quá trình theo dõi điều trị lâu dài; quy trình thanh toán và tính toán thù lao ca làm việc dễ xảy ra nhầm lẫn. "
             "Xuất phát từ thực tiễn đó, đề tài 'Hệ thống quản lý và đặt lịch phòng khám nha khoa trực tuyến' được xây dựng nhằm cung cấp một giải pháp phần mềm toàn diện, số hóa khép kín toàn bộ chu trình khám chữa bệnh từ khâu tra cứu, đặt lịch trực tuyến, đặt cọc ràng buộc, tiếp nhận, khám và điều trị, kê đơn thuốc điện tử, quản lý hóa đơn đến hệ thống báo cáo thống kê chuyên sâu.")

    add_heading2("1.2. Mục tiêu nghiên cứu tổng quát và cụ thể")
    add_bullet("Mục tiêu tổng quát: Thiết kế và phát triển một hệ thống Web ứng dụng hiện đại, ổn định, có tính module hóa cao phục vụ công tác điều phối vận hành phòng khám nha khoa và hỗ trợ bệnh nhân tương tác trực tuyến 24/7.", "• ")
    add_bullet("Mục tiêu kỹ thuật: Xây dựng cơ sở dữ liệu quan hệ đạt chuẩn 3NF trên MySQL 8.0; phát triển hệ thống RESTful API an toàn, có khả năng mở rộng với Python/Django REST Framework; xây dựng giao diện tương tác người dùng mượt mà, trực quan với React và Ant Design; tích hợp trí tuệ nhân tạo (AI Chatbot) ứng dụng mô hình ngôn ngữ lớn tiên tiến có kiểm soát y đức.", "• ")
    add_bullet("Mục tiêu nghiệp vụ: Giải quyết bài toán No-show bằng cơ chế đặt cọc 100.000 VNĐ; trao quyền cho bác sĩ tự chủ đăng ký lịch làm việc (Self-scheduling); chuẩn hóa hồ sơ bệnh án điện tử nha khoa (Lightweight EHR) và tự động hóa khâu hạch toán viện phí.", "• ")

    # ========================================================
    # PHẦN 2: CÁC MÔ HÌNH THIẾT KẾ VÀ KIẾN TRÚC HỆ THỐNG (MỚI BỔ SUNG CHI TIẾT)
    # ========================================================
    add_heading1("PHẦN 2. MÔ HÌNH THIẾT KẾ VÀ KIẾN TRÚC KỸ THUẬT CỦA HỆ THỐNG")
    add_body("Hệ thống được thiết kế dựa trên các nguyên lý chuẩn mực trong kỹ thuật phần mềm (Software Engineering Principles), kết hợp hài hòa giữa các mô hình kiến trúc phân lớp, hướng thành phần và xác thực bảo mật hiện đại:")

    add_heading2("2.1. Mô hình kiến trúc tổng thể: Client - Server phân tách (Decoupled Architecture) 3 tầng")
    add_body("Khác với các ứng dụng Web truyền thống tích hợp chặt (Monolithic Web), hệ thống áp dụng mô hình phân tách hoàn toàn giữa giao diện người dùng (Frontend) và máy chủ logic (Backend). Hai thành phần này hoạt động độc lập, giao tiếp với nhau duy nhất thông qua giao thức chuẩn RESTful API với định dạng dữ liệu JSON:")
    add_bullet("Tầng 1 - Tầng trình diễn (Presentation Layer - Frontend): Phát triển dưới dạng Single Page Application (SPA) sử dụng React 19 và công cụ đóng gói Vite. Ứng dụng chỉ tải tài nguyên ban đầu một lần; toàn bộ quá trình điều hướng trang và cập nhật giao diện diễn ra tức thì thông qua Client-side Routing, loại bỏ hiện tượng tải lại toàn trang (No page reload), mang lại trải nghiệm mượt mà tương tự như một ứng dụng Native trên máy tính để bàn.", "1. ")
    add_bullet("Tầng 2 - Tầng logic ứng dụng (Business Logic / Application Layer - Backend): Xây dựng trên nền tảng Python, Django Framework và Django REST Framework (DRF). Tầng này đảm nhận việc xác thực danh tính người dùng, kiểm soát phân quyền (RBAC), kiểm tra ràng buộc dữ liệu (Validation), thực thi các quy tắc nghiệp vụ (đặt cọc, tính viện phí, duyệt ca khám) và tích hợp các dịch vụ bên ngoài như Google Gemini AI.", "2. ")
    add_bullet("Tầng 3 - Tầng lưu trữ và truy xuất dữ liệu (Data Persistence Layer): Hệ quản trị cơ sở dữ liệu quan hệ MySQL Server 8.0, thiết kế theo chuẩn hóa dạng chuẩn 3 (3NF). Tầng này chịu trách nhiệm lưu trữ bền vững toàn bộ thực thể dữ liệu của phòng khám, tối ưu hóa qua các bảng chỉ mục (Indexes) và bảo đảm tính toàn vẹn tham chiếu (Referential Integrity).", "3. ")

    add_heading2("2.2. Mô hình kiến trúc Backend: Model - Serializer - ViewSet (Biến thể API của MVC/MVT)")
    add_body("Tại phía máy chủ Django, thay vì sử dụng mô hình MVT (Model - View - Template) truyền thống render HTML trực tiếp từ server, hệ thống chuyển dịch sang mô hình hướng dịch vụ API (API-Centric Architecture):")
    add_bullet("Model (Tầng mô hình dữ liệu): Định nghĩa các thực thể dữ liệu, kiểu dữ liệu, các trường quan hệ (ForeignKey, OneToOneField) và các ràng buộc dữ liệu toàn vẹn (UniqueTogether, Choices). Model tương tác trực tiếp với MySQL thông qua cơ chế Django ORM (Object-Relational Mapping), giúp loại bỏ hoàn toàn các câu lệnh SQL thuần túy dễ gây lỗi bảo mật SQL Injection.", "• ")
    add_bullet("Serializer (Tầng Data Transfer Object - DTO & Data Validation): Đóng vai trò là cầu nối chuyển đổi hai chiều: tuần tự hóa (Serialization) các đối tượng phức tạp của Python/Django thành chuỗi JSON để gửi về cho Client, và giải tuần tự hóa (Deserialization) dữ liệu JSON từ Client gửi lên để lưu vào Database. Đồng thời, Serializer thực hiện kiểm tra tính hợp lệ của dữ liệu đầu vào (kiểm tra định dạng email, số điện thoại, ngày khám trong tương lai, trùng lặp lịch...).", "• ")
    add_bullet("ViewSet / Controller (Tầng điều khiển nghiệp vụ): Tiếp nhận các yêu cầu HTTP Request (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), phối hợp với hệ thống phân quyền (Permissions) để kiểm tra tính hợp lệ của tác nhân gọi API, gọi các phương thức xử lý nghiệp vụ tương ứng và trả về HTTP Response kèm mã trạng thái HTTP chuẩn (200 OK, 201 Created, 400 Bad Request, 403 Forbidden, 404 Not Found).", "• ")

    add_heading2("2.3. Mô hình kiến trúc Frontend: Hướng thành phần (Component-Based Architecture)")
    add_body("Phía Client React được tổ chức nghiêm ngặt theo mô hình Component-Based kết hợp luồng dữ liệu đơn hướng (Unidirectional Data Flow):")
    add_bullet("Phân tách thành phần giao diện (Component Hierarchy): Giao diện được cấu thành từ các thành phần nhỏ, độc lập và có khả năng tái sử dụng cao. Cấu trúc gồm: Tầng Layouts (AdminLayout, ReceptionistLayout, DoctorLayout) định hình khung thanh điều hướng (Sidebar, Header, Footer); Tầng Pages định nghĩa nội dung từng màn hình chức năng; Tầng Components tái sử dụng (Bảng dữ liệu, Hộp thoại Modal, Form nhập liệu, Thẻ thông tin).", "• ")
    add_bullet("Quản lý trạng thái toàn cục (Global State Management): Ứng dụng mô hình React Context API kết hợp LocalStorage (`AuthContext.jsx`) để lưu trữ tập trung thông tin phiên đăng nhập của người dùng, phân quyền tác nhân, bảo đảm việc đồng bộ trạng thái xuyên suốt toàn bộ ứng dụng mà không gặp hiện tượng Props Drilling.", "• ")
    add_bullet("Tầng giao tiếp mạng trung gian (Network Interceptor Layer): Xây dựng một Axios Instance chuẩn mực, tích hợp Interceptor tại cả chiều đi (Request) và chiều về (Response). Chiều đi tự động chèn JWT Access Token vào tiêu đề HTTP Authorization; chiều về tự động bắt lỗi 401 (Hết hạn phiên) và kích hoạt cơ chế làm mới Token ngầm (Silent Refresh Token) mà không làm gián đoạn thao tác của người dùng.", "• ")

    add_heading2("2.4. Mô hình kiểm soát truy cập và bảo mật: RBAC kết hợp JWT phi trạng thái")
    add_body("Nhằm đảm bảo an toàn thông tin y tế nhạy cảm của người bệnh và sự nghiêm ngặt trong phân cấp quyền hạn phòng khám, hệ thống triển khai hai cơ chế bảo mật then chốt:")
    add_bullet("Mô hình kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC): Hệ thống thiết lập 4 vai trò tác nhân độc lập: Admin, Lễ tân (Receptionist), Bác sĩ (Doctor), Bệnh nhân (Patient). Mỗi vai trò được gắn với một tập hợp quyền hạn truy cập (Permissions) được kiểm soát nghiêm ngặt ở cả 2 đầu: tầng API Endpoint của Django (Custom Permission Classes) và tầng điều hướng giao diện của React (Protected Routes).", "• ")
    add_bullet("Mô hình xác thực phi trạng thái (Stateless Authentication qua JWT): Loại bỏ việc lưu Session trên bộ nhớ RAM của máy chủ, giúp máy chủ đạt khả năng mở rộng cao. Khi đăng nhập thành công, máy chủ cấp phát cặp khóa: Access Token (thời hạn 24 giờ, dùng cho các giao dịch API) và Refresh Token (thời hạn 7 ngày, dùng để cấp mới Access Token). Dữ liệu trong Token được ký mã hóa bằng thuật toán đối xứng HMAC-SHA256.", "• ")

    add_heading2("2.5. Mô hình tích hợp Trí tuệ nhân tạo: Bồi đắp ngữ cảnh động (Dynamic In-Context Injection)")
    add_body("Thay vì sử dụng các kịch bản tĩnh (Rule-based) hoặc để mô hình ngôn ngữ lớn (LLM) tự do suy diễn dễ dẫn đến lỗi ảo tưởng thông tin (Hallucination), hệ thống xây dựng mô hình tích hợp AI kết hợp bồi đắp ngữ cảnh thời gian thực (Lightweight Retrieval-Augmented Generation - RAG):")
    add_bullet("Luồng xử lý ngữ cảnh (Context Pipeline): Khi bệnh nhân gửi câu hỏi qua Chatbot, máy chủ Backend không gửi tin nhắn trực tiếp đến AI mà thực hiện một bước truy xuất tự động từ MySQL Database: lấy danh sách các bác sĩ đang làm việc, lịch trực khả dụng trong ngày hôm nay, và bảng giá dịch vụ hiện hành.", "• ")
    add_bullet("Bồi đắp vào System Prompt: Dữ liệu thời gian thực này được ghép nối vào ngữ cảnh chỉ thị hệ thống (System Instructions) cùng với câu hỏi của bệnh nhân trước khi gửi tới mô hình Google Gemini 2.0 Flash.", "• ")
    add_bullet("Bộ lọc y đức (Ethical Guardrails): Hệ thống cài đặt nguyên tắc bất biến trong prompt: AI chỉ đóng vai trò trợ lý thông tin phòng khám; nghiêm cấm tuyệt đối việc chẩn đoán bệnh tật, phân tích triệu chứng hoặc kê đơn thuốc thay cho bác sĩ chuyên khoa.", "• ")

    # ========================================================
    # PHẦN 3: CHI TIẾT CƠ CẤU CHỨC NĂNG HỆ THỐNG
    # ========================================================
    add_heading1("PHẦN 3. CHI TIẾT CƠ CẤU CHỨC NĂNG CỦA HỆ THỐNG")
    add_body("Hệ thống được thiết kế thành 5 phân hệ chức năng hoàn chỉnh, đáp ứng trọn vẹn mọi yêu cầu nghiệp vụ của phòng khám:")

    add_heading2("3.1. Phân hệ 1: Quản trị hệ thống và Thống kê vận hành (Admin Management Module)")
    add_bullet("Quản lý người dùng đa vai trò: Thực hiện các thao tác thêm, sửa, xóa, khóa/mở khóa tài khoản (Toggle Active) và cấp lại mật khẩu cho toàn bộ nhân sự và bệnh nhân.", "a) ")
    add_bullet("Quản lý danh mục dịch vụ nha khoa: Thiết lập bảng giá dịch vụ điều trị, thời lượng khám (phút), nhóm dịch vụ (Khám tổng quát, Phục hình, Phẫu thuật, Nha chu...) và trạng thái áp dụng.", "b) ")
    add_bullet("Giám sát lịch làm việc bác sĩ: Theo dõi lịch đăng ký ca làm việc của đội ngũ y bác sĩ, đối chiếu thực tế và điều chỉnh linh hoạt khi có sự cố phát sinh.", "c) ")
    add_bullet("Báo cáo và phân tích thông minh (Dashboard & Analytics): Biểu đồ phân tích doanh thu theo ngày, tháng, năm; cơ cấu doanh thu theo từng dịch vụ; tự động thống kê tổng số ca làm việc thực tế của từng bác sĩ nhằm hỗ trợ công tác hạch toán lương và thù lao công bằng.", "d) ")

    add_heading2("3.2. Phân hệ 2: Tiếp nhận và Điều phối lịch hẹn (Receptionist & Front-Desk Module)")
    add_bullet("Cơ chế giải quyết bài toán No-show (Ràng buộc cọc 100.000 VNĐ): Hệ thống tự sinh mã giao dịch và thông tin chuyển khoản/mã QR cho mỗi yêu cầu đặt hẹn. Lễ tân kiểm tra biến động tài khoản và kích hoạt 'Xác nhận đặt cọc' để đưa lịch hẹn vào trạng thái hợp lệ.", "a) ")
    add_bullet("Quản trị vòng đời lịch hẹn (Appointment State Machine): Luồng 8 trạng thái nghiêm ngặt: Chờ cọc (Pending Deposit) → Đã đặt cọc (Deposit Paid) → Đã xác nhận (Confirmed) → Đã đến phòng khám (Arrived) → Đang khám (Examining) → Hoàn thành (Completed) / Đã hủy (Cancelled) / Không đến (No-show).", "b) ")
    add_bullet("Quy trình tiếp nhận và phân luồng vào phòng khám: Khi bệnh nhân có mặt tại quầy, lễ tân kích hoạt tiếp nhận, hệ thống tự động đẩy dữ liệu bệnh nhân vào danh sách phòng chờ của bác sĩ phụ trách.", "c) ")
    add_bullet("Quản lý tài chính và xuất hóa đơn viện phí: Tự động tổng hợp chi phí từ tiền công khám của bác sĩ và các thủ thuật nha khoa do bác sĩ chỉ định; tự động đối trừ 100.000 VNĐ tiền cọc đã nộp trước; ghi nhận phương thức thanh toán cuối cùng (Tiền mặt / Chuyển khoản) và cập nhật trạng thái hóa đơn Đã thanh toán (Paid).", "d) ")

    add_heading2("3.3. Phân hệ 3: Nghiệp vụ Lâm sàng và Hồ sơ Bệnh án điện tử (Doctor & Clinical Module)")
    add_bullet("Cơ chế tự chủ đăng ký lịch làm việc (Self-Scheduling): Bác sĩ chủ động đăng ký ca làm việc hàng tuần qua tài khoản cá nhân với 3 lựa chọn linh hoạt: Ca sáng (8h - 12h), Ca chiều (13h - 17h) hoặc Cả ngày hành chính. Dữ liệu này tự động đồng bộ sang lịch hiển thị cho bệnh nhân đặt hẹn.", "a) ")
    add_bullet("Quản lý danh sách bệnh nhân theo ca: Hiển thị thời gian thực danh sách bệnh nhân đã đến phòng khám và đang chờ đến lượt, giúp bác sĩ chủ động chuẩn bị dụng cụ và vật tư tiêu hao tương ứng.", "b) ")
    add_bullet("Bệnh án điện tử nha khoa (Electronic Health Record - EHR): Bác sĩ tra cứu tiền sử bệnh lý toàn thân, tiền sử dị ứng thuốc; ghi nhận chẩn đoán bệnh chính, mô tả tình trạng răng cần can thiệp, phác đồ điều trị và các lưu ý lâm sàng.", "c) ")
    add_bullet("Kê đơn thuốc điện tử (Electronic Prescription): Thiết lập danh mục thuốc điều trị kèm liều lượng, cách dùng, thời gian uống và hướng dẫn chăm sóc sau thủ thuật, lưu trữ vĩnh viễn trong hồ sơ bệnh án phục vụ theo dõi.", "d) ")

    add_heading2("3.4. Phân hệ 4: Cổng tương tác bệnh nhân trực tuyến (Patient Portal)")
    add_bullet("Minh bạch hóa thông tin: Bệnh nhân dễ dàng tra cứu lý lịch chuyên môn, năm kinh nghiệm và phí khám của từng bác sĩ; xem bảng giá dịch vụ nha khoa công khai và tìm hiểu quy trình điều trị.", "a) ")
    add_bullet("Quy trình đặt lịch trực tuyến 4 bước: 1) Chọn bác sĩ mong muốn; 2) Xem lịch làm việc khả dụng; 3) Chọn dịch vụ và thời gian khám; 4) Xem hướng dẫn chuyển khoản đặt cọc 100.000 VNĐ và gửi thông báo đã đặt cọc.", "b) ")
    add_bullet("Sổ theo dõi sức khỏe nha khoa cá nhân: Bệnh nhân theo dõi chi tiết toàn bộ lịch sử các lần đến khám, kết quả chẩn đoán, đơn thuốc đã kê và các khoản chi phí đã thanh toán.", "c) ")

    add_heading2("3.5. Phân hệ 5: Trợ lý ảo AI thông minh (Generative AI Chatbot Assistant)")
    add_bullet("Công nghệ lõi: Ứng dụng mô hình nền tảng Gemini 2.0 Flash của Google thông qua bộ SDK chính thức google-genai.", "a) ")
    add_bullet("Kỹ thuật Dynamic In-Context Injection: Khi người dùng tương tác, máy chủ Backend tự động trích xuất các thông tin thời gian thực từ Database (danh sách bác sĩ đang làm việc, dịch vụ hiện hành, lịch trực trong ngày hôm nay) ghép nối vào ngữ cảnh truy vấn (System Context Prompt). Nhờ đó, AI trả lời chính xác thông tin thực tế của phòng khám mà không sinh lỗi ảo tưởng (Hallucination).", "b) ")
    add_bullet("Bộ lọc an toàn y đức (Medical Ethical Guardrails): Hệ thống thiết lập nghiêm ngặt: AI tuyệt đối không chẩn đoán thay bác sĩ, không kê đơn thuốc hoặc phán đoán bệnh lý; chỉ đóng vai trò hướng dẫn quy trình, thông tin dịch vụ, chi phí và thời gian làm việc.", "c) ")

    # Table of Functional Modules
    add_heading2("3.6. Ma trận phân quyền chức năng theo tác nhân (RBAC Matrix)")
    table = doc.add_table(rows=1, cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    headers = ["Nhóm chức năng nghiệp vụ", "Admin", "Lễ tân", "Bác sĩ", "Bệnh nhân"]
    for idx, text in enumerate(headers):
        hdr_cells[idx].text = text
        hdr_cells[idx].paragraphs[0].runs[0].bold = True
        hdr_cells[idx].paragraphs[0].runs[0].font.size = Pt(11)
        hdr_cells[idx].paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        hdr_cells[idx].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_cell_background(hdr_cells[idx], "003366")
        set_cell_margins(hdr_cells[idx], 80, 80, 100, 100)

    matrix_data = [
        ("Quản lý tài khoản & Phân quyền", "Toàn quyền", "Không", "Không", "Tự quản lý"),
        ("Quản lý danh mục Dịch vụ nha khoa", "Toàn quyền", "Xem", "Xem", "Xem"),
        ("Đăng ký ca làm việc", "Giám sát/Sửa", "Xem", "Đăng ký cá nhân", "Không"),
        ("Đặt lịch khám trực tuyến", "Giám sát", "Tạo thay tại quầy", "Xem lịch", "Đặt lịch"),
        ("Xác nhận tiền đặt cọc (100k)", "Giám sát", "Xác nhận", "Không", "Báo đã cọc"),
        ("Tiếp nhận bệnh nhân đến khám", "Giám sát", "Tiếp nhận", "Nhận vào khám", "Không"),
        ("Ghi nhận chẩn đoán, điều trị & đơn thuốc", "Xem hồ sơ", "Xem tóm tắt", "Ghi nhận/Kê đơn", "Xem cá nhân"),
        ("Lập và thu hóa đơn viện phí", "Xem/Thống kê", "Lập & Thu tiền", "Không", "Xem hóa đơn"),
        ("Báo cáo doanh thu & Tính lương", "Toàn quyền", "Không", "Xem số ca", "Không"),
        ("Trợ lý ảo AI Chatbot", "Cấu hình", "Hỗ trợ", "Hỗ trợ", "Tra cứu 24/7")
    ]

    for row_idx, data in enumerate(matrix_data):
        row = table.add_row()
        fill_bg = "F2F5F8" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate(data):
            cell = row.cells[col_idx]
            cell.text = text
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if col_idx == 0 else WD_ALIGN_PARAGRAPH.CENTER
            p.runs[0].font.size = Pt(11)
            set_cell_background(cell, fill_bg)
            set_cell_margins(cell, 60, 60, 80, 80)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ========================================================
    # PHẦN 4: HIỆN TRẠNG TRIỂN KHAI VÀ KẾT QUẢ ĐẠT ĐƯỢC
    # ========================================================
    add_heading1("PHẦN 4. HIỆN TRẠNG TRIỂN KHAI VÀ KẾT QUẢ ĐÃ ĐẠT ĐƯỢC CỦA DỰ ÁN")
    add_body("Tính đến thời điểm hiện tại, toàn bộ các hạng mục kỹ thuật cốt lõi từ kiến trúc Cơ sở dữ liệu, Backend RESTful API, Tích hợp AI đến Bộ khung Giao diện Frontend đã được triển khai bài bản và đạt được các kết quả cụ thể như sau:")

    add_heading2("4.1. Kết quả về Kiến trúc Cơ sở dữ liệu (Database Persistence)")
    add_bullet("Hoàn thành khởi tạo và cấu hình cơ sở dữ liệu quan hệ MySQL 8.0 mang tên 'dental_clinic_db', thiết lập bảng mã ký tự utf8mb4_unicode_ci bảo đảm tương thích tuyệt đối với tiếng Việt.", "• ")
    add_bullet("Thiết kế và triển khai 10 bộ Model quan hệ chặt chẽ tương ứng với 10 ứng dụng thành phần: accounts_user, doctors, patients, services, doctor_schedules, appointments, medical_records, prescriptions, invoices, chatbot_messages.", "• ")
    add_bullet("Áp dụng thành công 100% các Migration tự động của Django; các mối quan hệ One-to-One, Foreign Key và ràng buộc Unique Together (như một bác sĩ chỉ đăng ký tối đa 1 lịch/ngày) hoạt động chuẩn xác và không phát sinh lỗi xung đột dữ liệu.", "• ")

    add_heading2("4.2. Kết quả về Kiến trúc Backend và Hệ thống RESTful API")
    add_bullet("Cấu trúc hệ thống Backend thành 10 Django Apps chuyên biệt: accounts, doctors, patients, services, schedules, appointments, medical, invoices, stats, chatbot.", "• ")
    add_bullet("Xây dựng hoàn chỉnh hơn 35 RESTful API endpoints hỗ trợ đầy đủ các phương thức HTTP (GET, POST, PUT, PATCH, DELETE) phục vụ mọi nhu cầu trao đổi dữ liệu.", "• ")
    add_bullet("Hiện thực hóa hệ thống phân quyền tùy chỉnh (Custom Permissions): IsAdmin, IsReceptionist, IsDoctor, IsPatient, IsAdminOrReceptionist... bảo đảm an toàn dữ liệu ở tầng Endpoint.", "• ")
    add_bullet("Cơ chế xác thực an toàn: Cấu hình djangorestframework-simplejwt với Access Token có thời hạn 24 giờ và Refresh Token 7 ngày; tích hợp CORS Headers cho phép giao tiếp an toàn với Frontend.", "• ")
    add_bullet("Hoàn thành tập lệnh tự động hóa (Management Command): Lệnh python manage.py seed_data đã khởi tạo sẵn sàng bộ dữ liệu chuẩn gồm tài khoản quản trị viên, lễ tân, 2 bác sĩ chuyên khoa, 10 dịch vụ nha khoa tiêu biểu và hồ sơ bệnh nhân mẫu.", "• ")

    add_heading2("4.3. Kết quả về Tích hợp Trợ lý Trí tuệ nhân tạo (AI Chatbot)")
    add_bullet("Nâng cấp đồng bộ lên bộ thư viện chính thức mới nhất của Google là google-genai, thay thế cho gói google.generativeai đã cũ.", "• ")
    add_bullet("Kết nối thành công mô hình Gemini 2.0 Flash với độ trễ thấp và khả năng hiểu ngôn ngữ tự nhiên tiếng Việt xuất sắc.", "• ")
    add_bullet("Xây dựng cơ chế trích xuất dữ liệu phòng khám theo thời gian thực (Real-time Dynamic Context Injection), giúp Chatbot luôn nắm bắt đúng danh sách bác sĩ trực ca và bảng giá mới nhất từ cơ sở dữ liệu để trả lời người bệnh.", "• ")

    add_heading2("4.4. Kết quả về Xây dựng Giao diện người dùng (Frontend)")
    add_bullet("Thiết lập thành công môi trường phát triển Frontend với React 19, Vite và Ant Design v5 tại thư mục dự án.", "• ")
    add_bullet("Cấu hình cổng Proxy đảo ngược (Reverse Proxy) tại vite.config.js chuyển tiếp các yêu cầu /api và /media đến máy chủ Django (cổng 8000), giải quyết triệt để vấn đề CORS trong môi trường phát triển.", "• ")
    add_bullet("Xây dựng thành công tầng kết nối API (Axios Instance) với cơ chế tự động đính kèm JWT Bearer Token vào tiêu đề HTTP và tự động làm mới mã Token (Silent Token Refresh) khi phiên làm việc hết hạn mà không gây gián đoạn cho người dùng.", "• ")
    add_bullet("Hoàn thành xây dựng và phân chia các Layouts chuyên biệt: AdminLayout (màu xanh Navy đậm), ReceptionistLayout (màu xanh lá y tế), DoctorLayout (màu xanh dương đậm) với hệ thống Side Navigation linh hoạt, thanh Header hiển thị thông tin phiên làm việc và nút Đăng xuất an toàn.", "• ")

    add_heading2("4.5. Bảng tổng hợp mức độ hoàn thiện các phân hệ so với đề cương")
    t_status = doc.add_table(rows=1, cols=4)
    t_status.alignment = WD_TABLE_ALIGNMENT.CENTER
    s_hdr = t_status.rows[0].cells
    s_titles = ["Hạng mục thành phần", "Công nghệ sử dụng", "Mức độ hoàn thiện", "Đánh giá học thuật"]
    for idx, text in enumerate(s_titles):
        s_hdr[idx].text = text
        s_hdr[idx].paragraphs[0].runs[0].bold = True
        s_hdr[idx].paragraphs[0].runs[0].font.size = Pt(11)
        s_hdr[idx].paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        s_hdr[idx].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_cell_background(s_hdr[idx], "003366")
        set_cell_margins(s_hdr[idx], 80, 80, 100, 100)

    status_data = [
        ("Thiết kế Cơ sở dữ liệu", "MySQL 8.0, 3NF", "100%", "Hoàn tất, tối ưu hóa chỉ mục và ràng buộc"),
        ("Kiến trúc Backend & API", "Python, Django, DRF", "100%", "Đầy đủ 10 Apps, bảo mật JWT & RBAC"),
        ("Tích hợp Trí tuệ nhân tạo", "Google Gemini 2.0, GenAI", "95%", "Hoàn tất RAG ngữ cảnh, chuẩn an toàn y đức"),
        ("Tầng giao tiếp dữ liệu API", "Axios Interceptor, JWT", "100%", "Xử lý refresh token tự động xuyên suốt"),
        ("Bộ khung Giao diện (Layouts)", "React, Ant Design v5", "100%", "Hoàn tất các Layouts phân quyền chuyên biệt"),
        ("Giao diện chức năng chi tiết", "React Router, Components", "80%", "Đang hoàn tất các trang View chi tiết"),
        ("Dữ liệu thử nghiệm (Seed)", "Django Management Command", "100%", "Đã nạp sẵn dữ liệu kiểm thử đầy đủ")
    ]

    for r_idx, row_vals in enumerate(status_data):
        row = t_status.add_row()
        fill_bg = "F2F5F8" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_vals):
            cell = row.cells[c_idx]
            cell.text = val
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if c_idx == 0 else WD_ALIGN_PARAGRAPH.CENTER
            p.runs[0].font.size = Pt(11)
            if c_idx == 2:
                p.runs[0].bold = True
            set_cell_background(cell, fill_bg)
            set_cell_margins(cell, 60, 60, 80, 80)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ========================================================
    # PHẦN 5: KẾ HOẠCH BẢO VỆ VÀ HƯỚNG MỞ RỘNG
    # ========================================================
    add_heading1("PHẦN 5. ĐÁNH GIÁ CHUNG VÀ HƯỚNG PHÁT TRIỂN TRONG TƯƠNG LAI")
    add_body("Nhìn chung, đề tài 'Hệ thống quản lý và đặt lịch phòng khám nha khoa trực tuyến' đã bám sát 100% mục tiêu nghiên cứu và tiến độ đề ra trong Đề cương được phê duyệt bởi Giảng viên hướng dẫn ThS. Đoàn Duy Bình. Dự án sở hữu kiến trúc kỹ thuật hiện đại, phân tách phân lớp rõ ràng, giải quyết triệt để các bài toán khó trong thực tế phòng khám.")

    add_heading2("5.1. Định hướng mở rộng công nghệ trong tương lai:")
    add_bullet("Tự động hóa thanh toán ngân hàng (Payment Gateway & Webhook): Kết nối trực tiếp hệ thống VietQR tự động (SePay, PayOS) để đối soát biến động số dư và kích hoạt lịch hẹn tức thời không cần duyệt thủ công.", "1. ")
    add_bullet("Hệ thống thông báo đa kênh: Tích hợp SMS Brandname hoặc Zalo ZNS để nhắc lịch khám tự động trước 24 giờ và gửi hướng dẫn chăm sóc sau điều trị.", "2. ")
    add_bullet("Sơ đồ răng tương tác 2D/3D (Interactive Odontogram): Xây dựng biểu đồ 32 răng trực quan, cho phép bác sĩ bấm trực tiếp vào từng mặt răng để đánh dấu tình trạng sâu răng, trám răng hoặc cấy ghép Implant.", "3. ")
    add_bullet("Ứng dụng Computer Vision trong nha khoa: Nghiên cứu tích hợp mô hình phân tích ảnh X-quang toàn cảnh (Panorex) hỗ trợ khoanh vùng tổn thương quanh chóp và tiêu xương ổ răng.", "4. ")

    # Footer signature placeholder
    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(24)
    p_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_date = p_sig.add_run("Đà Nẵng, ngày 28 tháng 10 năm 2026\n")
    r_date.italic = True
    r_author = p_sig.add_run("Sinh viên thực hiện\n\n\n\n")
    r_author.bold = True
    r_name = p_sig.add_run("Lê Đình Nguyên")
    r_name.bold = True

    # Save docx file
    out_dir = r"C:\Users\Administrator\dental-clinic"
    file_path = os.path.join(out_dir, "Bao_Cao_Tong_Hop_Co_Cau_Chuc_Nang_Va_Tien_Do_Do_An.docx")
    doc.save(file_path)
    print(f"Report successfully generated at: {file_path}")

if __name__ == '__main__':
    create_report()
