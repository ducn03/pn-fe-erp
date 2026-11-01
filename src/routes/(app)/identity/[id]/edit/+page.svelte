<script lang="ts">
  import {
    PageHeader,
    Card,
    Badge,
    Button,
    toast,
    CARD_ACCENTS,
    BADGE_VARIANTS
  } from '$ui';
  import { goto } from '$app/navigation';
  import { authStore } from '$core/stores';
  import {
    getUserById,
    updateUser,
    getModuleMeta,
    type User
  } from '$features/identity';
  import {
    getDepartments,
    getRoles,
    getPermissions,
    type Department,
    type Role,
    type Permission
  } from '$features/company';

  interface PageData {
    userId: string;
  }

  let { data }: { data: PageData } = $props();

  let targetUser = $state<User | null>(null);
  let departments = $state<Department[]>([]);
  let roles = $state<Role[]>([]);
  let allPermissions = $state<Permission[]>([]);
  let loadingData = $state(true);

  // Form Fields
  let fullName = $state('');
  let username = $state('');
  let email = $state('');
  let phone = $state('');
  let selectedDepartmentId = $state<number | undefined>(undefined);
  let selectedRoleId = $state<number | undefined>(undefined);
  let selectedPermissionIds = $state<number[]>([]);
  let showCustomPermissions = $state(false);

  // Validation & Submit State
  let formErrors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);

  let availableRoles = $derived.by(() => {
    return roles.filter((r) => {
      if (authStore.isAdmin) {
        return true;
      }
      return r.code !== 'ROLE_ADMIN' && r.code !== 'SUPER_ADMIN';
    });
  });

  let availablePermissions = $derived.by(() => {
    return allPermissions.filter((p) => {
      if (authStore.isAdmin) {
        return true;
      }
      return p.module !== 'SYSTEM';
    });
  });

  let groupedPermissions = $derived.by(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of availablePermissions) {
      let mod = 'KHAC';
      if (p.module) {
        mod = p.module;
      }
      if (!groups[mod]) {
        groups[mod] = [];
      }
      groups[mod].push(p);
    }
    return groups;
  });

  async function loadInitialData() {
    loadingData = true;
    try {
      const [deptList, roleList, permList, userDetail] = await Promise.all([
        getDepartments(),
        getRoles(),
        getPermissions(),
        getUserById(data.userId)
      ]);
      departments = deptList;
      roles = roleList;
      allPermissions = permList;
      targetUser = userDetail;

      fullName = userDetail.fullName || '';
      username = userDetail.username || '';
      email = userDetail.email || '';
      phone = userDetail.phone || '';
      selectedDepartmentId = userDetail.departmentId;
      selectedRoleId = userDetail.roleId;

      if (Array.isArray(userDetail.permissionIds) && userDetail.permissionIds.length > 0) {
        selectedPermissionIds = [...userDetail.permissionIds];
      } else if (userDetail.roleId) {
        const matchingRole = roleList.find((r) => r.id === userDetail.roleId);
        if (matchingRole && Array.isArray(matchingRole.permissionIds)) {
          selectedPermissionIds = [...matchingRole.permissionIds];
        } else {
          selectedPermissionIds = [];
        }
      } else {
        selectedPermissionIds = [];
      }
    } catch (err: any) {
      let msg = 'Lỗi kết nối';
      if (err.message) {
        msg = err.message;
      }
      toast.error('Không thể nạp thông tin người dùng: ' + msg);
    } finally {
      loadingData = false;
    }
  }

  $effect(() => {
    loadInitialData();
  });

  function handleFullNameInput(e: Event) {
    const input = e.target as HTMLInputElement;
    fullName = input.value;
    delete formErrors.fullName;
  }

  function handleSelectRole(roleId: number) {
    selectedRoleId = roleId;
    delete formErrors.roleId;

    // Tự động điền danh sách quyền mặc định theo vai trò được chọn
    const r = roles.find((item) => item.id === roleId);
    if (r && Array.isArray(r.permissionIds)) {
      selectedPermissionIds = [...r.permissionIds];
    }
  }

  function togglePermission(permId: number) {
    if (selectedPermissionIds.includes(permId)) {
      selectedPermissionIds = selectedPermissionIds.filter((id) => id !== permId);
    } else {
      selectedPermissionIds = [...selectedPermissionIds, permId];
    }
  }

  function selectAllInModule(perms: Permission[]) {
    const pIds = perms.map((p) => p.id);
    const allSelected = pIds.every((id) => selectedPermissionIds.includes(id));
    if (allSelected) {
      selectedPermissionIds = selectedPermissionIds.filter((id) => !pIds.includes(id));
    } else {
      const merged = new Set([...selectedPermissionIds, ...pIds]);
      selectedPermissionIds = Array.from(merged);
    }
  }

  async function handleSubmit() {
    formErrors = {};

    const trimmedFullName = fullName.trim();
    if (!trimmedFullName) {
      formErrors.fullName = 'Họ và tên không được để trống';
    } else {
      const words = trimmedFullName.split(/\s+/).filter(Boolean);
      if (words.length < 2) {
        formErrors.fullName = 'Họ và tên phải có ít nhất 2 từ (Ví dụ: Nguyễn Văn A)';
      }
    }

    if (!selectedRoleId) {
      formErrors.roleId = 'Vui lòng chọn vai trò cho nhân sự';
    }

    if (Object.keys(formErrors).length > 0) {
      toast.error('Vui lòng kiểm tra lại các trường thông tin có lỗi màu đỏ.');
      return;
    }

    isSubmitting = true;
    try {
      await updateUser(data.userId, {
        fullName: trimmedFullName,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        departmentId: selectedDepartmentId,
        roleId: selectedRoleId,
        permissionIds: selectedPermissionIds
      });

      toast.success(`Cập nhật thông tin tài khoản "${trimmedFullName}" thành công!`);
      goto('/identity');
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật tài khoản: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Chỉnh Sửa Tài Khoản Nhân Sự | Premier Nuts ERP</title>
</svelte:head>

<PageHeader
  title="Chỉnh Sửa Tài Khoản Nhân Sự"
  subtitle="Cập nhật hồ sơ nhân sự, chức danh vai trò và cấu hình ma trận phân quyền"
  breadcrumbs={[
    { label: 'Premier Nuts', href: '/' },
    { label: 'Hệ thống' },
    { label: 'Người dùng', href: '/identity' },
    { label: 'Chỉnh sửa' }
  ]}
>
  {#snippet actions()}
    <Button variant="secondary" onclick={() => goto('/identity')}>
      Quay lại danh sách
    </Button>
  {/snippet}
</PageHeader>

{#if loadingData}
  <Card accent={CARD_ACCENTS.ORANGE}>
    <div class="loading-state">
      Đang nạp dữ liệu hồ sơ nhân sự và cấu hình phân quyền...
    </div>
  </Card>
{:else}
  <div class="edit-user-container">
    <div class="form-grid">
      <!-- Cột 1: Thông tin nhân sự cơ bản -->
      <Card accent={CARD_ACCENTS.ORANGE}>
        <div class="card-header-styled">
          <h3 class="card-section-title">1. Thông Tin Nhân Sự Cơ Bản</h3>
          <p class="card-section-desc">Họ tên, mã định danh đăng nhập và thông tin liên hệ phòng ban</p>
        </div>

        <div class="form-fields">
          <!-- Tên đăng nhập (Readonly) -->
          <div class="form-group">
            <div class="label-with-badge">
              <span class="form-label">Tên Đăng Nhập Hệ Thống</span>
              <Badge variant={BADGE_VARIANTS.PRIMARY}>Cố định</Badge>
            </div>
            <div class="readonly-username-box">
              <span class="username-at">@</span>
              <span class="username-code">{username}</span>
            </div>
          </div>

          <!-- Họ và tên -->
          <div class="form-group">
            <label for="fullNameEditInput" class="form-label required">Họ và Tên Nhân Sự</label>
            <input
              id="fullNameEditInput"
              type="text"
              class="form-input"
              class:is-invalid={Boolean(formErrors.fullName)}
              value={fullName}
              oninput={handleFullNameInput}
              placeholder="Ví dụ: Nguyễn Đình Đức..."
            />
            {#if formErrors.fullName}
              <span class="field-error-text">{formErrors.fullName}</span>
            {:else}
              <span class="field-hint-text">Quy tắc: Nhập tối thiểu 2 từ (Ví dụ: Nguyễn Văn A).</span>
            {/if}
          </div>

          <!-- Email & Số điện thoại -->
          <div class="form-row-2">
            <div class="form-group">
              <label for="emailEditInput" class="form-label">Email Doanh Nghiệp</label>
              <input
                id="emailEditInput"
                type="email"
                class="form-input"
                bind:value={email}
                placeholder="duc.nguyen@premiernuts.vn"
              />
            </div>
            <div class="form-group">
              <label for="phoneEditInput" class="form-label">Số Điện Thoại</label>
              <input
                id="phoneEditInput"
                type="text"
                class="form-input"
                bind:value={phone}
                placeholder="Ví dụ: 0912345678"
              />
            </div>
          </div>

          <!-- Phòng ban -->
          <div class="form-group">
            <label for="deptEditSelect" class="form-label">Phòng Ban / Phân Xưởng Trực Thuộc</label>
            <select id="deptEditSelect" class="form-select" bind:value={selectedDepartmentId}>
              {#each departments as dept (dept.id)}
                <option value={dept.id}>{dept.name}</option>
              {/each}
            </select>
          </div>
        </div>
      </Card>

      <!-- Cột 2: Vai trò chức danh & Ma trận quyền hạn -->
      <Card accent={CARD_ACCENTS.ORANGE}>
        <div class="card-header-styled">
          <h3 class="card-section-title">2. Thiết Lập Vai Trò & Phân Quyền</h3>
          <p class="card-section-desc">Chọn chức danh mẫu và tùy biến các quyền hạn thực thi trực tiếp</p>
        </div>

        <div class="form-fields">
          <!-- Chọn Vai Trò Mẫu -->
          <div class="form-group">
            <label for="roleTemplateSelect" class="form-label required">Chức Danh / Vai Trò</label>
            <div class="role-cards-grid">
              {#each availableRoles as r (r.id)}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  class="role-card-item"
                  class:is-selected={selectedRoleId === r.id}
                  onclick={() => handleSelectRole(r.id)}
                >
                  <div class="role-item-header">
                    <span class="role-item-name">{r.name}</span>
                    {#if selectedRoleId === r.id}
                      <Badge variant={BADGE_VARIANTS.PRIMARY}>Đang chọn</Badge>
                    {/if}
                  </div>
                  <div class="role-item-desc">{r.description}</div>
                  <div class="role-item-perm-count">
                    {r.permissionIds?.length || 0} quyền hạn mặc định
                  </div>
                </div>
              {/each}
            </div>
            {#if formErrors.roleId}
              <span class="field-error-text">{formErrors.roleId}</span>
            {/if}
          </div>

          <!-- Banner Tùy Biến Permissions -->
          <div class="custom-perm-toggle-banner">
            <div>
              <div class="toggle-title">Ma Trận Quyền Hạn Chi Tiết Cho Tài Khoản Này</div>
              <div class="toggle-subtitle">
                Đang kích hoạt <strong>{selectedPermissionIds.length}</strong> / {availablePermissions.length} quyền hệ thống.
              </div>
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

          <!-- Danh sách permissions mở rộng -->
          {#if showCustomPermissions}
            <div class="permissions-matrix-wrap">
              {#each Object.entries(groupedPermissions) as [moduleKey, perms] (moduleKey)}
                {@const modInfo = getModuleMeta(moduleKey)}
                <div class="permission-module-block">
                  <div class="module-header">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span class="module-dot" style="background-color: {modInfo.color};"></span>
                      <span class="module-name">{modInfo.title}</span>
                    </div>
                    <button
                      type="button"
                      class="module-select-all-btn"
                      onclick={() => selectAllInModule(perms)}
                    >
                      Chọn tất cả ({perms.length})
                    </button>
                  </div>

                  <div class="perms-grid">
                    {#each perms as p (p.id)}
                      {@const checked = selectedPermissionIds.includes(p.id)}
                      <!-- svelte-ignore a11y_click_events_have_key_events -->
                      <!-- svelte-ignore a11y_no_static_element_interactions -->
                      <div
                        class="perm-checkbox-item"
                        class:is-checked={checked}
                        onclick={() => togglePermission(p.id)}
                      >
                        <input
                          type="checkbox"
                          class="perm-native-checkbox"
                          {checked}
                          tabindex="-1"
                        />
                        <div class="perm-info">
                          <div class="perm-title">{p.name}</div>
                          {#if p.description}
                            <div class="perm-desc">{p.description}</div>
                          {/if}
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </Card>
    </div>

    <!-- Thanh Điều Khiển Submit Phía Dưới -->
    <div class="bottom-actions-card">
      <div class="actions-wrapper">
        <Button
          variant="secondary"
          onclick={() => goto('/identity')}
          disabled={isSubmitting}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          onclick={handleSubmit}
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            Đang lưu thay đổi...
          {:else}
            Lưu thay đổi tài khoản
          {/if}
        </Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .edit-user-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 40px;
  }

  .loading-state {
    padding: 48px;
    text-align: center;
    color: var(--pn-ink-soft, #6b5d4f);
    font-size: 14px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 24px;
    align-items: start;
  }

  @media (max-width: 1024px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }

  .card-header-styled {
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--pn-line, #eee3d3);
  }

  .card-section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--pn-ink, #2b2116);
    margin: 0 0 4px 0;
  }

  .card-section-desc {
    font-size: 13px;
    color: var(--pn-ink-soft, #6b5d4f);
    margin: 0;
  }

  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
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

  .form-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--pn-ink, #2b2116);
  }

  .form-label.required::after {
    content: ' *';
    color: #dc2626;
  }

  .label-with-badge {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .readonly-username-box {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    background-color: #f7f4ed;
    border: 1px solid var(--pn-line, #eee3d3);
    border-radius: 6px;
    font-family: monospace;
    font-size: 14px;
    color: var(--pn-ink, #2b2116);
  }

  .username-at {
    color: var(--pn-orange, #f0821e);
    font-weight: 700;
    margin-right: 2px;
  }

  .username-code {
    font-weight: 600;
  }

  .form-input,
  .form-select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--pn-line, #eee3d3);
    border-radius: 6px;
    font-size: 13px;
    color: var(--pn-ink, #2b2116);
    background-color: var(--pn-paper, #ffffff);
    box-sizing: border-box;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .form-input:focus,
  .form-select:focus {
    outline: none;
    border-color: var(--pn-orange, #f0821e);
    box-shadow: 0 0 0 3px rgba(240, 130, 30, 0.15);
  }

  .form-input.is-invalid {
    border-color: #dc2626 !important;
    background-color: #fffaf9 !important;
  }

  .field-error-text {
    font-size: 12px;
    color: #dc2626;
    margin-top: 2px;
  }

  .field-hint-text {
    font-size: 11px;
    color: var(--pn-ink-soft, #6b5d4f);
    margin-top: 2px;
  }

  /* Role Cards Grid */
  .role-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  .role-card-item {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 12px;
    border: 1px solid var(--pn-line, #eee3d3);
    border-radius: 8px;
    background-color: var(--pn-paper, #ffffff);
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
  }

  .role-card-item:hover {
    border-color: #d1bfa8;
    background-color: #fffdf9;
  }

  .role-card-item.is-selected {
    border-color: var(--pn-orange, #f0821e);
    background-color: #fff9f3;
    box-shadow: 0 4px 12px rgba(240, 130, 30, 0.12);
  }

  .role-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .role-item-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--pn-ink, #2b2116);
  }

  .role-item-desc {
    font-size: 11px;
    color: var(--pn-ink-soft, #6b5d4f);
    line-height: 1.4;
    margin-bottom: 8px;
  }

  .role-item-perm-count {
    font-size: 11px;
    font-weight: 600;
    color: var(--pn-orange, #f0821e);
  }

  /* Custom Permissions Toggle Banner */
  .custom-perm-toggle-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background-color: #fffaf4;
    border: 1px dashed var(--pn-orange, #f0821e);
    border-radius: 8px;
    gap: 12px;
  }

  .toggle-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--pn-ink, #2b2116);
    margin-bottom: 2px;
  }

  .toggle-subtitle {
    font-size: 12px;
    color: var(--pn-ink-soft, #6b5d4f);
  }

  /* Permissions Matrix */
  .permissions-matrix-wrap {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 8px;
  }

  .permission-module-block {
    border: 1px solid var(--pn-line, #eee3d3);
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--pn-paper, #ffffff);
  }

  .module-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background-color: #faf7f2;
    border-bottom: 1px solid var(--pn-line, #eee3d3);
  }

  .module-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .module-name {
    font-size: 12px;
    font-weight: 700;
    color: var(--pn-ink, #2b2116);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .module-select-all-btn {
    background: none;
    border: none;
    color: var(--pn-orange, #f0821e);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .module-select-all-btn:hover {
    background-color: rgba(240, 130, 30, 0.1);
  }

  .perms-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1px;
    background-color: var(--pn-line, #eee3d3);
  }

  .perm-checkbox-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 14px;
    background-color: var(--pn-paper, #ffffff);
    cursor: pointer;
    transition: background-color 0.15s ease;
    user-select: none;
  }

  .perm-checkbox-item:hover {
    background-color: #fffdfa;
  }

  .perm-checkbox-item.is-checked {
    background-color: #fff9f3;
  }

  .perm-native-checkbox {
    margin-top: 2px;
    cursor: pointer;
    accent-color: var(--pn-orange, #f0821e);
  }

  .perm-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .perm-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--pn-ink, #2b2116);
  }

  .perm-desc {
    font-size: 11px;
    color: var(--pn-ink-soft, #6b5d4f);
    line-height: 1.3;
  }

  /* Bottom Actions Card */
  .bottom-actions-card {
    position: sticky;
    bottom: 16px;
    background-color: var(--pn-paper, #ffffff);
    border: 1px solid var(--pn-line, #eee3d3);
    border-radius: 8px;
    padding: 16px 24px;
    box-shadow: 0 4px 16px rgba(43, 33, 22, 0.08);
  }

  .actions-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
