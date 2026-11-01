<script lang="ts">
  import {
    Modal,
    Button,
    Badge,
    toast,
    BADGE_VARIANTS
  } from '$ui';
  import { authStore } from '$core/stores';
  import type { User } from '../identity.types';
  import { updateUser } from '../identity.api';
  import {
    getDepartments,
    getRoles,
    getPermissions,
    type Department,
    type Role,
    type Permission
  } from '$features/company';

  interface Props {
    open: boolean;
    user: User | null;
    onclose: () => void;
    onsave: (updated: User) => void;
  }

  let { open = false, user = null, onclose, onsave }: Props = $props();

  let departments = $state<Department[]>([]);
  let roles = $state<Role[]>([]);
  let allPermissions = $state<Permission[]>([]);
  let loadingMetadata = $state(false);

  // Form states
  let username = $state('');
  let fullName = $state('');
  let email = $state('');
  let phone = $state('');
  let selectedDepartmentId = $state<number | undefined>(undefined);
  let selectedRoleId = $state<number | undefined>(undefined);
  let selectedPermissionIds = $state<number[]>([]);
  let showCustomPermissions = $state(false);

  let formErrors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);

  const MODULE_TITLES: Record<string, { title: string; color: string }> = {
    IDENTITY: { title: 'Tài Khoản & Nhân Sự', color: '#3B82F6' },
    INVENTORY: { title: 'Kho Vận & Vật Tư', color: '#F0821E' },
    BRANCH: { title: 'Quản Lý Chi Nhánh', color: '#10B981' },
    FINANCE: { title: 'Tài Chính & Kế Toán', color: '#8B5CF6' },
    MANUFACTURING: { title: 'Xưởng Sản Xuất Chế Biến', color: '#EC4899' },
    QC: { title: 'Kiểm Định Chất Lượng', color: '#06B6D4' },
    MANAGEMENT: { title: 'Ban Giám Đốc & Điều Hành', color: '#F59E0B' },
    SYSTEM: { title: 'Quản Trị Hệ Thống', color: '#6366F1' }
  };

  let groupedPermissions = $derived.by(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of allPermissions) {
      const mod = p.module || 'KHAC';
      if (!groups[mod]) {
        groups[mod] = [];
      }
      groups[mod].push(p);
    }
    return groups;
  });

  async function loadMetadata() {
    loadingMetadata = true;
    try {
      const [deptList, roleList, permList] = await Promise.all([
        getDepartments(),
        getRoles(),
        getPermissions()
      ]);
      departments = deptList;
      roles = roleList;
      allPermissions = permList;
    } catch (err: any) {
      toast.error('Lỗi khi nạp danh mục cấu hình: ' + (err.message || 'Lỗi mạng'));
    } finally {
      loadingMetadata = false;
    }
  }

  $effect(() => {
    if (open) {
      loadMetadata();
      if (user) {
        username = user.username || '';
        fullName = user.fullName || '';
        email = user.email || '';
        phone = user.phone || '';
        selectedDepartmentId = user.departmentId;
        selectedRoleId = user.roleId;

        if (Array.isArray(user.permissionIds) && user.permissionIds.length > 0) {
          selectedPermissionIds = [...user.permissionIds];
        } else if (user.roleId && roles.length > 0) {
          const r = roles.find((item) => item.id === user.roleId);
          if (r && Array.isArray(r.permissionIds)) {
            selectedPermissionIds = [...r.permissionIds];
          } else {
            selectedPermissionIds = [];
          }
        } else {
          selectedPermissionIds = [];
        }
      }
      formErrors = {};
      showCustomPermissions = false;
    }
  });

  function handleSelectRole(roleId: number) {
    selectedRoleId = roleId;
    delete formErrors.roleId;
    const r = roles.find((item) => item.id === roleId);
    if (r && Array.isArray(r.permissionIds)) {
      selectedPermissionIds = [...r.permissionIds];
    }
  }

  function togglePermission(pId: number) {
    if (selectedPermissionIds.includes(pId)) {
      selectedPermissionIds = selectedPermissionIds.filter((id) => id !== pId);
    } else {
      selectedPermissionIds = [...selectedPermissionIds, pId];
    }
  }

  function selectAllInModule(perms: Permission[]) {
    const pIds = perms.map((p) => p.id);
    const allSelected = pIds.every((id) => selectedPermissionIds.includes(id));
    if (allSelected) {
      selectedPermissionIds = selectedPermissionIds.filter((id) => !pIds.includes(id));
    } else {
      selectedPermissionIds = Array.from(new Set([...selectedPermissionIds, ...pIds]));
    }
  }

  async function handleSave() {
    formErrors = {};

    if (!user) return;

    const trimmedFullName = fullName.trim();
    if (!trimmedFullName) {
      formErrors.fullName = 'Họ và tên không được để trống';
    } else {
      const words = trimmedFullName.split(/\s+/).filter(Boolean);
      if (words.length < 2) {
        formErrors.fullName = 'Họ và tên phải có ít nhất 2 từ';
      }
    }

    if (authStore.isAdmin) {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        formErrors.username = 'Tên đăng nhập không được để trống';
      }
    }

    if (!selectedRoleId) {
      formErrors.roleId = 'Vui lòng chọn vai trò';
    }

    if (Object.keys(formErrors).length > 0) {
      toast.error('Vui lòng kiểm tra lại thông tin có cảnh báo đỏ');
      return;
    }

    isSubmitting = true;
    try {
      const payload: any = {
        fullName: trimmedFullName,
        email: email.trim(),
        phone: phone.trim(),
        departmentId: selectedDepartmentId,
        roleId: selectedRoleId,
        permissionIds: selectedPermissionIds
      };

      if (authStore.isAdmin) {
        payload.username = username.trim();
      }

      const updated = await updateUser(user.id, payload);
      toast.success(`Cập nhật thông tin và phân quyền cho ${trimmedFullName} thành công!`);
      onsave(updated);
      onclose();
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật người dùng: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      isSubmitting = false;
    }
  }
</script>

<Modal
  {open}
  title="Điều Chỉnh Thông Tin & Phân Quyền Người Dùng"
  size="lg"
  {onclose}
>
  {#if loadingMetadata}
    <div class="loading-state">Đang tải thông tin phân quyền...</div>
  {:else}
    <div class="edit-modal-body">
      <!-- Section 1: Thông tin cơ bản -->
      <div class="form-row-2">
        <!-- Tên đăng nhập (Chỉ Admin sửa) -->
        <div class="form-group">
          <div class="label-row">
            <label for="edit-username" class="form-label">Tên đăng nhập (Username)</label>
            {#if authStore.isAdmin}
              <Badge variant={BADGE_VARIANTS.WARNING}>Admin được phép sửa</Badge>
            {:else}
              <Badge variant={BADGE_VARIANTS.NEUTRAL}>Chỉ Admin được sửa</Badge>
            {/if}
          </div>
          <input
            id="edit-username"
            type="text"
            class="form-input"
            class:is-invalid={Boolean(formErrors.username)}
            disabled={!authStore.isAdmin}
            bind:value={username}
          />
          {#if formErrors.username}
            <span class="error-msg">{formErrors.username}</span>
          {/if}
        </div>

        <!-- Họ và tên -->
        <div class="form-group">
          <label for="edit-fullname" class="form-label required">Họ và tên nhân sự</label>
          <input
            id="edit-fullname"
            type="text"
            class="form-input"
            class:is-invalid={Boolean(formErrors.fullName)}
            bind:value={fullName}
            placeholder="Ví dụ: Nguyễn Đình Đức"
          />
          {#if formErrors.fullName}
            <span class="error-msg">{formErrors.fullName}</span>
          {/if}
        </div>
      </div>

      <!-- Email & SĐT -->
      <div class="form-row-2">
        <div class="form-group">
          <label for="edit-email" class="form-label">Email công việc</label>
          <input
            id="edit-email"
            type="email"
            class="form-input"
            bind:value={email}
            placeholder="duc.nguyen@premiernuts.vn"
          />
        </div>
        <div class="form-group">
          <label for="edit-phone" class="form-label">Số điện thoại</label>
          <input
            id="edit-phone"
            type="text"
            class="form-input"
            bind:value={phone}
            placeholder="0912345678"
          />
        </div>
      </div>

      <!-- Phòng ban -->
      <div class="form-group">
        <label for="edit-dept" class="form-label">Phòng ban trực thuộc</label>
        <select id="edit-dept" class="form-select" bind:value={selectedDepartmentId}>
          {#each departments as d (d.id)}
            <option value={d.id}>{d.name} ({d.code})</option>
          {/each}
        </select>
      </div>

      <!-- Section 2: Vai trò & Phân quyền -->
      <div class="role-section">
        <label for="edit-role-select" class="form-label required">Vai trò mẫu</label>
        <div class="role-grid">
          {#each roles as r (r.id)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="role-card"
              class:selected={selectedRoleId === r.id}
              onclick={() => handleSelectRole(r.id)}
            >
              <div class="role-card-top">
                <span class="role-card-name">{r.name}</span>
                {#if selectedRoleId === r.id}
                  <span class="role-check">✓</span>
                {/if}
              </div>
              <div class="role-card-count">{r.permissionIds?.length || 0} quyền mặc định</div>
            </div>
          {/each}
        </div>
        {#if formErrors.roleId}
          <span class="error-msg">{formErrors.roleId}</span>
        {/if}
      </div>

      <!-- Tùy chỉnh quyền hạn chi tiết -->
      <div class="perm-custom-toggle-bar">
        <div>
          <span class="perm-summary-title">Quyền hạn kích hoạt riêng cho tài khoản:</span>
          <span class="perm-summary-count">
            <strong>{selectedPermissionIds.length}</strong> / {allPermissions.length} quyền
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onclick={() => (showCustomPermissions = !showCustomPermissions)}
        >
          {#if showCustomPermissions}
            Thu gọn danh sách quyền
          {:else}
            Tùy chỉnh quyền chi tiết ({selectedPermissionIds.length} quyền)
          {/if}
        </Button>
      </div>

      {#if showCustomPermissions}
        <div class="perm-matrix-wrap">
          {#each Object.entries(groupedPermissions) as [modKey, perms] (modKey)}
            {@const mod = MODULE_TITLES[modKey] || { title: modKey, color: '#D96B27' }}
            <div class="mod-group">
              <div class="mod-head">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="mod-dot" style="background-color: {mod.color};"></span>
                  <span class="mod-title">{mod.title}</span>
                </div>
                <button
                  type="button"
                  class="mod-all-btn"
                  onclick={() => selectAllInModule(perms)}
                >
                  Chọn tất cả
                </button>
              </div>

              <div class="mod-perms-grid">
                {#each perms as p (p.id)}
                  {@const isChecked = selectedPermissionIds.includes(p.id)}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div
                    class="perm-item"
                    class:checked={isChecked}
                    onclick={() => togglePermission(p.id)}
                  >
                    <input
                      type="checkbox"
                      class="perm-checkbox"
                      checked={isChecked}
                      tabindex="-1"
                    />
                    <div>
                      <div class="p-title">{p.name}</div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  {#snippet footer()}
    <div class="modal-footer-btns">
      <Button variant="ghost" onclick={onclose} disabled={isSubmitting}>
        Hủy bỏ
      </Button>
      <Button variant="primary" onclick={handleSave} disabled={isSubmitting}>
        {#if isSubmitting}Đang lưu...{:else}Lưu thay đổi{/if}
      </Button>
    </div>
  {/snippet}
</Modal>

<style>
  .edit-modal-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 75vh;
    overflow-y: auto;
    padding-right: 4px;
  }

  .loading-state {
    padding: 32px;
    text-align: center;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  @media (max-width: 640px) {
    .form-row-2 {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
  }

  .form-label.required::after {
    content: ' *';
    color: #DC2626;
  }

  .form-input,
  .form-select {
    padding: 9px 12px;
    border: 1.5px solid var(--pn-border, #E8DFD8);
    border-radius: 8px;
    font-size: 13.5px;
    background: #FFF;
    color: var(--pn-ink, #2B2116);
    outline: none;
    transition: all 0.2s ease;
  }

  .form-input:disabled {
    background: #F4EFEA;
    color: var(--pn-ink-soft, #6B5D4F);
    cursor: not-allowed;
  }

  .form-input:focus,
  .form-select:focus {
    border-color: var(--pn-brand, #D96B27);
  }

  .form-input.is-invalid {
    border-color: #DC2626;
    background-color: #FFF5F5;
  }

  .error-msg {
    font-size: 12px;
    color: #DC2626;
    font-weight: 500;
  }

  .role-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }

  .role-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
  }

  .role-card {
    border: 1.5px solid var(--pn-border, #E8DFD8);
    border-radius: 8px;
    padding: 10px 12px;
    background: #FFF;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .role-card:hover {
    border-color: var(--pn-brand, #D96B27);
  }

  .role-card.selected {
    border-color: var(--pn-brand, #D96B27);
    background: #FFF8F3;
    box-shadow: 0 0 0 1px var(--pn-brand, #D96B27);
  }

  .role-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .role-check {
    color: var(--pn-brand, #D96B27);
    font-weight: 800;
    font-size: 14px;
  }

  .role-card-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
    margin-bottom: 2px;
  }

  .role-card-count {
    font-size: 11.5px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .perm-custom-toggle-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #FAF6F0;
    border: 1px solid var(--pn-border, #E8DFD8);
    border-radius: 8px;
    padding: 10px 14px;
    margin-top: 6px;
  }

  .perm-summary-title {
    font-size: 13px;
    color: var(--pn-ink, #2B2116);
    margin-right: 6px;
  }

  .perm-summary-count {
    font-size: 13px;
    color: var(--pn-brand, #D96B27);
  }

  .perm-matrix-wrap {
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: #FCFAF7;
    border: 1px solid var(--pn-border, #E8DFD8);
    border-radius: 8px;
    padding: 14px;
  }

  .mod-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .mod-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .mod-title {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .mod-all-btn {
    background: none;
    border: none;
    color: var(--pn-brand, #D96B27);
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
  }

  .mod-perms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 8px;
  }

  .perm-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 10px;
    background: #FFF;
    border: 1px solid var(--pn-border, #E8DFD8);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .perm-item:hover {
    border-color: var(--pn-brand, #D96B27);
  }

  .perm-item.checked {
    border-color: var(--pn-brand, #D96B27);
    background: #FFF8F3;
  }

  .perm-checkbox {
    margin-top: 3px;
    accent-color: var(--pn-brand, #D96B27);
    cursor: pointer;
  }

  .p-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
  }

  .modal-footer-btns {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    width: 100%;
  }
</style>
