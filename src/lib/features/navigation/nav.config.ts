import type { NavSection } from '$ui/types';

export const ERP_NAV_SECTIONS: NavSection[] = [
  {
    heading: 'TỔNG QUAN',
    items: [
      { label: 'Bàn làm việc', href: '/' }
    ]
  },
  {
    heading: 'DOANH NGHIỆP',
    items: [
      { label: 'Thông tin Doanh nghiệp', href: '/company' }
    ]
  },
  {
    heading: 'HỆ THỐNG & ĐỊNH DANH',
    items: [
      { label: 'Quản lý Người dùng', href: '/identity' },
      { label: 'Nhật ký Truy cập', href: '/logs' },
      { label: 'Giám sát Hệ thống', href: '/health' }
    ]
  }
];
