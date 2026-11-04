from django.core.management.base import BaseCommand
from accounts.models import User
from doctors.models import Doctor
from patients.models import Patient
from services.models import Service


class Command(BaseCommand):
    help = 'Tạo dữ liệu mẫu ban đầu'

    def handle(self, *args, **options):
        self.stdout.write('Đang tạo dữ liệu mẫu...')

        # 1. Admin
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin', password='admin123',
                first_name='Quản trị', last_name='Viên',
                email='admin@nhakhoa.com', role='admin'
            )
            self.stdout.write(self.style.SUCCESS('✓ Tạo tài khoản admin'))

        # 2. Lễ tân
        if not User.objects.filter(username='letan1').exists():
            lt = User.objects.create_user(
                username='letan1', password='letan123',
                first_name='Nguyễn Thị', last_name='Lan',
                email='letan@nhakhoa.com', role='receptionist',
                phone='0901234567'
            )
            self.stdout.write(self.style.SUCCESS('✓ Tạo tài khoản lễ tân'))

        # 3. Bác sĩ 1
        if not User.objects.filter(username='bsminh').exists():
            u1 = User.objects.create_user(
                username='bsminh', password='doctor123',
                first_name='Trần Văn', last_name='Minh',
                email='bsminh@nhakhoa.com', role='doctor',
                phone='0912345678'
            )
            Doctor.objects.create(
                user=u1, specialty='Nha khoa tổng quát',
                experience_years=8,
                description='Chuyên gia nha khoa tổng quát với 8 năm kinh nghiệm.',
                consultation_fee=200000
            )
            self.stdout.write(self.style.SUCCESS('✓ Tạo bác sĩ Trần Văn Minh'))

        # 4. Bác sĩ 2
        if not User.objects.filter(username='bshoa').exists():
            u2 = User.objects.create_user(
                username='bshoa', password='doctor123',
                first_name='Lê Thị', last_name='Hoa',
                email='bshoa@nhakhoa.com', role='doctor',
                phone='0923456789'
            )
            Doctor.objects.create(
                user=u2, specialty='Chỉnh nha',
                experience_years=5,
                description='Chuyên gia chỉnh nha và niềng răng thẩm mỹ.',
                consultation_fee=250000
            )
            self.stdout.write(self.style.SUCCESS('✓ Tạo bác sĩ Lê Thị Hoa'))

        # 5. Dịch vụ
        services_data = [
            {'name': 'Khám tổng quát', 'price': 100000, 'duration_minutes': 20, 'category': 'Khám', 'description': 'Kiểm tra tổng quát tình trạng răng miệng'},
            {'name': 'Nhổ răng thường', 'price': 200000, 'duration_minutes': 30, 'category': 'Phẫu thuật', 'description': 'Nhổ răng sữa hoặc răng vĩnh viễn thông thường'},
            {'name': 'Nhổ răng khôn', 'price': 800000, 'duration_minutes': 60, 'category': 'Phẫu thuật', 'description': 'Phẫu thuật nhổ răng khôn'},
            {'name': 'Trám răng composite', 'price': 300000, 'duration_minutes': 45, 'category': 'Phục hình', 'description': 'Trám răng sâu bằng vật liệu composite thẩm mỹ'},
            {'name': 'Lấy cao răng (tẩy vôi)', 'price': 200000, 'duration_minutes': 30, 'category': 'Nha chu', 'description': 'Lấy cao răng và làm sạch nướu'},
            {'name': 'Tẩy trắng răng tại phòng khám', 'price': 1500000, 'duration_minutes': 90, 'category': 'Thẩm mỹ', 'description': 'Tẩy trắng răng bằng đèn LED chuyên dụng'},
            {'name': 'Bọc răng sứ', 'price': 3000000, 'duration_minutes': 90, 'category': 'Phục hình', 'description': 'Bọc răng sứ thẩm mỹ cao cấp (1 răng)'},
            {'name': 'Niềng răng mắc cài', 'price': 15000000, 'duration_minutes': 60, 'category': 'Chỉnh nha', 'description': 'Niềng răng mắc cài kim loại (trọn liệu trình)'},
            {'name': 'Chữa tủy răng', 'price': 1200000, 'duration_minutes': 60, 'category': 'Nội nha', 'description': 'Điều trị tủy răng viêm, hoại tử'},
            {'name': 'Nhổ răng có gây mê', 'price': 2000000, 'duration_minutes': 60, 'category': 'Phẫu thuật', 'description': 'Phẫu thuật nhổ răng có gây mê toàn thân'},
        ]
        for s in services_data:
            Service.objects.get_or_create(name=s['name'], defaults=s)
        self.stdout.write(self.style.SUCCESS(f'✓ Tạo {len(services_data)} dịch vụ nha khoa'))

        # 6. Bệnh nhân mẫu
        if not User.objects.filter(username='benhnhan1').exists():
            pu = User.objects.create_user(
                username='benhnhan1', password='patient123',
                first_name='Phạm Thị', last_name='Mai',
                email='mai@email.com', role='patient',
                phone='0934567890'
            )
            Patient.objects.create(
                user=pu, gender='F',
                date_of_birth='1995-05-15',
                allergies='Dị ứng Penicillin'
            )
            self.stdout.write(self.style.SUCCESS('✓ Tạo bệnh nhân mẫu'))

        self.stdout.write(self.style.SUCCESS('\n🎉 Hoàn thành! Tài khoản đăng nhập:'))
        self.stdout.write('  Admin:     admin / admin123')
        self.stdout.write('  Lễ tân:    letan1 / letan123')
        self.stdout.write('  Bác sĩ 1:  bsminh / doctor123')
        self.stdout.write('  Bác sĩ 2:  bshoa / doctor123')
        self.stdout.write('  Bệnh nhân: benhnhan1 / patient123')
