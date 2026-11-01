import type { NavSection, BreadcrumbItem } from '$ui/types';

export interface RouteMeta {
  title: string;
  subtitle: string;
  breadcrumbs: BreadcrumbItem[];
}

export interface RouteDefinition {
  match: (pathname: string) => boolean;
  title: string;
  subtitle: string;
  breadcrumbs: (pathname: string, leafLabel?: string) => BreadcrumbItem[];
}

/**
 * Danh mục điều hướng Sidebar và phân quyền truy cập tính năng (Permission-based Navigation)
 * Nguồn dữ liệu duy nhất (Single Source of Truth) cho toàn bộ hệ thống Premier Nuts ERP.
 */
export const ERP_NAV_SECTIONS: NavSection[] = [
  {
    heading: 'TỔNG QUAN',
    items: [
      {
        label: 'Bàn làm việc',
        href: '/',
        permissions: ['DASHBOARD_VIEW', 'REPORT_VIEW']
      }
    ]
  },
  {
    heading: 'DOANH NGHIỆP',
    items: [
      {
        label: 'Thông tin Doanh nghiệp',
        href: '/company'
      }
    ]
  },
  {
    heading: 'KHO & NGUYÊN LIỆU',
    items: [
      {
        label: 'Kho hạt & Nguyên liệu',
        href: '/kho',
        permissions: ['INVENTORY_VIEW']
      }
    ]
  },
  {
    heading: 'HỆ THỐNG QUẢN TRỊ VIÊN',
    items: [
      {
        label: 'Quản lý Tài khoản',
        href: '/identity',
        permissions: ['USER_VIEW', 'USER_MANAGE']
      },
      {
        label: 'Nhật ký Truy cập',
        href: '/logs',
        permissions: ['LOG_VIEW']
      },
      {
        label: 'Giám sát Hệ thống',
        href: '/health',
        permissions: ['HEALTH_VIEW']
      }
    ]
  }
];

/**
 * Cấu hình tập trung tiêu đề trang (Title), mô tả (Subtitle) và đường dẫn phân cấp (Breadcrumbs)
 * Giúp quản lý đồng bộ Header Navigation tại một nơi duy nhất.
 */
const APP_ROUTES: RouteDefinition[] = [
  {
    match: (path) => path === '/',
    title: 'Bàn Làm Việc',
    subtitle: 'Tổng quan hệ thống điều hành nguồn lực Premier Nuts ERP',
    breadcrumbs: () => [
      { label: 'Premier Nuts', href: '/' },
      { label: 'Bàn làm việc' }
    ]
  },
  {
    match: (path) => path === '/company',
    title: 'Thông Tin Doanh Nghiệp & Cơ Cấu',
    subtitle: 'Quản lý pháp nhân công ty, cơ cấu phòng ban và phân định vai trò nhiệm vụ',
    breadcrumbs: () => [
      { label: 'Premier Nuts', href: '/' },
      { label: 'Doanh nghiệp' },
      { label: 'Thông tin Doanh nghiệp' }
    ]
  },
  {
    match: (path) => path === '/kho',
    title: 'Kho Hạt & Nguyên Liệu',
    subtitle: 'Quản lý chi tiết từng lô hạt, xuất xứ, hạn dùng và giá trị tồn kho',
    breadcrumbs: () => [
      { label: 'Premier Nuts', href: '/' },
      { label: 'Kho & Nguyên liệu' },
      { label: 'Kho hạt & Nguyên liệu' }
    ]
  },
  {
    match: (path) => path === '/identity',
    title: 'Quản Lý Tài Khoản & Phân Quyền',
    subtitle: 'Quản trị nhân sự, vai trò nghiệp vụ và phân quyền truy cập hệ thống Premier Nuts',
    breadcrumbs: () => [
      { label: 'Premier Nuts', href: '/' },
      { label: 'Hệ thống' },
      { label: 'Quản lý Tài khoản' }
    ]
  },
  {
    match: (path) => path === '/identity/create',
    title: 'Thêm Tài Khoản Nhân Sự Mới',
    subtitle: 'Khởi tạo tài khoản nhân viên, tự động phát sinh username và cấu hình phân quyền truy cập chi tiết',
    breadcrumbs: () => [
      { label: 'Premier Nuts', href: '/' },
      { label: 'Hệ thống' },
      { label: 'Quản lý Tài khoản', href: '/identity' },
      { label: 'Thêm mới' }
    ]
  },
  {
    match: (path) => /^\/identity\/[^/]+\/edit\/?$/.test(path),
    title: 'Chỉnh Sửa Tài Khoản Nhân Sự',
    subtitle: 'Cập nhật hồ sơ nhân sự, chức danh vai trò và cấu hình ma trận phân quyền',
    breadcrumbs: () => [
      { label: 'Premier Nuts', href: '/' },
      { label: 'Hệ thống' },
      { label: 'Quản lý Tài khoản', href: '/identity' },
      { label: 'Chỉnh sửa' }
    ]
  },
  {
    match: (path) => /^\/identity\/[^/]+\/?$/.test(path),
    title: 'Hồ Sơ Chi Tiết Tài Khoản',
    subtitle: 'Thông tin định danh, chức vụ công tác và quyền hạn hệ thống của nhân sự',
    breadcrumbs: (_path, leafLabel) => [
      { label: 'Premier Nuts', href: '/' },
      { label: 'Hệ thống' },
      { label: 'Quản lý Tài khoản', href: '/identity' },
      { label: leafLabel || 'Chi tiết' }
    ]
  },
  {
    match: (path) => path === '/logs',
    title: 'Nhật Ký Truy Cập & Giám Sát Bất Thường',
    subtitle: 'Theo dõi lịch sử đăng nhập, thiết bị và các cảnh báo an ninh bảo mật hệ thống',
    breadcrumbs: () => [
      { label: 'Premier Nuts', href: '/' },
      { label: 'Hệ thống' },
      { label: 'Nhật ký Truy cập' }
    ]
  },
  {
    match: (path) => path === '/health',
    title: 'Giám Sát Hệ Thống',
    subtitle: 'Kiểm tra trạng thái hoạt động thực tế của API Gateway, Identity Service và Cơ sở dữ liệu PostgreSQL',
    breadcrumbs: () => [
      { label: 'Premier Nuts', href: '/' },
      { label: 'Hệ thống' },
      { label: 'Giám sát Hệ thống' }
    ]
  }
];

/**
 * Lấy siêu dữ liệu định tuyến (Route Meta: Title, Subtitle, Breadcrumbs) theo đường dẫn URL hiện tại
 * @param pathname Đường dẫn URL hiện tại (ví dụ: '/identity', '/identity/10', '/identity/create')
 * @param leafLabel Nhãn động cho cấp lá cuối cùng (ví dụ: tên nhân viên 'Nguyễn Văn A')
 */
export function getRouteMeta(pathname: string, leafLabel?: string): RouteMeta {
  const cleanPath = pathname.replace(/\/$/, '') || '/';
  const found = APP_ROUTES.find((r) => r.match(cleanPath));
  if (found) {
    return {
      title: found.title,
      subtitle: found.subtitle,
      breadcrumbs: found.breadcrumbs(cleanPath, leafLabel)
    };
  }

  return {
    title: 'Premier Nuts ERP',
    subtitle: '',
    breadcrumbs: [{ label: 'Premier Nuts', href: '/' }]
  };
}

/**
 * Lấy danh sách Breadcrumbs theo đường dẫn URL hiện tại
 */
export function getBreadcrumbs(pathname: string, leafLabel?: string): BreadcrumbItem[] {
  return getRouteMeta(pathname, leafLabel).breadcrumbs;
}
