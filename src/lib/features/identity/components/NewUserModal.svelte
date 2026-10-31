<script lang="ts">
  import { Modal, Input, Select, Button, toast } from '$ui';
  import { StringHelper } from '$core/utils';
  import { authStore } from '$core/stores';
  import { getDepartments, getRoles, type Department, type Role } from '$features/company';
  import { createUser } from '../identity.api';
  import type { User } from '../identity.types';

  interface Props {
    open: boolean;
    oncreated?: (newUser: User) => void;
  }

  let { open = $bindable(false), oncreated }: Props = $props();

  let username = $state('');
  let password = $state('');
  let fullName = $state('');
  let email = $state('');
  let phone = $state('');
  let selectedRoleId = $state<string>('');
  let selectedDepartmentId = $state<string>('');

  let departments = $state<Department[]>([]);
  let roles = $state<Role[]>([]);
  let loadingData = $state(false);
  let submitting = $state(false);

  // Field validation errors
  let usernameError = $state('');
  let fullNameError = $state('');
  let passwordError = $state('');
  let roleError = $state('');

  // Lấy dữ liệu động từ backend (không hardcode)
  $effect(() => {
    if (open) {
      loadSelectOptions();
    }
  });

  async function loadSelectOptions() {
    loadingData = true;
    try {
      const [deptList, roleList] = await Promise.all([
        getDepartments(),
        getRoles()
      ]);
      departments = deptList;
      roles = roleList;

      // Default department nếu chưa chọn
      if (!selectedDepartmentId && deptList.length > 0) {
        selectedDepartmentId = String(deptList[0].id);
      }

      // Default role (nếu không phải Admin thì chỉ gán vai trò nhân viên thông thường)
      const allowedRoles = getAllowedRoles();
      if (!selectedRoleId && allowedRoles.length > 0) {
        selectedRoleId = String(allowedRoles[0].id);
      }
    } catch (err: any) {
      toast.error('Không thể tải danh sách phòng ban và vai trò: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      loadingData = false;
    }
  }

  /**
   * Quy tắc nghiệp vụ phân quyền:
   * CHỈ ADMIN MỚI CÓ QUYỀN THÊM ADMIN.
   * Nếu người dùng hiện tại không phải Admin, lọc bỏ ROLE_ADMIN khỏi danh sách lựa chọn!
   */
  function getAllowedRoles(): Role[] {
    if (authStore.isAdmin) {
      return roles;
    }
    return roles.filter(
      (r) => r.code !== 'ROLE_ADMIN' && r.code !== 'SUPER_ADMIN'
    );
  }

  function validate(): boolean {
    let valid = true;
    usernameError = '';
    fullNameError = '';
    passwordError = '';
    roleError = '';

    const trimmedUser = StringHelper.trim(username);
    const trimmedName = StringHelper.trim(fullName);
    const trimmedPass = StringHelper.trim(password);

    if (StringHelper.isBlank(trimmedUser)) {
      usernameError = 'Vui lòng nhập tên tài khoản';
      valid = false;
    } else if (trimmedUser.length < 3) {
      usernameError = 'Tên tài khoản tối thiểu 3 ký tự';
      valid = false;
    }

    if (StringHelper.isBlank(trimmedName)) {
      fullNameError = 'Vui lòng nhập họ và tên nhân viên';
      valid = false;
    }

    if (StringHelper.isBlank(trimmedPass)) {
      passwordError = 'Vui lòng nhập mật khẩu khởi tạo';
      valid = false;
    } else if (trimmedPass.length < 6) {
      passwordError = 'Mật khẩu tối thiểu 6 ký tự';
      valid = false;
    }

    if (!selectedRoleId) {
      roleError = 'Vui lòng chọn vai trò';
      valid = false;
    } else {
      const targetRole = roles.find((r) => String(r.id) === selectedRoleId);
      if (
        targetRole &&
        (targetRole.code === 'ROLE_ADMIN' || targetRole.code === 'SUPER_ADMIN') &&
        !authStore.isAdmin
      ) {
        roleError = 'Chỉ Quản trị viên (Admin) mới có quyền cấp vai trò Quản trị viên!';
        valid = false;
      }
    }

    return valid;
  }

  async function handleSubmit() {
    if (!validate()) {
      return;
    }

    submitting = true;
    try {
      const trimmedUser = StringHelper.trim(username);
      const trimmedName = StringHelper.trim(fullName);
      const trimmedPass = StringHelper.trim(password);
      const roleIdNum = Number(selectedRoleId);
      const deptIdNum = Number(selectedDepartmentId);

      const targetDept = departments.find((d) => String(d.id) === selectedDepartmentId);
      const targetRole = roles.find((r) => String(r.id) === selectedRoleId);

      let assignedRoleIds: number[] | undefined = undefined;
      if (roleIdNum) {
        assignedRoleIds = [roleIdNum];
      }

      let trimmedEmail: string | undefined = undefined;
      if (StringHelper.isNotBlank(email)) {
        trimmedEmail = StringHelper.trim(email);
      }

      let trimmedPhone: string | undefined = undefined;
      if (StringHelper.isNotBlank(phone)) {
        trimmedPhone = StringHelper.trim(phone);
      }

      const created = await createUser({
        username: StringHelper.toLowerCase(trimmedUser),
        fullName: trimmedName,
        password: trimmedPass,
        email: trimmedEmail,
        phone: trimmedPhone,
        departmentId: deptIdNum || undefined,
        department: targetDept?.name,
        roleIds: assignedRoleIds,
        role: targetRole?.code
      });

      toast.success(`Đã cấp tài khoản thành công cho: ${created.fullName}`);
      username = '';
      fullName = '';
      email = '';
      phone = '';
      password = '';
      open = false;
      if (oncreated) oncreated(created);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo tài khoản');
    } finally {
      submitting = false;
    }
  }
</script>

<Modal
  bind:open
  title="Cấp Tài Khoản Người Dùng Mới"
  size="md"
>
  <p class="desc">
    Tạo tài khoản truy cập hệ thống Premier Nuts ERP và phân quyền phòng ban:
  </p>

  <div class="form-body">
    <div class="form-grid">
      <!-- Username Input -->
      <div class="field-wrap">
        <label for="new-username" class="field-label">Tên tài khoản <span class="req">*</span></label>
        <input
          id="new-username"
          type="text"
          class="custom-input"
          class:has-error={!!usernameError}
          placeholder="Ví dụ: van_a"
          bind:value={username}
          oninput={() => (usernameError = '')}
          disabled={submitting}
        />
        {#if usernameError}
          <span class="field-error">{usernameError}</span>
        {/if}
      </div>

      <!-- Fullname Input -->
      <div class="field-wrap">
        <label for="new-fullname" class="field-label">Họ và tên nhân viên <span class="req">*</span></label>
        <input
          id="new-fullname"
          type="text"
          class="custom-input"
          class:has-error={!!fullNameError}
          placeholder="Ví dụ: Nguyễn Văn A"
          bind:value={fullName}
          oninput={() => (fullNameError = '')}
          disabled={submitting}
        />
        {#if fullNameError}
          <span class="field-error">{fullNameError}</span>
        {/if}
      </div>
    </div>

    <div class="form-grid">
      <!-- Password -->
      <div class="field-wrap">
        <label for="new-password" class="field-label">Mật khẩu khởi tạo <span class="req">*</span></label>
        <input
          id="new-password"
          type="password"
          class="custom-input"
          class:has-error={!!passwordError}
          placeholder="Tối thiểu 6 ký tự"
          bind:value={password}
          oninput={() => (passwordError = '')}
          disabled={submitting}
        />
        {#if passwordError}
          <span class="field-error">{passwordError}</span>
        {/if}
      </div>

      <!-- Phone -->
      <div class="field-wrap">
        <label for="new-phone" class="field-label">Số điện thoại</label>
        <input
          id="new-phone"
          type="tel"
          class="custom-input"
          placeholder="Ví dụ: 0912345678"
          bind:value={phone}
          disabled={submitting}
        />
      </div>
    </div>

    <div class="form-grid">
      <!-- Email -->
      <div class="field-wrap">
        <label for="new-email" class="field-label">Email công ty</label>
        <input
          id="new-email"
          type="email"
          class="custom-input"
          placeholder="Ví dụ: a.nguyen@premiernuts.vn"
          bind:value={email}
          disabled={submitting}
        />
      </div>
    </div>

    <div class="form-grid">
      <!-- Role (Dynamic from API, filtered by admin permission) -->
      <div class="field-wrap">
        <label for="new-role" class="field-label">Vai trò phân quyền <span class="req">*</span></label>
        <select
          id="new-role"
          class="custom-select"
          class:has-error={!!roleError}
          bind:value={selectedRoleId}
          onchange={() => (roleError = '')}
          disabled={submitting || loadingData}
        >
          {#each getAllowedRoles() as r (r.id)}
            <option value={String(r.id)}>{r.name} ({r.code})</option>
          {/each}
        </select>
        {#if roleError}
          <span class="field-error">{roleError}</span>
        {/if}
        {#if !authStore.isAdmin}
          <span class="field-hint">Chỉ Quản trị viên mới được phân quyền Quản trị viên (Admin).</span>
        {/if}
      </div>

      <!-- Department (Dynamic from API) -->
      <div class="field-wrap">
        <label for="new-department" class="field-label">Phòng ban trực thuộc</label>
        <select
          id="new-department"
          class="custom-select"
          bind:value={selectedDepartmentId}
          disabled={submitting || loadingData}
        >
          {#each departments as d (d.id)}
            <option value={String(d.id)}>{d.name} ({d.code})</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  {#snippet footer()}
    <Button variant="secondary" onclick={() => (open = false)} disabled={submitting}>
      Hủy bỏ
    </Button>
    <Button variant="primary" onclick={handleSubmit} disabled={submitting || loadingData}>
      {#if submitting}
        Đang tạo...
      {:else}
        Xác nhận tạo tài khoản
      {/if}
    </Button>
  {/snippet}
</Modal>

<style>
  .desc {
    margin: 0 0 16px;
    font-size: 13.5px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .form-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Responsive grid layout */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }

  @media (min-width: 640px) {
    .form-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .field-wrap {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .field-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
  }

  .req {
    color: var(--pn-error, #B92C2C);
  }

  .custom-input,
  .custom-select {
    width: 100%;
    box-sizing: border-box;
    background-color: var(--pn-paper, #FFFFFF);
    border: 1px solid var(--pn-line-dark, #D6C5B3);
    border-radius: var(--pn-radius, 6px);
    padding: 9px 12px;
    font-size: 13.5px;
    color: var(--pn-ink, #2B2116);
    outline: none;
    font-family: inherit;
    transition: border-color var(--pn-transition, 0.2s), box-shadow var(--pn-transition, 0.2s);
  }

  .custom-input:focus,
  .custom-select:focus {
    border-color: var(--pn-orange, #F0821E);
    box-shadow: 0 0 0 3px rgba(240, 130, 30, 0.16);
  }

  .custom-input.has-error,
  .custom-select.has-error {
    border-color: #dc2626 !important;
    background-color: #fffaf9 !important;
  }

  .custom-input.has-error:focus,
  .custom-select.has-error:focus {
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15) !important;
  }

  .field-error {
    font-size: 12px;
    color: #dc2626;
    font-weight: 500;
    margin-top: 2px;
  }

  .field-hint {
    font-size: 11.5px;
    color: var(--pn-ink-soft, #6B5D4F);
    font-style: italic;
    margin-top: 2px;
  }
</style>
