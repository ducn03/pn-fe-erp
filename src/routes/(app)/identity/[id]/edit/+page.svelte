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

  let userInitials = $derived.by(() => {
    const trimmed = fullName.trim();
    if (!trimmed) {
      return 'PN';
    }
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    const first = words[0][0];
    const last = words[words.length - 1][0];
    return (first + last).toUpperCase();
  });

  let selectedRole = $derived.by(() => {
    return roles.find((r) => r.id === selectedRoleId);
  });

  let selectedDepartment = $derived.by(() => {
    return departments.find((d) => d.id === selectedDepartmentId);
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
      toast.error('Không thể nạp thông tin người dùng: ' + (err.message || 'Lỗi mạng'));
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
    <div style="padding: 40px; text-align: center; color: var(--pn-ink-soft);">
      Đang nạp dữ liệu hồ sơ nhân sự và ma trận phân quyền...
    </div>
  </Card>
{:else}
  <div class="user-page-container">
    <!-- HÀNG 1: Thông tin nhân sự & Đăng nhập CÙNG HÀNG với Hồ sơ & Trạng thái -->
    <div class="top-row-grid">
      <!-- Cột trái: Form nhập thông tin nhân sự & đăng nhập -->
      <Card accent={CARD_ACCENTS.ORANGE}>
        <div class="card-header-styled">
          <h3 class="card-section-title">1. Thông Tin Nhân Sự & Đăng Nhập</h3>
          <p class="card-section-desc">Họ tên, mã định danh tài khoản và thông tin phòng ban trực thuộc</p>
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
              <span class="field-hint-text">Quy tắc: Nhập tối thiểu 2 từ (Ví dụ: Nguyễn Văn A).</span>
            {/if}
          </div>

          <!-- Tên đăng nhập (Readonly Display Box) -->
          <div class="form-group">
            <div class="label-with-badge">
              <span class="form-label">Tên Đăng Nhập Hệ Thống</span>
              <Badge variant={BADGE_VARIANTS.PRIMARY}>Cố định</Badge>
            </div>
            <div class="auto-username-box">
              <div class="username-display">
                <span class="username-at">@</span>
                <span class="username-code">{username}</span>
                <span class="username-status">Đang hoạt động</span>
              </div>
            </div>
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

      <!-- Cột phải: Thẻ tóm tắt hồ sơ & Cấp bậc phân quyền -->
      <Card accent={CARD_ACCENTS.ORANGE}>
        <div class="card-header-styled">
          <h3 class="card-section-title">Hồ Sơ & Trạng Thái Tài Khoản</h3>
          <p class="card-section-desc">Tổng quan thông số định danh và mức độ phân quyền tài khoản</p>
        </div>

        <div class="account-overview-box">
          <div class="profile-header-flex">
            <div class="profile-avatar-circle">{userInitials}</div>
            <div class="profile-meta-info">
              <div class="profile-name-text">{fullName || 'Chưa cập nhật tên'}</div>
              <div class="profile-username-sub">@{username || 'chua-co-username'}</div>
              <div class="profile-status-pill">
                <span class="status-indicator-dot"></span>
                <span class="status-indicator-text">Tài khoản hoạt động</span>
              </div>
            </div>
          </div>

          <div class="overview-stats-grid">
            <div class="stat-mini-card">
              <span class="stat-label">Phòng Ban</span>
              <span class="stat-value">{selectedDepartment?.name || 'Chưa phân bổ'}</span>
            </div>
            <div class="stat-mini-card">
              <span class="stat-label">Chức Danh Vai Trò</span>
              <span class="stat-value">{selectedRole?.name || 'Chưa chọn'}</span>
            </div>
            <div class="stat-mini-card">
              <span class="stat-label">Quyền Hạn Kích Hoạt</span>
              <span class="stat-value highlight-green">{selectedPermissionIds.length} quyền hạn</span>
            </div>
            <div class="stat-mini-card">
              <span class="stat-label">Cấp Bậc Quản Trị</span>
              <span class="stat-value">Cấp {selectedRole?.level || 99}</span>
            </div>
          </div>
        </div>

        <div class="security-notes-section">
          <div class="security-note-item">
            <span class="note-bullet-dot"></span>
            <span class="note-text"><strong>Nguyên tắc phân quyền:</strong> Phân bổ quyền hạn theo đúng phạm vi trách nhiệm nghiệp vụ.</span>
          </div>
          <div class="security-note-item">
            <span class="note-bullet-dot"></span>
            <span class="note-text"><strong>Hiệu lực cập nhật:</strong> Các thay đổi về quyền hạn sẽ được đồng bộ ngay khi lưu thành công.</span>
          </div>
          <div class="security-note-item">
            <span class="note-bullet-dot"></span>
            <span class="note-text"><strong>Nhật ký bảo mật:</strong> Mọi thao tác cập nhật đều được ghi nhận vào Audit Log hệ thống.</span>
          </div>
        </div>
      </Card>
    </div>

    <!-- HÀNG 2: Vai trò & Phân quyền XUỐNG DƯỚI (Full Width Card) -->
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
                    <span class="role-selected-check" title="Đã chọn vai trò này">
                      <svg viewBox="0 0 20 20" fill="currentColor" class="check-icon-svg">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </span>
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

    <!-- HÀNG 3: Thanh Hành Động Cuối Trang -->
    <div class="page-actions-bar">
      <Button variant="secondary" onclick={() => goto('/identity')} disabled={isSubmitting}>
        Hủy bỏ & Quay lại
      </Button>
      <Button variant="primary" onclick={handleSubmit} disabled={isSubmitting}>
        {#if isSubmitting}
          Đang lưu thay đổi...
        {:else}
          Lưu thay đổi tài khoản
        {/if}
      </Button>
    </div>
  </div>
{/if}

<style>
  .user-page-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-bottom: 40px;
  }

  .top-row-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: stretch;
  }

  @media (max-width: 960px) {
    .top-row-grid {
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

  /* Auto / Readonly Username Box */
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

  /* Account Overview & Summary */
  .account-overview-box {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .profile-header-flex {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 14px;
    border-bottom: 1px dashed var(--pn-line, #EEE3D3);
  }

  .profile-avatar-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #FFF4E6;
    border: 2px solid var(--pn-orange, #F0821E);
    color: #D97706;
    font-size: 18px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .profile-meta-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .profile-name-text {
    font-size: 15px;
    font-weight: 800;
    color: var(--pn-ink, #2B2116);
  }

  .profile-username-sub {
    font-size: 12.5px;
    font-family: monospace;
    font-weight: 700;
    color: #1E3A8A;
  }

  .profile-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    font-size: 11.5px;
    font-weight: 600;
    color: #059669;
  }

  .status-indicator-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #10B981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }

  .overview-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat-mini-card {
    background: #FAF7F2;
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 6px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-label {
    font-size: 11px;
    color: var(--pn-ink-soft, #6B5D4F);
    font-weight: 600;
  }

  .stat-value {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .stat-value.highlight-green {
    color: #059669;
  }

  .security-notes-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px dashed var(--pn-line, #EEE3D3);
  }

  .security-note-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 11.5px;
    color: var(--pn-ink-soft, #6B5D4F);
    line-height: 1.4;
  }

  .note-bullet-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: var(--pn-orange, #F0821E);
    margin-top: 6px;
    flex-shrink: 0;
  }

  /* Role Cards Grid */
  .role-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 12px;
    margin-top: 4px;
  }

  .role-card-item {
    border: 1.5px solid var(--pn-line, #EEE3D3);
    border-radius: 8px;
    padding: 12px 14px;
    background: #FFF;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 6px;
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

  .role-item-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .role-selected-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background-color: #ECFDF5;
    border: 1.5px solid #10B981;
    border-radius: 50%;
    color: #059669;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(16, 185, 129, 0.2);
  }

  .check-icon-svg {
    width: 14px;
    height: 14px;
  }

  .role-item-desc {
    font-size: 12px;
    color: var(--pn-ink-soft, #6B5D4F);
    line-height: 1.35;
  }

  .role-item-perm-count {
    font-size: 11.5px;
    font-weight: 700;
    color: #059669;
    margin-top: 4px;
  }

  /* Custom Permissions Toggle Banner */
  .custom-perm-toggle-banner {
    background: #FAF7F2;
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 8px;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 6px;
  }

  .toggle-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .toggle-subtitle {
    font-size: 12.5px;
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
    padding: 16px;
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px dashed var(--pn-line, #EEE3D3);
  }

  .module-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }

  .module-name {
    font-size: 13.5px;
    font-weight: 800;
    color: var(--pn-ink, #2B2116);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .module-select-all-btn {
    background: none;
    border: none;
    font-size: 12px;
    color: var(--pn-orange, #F0821E);
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
  }

  .perms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 10px;
  }

  .perm-checkbox-item {
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 6px;
    padding: 10px 12px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
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
    font-size: 13px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .perm-desc {
    font-size: 11.5px;
    color: var(--pn-ink-soft, #6B5D4F);
    margin-top: 2px;
    line-height: 1.35;
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
