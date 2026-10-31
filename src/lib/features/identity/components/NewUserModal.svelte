<script lang="ts">
  import { Modal, Input, Select, Button, toast } from '$ui';
  import { StringHelper } from '$core/utils';
  import { createUser } from '../identity.api';
  import type { User, UserRole } from '../identity.types';

  interface Props {
    open: boolean;
    oncreated?: (newUser: User) => void;
  }

  let { open = $bindable(false), oncreated }: Props = $props();

  let username = $state('');
  let fullName = $state('');
  let email = $state('');
  let role = $state<UserRole>('ROLE_KHO');
  let department = $state('Kho Vận & Logistics');
  let loading = $state(false);

  async function handleSubmit() {
    const trimmedUsername = StringHelper.trim(username);
    const trimmedFullName = StringHelper.trim(fullName);

    if (StringHelper.isBlank(trimmedUsername) || StringHelper.isBlank(trimmedFullName)) {
      toast.error('Vui lòng nhập đầy đủ tài khoản và họ tên!');
      return;
    }

    loading = true;
    try {
      const created = await createUser({
        username: StringHelper.toLowerCase(trimmedUsername),
        fullName: trimmedFullName,
        email: StringHelper.trim(email) || `${trimmedUsername}@premiernuts.vn`,
        role,
        department: StringHelper.trim(department)
      });

      toast.success(`Đã cấp tài khoản thành công cho: ${created.fullName}`);
      username = '';
      fullName = '';
      email = '';
      open = false;
      if (oncreated) oncreated(created);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo tài khoản');
    } finally {
      loading = false;
    }
  }
</script>

<Modal
  bind:open
  title="Cấp Tài Khoản Người Dùng Mới"
  size="md"
>
  <p class="desc">Tạo tài khoản truy cập vào cụm hệ thống Premier Nuts ERP:</p>

  <div class="form-body">
    <div class="form-row">
      <Input
        label="Tên đăng nhập (Username)"
        placeholder="Ví dụ: nguyen_van_a"
        bind:value={username}
        required={true}
      />
      <Input
        label="Họ và tên nhân viên"
        placeholder="Ví dụ: Nguyễn Văn A"
        bind:value={fullName}
        required={true}
      />
    </div>

    <Input
      label="Email công ty"
      type="email"
      placeholder="Ví dụ: a.nguyen@premiernuts.vn"
      bind:value={email}
    />

    <div class="form-row">
      <Select
        label="Vai trò (Role)"
        bind:value={role}
        options={[
          { value: 'ROLE_ADMIN', label: 'Quản Trị Viên (Admin)' },
          { value: 'ROLE_KHO', label: 'Thủ Kho (Warehouse)' },
          { value: 'ROLE_KE_TOAN', label: 'Kế Toán (Accountant)' },
          { value: 'ROLE_SAN_XUAT', label: 'Tổ Trưởng Sản Xuất (Manufacturing)' }
        ]}
      />
      <Input
        label="Phòng ban"
        placeholder="Ví dụ: Phân xưởng chế biến..."
        bind:value={department}
      />
    </div>
  </div>

  {#snippet footer()}
    <Button variant="secondary" onclick={() => (open = false)} disabled={loading}>
      Hủy bỏ
    </Button>
    <Button variant="primary" onclick={handleSubmit} disabled={loading}>
      {loading ? 'Đang tạo...' : 'Xác nhận tạo tài khoản'}
    </Button>
  {/snippet}
</Modal>

<style>
  .desc {
    margin: 0 0 16px;
    font-size: 13.5px;
    color: var(--pn-ink-soft);
  }

  .form-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
</style>
