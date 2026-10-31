import type { NavSection } from '$ui/types';

export const ERP_NAV_SECTIONS: NavSection[] = [
  {
    heading: 'TỔNG QUAN',
    items: [
      { label: 'Bàn làm việc (Dashboard)', href: '/' }
    ]
  },
  {
    heading: 'KHO & NGUYÊN LIỆU',
    items: [
      { label: 'Kho hạt & Nguyên liệu', href: '/kho' }
    ]
  },
  {
    heading: 'HỆ THỐNG',
    items: [
      { label: 'Tài khoản & Phân quyền', href: '/identity' }
    ]
  }
];
