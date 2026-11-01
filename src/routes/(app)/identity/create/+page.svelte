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
    createUser,
    generateUsername
  } from '$features/identity';
  import {
    getDepartments,
    getRoles,
    getPermissions,
    type Department,
    type Role,
    type Permission
  } from '$features/company';

  let departments = $state<Department[]>([]);
  let roles = $state<Role[]>([]);
  let allPermissions = $state<Permission[]>([]);
  let loadingData = $state(true);

  // Form Fields
  let fullName = $state('');
  let autoUsername = $state('');
  let email = $state('');
  let phone = $state('');
  let password = $state('password123');
  let selectedDepartmentId = $state<number | undefined>(undefined);
  let selectedRoleId = $state<number | undefined>(undefined);
  let selectedPermissionIds = $state<number[]>([]);
  let showCustomPermissions = $state(false);

  // Validation & Submit State
  let formErrors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);
  let isGeneratingUsername = $state(false);
  let usernameDebounceTimer: any = null;

  // Nhóm quyền theo Module
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

  let availableRoles = $derived(
    roles.filter((r) => authStore.isAdmin || (r.code !== 'ROLE_ADMIN' && r.code !== 'SUPER_ADMIN'))
  );

  let availablePermissions = $derived(
    allPermissions.filter((p) => authStore.isAdmin || p.module !== 'SYSTEM')
  );

  let groupedPermissions = $derived.by(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of availablePermissions) {
      const mod = p.module || 'KHAC';
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
      const [deptList, roleList, permList] = await Promise.all([
        getDepartments(),
        getRoles(),
        getPermissions()
      ]);
      departments = deptList;
      roles = roleList;
      allPermissions = permList;

      if (roleList.length > 0) {
        const allowed = roleList.filter((r) => authStore.isAdmin || (r.code !== 'ROLE_ADMIN' && r.code !== 'SUPER_ADMIN'));
        const defaultRole = allowed.find((r) => r.code === 'ROLE_KHO') || allowed[0] || roleList[0];
        handleSelectRole(defaultRole.id);
      }
      if (departments.length > 0) {
        selectedDepartmentId = departments[0].id;
      }
    } catch (err: any) {
      toast.error('Không thể nạp dữ liệu cấu hình: ' + (err.message || 'Lỗi mạng'));
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

    clearTimeout(usernameDebounceTimer);
    const words = fullName.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      isGeneratingUsername = true;
      usernameDebounceTimer = setTimeout(async () => {
        try {
          const generated = await generateUsername(fullName.trim());
          if (generated) {
            autoUsername = generated;
            if (!email || email.endsWith('@premiernuts.vn')) {
              email = `${generated}@premiernuts.vn`;
            }
          }
        } catch (err) {
          console.warn('Lỗi tự động sinh username:', err);
        } finally {
          isGeneratingUsername = false;
        }
      }, 300);
    } else {
      autoUsername = '';
    }
  }

  function handleSelectRole(roleId: number) {
    selectedRoleId = roleId;
    const r = roles.find((item) => item.id === roleId);
    if (r && Array.isArray(r.permissionIds)) {
      selectedPermissionIds = [...r.permissionIds];
    } else {
      selectedPermissionIds = [];
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

    if (!password || password.length < 6) {
      formErrors.password = 'Mật khẩu phải có từ 6 ký tự trở lên';
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
      await createUser({
        fullName: trimmedFullName,
        username: autoUsername || undefined,
        password: password,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        departmentId: selectedDepartmentId,
        roleId: selectedRoleId,
        permissionIds: selectedPermissionIds
      });

      toast.success(`Tạo tài khoản nhân viên "${trimmedFullName}" thành công!`);
      goto('/identity');
    } catch (err: any) {
      toast.error('Lỗi khi tạo tài khoản: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Thêm Tài Khoản Nhân Sự | Premier Nuts ERP</title>
</svelte:head>

<PageHeader
  title="Thêm Tài Khoản Nhân Sự Mới"
  subtitle="Khởi tạo tài khoản nhân viên, tự động phát sinh username và cấu hình phân quyền truy cập chi tiết"
  breadcrumbs={[
    { label: 'Premier Nuts', href: '/' },
    { label: 'Hệ thống' },
    { label: 'Người dùng', href: '/identity' },
    { label: 'Thêm mới' }
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
    <div style="padding: 40px; text-align: center; color: var(--pn-ink-soft);">
      Đang nạp danh mục phòng ban và ma trận phân quyền...
    </div>
  </Card>
{:else}
  <div class="create-user-container">
    <div class="form-grid">
      <!-- Cột 1: Thông tin cơ bản & Đăng nhập -->
      <Card accent={CARD_ACCENTS.ORANGE}>
        <div class="card-header-styled">
          <h3 class="card-section-title">1. Thông Tin Nhân Sự & Đăng Nhập</h3>
          <p class="card-section-desc">Thông tin cá nhân và tài khoản truy cập Premier Nuts ERP</p>
        </div>

        <div class="form-fields">
          <!-- Họ và tên -->
          <div class="form-group">
            <label for="fullNameInput" class="form-label required">Họ và Tên Nhân Sự</label>
            <input
              id="fullNameInput"
              type="text"
              class="form-input"
              class:is-invalid={Boolean(formErrors.fullName)}
              value={fullName}
              oninput={handleFullNameInput}
              placeholder="Ví dụ: Nguyễn Đình Đức, John Smith..."
            />
            {#if formErrors.fullName}
              <span class="field-error-text">{formErrors.fullName}</span>
            {:else}
              <span class="field-hint-text">Quy tắc: Nhập tối thiểu 2 từ để hệ thống tự động sinh tên đăng nhập.</span>
            {/if}
          </div>

          <!-- Tên đăng nhập (Tự phát sinh - Preview Badge) -->
          <div class="form-group">
            <div class="label-with-badge">
              <span class="form-label">Tên Đăng Nhập Hệ Thống</span>
              <Badge variant={BADGE_VARIANTS.PRIMARY}>Tự động tạo</Badge>
            </div>
            <div class="auto-username-box">
              {#if isGeneratingUsername}
                <span class="generating-text">Đang phân tích họ tên và sinh mã định danh...</span>
              {:else if autoUsername}
                <div class="username-display">
                  <span class="username-at">@</span>
                  <span class="username-code">{autoUsername}</span>
                  <span class="username-status">Khả dụng</span>
                </div>
              {:else}
                <span class="placeholder-text">Sẽ tự động tạo khi bạn nhập họ tên hợp lệ ở trên</span>
              {/if}
            </div>
          </div>

          <!-- Mật khẩu ban đầu -->
          <div class="form-group">
            <label for="passwordInput" class="form-label required">Mật Khẩu Đăng Nhập Ban Đầu</label>
            <input
              id="passwordInput"
              type="text"
              class="form-input"
              class:is-invalid={Boolean(formErrors.password)}
              bind:value={password}
              placeholder="Tối thiểu 6 ký tự"
            />
            {#if formErrors.password}
              <span class="field-error-text">{formErrors.password}</span>
            {/if}
          </div>

          <!-- Email & Số điện thoại -->
          <div class="form-row-2">
            <div class="form-group">
              <label for="emailInput" class="form-label">Email Doanh Nghiệp</label>
              <input
                id="emailInput"
                type="email"
                class="form-input"
                bind:value={email}
                placeholder="duc.nguyen@premiernuts.vn"
              />
            </div>
            <div class="form-group">
              <label for="phoneInput" class="form-label">Số Điện Thoại</label>
              <input
                id="phoneInput"
                type="text"
                class="form-input"
                bind:value={phone}
                placeholder="Ví dụ: 0912345678"
              />
            </div>
          </div>

          <!-- Phòng ban -->
          <div class="form-group">
            <label for="deptSelect" class="form-label">Phòng Ban / Phân Xưởng Trực Thuộc</label>
            <select id="deptSelect" class="form-select" bind:value={selectedDepartmentId}>
              {#each departments as dept (dept.id)}
                <option value={dept.id}>{dept.name}</option>
              {/each}
            </select>
          </div>
        </div>
      </Card>

      <!-- Cột 2: Vai trò & Phân quyền -->
      <Card accent={CARD_ACCENTS.ORANGE}>
        <div class="card-header-styled">
          <h3 class="card-section-title">2. Thiết Lập Vai Trò & Phân Quyền</h3>
          <p class="card-section-desc">Chọn chức danh mẫu và tùy biến các quyền hạn thực thi trực tiếp</p>
        </div>

        <div class="form-fields">
          <!-- Chọn Vai Trò Mẫu -->
          <div class="form-group">
            <label for="roleTemplateSelect" class="form-label required">Chức Danh / Vai Trò Mẫu</label>
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
                      <span class="check-icon">✓</span>
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
                {@const modInfo = MODULE_TITLES[moduleKey] || { title: moduleKey, color: '#F0821E' }}
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

    <!-- Thanh Hành Động Cuối Trang -->
    <div class="page-actions-bar">
      <Button variant="secondary" onclick={() => goto('/identity')} disabled={isSubmitting}>
        Hủy bỏ & Quay lại
      </Button>
      <Button variant="primary" onclick={handleSubmit} disabled={isSubmitting}>
        {#if isSubmitting}
          Đang khởi tạo tài khoản...
        {:else}
          Tạo tài khoản nhân sự
        {/if}
      </Button>
    </div>
  </div>
{/if}

<style>
  .create-user-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-bottom: 40px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
    padding-bottom: 14px;
    border-bottom: 1px solid var(--pn-line, #EEE3D3);
  }

  .card-section-title {
    margin: 0 0 4px 0;
    font-size: 17px;
    font-weight: 800;
    color: var(--pn-ink, #2B2116);
  }

  .card-section-desc {
    margin: 0;
    font-size: 13px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
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

  .form-label {
    font-size: 13px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .form-label.required::after {
    content: ' *';
    color: #DC2626;
  }

  .label-with-badge {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-input, .form-select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 8px;
    background: #FFF;
    font-size: 14px;
    color: var(--pn-ink, #2B2116);
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .form-input:focus, .form-select:focus {
    outline: none;
    border-color: var(--pn-orange, #F0821E);
    box-shadow: 0 0 0 3px rgba(240, 130, 30, 0.15);
  }

  .form-input.is-invalid {
    border-color: #DC2626 !important;
    background-color: #FEF2F2 !important;
  }

  .field-error-text {
    font-size: 12px;
    color: #DC2626;
    font-weight: 600;
  }

  .field-hint-text {
    font-size: 12px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  /* Auto Username Preview Box */
  .auto-username-box {
    background: #FAF7F2;
    border: 1.5px dashed var(--pn-orange, #F0821E);
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    min-height: 46px;
  }

  .username-display {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .username-at {
    font-size: 18px;
    font-weight: 800;
    color: var(--pn-orange, #F0821E);
  }

  .username-code {
    font-size: 16px;
    font-weight: 800;
    font-family: monospace;
    color: #1E3A8A;
    background: #DBEAFE;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .username-status {
    font-size: 12px;
    color: #059669;
    font-weight: 600;
  }

  .generating-text {
    font-size: 13px;
    color: var(--pn-orange, #F0821E);
    font-style: italic;
  }

  .placeholder-text {
    font-size: 13px;
    color: var(--pn-ink-soft, #8C7D6F);
    font-style: italic;
  }

  /* Role Cards Grid */
  .role-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
    margin-top: 4px;
  }

  .role-card-item {
    border: 1.5px solid var(--pn-line, #EEE3D3);
    border-radius: 8px;
    padding: 10px 12px;
    background: #FFF;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .role-card-item:hover {
    border-color: var(--pn-orange, #F0821E);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  .role-card-item.is-selected {
    border-color: var(--pn-orange, #F0821E);
    background: #FFF8F0;
    box-shadow: 0 0 0 2px var(--pn-orange, #F0821E);
  }

  .role-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .check-icon {
    font-size: 12px;
    font-weight: 800;
    color: #FFF;
    background: var(--pn-orange, #F0821E);
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .role-item-name {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .role-item-desc {
    font-size: 11.5px;
    color: var(--pn-ink-soft, #6B5D4F);
    line-height: 1.3;
  }

  .role-item-perm-count {
    font-size: 11px;
    font-weight: 700;
    color: #059669;
    margin-top: 4px;
  }

  /* Custom Permissions Toggle Banner */
  .custom-perm-toggle-banner {
    background: #FAF7F2;
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 6px;
  }

  .toggle-title {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .toggle-subtitle {
    font-size: 12px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  /* Permissions Matrix */
  .permissions-matrix-wrap {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 8px;
  }

  .permission-module-block {
    background: #FFF;
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 8px;
    padding: 14px;
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px dashed var(--pn-line, #EEE3D3);
  }

  .module-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .module-name {
    font-size: 13px;
    font-weight: 800;
    color: var(--pn-ink, #2B2116);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .module-select-all-btn {
    background: none;
    border: none;
    font-size: 11.5px;
    color: var(--pn-orange, #F0821E);
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
  }

  .perms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 8px;
  }

  .perm-checkbox-item {
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 6px;
    padding: 8px 10px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    background: #FAFAFA;
  }

  .perm-checkbox-item:hover {
    background: #FFF;
    border-color: var(--pn-orange, #F0821E);
  }

  .perm-checkbox-item.is-checked {
    background: #FFF9F2;
    border-color: var(--pn-orange, #F0821E);
  }

  .perm-native-checkbox {
    margin-top: 3px;
    accent-color: var(--pn-orange, #F0821E);
  }

  .perm-title {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .perm-desc {
    font-size: 11px;
    color: var(--pn-ink-soft, #6B5D4F);
    margin-top: 2px;
  }

  /* Actions Bar */
  .page-actions-bar {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--pn-line, #EEE3D3);
  }
</style>
