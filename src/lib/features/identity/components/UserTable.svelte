<script lang="ts">
  import { Table, Badge, Button, toast, BADGE_VARIANTS, type BadgeVariant } from '$ui';
  import { goto } from '$app/navigation';
  import { DateHelper } from '$core/utils';
  import { authStore } from '$core/stores';
  import { UserStatus, type User, type UserRole } from '../identity.types';
  import { UI_CONSTANTS } from '$core/constants';

  interface Props {
    users: User[];
  }

  let { users = $bindable() }: Props = $props();



  function getUserStatusBadgeVariant(status: UserStatus | string): BadgeVariant {
    if (status === UserStatus.ACTIVE) {
      return BADGE_VARIANTS.SUCCESS;
    }
    return BADGE_VARIANTS.ERROR;
  }

  function getUserStatusText(status: UserStatus | string): string {
    if (status === UserStatus.ACTIVE) {
      return 'Hoạt động';
    }
    return 'Đã khóa';
  }

  function formatDepartment(u: User): string {
    if (u.department) {
      return u.department;
    }
    if (u.departmentName) {
      return u.departmentName;
    }
    return UI_CONSTANTS.EMPTY_PLACEHOLDER;
  }

  function getRoleBadge(role: UserRole | undefined) {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ROLE_ADMIN':
        return { label: 'Quản Trị Viên', variant: 'primary' as const };
      case 'ROLE_DIRECTOR':
        return { label: 'Ban Giám Đốc', variant: 'primary' as const };
      case 'ROLE_BRANCH_MANAGER':
        return { label: 'Quản Lý Chi Nhánh', variant: 'warning' as const };
      case 'ROLE_KHO':
        return { label: 'Thủ Kho', variant: 'warning' as const };
      case 'ROLE_KE_TOAN':
        return { label: 'Kế Toán', variant: 'neutral' as const };
      case 'ROLE_SAN_XUAT':
        return { label: 'Tổ Trưởng Sản Xuất', variant: 'success' as const };
      case 'ROLE_QC':
        return { label: 'Kỹ Thuật Viên QC', variant: 'outline' as const };
      default:
        let fallbackRole = 'Nhân Viên';
        if (role) {
          fallbackRole = role;
        }
        return { label: fallbackRole, variant: 'neutral' as const };
    }
  }

  function handleRoleConfig(u: User) {
    const isTargetAdmin = u.roles?.includes('ROLE_ADMIN') || u.role === 'ROLE_ADMIN';
    if (isTargetAdmin && !authStore.isAdmin) {
      toast.error('Chỉ Quản trị viên (Admin) mới có quyền phân quyền hoặc chỉnh sửa tài khoản Admin!');
      return;
    }
    goto(`/identity/${u.id}/edit`);
  }
</script>

<div class="user-table-wrap">
  <Table striped={true} hover={true}>
    <thead>
      <tr>
        <th style="min-width: 140px;">Tài khoản</th>
        <th style="min-width: 180px;">Họ và tên</th>
        <th style="min-width: 200px;">Email</th>
        <th style="min-width: 160px;">Phòng ban</th>
        <th style="min-width: 170px;">Vai trò</th>
        <th style="min-width: 110px;">Trạng thái</th>
        <th style="min-width: 120px;">Ngày tạo</th>
        {#if authStore.isAdmin || authStore.hasPermission('ROLE_ASSIGN')}
          <th style="min-width: 110px; text-align: right;">Thao tác</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each users as u (u.id)}
        {@const roleInfo = getRoleBadge(u.role || (u.roles && u.roles[0]))}
        <tr>
          <td><span class="username-tag">{u.username}</span></td>
          <td class="font-bold">{u.fullName}</td>
          <td class="text-muted">{u.email}</td>
          <td>{formatDepartment(u)}</td>
          <td>
            <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
          </td>
          <td>
            <Badge variant={getUserStatusBadgeVariant(u.status)}>
              {getUserStatusText(u.status)}
            </Badge>
          </td>
          <td class="text-muted font-mono">{DateHelper.formatDate(u.createdAt)}</td>
          {#if authStore.isAdmin || authStore.hasPermission('ROLE_ASSIGN')}
            <td style="text-align: right;">
              {#if !((u.roles?.includes('ROLE_ADMIN') || u.role === 'ROLE_ADMIN') && !authStore.isAdmin)}
                <Button
                  size="sm"
                  variant="ghost"
                  onclick={() => handleRoleConfig(u)}
                >
                  Sửa & Phân quyền
                </Button>
              {/if}
            </td>
          {/if}
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
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .username-tag {
    font-family: monospace;
    font-weight: 700;
    color: var(--pn-ink);
  }

  .font-bold {
    font-weight: 600;
  }

  .font-mono {
    font-family: monospace;
    font-size: 12.5px;
  }

  .text-muted {
    color: var(--pn-ink-soft);
    font-size: 13px;
  }

  .empty-state {
    text-align: center;
    padding: 32px;
    color: var(--pn-ink-soft);
    font-style: italic;
  }
</style>
