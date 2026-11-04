import dayjs from 'dayjs'

export const formatMoney = (amount) => {
  if (amount === null || amount === undefined) return '0đ'
  return new Intl.NumberFormat('vi-VN').format(Number(amount)) + 'đ'
}

export const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('DD/MM/YYYY')
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

export const STATUS_COLORS = {
  pending: 'orange',
  pending_deposit: 'orange',
  deposited: 'blue',
  deposit_paid: 'blue',
  confirmed: 'cyan',
  checked_in: 'green',
  arrived: 'green',
  in_progress: 'geekblue',
  completed: 'success',
  cancelled: 'default',
  no_show: 'red',
  rescheduled: 'purple',
}

export const STATUS_LABELS = {
  pending: 'Chờ chuyển cọc',
  pending_deposit: 'Chờ đặt cọc',
  deposited: 'Đã chuyển cọc',
  deposit_paid: 'Đã đặt cọc',
  confirmed: 'Đã xác nhận lịch',
  checked_in: 'Đã đến khám',
  arrived: 'Đã đến khám',
  in_progress: 'Đang khám bệnh',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
  no_show: 'Không đến',
  rescheduled: 'Đã đổi lịch',
}

export const SHIFT_LABELS = {
  morning: 'Buổi sáng (8:00 - 12:00)',
  afternoon: 'Buổi chiều (13:00 - 17:00)',
  full: 'Cả ngày (8:00 - 17:00)',
}

export const ROLE_LABELS = {
  admin: 'Admin',
  receptionist: 'Lễ tân',
  doctor: 'Bác sĩ',
  patient: 'Bệnh nhân',
}

export const ROLE_COLORS = {
  admin: 'red',
  receptionist: 'blue',
  doctor: 'green',
  patient: 'orange',
}

export const getHomeRoute = (role) => {
  const routes = {
    admin: '/admin/dashboard',
    receptionist: '/receptionist/dashboard',
    doctor: '/doctor/dashboard',
    patient: '/patient/dashboard',
  }
  return routes[role] || '/login'
}
