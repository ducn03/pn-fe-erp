<script lang="ts">
  import { Modal, Button, toast } from '$ui';
  import { StringHelper } from '$core/utils';
  import { authStore } from '$core/stores';
  import {
    getDepartments,
    getRoles,
    getPermissions,
    type Department,
    type Role,
    type Permission
  } from '$features/company';
  import { createUser } from '../identity.api';
  import type { User } from '../identity.types';
  import { getModuleMeta } from '../identity.constants';

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
  let selectedPermissionIds = $state<number[]>([]);

  let departments = $state<Department[]>([]);
  let roles = $state<Role[]>([]);
  let permissions = $state<Permission[]>([]);
  let loadingData = $state(false);
  let submitting = $state(false);

  // Field validation errors
  let usernameError = $state('');
  let fullNameError = $state('');
  let passwordError = $state('');
  let roleError = $state('');



  // Nạp dữ liệu động từ backend
  $effect(() => {
    if (open) {
      loadSelectOptions();
    }
  });

  async function loadSelectOptions() {
    loadingData = true;
    try {
      const [deptList, roleList, permList] = await Promise.all([
        getDepartments(),
        getRoles(),
        getPermissions()
      ]);
      departments = deptList;
      roles = roleList;
      permissions = permList;

      // Default department nếu chưa chọn
      if (!selectedDepartmentId && deptList.length > 0) {
        selectedDepartmentId = String(deptList[0].id);
      }

      // Default role (nếu không phải Admin thì chỉ gán vai trò nhân viên thông thường)
      const allowedRoles = getAllowedRoles();
      if (!selectedRoleId && allowedRoles.length > 0) {
        selectedRoleId = String(allowedRoles[0].id);
        applyRoleTemplate(selectedRoleId);
      }
    } catch (err: any) {
      toast.error('Không thể tải danh mục hệ thống: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      loadingData = false;
    }
  }

  /**
   * Áp dụng template permissions từ vai trò đã chọn
   */
  function applyRoleTemplate(roleIdStr: string) {
    const targetRole = roles.find((r) => String(r.id) === roleIdStr);
    if (targetRole && targetRole.permissionIds && targetRole.permissionIds.length > 0) {
      selectedPermissionIds = [...targetRole.permissionIds];
    } else {
      selectedPermissionIds = [];
    }
  }

  function handleRoleChange() {
    roleError = '';
    applyRoleTemplate(selectedRoleId);
  }

  /**
   * Quy tắc nghiệp vụ phân quyền:
   * CHỈ ADMIN MỚI CÓ QUYỀN THÊM ADMIN.
   */
  function getAllowedRoles(): Role[] {
    if (authStore.isAdmin) {
      return roles;
    }
    return roles.filter(
      (r) => r.code !== 'ROLE_ADMIN' && r.code !== 'SUPER_ADMIN'
    );
  }

  function getPermissionsByModule(): Record<string, Permission[]> {
    const grouped: Record<string, Permission[]> = {};
    for (const p of permissions) {
      const mod = p.module || 'KHÁC';
      if (!grouped[mod]) {
        grouped[mod] = [];
      }
      grouped[mod].push(p);
    }
    return grouped;
  }

  function togglePermission(id: number, checked: boolean) {
    if (checked) {
      if (!selectedPermissionIds.includes(id)) {
        selectedPermissionIds = [...selectedPermissionIds, id];
      }
    } else {
      selectedPermissionIds = selectedPermissionIds.filter((pId) => pId !== id);
    }
  }

  function toggleModulePermissions(modulePerms: Permission[], selectAll: boolean) {
    const modIds = modulePerms.map((p) => p.id);
    if (selectAll) {
      const merged = new Set([...selectedPermissionIds, ...modIds]);
      selectedPermissionIds = Array.from(merged);
    } else {
      selectedPermissionIds = selectedPermissionIds.filter((id) => !modIds.includes(id));
    }
  }

  function isModuleFullySelected(modulePerms: Permission[]): boolean {
    if (modulePerms.length === 0) return false;
    for (const p of modulePerms) {
      if (!selectedPermissionIds.includes(p.id)) {
        return false;
      }
    }
    return true;
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
        roleId: roleIdNum || undefined,
        roleIds: assignedRoleIds,
        permissionIds: selectedPermissionIds,
        role: targetRole?.code
      });

      toast.success(`Đã cấp tài khoản thành công cho: ${created.fullName} (${selectedPermissionIds.length} quyền)`);
      username = '';
      fullName = '';
      email = '';
      phone = '';
      password = '';
      selectedPermissionIds = [];
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
  title="Cấp Tài Khoản Người Dùng & Tùy Biến Quyền Hạn"
  size="lg"
>
  <p class="desc">
    Tạo tài khoản người dùng, chọn khuôn mẫu vai trò và tùy chỉnh linh hoạt quyền hạn trực tiếp:
  </p>

  <div class="modal-scroll-area">
    <div class="form-body">
      <!-- Thông tin cơ bản -->
      <div class="section-title">1. Thông tin tài khoản & nhân sự</div>

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

        <!-- Department -->
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

      <!-- Khuôn mẫu vai trò -->
      <div class="section-title">2. Khuôn mẫu vai trò (Role Template)</div>
      <div class="role-selection-box">
        <div class="field-wrap">
          <label for="new-role" class="field-label">Chọn vai trò mẫu <span class="req">*</span></label>
          <select
            id="new-role"
            class="custom-select"
            class:has-error={!!roleError}
            bind:value={selectedRoleId}
            onchange={handleRoleChange}
            disabled={submitting || loadingData}
          >
            {#each getAllowedRoles() as r (r.id)}
              <option value={String(r.id)}>{r.name} ({r.code})</option>
            {/each}
          </select>
          {#if roleError}
            <span class="field-error">{roleError}</span>
          {/if}
          <span class="field-hint">
            Hệ thống tự động nạp danh sách quyền chuẩn của vai trò này vào bên dưới. Bạn có thể tự do thêm hoặc bớt quyền cho nhân viên.
          </span>
        </div>
      </div>

      <!-- Tùy biến quyền hạn trực tiếp -->
      <div class="permission-section">
        <div class="permission-header">
          <div>
            <div class="section-title perm-title">3. Danh sách quyền hạn trực tiếp (User Permissions)</div>
            <p class="perm-desc">Tích chọn để cấp thêm hoặc bỏ bớt các quyền cụ thể cho tài khoản này.</p>
          </div>
          <div class="perm-counter">
            Đã chọn: <span class="counter-num">{selectedPermissionIds.length}</span> / {permissions.length} quyền
          </div>
        </div>

        {#if loadingData}
          <div class="perm-loading">Đang tải danh mục quyền hạn...</div>
        {:else}
          {@const groupedPerms = getPermissionsByModule()}
          <div class="modules-stack">
            {#each Object.entries(groupedPerms) as [modCode, modPerms] (modCode)}
              {@const isAllChecked = isModuleFullySelected(modPerms)}
              <div class="module-card">
                <div class="module-card-header">
                  <div class="module-info">
                    <span class="module-code-badge">{modCode}</span>
                    <span class="module-title">{getModuleMeta(modCode).title}</span>
                  </div>
                  <div class="module-actions">
                    {#if isAllChecked}
                      <button
                        type="button"
                        class="toggle-link"
                        onclick={() => toggleModulePermissions(modPerms, false)}
                        disabled={submitting}
                      >
                        Bỏ chọn tất cả
                      </button>
                    {:else}
                      <button
                        type="button"
                        class="toggle-link"
                        onclick={() => toggleModulePermissions(modPerms, true)}
                        disabled={submitting}
                      >
                        Chọn tất cả ({modPerms.length})
                      </button>
                    {/if}
                  </div>
                </div>

                <div class="module-perms-grid">
                  {#each modPerms as p (p.id)}
                    {@const isChecked = selectedPermissionIds.includes(p.id)}
                    <label class="perm-checkbox-item" class:is-checked={isChecked}>
                      <input
                        type="checkbox"
                        class="custom-checkbox"
                        checked={isChecked}
                        onchange={(e) => togglePermission(p.id, e.currentTarget.checked)}
                        disabled={submitting}
                      />
                      <div class="perm-item-content">
                        <span class="perm-name">{p.name}</span>
                        <span class="perm-code">{p.code}</span>
                        {#if p.description}
                          <span class="perm-desc-text">{p.description}</span>
                        {/if}
                      </div>
                    </label>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#snippet footer()}
    <Button variant="secondary" onclick={() => (open = false)} disabled={submitting}>
      Hủy bỏ
    </Button>
    <Button variant="primary" onclick={handleSubmit} disabled={submitting || loadingData}>
      {#if submitting}
        Đang cấp tài khoản...
      {:else}
        Xác nhận cấp tài khoản ({selectedPermissionIds.length} quyền)
      {/if}
    </Button>
  {/snippet}
</Modal>

<style>
  .desc {
    margin: 0 0 14px;
    font-size: 13.5px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .modal-scroll-area {
    max-height: 72vh;
    overflow-y: auto;
    padding-right: 6px;
  }

  .form-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
    margin-top: 6px;
    margin-bottom: 2px;
    border-bottom: 1px solid var(--pn-line, #EEE3D3);
    padding-bottom: 6px;
  }

  .perm-title {
    border-bottom: none;
    padding-bottom: 0;
    margin-top: 0;
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

  .role-selection-box {
    background: var(--pn-cream, #FFFBF4);
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: var(--pn-radius, 6px);
    padding: 12px 14px;
  }

  /* Permission customization section */
  .permission-section {
    background: #FAFAF7;
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: var(--pn-radius, 6px);
    padding: 14px;
    margin-top: 4px;
  }

  .permission-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .perm-desc {
    margin: 2px 0 0;
    font-size: 12.5px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .perm-counter {
    background: var(--pn-paper, #FFFFFF);
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 4px;
    padding: 4px 10px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
  }

  .counter-num {
    color: var(--pn-orange, #F0821E);
    font-weight: 700;
  }

  .perm-loading {
    font-size: 13px;
    color: var(--pn-ink-soft, #6B5D4F);
    padding: 16px;
    text-align: center;
  }

  .modules-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .module-card {
    background: var(--pn-paper, #FFFFFF);
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 6px;
    overflow: hidden;
  }

  .module-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--pn-cream, #FFFBF4);
    border-bottom: 1px solid var(--pn-line, #EEE3D3);
    padding: 8px 12px;
    flex-wrap: wrap;
    gap: 6px;
  }

  .module-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .module-code-badge {
    background: #EAE2D5;
    color: var(--pn-ink, #2B2116);
    font-size: 11px;
    font-weight: 700;
    font-family: monospace;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .module-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .toggle-link {
    background: none;
    border: none;
    padding: 0;
    color: var(--pn-orange, #F0821E);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .toggle-link:hover {
    text-decoration: underline;
  }

  .module-perms-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 10px 12px;
  }

  @media (min-width: 640px) {
    .module-perms-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .perm-checkbox-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    transition: background 0.15s ease;
  }

  .perm-checkbox-item:hover {
    background: var(--pn-cream, #FFFBF4);
  }

  .perm-checkbox-item.is-checked {
    background: #FFF8EE;
  }

  .custom-checkbox {
    accent-color: var(--pn-orange, #F0821E);
    margin-top: 3px;
    cursor: pointer;
    width: 15px;
    height: 15px;
  }

  .perm-item-content {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .perm-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
  }

  .perm-code {
    font-size: 11px;
    font-family: monospace;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .perm-desc-text {
    font-size: 11.5px;
    color: #8C7B6B;
    line-height: 1.25;
  }
</style>
