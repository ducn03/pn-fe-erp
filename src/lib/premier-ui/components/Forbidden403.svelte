<script lang="ts">
  import { Button, Card } from '$ui';
  import { goto } from '$app/navigation';
  import { authStore } from '$core/stores';

  interface Props {
    title?: string;
    description?: string;
    requiredPermission?: string;
  }

  let {
    title = 'Quyền Truy Cập Bị Từ Chối (403 Forbidden)',
    description = 'Tài khoản của bạn không có đủ quyền hạn được cấp để truy cập chức năng này.',
    requiredPermission
  }: Props = $props();

  function getFriendlyRoleName(code: string): string {
    switch (code) {
      case 'SUPER_ADMIN':
      case 'ROLE_ADMIN':
        return 'Quản Trị Viên';
      case 'ROLE_DIRECTOR':
        return 'Ban Giám Đốc';
      case 'ROLE_BRANCH_MANAGER':
        return 'Quản Lý Chi Nhánh';
      case 'ROLE_KHO':
        return 'Thủ Kho';
      case 'ROLE_KE_TOAN':
        return 'Kế Toán';
      case 'ROLE_SAN_XUAT':
        return 'Tổ Trưởng Sản Xuất';
      case 'ROLE_QC':
        return 'Kỹ Thuật Viên QC';
      default:
        return code.replace('ROLE_', '');
    }
  }
</script>

<svelte:head>
  <title>403 - Truy Cập Bị Từ Chối | Premier Nuts ERP</title>
</svelte:head>

<div class="forbidden-page-container">
  <Card accent="orange">
    <div class="forbidden-content">
      <div class="forbidden-code">403</div>
      <h2 class="forbidden-title">{title}</h2>
      <p class="forbidden-desc">{description}</p>

      <div class="account-summary-pill">
        <span>Tài khoản: <strong>{authStore.user?.fullName || authStore.user?.username || 'Người dùng'}</strong></span>
        {#if authStore.user?.roles && authStore.user.roles.length > 0}
          <span class="role-chip">Vai trò: {authStore.user.roles.map(getFriendlyRoleName).join(', ')}</span>
        {/if}
      </div>

      {#if requiredPermission}
        <div class="permission-note">
          Vui lòng liên hệ Quản trị viên nếu bạn cần cấp quyền truy cập chức năng này.
        </div>
      {/if}

      <div class="action-row">
        {#if authStore.isAdmin || authStore.hasPermission('DASHBOARD_VIEW')}
          <Button variant="primary" onclick={() => goto('/')}>
            Về Bàn Làm Việc
          </Button>
        {:else if authStore.hasPermission('INVENTORY_VIEW')}
          <Button variant="primary" onclick={() => goto('/kho')}>
            Đến Kho Hạt
          </Button>
        {:else}
          <Button variant="primary" onclick={() => goto('/company')}>
            Về Trang Doanh Nghiệp
          </Button>
        {/if}
        <Button variant="secondary" onclick={() => history.back()}>
          Quay lại Trang Trước
        </Button>
      </div>
    </div>
  </Card>
</div>

<style>
  .forbidden-page-container {
    max-width: 680px;
    margin: 40px auto;
    padding: 0 16px;
  }

  .forbidden-content {
    padding: 32px 16px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .forbidden-code {
    font-size: 54px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #DC2626;
    line-height: 1;
    font-family: monospace;
    background: #FEF2F2;
    border: 1px solid #FCA5A5;
    padding: 8px 24px;
    border-radius: 12px;
  }

  .forbidden-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
    margin: 4px 0 0;
  }

  .forbidden-desc {
    font-size: 14.5px;
    color: var(--pn-ink-soft, #6B5D4F);
    max-width: 500px;
    margin: 0;
    line-height: 1.55;
  }

  .account-summary-pill {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: #FAF6F0;
    border: 1px solid var(--pn-border, #E8DFD8);
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    color: var(--pn-ink, #2B2116);
  }

  .role-chip {
    color: var(--pn-brand, #D96B27);
    font-weight: 600;
  }

  .permission-note {
    font-size: 12px;
    color: var(--pn-ink-soft, #6B5D4F);
  }


  .action-row {
    display: flex;
    gap: 12px;
    margin-top: 14px;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
