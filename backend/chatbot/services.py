"""
Dịch vụ Gemini AI cho chatbot (dùng google-genai mới).
Chatbot chỉ hỗ trợ tra cứu thông tin phòng khám, không chẩn đoán bệnh.
"""
from google import genai
from django.conf import settings
from doctors.models import Doctor
from services.models import Service
from schedules.models import DoctorSchedule
from datetime import date


def get_clinic_context() -> str:
    doctors = Doctor.objects.filter(is_available=True).select_related('user')
    doctor_list = "\n".join([
        f"- BS. {d.user.get_full_name()} | Chuyên khoa: {d.specialty} | "
        f"Kinh nghiệm: {d.experience_years} năm | Phí khám: {d.consultation_fee:,.0f}đ"
        for d in doctors
    ])

    services = Service.objects.filter(is_active=True)
    service_list = "\n".join([
        f"- {s.name} | Giá: {s.price:,.0f}đ | Thời gian: {s.duration_minutes} phút"
        + (f" | Danh mục: {s.category}" if s.category else "")
        for s in services
    ])

    today = date.today()
    today_schedules = DoctorSchedule.objects.filter(
        date=today, status__in=['registered', 'approved']
    ).select_related('doctor__user')
    today_schedule_text = "\n".join([
        f"- BS. {s.doctor.user.get_full_name()}: {s.get_session_display()}"
        for s in today_schedules
    ]) or "Không có thông tin lịch làm việc hôm nay."

    return f"""
THÔNG TIN PHÒNG KHÁM NHA KHOA:
- Tên: Phòng khám Nha khoa
- Giờ làm việc: Thứ 2 - Thứ 7 | Sáng: 8:00 - 12:00 | Chiều: 13:00 - 17:00
- Tiền đặt cọc khi đặt lịch: 100.000đ (chuyển khoản hoặc QR code)
- Thanh toán tại phòng khám: Tiền mặt hoặc chuyển khoản
- Liên hệ đổi lịch: Qua Zalo của phòng khám

DANH SÁCH BÁC SĨ:
{doctor_list if doctor_list else "Chưa có thông tin bác sĩ."}

DỊCH VỤ NHA KHOA:
{service_list if service_list else "Chưa có thông tin dịch vụ."}

LỊCH LÀM VIỆC HÔM NAY ({today.strftime('%d/%m/%Y')}):
{today_schedule_text}

HƯỚNG DẪN ĐẶT LỊCH:
1. Đăng ký / đăng nhập tài khoản
2. Chọn bác sĩ và xem lịch làm việc
3. Chọn dịch vụ, ngày khám và ca (sáng/chiều)
4. Chuyển khoản 100.000đ tiền cọc theo thông tin phòng khám
5. Bấm "Đã đặt cọc" để thông báo lễ tân xác nhận
6. Nhận xác nhận lịch hẹn
"""


SYSTEM_PROMPT = """Bạn là trợ lý AI của Phòng khám Nha khoa. Nhiệm vụ của bạn là:
- Trả lời câu hỏi về thông tin phòng khám, bác sĩ, dịch vụ, lịch làm việc
- Hướng dẫn quy trình đặt lịch và đặt cọc
- Giải đáp các thắc mắc thông thường

QUAN TRỌNG - Bạn KHÔNG được:
- Chẩn đoán bệnh hoặc tình trạng răng miệng
- Kê đơn thuốc hoặc đề xuất phương pháp điều trị cụ thể
- Thay thế tư vấn y tế của bác sĩ
- Trả lời các câu hỏi không liên quan đến phòng khám

Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt. Nếu không có thông tin, hãy đề nghị người dùng liên hệ trực tiếp phòng khám.
"""


def chat_with_gemini(user_message: str, history: list = None) -> str:
    try:
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == 'YOUR_GEMINI_API_KEY_HERE':
            return "Chatbot chưa được cấu hình. Vui lòng liên hệ trực tiếp phòng khám để được hỗ trợ."

        client = genai.Client(api_key=api_key)
        clinic_context = get_clinic_context()
        full_message = f"{clinic_context}\n\nCâu hỏi của người dùng: {user_message}"

        contents = []
        if history:
            for msg in history:
                contents.append({"role": msg["role"], "parts": [{"text": msg["parts"][0]}]})
        contents.append({"role": "user", "parts": [{"text": full_message}]})

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config={"system_instruction": SYSTEM_PROMPT},
        )
        return response.text

    except Exception as e:
        return f"Xin lỗi, tôi không thể trả lời lúc này. Vui lòng liên hệ phòng khám để được hỗ trợ. ({str(e)})"
