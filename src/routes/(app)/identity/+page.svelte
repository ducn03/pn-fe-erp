<script lang="ts">
  import {
    Button,
    Card,
    PageHeader,
    Callout,
    toast
  } from '#lib/premier-ui';
  import {
    UserTable,
    NewUserModal,
    getUsers,
    type User
  } from '#lib/modules/identity';

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
    <Button variant="secondary" onclick={() => toast.info('Đang đồng bộ danh sách quyền từ pn-identity (:8081)...')}>
      Đồng bộ quyền
    </Button>
    <Button variant="primary" onclick={() => (isModalOpen = true)}>
      + Cấp tài khoản mới
    </Button>
  {/snippet}
</PageHeader>

<Callout variant="info" title="Microservice Identity (Spring Boot pn-identity)">
  Phân hệ này liên kết trực tiếp với backend <code>pn-identity</code> chạy trên cổng <code>8081</code> qua <code>pn-api-gateway</code> (cổng <code>8080</code>). Hệ thống hỗ trợ xác thực JWT và phân quyền chi tiết cho Ban giám đốc, Thủ kho, Kế toán và Quản đốc nhà máy.
</Callout>

<Card accent="orange" style="margin-top: 18px;">
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

  code {
    background: var(--pn-orange-light);
    color: var(--pn-orange-hover);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }
</style>
