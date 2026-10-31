<script lang="ts">
  import {
    Button,
    Card,
    PageHeader,
    Callout,
    toast
  } from '$ui';
  import {
    UserTable,
    NewUserModal,
    getUsers,
    type User
  } from '$features/identity';

  let users = $state<User[]>([]);
  let isModalOpen = $state(false);

  $effect(() => {
    getUsers().then((data) => (users = data));
  });

  function handleUserCreated(newUser: User) {
    users = [newUser, ...users];
  }
</script>

<PageHeader
  title="Tài Khoản & Phân Quyền"
  subtitle="Quản trị nhân sự, vai trò và phân quyền truy cập cụm hệ thống Premier Nuts"
  breadcrumbs={[
    { label: 'Premier Nuts', href: '/' },
    { label: 'Hệ thống' },
    { label: 'Identity' }
  ]}
>
  {#snippet actions()}
    <Button variant="secondary" onclick={() => toast.info('Đang làm mới danh sách tài khoản...')}>
      Làm mới danh sách
    </Button>
    <Button variant="primary" onclick={() => (isModalOpen = true)}>
      + Cấp tài khoản mới
    </Button>
  {/snippet}
</PageHeader>

<Card accent="orange">
  <div class="table-header">
    <div>
      <h3>Danh sách nhân sự & quyền hạn</h3>
      <p class="text-muted">Tổng cộng {users.length} tài khoản đang hoạt động trong hệ thống.</p>
    </div>
    <Button variant="outline" size="sm" onclick={() => (isModalOpen = true)}>
      + Thêm người dùng
    </Button>
  </div>

  <UserTable {users} />
</Card>

<NewUserModal
  bind:open={isModalOpen}
  oncreated={handleUserCreated}
/>

<style>
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }

  .table-header h3 {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 700;
    color: var(--pn-ink);
  }

  .text-muted {
    margin: 0;
    font-size: 13px;
    color: var(--pn-ink-soft);
  }
</style>
