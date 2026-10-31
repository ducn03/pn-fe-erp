<script lang="ts">
  import {
    Button,
    Card,
    PageHeader,
    toast
  } from '$ui';
  import { authStore } from '$core/stores';
  import {
    UserTable,
    NewUserModal,
    getUsers,
    type User
  } from '$features/identity';

  let users = $state<User[]>([]);
  let isModalOpen = $state(false);
  let loading = $state(true);

  async function loadUsers(isManual = false) {
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
    loadUsers(false);
  });

  function handleUserCreated(newUser: User) {
    users = [newUser, ...users];
  }
</script>

<svelte:head>
  <title>Quản Lý Người Dùng & Phân Quyền | Premier Nuts ERP</title>
</svelte:head>

<PageHeader
  title="Quản Lý Tài Khoản & Phân Quyền"
  subtitle="Quản trị nhân sự, vai trò nghiệp vụ và phân quyền truy cập hệ thống Premier Nuts"
  breadcrumbs={[
    { label: 'Premier Nuts', href: '/' },
    { label: 'Hệ thống' },
    { label: 'Identity' }
  ]}
>
  {#snippet actions()}
    <Button variant="secondary" onclick={() => loadUsers(true)} disabled={loading}>
      {#if loading}Đang làm mới...{:else}Làm mới danh sách{/if}
    </Button>
    <!-- Phân quyền chức năng: Chỉ hiển thị nút thêm nếu có quyền USER_MANAGE hoặc là Admin -->
    {#if authStore.isAdmin || authStore.hasPermission('USER_MANAGE')}
      <Button variant="primary" onclick={() => (isModalOpen = true)}>
        + Cấp tài khoản mới
      </Button>
    {/if}
  {/snippet}
</PageHeader>

<Card accent="orange">
  <div class="table-header">
    <div>
      <h3 class="table-title">Danh sách nhân sự & quyền hạn</h3>
      <p class="text-muted">Tổng cộng {users.length} tài khoản đang hoạt động trong hệ thống.</p>
    </div>
    {#if authStore.isAdmin || authStore.hasPermission('USER_MANAGE')}
      <Button variant="outline" size="sm" onclick={() => (isModalOpen = true)}>
        + Thêm người dùng
      </Button>
    {/if}
  </div>

  <UserTable {users} />
</Card>

{#if authStore.isAdmin || authStore.hasPermission('USER_MANAGE')}
  <NewUserModal
    bind:open={isModalOpen}
    oncreated={handleUserCreated}
  />
{/if}

<style>
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
