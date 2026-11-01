<script lang="ts">
  import {
    PageHeader,
    Card,
    Badge,
    Button,
    Forbidden403,
    toast,
    BADGE_VARIANTS,
    type BadgeVariant
  } from '$ui';
  import { goto } from '$app/navigation';
  import { authStore } from '$core/stores';
  import { DateHelper } from '$core/utils';
  import {
    getUserById,
    getModuleMeta,
    type User,
    UserStatus
  } from '$features/identity';
  import {
    getPermissions,
    type Permission
  } from '$features/company';

  interface PageData {
    userId: string;
  }

  let { data }: { data: PageData } = $props();

  let targetUser = $state<User | null>(null);
  let allPermissions = $state<Permission[]>([]);
  let loading = $state(true);
  let searchPermText = $state('');
  let showOnlyGranted = $state(true);
  let copiedField = $state<string | null>(null);

  let hasAccess = $derived(
    authStore.hasPermission('USER_VIEW') || authStore.hasPermission('USER_MANAGE') || authStore.isAdmin
  );

  let userInitials = $derived.by(() => {
    if (!targetUser?.fullName) {
      return 'PN';
    }
    const words = targetUser.fullName.trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    const first = words[0][0];
    const last = words[words.length - 1][0];
    return (first + last).toUpperCase();
  });

  let userPermissionCodes = $derived.by(() => {
    if (!targetUser) return new Set<string>();
    const list = targetUser.permissions || [];
    return new Set(list);
  });

  let userPermissionIdSet = $derived.by(() => {
    if (!targetUser) return new Set<number>();
    const list = targetUser.permissionIds || [];
    return new Set(list.map((id) => Number(id)));
  });

  function isPermissionActive(p: Permission): boolean {
    if (userPermissionIdSet.has(p.id)) {
      return true;
    }
    if (userPermissionCodes.has(p.code) || userPermissionCodes.has('*')) {
      return true;
    }
    return false;
  }

  let grantedPermissionsCount = $derived.by(() => {
    return allPermissions.filter((p) => isPermissionActive(p)).length;
  });

  let groupedPermissions = $derived.by(() => {
    const q = searchPermText.trim().toLowerCase();
    const groups: Record<string, { moduleKey: string; perms: Permission[]; activeCount: number }> = {};

    for (const p of allPermissions) {
      const active = isPermissionActive(p);
      if (showOnlyGranted && !active) {
        continue;
      }

      if (q) {
        const matchCode = p.code.toLowerCase().includes(q);
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchModule = (p.module || '').toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchDesc && !matchModule) {
          continue;
        }
      }

      const mod = p.module || 'KHAC';
      if (!groups[mod]) {
        groups[mod] = { moduleKey: mod, perms: [], activeCount: 0 };
      }
      groups[mod].perms.push(p);
      if (active) {
        groups[mod].activeCount++;
      }
    }

    return groups;
  });

  function getLevelTitle(level?: number): string {
    if (level === undefined || level === null) return 'Chưa phân cấp';
    switch (level) {
      case 1:
        return 'Cấp 1 - Quản Trị Tối Cao (SuperAdmin)';
      case 2:
        return 'Cấp 2 - Quản Trị Viên (Admin)';
      case 3:
        return 'Cấp 3 - Ban Giám Đốc (Director)';
      case 4:
        return 'Cấp 4 - Quản Lý Chi Nhánh (Manager)';
      case 5:
        return 'Cấp 5 - Vận Hành & Tác Nghiệp (Operational)';
      default:
        return `Cấp ${level} - Nhân Viên`;
    }
  }

  function getStatusBadge(status?: string): { label: string; variant: BadgeVariant } {
    if (status === UserStatus.ACTIVE || status === 'ACTIVE') {
      return { label: 'Đang hoạt động', variant: BADGE_VARIANTS.SUCCESS };
    }
    if (status === UserStatus.LOCKED || status === 'LOCKED') {
      return { label: 'Tài khoản bị khóa', variant: BADGE_VARIANTS.ERROR };
    }
    return { label: 'Không hoạt động', variant: BADGE_VARIANTS.NEUTRAL };
  }

  async function copyToClipboard(text: string, fieldName: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedField = fieldName;
      toast.success(`Đã sao chép ${fieldName} vào bộ nhớ tạm!`);
      setTimeout(() => {
        if (copiedField === fieldName) {
          copiedField = null;
        }
      }, 2000);
    } catch {
      toast.error('Không thể sao chép văn bản.');
    }
  }

  async function loadUserDetail() {
    loading = true;
    try {
      const [u, perms] = await Promise.all([
        getUserById(data.userId),
        getPermissions()
      ]);
      targetUser = u;
      allPermissions = perms;
    } catch (err: any) {
      toast.error('Lỗi khi tải thông tin hồ sơ: ' + (err.message || 'Lỗi mạng'));
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (hasAccess && data.userId) {
      loadUserDetail();
    }
  });
</script>

<svelte:head>
  <title>
    {targetUser ? `${targetUser.fullName} (@${targetUser.username})` : 'Hồ Sơ Nhân Sự'} | Premier Nuts ERP
  </title>
</svelte:head>

{#if !hasAccess}
  <Forbidden403
    title="Quyền Truy Cập Bị Từ Chối"
    description="Bạn không có quyền hạn tra cứu chi tiết thông tin hồ sơ nhân sự."
    requiredPermission="USER_VIEW"
  />
{:else if loading}
  <div class="loading-state-wrap">
    <div class="spinner-brand"></div>
    <p class="loading-text">Đang tải hồ sơ nhân sự & dữ liệu phân quyền...</p>
  </div>
{:else if !targetUser}
  <div class="not-found-wrap">
    <Card accent="orange">
      <div class="empty-detail-box">
        <h3>Không tìm thấy tài khoản người dùng</h3>
        <p class="text-muted">Tài khoản này có thể đã bị xóa hoặc mã định danh ID không hợp lệ.</p>
        <Button variant="primary" onclick={() => goto('/identity')}>
          Quay lại danh sách người dùng
        </Button>
      </div>
    </Card>
  </div>
{:else}
  {@const statusInfo = getStatusBadge(targetUser.status)}
  <!-- Chỉ duy nhất Admin mới được phép chỉnh sửa tài khoản -->
  {@const canEdit = authStore.isAdmin && targetUser.canManage !== false}

  <PageHeader
    leafLabel={targetUser.fullName}
    subtitle={`Thông tin định danh, chức vụ công tác và quyền hạn hệ thống của ${targetUser.fullName}`}
  >
    {#snippet actions()}
      <Button variant="secondary" onclick={() => goto('/identity')}>
        ← Quay lại danh sách
      </Button>
      {#if canEdit}
        <Button variant="primary" onclick={() => goto(`/identity/${targetUser?.id}/edit`)}>
          Chỉnh sửa & Phân quyền
        </Button>
      {/if}
    {/snippet}
  </PageHeader>

  <!-- 1. Profile Hero Banner -->
  <div class="profile-hero-card">
    <div class="hero-left">
      <div class="avatar-circle">
        {userInitials}
      </div>
      <div class="hero-identity">
        <div class="name-status-row">
          <h2 class="hero-fullname">{targetUser.fullName}</h2>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
        <div class="hero-meta-pills">
          <span class="meta-pill username-pill">
            @{targetUser.username}
          </span>
          <span class="meta-pill role-pill">
            {targetUser.roleName || targetUser.roleCode || 'Nhân Viên'}
          </span>
          <span class="meta-pill dept-pill">
            {targetUser.departmentName || targetUser.department || 'Văn phòng chính'}
          </span>
        </div>
      </div>
    </div>

    <!-- Quick Stat Chips on Hero -->
    <div class="hero-quick-chips">
      <div class="chip-metric">
        <span class="metric-label">Cấp bậc</span>
        <span class="metric-val text-brand font-bold">Cấp {targetUser.roleLevel ?? 5}</span>
      </div>
      <div class="chip-metric">
        <span class="metric-label">Quyền hạn</span>
        <span class="metric-val text-green font-bold">{grantedPermissionsCount} / {allPermissions.length}</span>
      </div>
    </div>
  </div>

  <!-- 2. HÀNG 2: THÔNG TIN & CHỨC DANH CÙNG LINE VỚI NHẬT KÝ HỆ THỐNG -->
  <div class="profile-same-line-grid">
    <!-- Cột trái: Thông Tin Tài Khoản & Chức Danh -->
    <Card accent="orange">
      <div class="spec-card-top">
        <div class="spec-header-title-box">
          <h3 class="spec-main-title">Thông Tin Tài Khoản & Chức Danh</h3>
          <p class="spec-subtitle">Dữ liệu phân bổ tổ chức và thẩm quyền tài khoản</p>
        </div>
        <span class="spec-tag">HỒ SƠ GỐC</span>
      </div>

      <!-- Bảng đặc tả dạng Key-Value rõ ràng Title bên trái, Content bên phải (Không dùng icon emoji) -->
      <div class="spec-table">
        <!-- Email -->
        <div class="spec-row">
          <div class="spec-label-col">
            <span class="spec-label-text">Email công việc</span>
          </div>
          <div class="spec-value-col">
            <span class="spec-val-primary font-bold">
              {targetUser.email || 'Chưa cập nhật email'}
            </span>
            {#if targetUser.email}
              <button
                type="button"
                class="btn-copy-chip"
                onclick={() => copyToClipboard(targetUser?.email || '', 'Email')}
              >
                {copiedField === 'Email' ? 'Đã chép' : 'Sao chép'}
              </button>
            {/if}
          </div>
        </div>

        <!-- Phone -->
        <div class="spec-row">
          <div class="spec-label-col">
            <span class="spec-label-text">Số điện thoại</span>
          </div>
          <div class="spec-value-col">
            {#if targetUser.phone}
              <span class="spec-val-primary font-mono font-bold">
                {targetUser.phone}
              </span>
              <button
                type="button"
                class="btn-copy-chip"
                onclick={() => copyToClipboard(targetUser?.phone || '', 'SĐT')}
              >
                {copiedField === 'SĐT' ? 'Đã chép' : 'Sao chép'}
              </button>
            {:else}
              <span class="text-placeholder">Chưa thiết lập</span>
            {/if}
          </div>
        </div>

        <!-- Company -->
        <div class="spec-row">
          <div class="spec-label-col">
            <span class="spec-label-text">Đơn vị pháp nhân</span>
          </div>
          <div class="spec-value-col">
            <span class="spec-val-primary">
              Công Ty Cổ Phần Nông Sản Premier Nuts
            </span>
          </div>
        </div>

        <!-- Department -->
        <div class="spec-row">
          <div class="spec-label-col">
            <span class="spec-label-text">Phòng ban công tác</span>
          </div>
          <div class="spec-value-col">
            <span class="badge-dept-pill">
              {targetUser.departmentName || targetUser.department || 'Chưa phân bổ'}
            </span>
          </div>
        </div>

        <!-- Role -->
        <div class="spec-row">
          <div class="spec-label-col">
            <span class="spec-label-text">Vai trò hệ thống</span>
          </div>
          <div class="spec-value-col">
            <span class="badge-role-pill">
              {targetUser.roleName || targetUser.roleCode || 'Nhân Viên'}
            </span>
          </div>
        </div>

        <!-- Level -->
        <div class="spec-row">
          <div class="spec-label-col">
            <span class="spec-label-text">Thang bậc quản trị</span>
          </div>
          <div class="spec-value-col">
            <div class="level-desc-box">
              <span class="level-pill-num font-mono">Cấp {targetUser.roleLevel ?? 5}</span>
              <span class="level-pill-text">{getLevelTitle(targetUser.roleLevel)}</span>
            </div>
          </div>
        </div>

        <!-- Governance Authority -->
        <div class="spec-row spec-row-highlight">
          <div class="spec-label-col">
            <span class="spec-label-text">Thẩm quyền quản trị</span>
          </div>
          <div class="spec-value-col">
            {#if targetUser.canManage !== false}
              <span class="badge-authority-can">
                Bạn có quyền điều chỉnh tài khoản này
              </span>
            {:else}
              <span class="badge-authority-lock">
                Tài khoản cùng cấp hoặc cấp trên (Chỉ xem)
              </span>
            {/if}
          </div>
        </div>
      </div>
    </Card>

    <!-- Cột phải: Nhật Ký & Dữ Liệu Hệ Thống CÙNG LINE (Không dùng icon emoji) -->
    <Card accent="green">
      <div class="spec-card-top">
        <div class="spec-header-title-box">
          <h3 class="spec-main-title">Nhật Ký & Dữ Liệu Hệ Thống</h3>
          <p class="spec-subtitle">Dữ liệu kiểm toán và lịch sử hoạt động bản ghi</p>
        </div>
        <span class="spec-tag-green">KIỂM TOÁN</span>
      </div>

      <!-- Bảng đặc tả dạng Key-Value đồng bộ với cột thông tin -->
      <div class="spec-table">
        <!-- User ID -->
        <div class="spec-row">
          <div class="spec-label-col">
            <span class="spec-label-text">Mã định danh ID</span>
          </div>
          <div class="spec-value-col">
            <span class="spec-val-primary font-mono font-bold">
              #USER-{targetUser.id}
            </span>
          </div>
        </div>

        <!-- CreatedAt -->
        <div class="spec-row">
          <div class="spec-label-col">
            <span class="spec-label-text">Thời điểm khởi tạo</span>
          </div>
          <div class="spec-value-col">
            <span class="spec-val-primary font-mono">
              {targetUser.createdAt ? DateHelper.formatDateTime(targetUser.createdAt) : 'Chưa ghi nhận'}
            </span>
          </div>
        </div>

        <!-- UpdatedAt -->
        <div class="spec-row">
          <div class="spec-label-col">
            <span class="spec-label-text">Cập nhật gần nhất</span>
          </div>
          <div class="spec-value-col">
            <span class="spec-val-primary font-mono">
              {targetUser.updatedAt ? DateHelper.formatDateTime(targetUser.updatedAt) : 'Chưa ghi nhận'}
            </span>
          </div>
        </div>

        <!-- LastLoginAt -->
        <div class="spec-row">
          <div class="spec-label-col">
            <span class="spec-label-text">Lần đăng nhập cuối</span>
          </div>
          <div class="spec-value-col">
            <span class="spec-val-primary font-mono">
              {targetUser.lastLoginAt ? DateHelper.formatDateTime(targetUser.lastLoginAt) : 'Chưa đăng nhập'}
            </span>
          </div>
        </div>

        <!-- Trạng thái bản ghi -->
        <div class="spec-row">
          <div class="spec-label-col">
            <span class="spec-label-text">Trạng thái bản ghi</span>
          </div>
          <div class="spec-value-col">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
        </div>

        <!-- Quản lý vai trò -->
        <div class="spec-row">
          <div class="spec-label-col">
            <span class="spec-label-text">Chế độ phân quyền</span>
          </div>
          <div class="spec-value-col">
            <span class="spec-val-primary">
              Kế thừa mẫu vai trò kết hợp phân quyền trực tiếp
            </span>
          </div>
        </div>

        <!-- Quy trình quản trị -->
        <div class="spec-row spec-row-highlight">
          <div class="spec-label-col">
            <span class="spec-label-text">Quy trình cấp quyền</span>
          </div>
          <div class="spec-value-col">
            <span class="text-hint-audit">
              Tạo ticket phê duyệt qua Admin theo chính sách bảo mật nội bộ
            </span>
          </div>
        </div>
      </div>
    </Card>
  </div>

  <!-- 3. HÀNG 3: MA TRẬN QUYỀN HẠN HỆ THỐNG ĐỂ HẲN XUỐNG DƯỚI TOÀN KHỔ -->
  <div class="permissions-bottom-section">
    <Card accent="orange">
      <div class="matrix-header-box">
        <div>
          <h3 class="spec-main-title">Ma Trận Quyền Hạn Truy Cập Hệ Thống</h3>
          <p class="spec-subtitle">
            Danh sách chi tiết các quyền hạn được kích hoạt trên hệ sinh thái phần mềm Premier Nuts
          </p>
        </div>
        <div class="perm-counter-pill">
          <strong>{grantedPermissionsCount}</strong> / {allPermissions.length} quyền
        </div>
      </div>

      <!-- Toolbar: Search & Filter Toggle -->
      <div class="matrix-toolbar">
        <div class="search-input-wrap">
          <input
            type="text"
            class="search-perm-input"
            placeholder="Tìm kiếm mã quyền, tên quyền hoặc phân hệ..."
            bind:value={searchPermText}
          />
          {#if searchPermText}
            <button
              type="button"
              class="clear-search-btn"
              onclick={() => (searchPermText = '')}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          {/if}
        </div>

        <div class="filter-toggles">
          <button
            type="button"
            class="filter-btn"
            class:active={showOnlyGranted}
            onclick={() => (showOnlyGranted = true)}
          >
            Quyền đã cấp ({grantedPermissionsCount})
          </button>
          <button
            type="button"
            class="filter-btn"
            class:active={!showOnlyGranted}
            onclick={() => (showOnlyGranted = false)}
          >
            Tất cả quyền ({allPermissions.length})
          </button>
        </div>
      </div>

      <!-- Permissions Grouped by Module -->
      <div class="module-blocks-container">
        {#each Object.entries(groupedPermissions) as [modKey, grp] (modKey)}
          {@const meta = getModuleMeta(modKey)}
          <div class="module-group-card" style="--mod-color: {meta.color};">
            <div class="module-header-row">
              <div class="module-title-wrap">
                <span class="module-color-dot"></span>
                <span class="module-title-text">{meta.title}</span>
                <span class="module-code-pill">{meta.code}</span>
              </div>
              <div class="module-count-badge">
                {grp.activeCount} / {grp.perms.length} kích hoạt
              </div>
            </div>

            {#if meta.description}
              <div class="module-desc-text">{meta.description}</div>
            {/if}

            <!-- Perms List Grid -->
            <div class="perms-chips-grid">
              {#each grp.perms as p (p.id)}
                {@const active = isPermissionActive(p)}
                <div class="perm-chip-item" class:is-granted={active}>
                  <div class="chip-status-icon">
                    {#if active}
                      <span class="check-badge-active" title="Quyền đang kích hoạt">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                      </span>
                    {:else}
                      <span class="check-badge-inactive" title="Chưa được cấp"></span>
                    {/if}
                  </div>
                  <div class="chip-content">
                    <div class="chip-name-row">
                      <span class="chip-name">{p.name || p.code}</span>
                      <span class="chip-code font-mono">{p.code}</span>
                    </div>
                    {#if p.description}
                      <div class="chip-desc">{p.description}</div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <div class="empty-matrix-search">
            <p>Không tìm thấy quyền hạn nào khớp với từ khóa "<strong>{searchPermText}</strong>".</p>
            <Button size="sm" variant="secondary" onclick={() => (searchPermText = '')}>
              Xóa bộ lọc tìm kiếm
            </Button>
          </div>
        {/each}
      </div>
    </Card>
  </div>
{/if}

<style>
  .loading-state-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 380px;
    gap: 16px;
  }

  .spinner-brand {
    width: 44px;
    height: 44px;
    border: 3.5px solid rgba(217, 107, 39, 0.2);
    border-top-color: var(--pn-brand, #D96B27);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    font-size: 14.5px;
    color: var(--pn-ink-soft, #6B5D4F);
    font-weight: 500;
  }

  .not-found-wrap {
    max-width: 600px;
    margin: 40px auto;
  }

  .empty-detail-box {
    text-align: center;
    padding: 32px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  /* 1. Profile Hero Card */
  .profile-hero-card {
    background: linear-gradient(135deg, #FFFFFF 0%, #FBF9F7 100%);
    border: 1.5px solid var(--pn-border, #E8DFD8);
    border-radius: 14px;
    padding: 22px 26px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    box-shadow: 0 3px 14px rgba(43, 33, 22, 0.04);
  }

  .hero-left {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .avatar-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #D96B27 0%, #F0821E 100%);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 23px;
    font-weight: 800;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 14px rgba(217, 107, 39, 0.3);
    flex-shrink: 0;
  }

  .hero-identity {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .name-status-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .hero-fullname {
    margin: 0;
    font-size: 21px;
    font-weight: 800;
    color: var(--pn-ink, #2B2116);
    letter-spacing: -0.3px;
  }

  .hero-meta-pills {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .meta-pill {
    padding: 3px 10px;
    font-size: 12px;
    border-radius: 6px;
    font-weight: 600;
  }

  .username-pill {
    background: rgba(43, 33, 22, 0.06);
    color: var(--pn-ink, #2B2116);
    font-family: monospace;
    font-size: 13px;
  }

  .role-pill {
    background: rgba(217, 107, 39, 0.1);
    color: var(--pn-brand, #D96B27);
  }

  .dept-pill {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }

  .hero-quick-chips {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .chip-metric {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    background: #FFFFFF;
    border: 1px solid var(--pn-border, #E8DFD8);
    border-radius: 8px;
    padding: 8px 14px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  }

  .metric-label {
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .metric-val {
    font-size: 14px;
  }

  .text-brand {
    color: var(--pn-brand, #D96B27);
  }

  .text-green {
    color: #059669;
  }

  /* 2. CÙNG LINE GRID (Thông tin và Nhật ký nằm ngang cạnh nhau) */
  .profile-same-line-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 22px;
    align-items: stretch;
  }

  @media (max-width: 960px) {
    .profile-same-line-grid {
      grid-template-columns: 1fr;
    }
  }

  .spec-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1.5px solid var(--pn-border, #E8DFD8);
  }

  .spec-header-title-box {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .spec-main-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .spec-subtitle {
    margin: 0;
    font-size: 12.5px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .spec-tag {
    font-size: 10.5px;
    font-weight: 800;
    color: var(--pn-brand, #D96B27);
    background: rgba(217, 107, 39, 0.08);
    padding: 3px 8px;
    border-radius: 4px;
    letter-spacing: 0.5px;
  }

  .spec-tag-green {
    font-size: 10.5px;
    font-weight: 800;
    color: #059669;
    background: rgba(16, 185, 129, 0.08);
    padding: 3px 8px;
    border-radius: 4px;
    letter-spacing: 0.5px;
  }

  /* Structured Spec Table: Tách bạch tuyệt đối Title và Content */
  .spec-table {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--pn-border, #E8DFD8);
    border-radius: 8px;
    overflow: hidden;
    background: #FFFFFF;
  }

  .spec-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--pn-border, #E8DFD8);
    min-height: 46px;
    transition: background 0.12s ease;
  }

  .spec-row:last-child {
    border-bottom: none;
  }

  .spec-row:hover {
    background: #FAF7F4;
  }

  .spec-row-highlight {
    background: rgba(217, 107, 39, 0.03);
  }

  /* Cột Title/Label bên trái: Nền xám nhẹ, viền phải, chữ đậm, cố định độ rộng */
  .spec-label-col {
    width: 155px;
    min-width: 155px;
    padding: 10px 14px;
    background: #F8F5F1;
    border-right: 1px solid var(--pn-border, #E8DFD8);
    align-self: stretch;
    display: flex;
    align-items: center;
    box-sizing: border-box;
  }

  .spec-label-text {
    font-size: 12.5px;
    font-weight: 700;
    color: #55483B;
  }

  /* Cột Value/Content bên phải */
  .spec-value-col {
    flex: 1;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    box-sizing: border-box;
  }

  .spec-val-primary {
    font-size: 13.5px;
    color: var(--pn-ink, #2B2116);
    word-break: break-all;
  }

  .font-bold {
    font-weight: 700;
  }

  .font-mono {
    font-family: monospace;
    font-size: 13px;
  }

  .text-placeholder {
    font-size: 13px;
    color: var(--pn-ink-soft, #6B5D4F);
    font-style: italic;
  }

  .text-hint-audit {
    font-size: 12.5px;
    color: var(--pn-ink-soft, #6B5D4F);
    font-style: italic;
  }

  .btn-copy-chip {
    background: #FFFFFF;
    border: 1px solid var(--pn-border, #E8DFD8);
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--pn-ink-soft, #6B5D4F);
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .btn-copy-chip:hover {
    background: rgba(217, 107, 39, 0.08);
    border-color: var(--pn-brand, #D96B27);
    color: var(--pn-brand, #D96B27);
  }

  .badge-dept-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #059669;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .badge-role-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    color: var(--pn-brand, #D96B27);
    background: rgba(217, 107, 39, 0.1);
    border: 1px solid rgba(217, 107, 39, 0.25);
  }

  .level-desc-box {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .level-pill-num {
    padding: 2px 7px;
    border-radius: 4px;
    background: rgba(43, 33, 22, 0.08);
    font-size: 12px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .level-pill-text {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .badge-authority-can {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: 700;
    color: #047857;
    background: rgba(16, 185, 129, 0.12);
  }

  .badge-authority-lock {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: 600;
    color: #4B5563;
    background: rgba(107, 114, 128, 0.12);
  }

  /* 3. MA TRẬN QUYỀN HẠN ĐỂ HẲN XUỐNG DƯỚI TOÀN KHỔ */
  .permissions-bottom-section {
    width: 100%;
  }

  .matrix-header-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .perm-counter-pill {
    padding: 6px 14px;
    border-radius: 20px;
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    font-size: 13.5px;
    font-weight: 600;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .matrix-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 12px;
    flex-wrap: wrap;
    background: #FDFBF9;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid var(--pn-border, #E8DFD8);
  }

  .search-input-wrap {
    position: relative;
    flex: 1;
    min-width: 240px;
  }

  .search-perm-input {
    width: 100%;
    padding: 8px 32px 8px 12px;
    font-size: 13px;
    border: 1px solid var(--pn-border, #E8DFD8);
    border-radius: 6px;
    background: #FFFFFF;
    color: var(--pn-ink, #2B2116);
    outline: none;
    transition: border-color 0.15s ease;
    box-sizing: border-box;
  }

  .search-perm-input:focus {
    border-color: var(--pn-brand, #D96B27);
  }

  .clear-search-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: var(--pn-ink-soft, #6B5D4F);
    cursor: pointer;
    padding: 4px;
    font-size: 12px;
  }

  .filter-toggles {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .filter-btn {
    padding: 6px 12px;
    font-size: 12.5px;
    font-weight: 600;
    border: 1px solid var(--pn-border, #E8DFD8);
    background: #FFFFFF;
    color: var(--pn-ink-soft, #6B5D4F);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .filter-btn:hover {
    color: var(--pn-brand, #D96B27);
    border-color: var(--pn-brand, #D96B27);
  }

  .filter-btn.active {
    background: var(--pn-brand, #D96B27);
    color: #FFFFFF;
    border-color: var(--pn-brand, #D96B27);
  }

  /* Module Group Cards */
  .module-blocks-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .module-group-card {
    border: 1px solid var(--pn-border, #E8DFD8);
    border-left: 4px solid var(--mod-color, #D96B27);
    border-radius: 10px;
    padding: 16px;
    background: #FFFFFF;
    transition: box-shadow 0.15s ease;
  }

  .module-group-card:hover {
    box-shadow: 0 3px 12px rgba(43, 33, 22, 0.05);
  }

  .module-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .module-title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .module-color-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--mod-color, #D96B27);
  }

  .module-title-text {
    font-size: 14.5px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .module-code-pill {
    font-size: 11px;
    font-family: monospace;
    font-weight: 700;
    background: rgba(43, 33, 22, 0.06);
    color: var(--pn-ink-soft, #6B5D4F);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .module-count-badge {
    font-size: 12px;
    font-weight: 600;
    color: var(--pn-ink-soft, #6B5D4F);
    background: #F8F5F2;
    padding: 3px 8px;
    border-radius: 4px;
  }

  .module-desc-text {
    font-size: 12px;
    color: var(--pn-ink-soft, #6B5D4F);
    margin-bottom: 12px;
  }

  /* Perms Chips Grid */
  .perms-chips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 10px;
  }

  .perm-chip-item {
    border: 1px solid var(--pn-border, #E8DFD8);
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #FAF8F6;
    transition: all 0.15s ease;
  }

  .perm-chip-item.is-granted {
    background: #FFFFFF;
    border-color: rgba(16, 185, 129, 0.4);
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.06);
  }

  .chip-status-icon {
    margin-top: 3px;
    flex-shrink: 0;
  }

  .check-badge-active {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #10B981;
    color: #FFFFFF;
  }

  .check-badge-inactive {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px dashed #D1D5DB;
  }

  .chip-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .chip-name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    flex-wrap: wrap;
  }

  .chip-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .chip-code {
    font-size: 11px;
    color: var(--pn-ink-soft, #6B5D4F);
    background: rgba(43, 33, 22, 0.05);
    padding: 1px 5px;
    border-radius: 3px;
  }

  .chip-desc {
    font-size: 11.5px;
    color: var(--pn-ink-soft, #6B5D4F);
    line-height: 1.35;
    margin-top: 2px;
  }

  .empty-matrix-search {
    text-align: center;
    padding: 32px 16px;
    color: var(--pn-ink-soft, #6B5D4F);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
</style>
