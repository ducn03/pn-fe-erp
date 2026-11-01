<script lang="ts">
  import {
    Button,
    Card,
    PageHeader,
    Forbidden403,
    toast
  } from '$ui';
  import { goto } from '$app/navigation';
  import { authStore } from '$core/stores';
  import {
    UserTable,
    RoleTemplateManager,
    getUsers,
    type User
  } from '$features/identity';

  let hasAccess = $derived(
    authStore.hasPermission('USER_VIEW') || authStore.hasPermission('USER_MANAGE')
  );
  let activeTab = $state<'users' | 'templates'>('users');
  let users = $state<User[]>([]);
  let loading = $state(true);

  async function loadUsers(isManual = false) {
    if (!hasAccess) return;
    loading = true;
    try {
      users = await getUsers();
      if (isManual) {
        toast.success('Đã cập nhật danh sách người dùng mới nhất!');
      }
    } catch (err: any) {
      toast.error('Lỗi khi tải danh sách người dùng: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (hasAccess) {
      loadUsers(false);
    }
  });
</script>

<svelte:head>
  <title>Quản Lý Tài Khoản & Phân Quyền | Premier Nuts ERP</title>
</svelte:head>

{#if !hasAccess}
  <Forbidden403
    title="Quyền Truy Cập Bị Từ Chối"
    description="Bạn không có quyền hạn tra cứu hoặc quản lý tài khoản người dùng."
    requiredPermission="USER_VIEW"
  />
{:else}
  <PageHeader>
    {#snippet actions()}
      {#if activeTab === 'users'}
        <Button variant="secondary" onclick={() => loadUsers(true)} disabled={loading}>
          {#if loading}Đang làm mới...{:else}Làm mới danh sách{/if}
        </Button>
        {#if authStore.isAdmin && authStore.hasPermission('USER_MANAGE')}
          <Button variant="primary" onclick={() => goto('/identity/create')}>
            + Cấp tài khoản mới
          </Button>
        {/if}
      {/if}
    {/snippet}
  </PageHeader>

  <!-- Navigation Tabs: Chỉ hiển thị tab Khuôn Mẫu Vai Trò cho Quản Trị Viên (Admin) -->
  {#if authStore.isAdmin}
    <div class="tabs-nav-bar">
      <button
        type="button"
        class="tab-nav-item"
        class:active={activeTab === 'users'}
        onclick={() => (activeTab = 'users')}
      >
        Danh Sách Nhân Sự & Tài Khoản ({users.length})
      </button>
      <button
        type="button"
        class="tab-nav-item"
        class:active={activeTab === 'templates'}
        onclick={() => (activeTab = 'templates')}
      >
        Khuôn Mẫu Phân Quyền Vai Trò
      </button>
    </div>
  {/if}

  {#if activeTab === 'users' || !authStore.isAdmin}
    <Card accent="orange">
      <div class="table-header">
        <div>
          <h3 class="table-title">Danh sách nhân sự & quyền hạn</h3>
          <p class="text-muted">Tổng cộng {users.length} tài khoản đang hoạt động trong hệ thống.</p>
        </div>
        {#if authStore.isAdmin && authStore.hasPermission('USER_MANAGE')}
          <Button variant="primary" size="sm" onclick={() => goto('/identity/create')}>
            + Thêm nhân sự mới
          </Button>
        {/if}
      </div>

      <UserTable bind:users />
    </Card>
  {:else if activeTab === 'templates' && authStore.isAdmin}
    <RoleTemplateManager />
  {/if}
{/if}

<style>
  .tabs-nav-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
    border-bottom: 2px solid var(--pn-border, #E8DFD8);
    padding-bottom: 2px;
  }

  .tab-nav-item {
    background: transparent;
    border: none;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    color: var(--pn-ink-soft, #6B5D4F);
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    border-bottom: 3px solid transparent;
    margin-bottom: -4px;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .tab-nav-item:hover {
    color: var(--pn-brand, #D96B27);
    background: rgba(217, 107, 39, 0.05);
  }

  .tab-nav-item.active {
    color: var(--pn-brand, #D96B27);
    border-bottom-color: var(--pn-brand, #D96B27);
    font-weight: 700;
    background: rgba(217, 107, 39, 0.08);
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .table-title {
    margin: 0 0 4px;
    font-size: 16.5px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .text-muted {
    margin: 0;
    font-size: 13px;
    color: var(--pn-ink-soft, #6B5D4F);
  }
</style>
