<script lang="ts">
  import { Table, Badge, Button, toast } from '#lib/premier-ui';
  import type { User, UserRole } from '../identity.types';

  interface Props {
    users: User[];
  }

  let { users }: Props = $props();

  function getRoleBadge(role: UserRole) {
    switch (role) {
      case 'ROLE_ADMIN':
        return { label: 'Quản Trị Viên (Admin)', variant: 'primary' as const };
      case 'ROLE_KHO':
        return { label: 'Thủ Kho', variant: 'warning' as const };
      case 'ROLE_KE_TOAN':
        return { label: 'Kế Toán', variant: 'neutral' as const };
      case 'ROLE_SAN_XUAT':
        return { label: 'Tổ Trưởng Sản Xuất', variant: 'success' as const };
      default:
        return { label: role, variant: 'neutral' as const };
    }
  }
</script>

<div class="user-table-wrap">
  <Table striped={true} hover={true}>
    <thead>
      <tr>
        <th>Tài khoản (Username)</th>
        <th>Họ và tên</th>
        <th>Email</th>
        <th>Phòng ban</th>
        <th>Vai trò (Role)</th>
        <th>Trạng thái</th>
        <th>Ngày tạo</th>
        <th style="text-align: right;">Thao tác</th>
      </tr>
    </thead>
    <tbody>
      {#each users as u (u.id)}
        {@const roleInfo = getRoleBadge(u.role)}
        <tr>
          <td><strong>{u.username}</strong></td>
          <td>{u.fullName}</td>
          <td>{u.email}</td>
          <td>{u.department}</td>
          <td>
            <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
          </td>
          <td>
            <Badge variant={u.status === 'ACTIVE' ? 'success' : 'error'}>
              {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
            </Badge>
          </td>
          <td>{u.createdAt}</td>
          <td style="text-align: right;">
            <Button
              size="sm"
              variant="ghost"
              onclick={() => toast.info(`Cấu hình quyền cho tài khoản: ${u.username}`)}
            >
              Phân quyền
            </Button>
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="8" class="empty-state">Chưa có người dùng nào</td>
        </tr>
      {/each}
    </tbody>
  </Table>
</div>

<style>
  .user-table-wrap {
    background: var(--pn-paper);
    border-radius: var(--pn-radius);
    overflow: hidden;
  }

  .empty-state {
    text-align: center;
    padding: 32px;
    color: var(--pn-ink-soft);
    font-style: italic;
  }
</style>
