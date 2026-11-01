/**
 * Shared constants for Identity & System Modules
 */

export interface SystemModuleMeta {
  code: string;
  title: string;
  label: string;
  color: string;
  description?: string;
}

export const ERP_MODULE_METAS: Record<string, SystemModuleMeta> = {
  IDENTITY: {
    code: 'IDENTITY',
    title: 'Tài Khoản & Nhân Sự',
    label: 'Tài Khoản & Nhân Sự',
    color: '#3B82F6',
    description: 'Quản trị nhân sự, tài khoản và phân quyền hệ thống'
  },
  INVENTORY: {
    code: 'INVENTORY',
    title: 'Kho Vận & Vật Tư',
    label: 'Kho Vận & Vật Tư',
    color: '#F0821E',
    description: 'Quản lý tồn kho hạt nông sản, nhập xuất vật tư'
  },
  BRANCH: {
    code: 'BRANCH',
    title: 'Quản Lý Chi Nhánh',
    label: 'Quản Lý Chi Nhánh',
    color: '#10B981',
    description: 'Điều hành hoạt động và phân bổ nguồn lực chi nhánh'
  },
  FINANCE: {
    code: 'FINANCE',
    title: 'Tài Chính & Kế Toán',
    label: 'Tài Chính & Kế Toán',
    color: '#8B5CF6',
    description: 'Theo dõi sổ sách, thu chi, công nợ và dòng tiền'
  },
  MANUFACTURING: {
    code: 'MANUFACTURING',
    title: 'Xưởng Sản Xuất Chế Biến',
    label: 'Xưởng Sản Xuất Chế Biến',
    color: '#EC4899',
    description: 'Kế hoạch sản xuất, rang sấy và đóng gói thành phẩm'
  },
  QC: {
    code: 'QC',
    title: 'Kiểm Định Chất Lượng',
    label: 'Kiểm Định Chất Lượng',
    color: '#06B6D4',
    description: 'Kiểm tra độ ẩm, chất lượng và phân hạng hạt'
  },
  MANAGEMENT: {
    code: 'MANAGEMENT',
    title: 'Ban Giám Đốc & Điều Hành',
    label: 'Ban Giám Đốc & Điều Hành',
    color: '#F59E0B',
    description: 'Báo cáo tổng hợp toàn công ty và phê duyệt trọng điểm'
  },
  SYSTEM: {
    code: 'SYSTEM',
    title: 'Quản Trị Hệ Thống',
    label: 'Quản Trị Hệ Thống',
    color: '#6366F1',
    description: 'Giám sát hạ tầng, kiểm toán an toàn và cấu hình hệ thống'
  }
};

export function getModuleMeta(moduleCode?: string): SystemModuleMeta {
  if (!moduleCode) {
    return {
      code: 'UNKNOWN',
      title: 'Khác',
      label: 'Khác',
      color: '#6B5D4F'
    };
  }
  return (
    ERP_MODULE_METAS[moduleCode] || {
      code: moduleCode,
      title: moduleCode,
      label: moduleCode,
      color: '#6B5D4F'
    }
  );
}
