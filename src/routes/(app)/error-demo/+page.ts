import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
  const trigger = url.searchParams.get('trigger');

  if (trigger === '500') {
    error(500, 'Lỗi cơ sở dữ liệu: Không thể kết nối tới MySQL cluster thông qua pn-identity (:8081)');
  }

  if (trigger === '403') {
    error(403, 'Quyền bị từ chối: Chỉ tài khoản có vai trò ROLE_ADMIN mới được cấu hình thông số Gateway');
  }

  if (trigger === '404') {
    error(404, 'Không tìm thấy chứng từ kiểm định chất lượng lô hạt #QC-9921 trong cơ sở dữ liệu');
  }

  return {};
};
