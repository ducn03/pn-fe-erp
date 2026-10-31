import type { NavSection } from '#lib/premier-ui/types';

export const ERP_NAV_SECTIONS: NavSection[] = [
  {
    heading: 'TỔNG QUAN',
    items: [
      { label: 'Bàn làm việc (Dashboard)', href: '/' },
      { label: 'Đơn hàng & Bán hàng', href: '/don-hang', badge: '12' }
    ]
  },
  {
    heading: 'KHO & SẢN XUẤT',
    items: [
      { label: 'Kho hạt & Nguyên liệu', href: '/kho' },
      { label: 'Lệnh sản xuất & Đóng gói', href: '/san-xuat' },
      { label: 'Kiểm định chất lượng (QC)', href: '/qc' }
    ]
  },
  {
    heading: 'HỆ THỐNG & ĐỊNH DANH',
    items: [
      { label: 'Tài khoản & Phân quyền', href: '/identity' },
      { label: 'Cụm Microservices Gateway', href: '/gateway' },
      { label: 'Kiểm tra trang lỗi (404, 500)', href: '/error-demo' }
    ]
  }
];
