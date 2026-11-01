<script lang="ts">
  import {
    Button,
    Card,
    PageHeader,
    Badge,
    Forbidden403,
    toast,
    CARD_ACCENTS,
    BADGE_VARIANTS
  } from '$ui';
  import { StatCardsGrid, getDashboardStats } from '$features/dashboard';
  import { getUsers, UserTable, type User } from '$features/identity';
  import { authStore } from '$core/stores';

  let hasAccess = $derived(authStore.isAdmin || authStore.hasPermission('DASHBOARD_VIEW'));
  let metrics = $state<any[]>([]);
  let recentUsers = $state<User[]>([]);
  let refreshing = $state(false);

  async function loadDashboardData(isManual = false) {
    if (!hasAccess) return;
    if (isManual) {
      refreshing = true;
    }
    try {
      const [statsData, usersData] = await Promise.all([
        getDashboardStats(),
        getUsers({ page: 0, size: 5 })
      ]);
      metrics = statsData;
      recentUsers = usersData;
      if (isManual) {
        toast.success('Đã cập nhật dữ liệu tổng quan mới nhất!');
      }
    } catch (err: any) {
      let errMsg = 'Lỗi kết nối';
      if (err && err.message) {
        errMsg = err.message;
      }
      if (isManual) {
        toast.error('Lỗi khi làm mới dữ liệu: ' + errMsg);
      }
    } finally {
      if (isManual) {
        refreshing = false;
      }
    }
  }

  // Load initial data
  $effect(() => {
    if (hasAccess) {
      loadDashboardData(false);
    }
  });
</script>

<svelte:head>
  <title>Bàn Làm Việc | Premier Nuts ERP</title>
</svelte:head>

{#if !hasAccess}
  <Forbidden403
    title="Quyền Truy Cập Bị Từ Chối"
    description="Bạn không có quyền hạn truy cập Bàn làm việc tổng quan của hệ thống."
    requiredPermission="DASHBOARD_VIEW"
  />
{:else}
  <PageHeader
    title="Bàn Làm Việc"
    subtitle="Tổng quan hệ thống điều hành nguồn lực Premier Nuts ERP"
    breadcrumbs={[
      { label: 'Premier Nuts', href: '/' },
      { label: 'Bàn làm việc' }
    ]}
  >
    {#snippet actions()}
      <Button
        variant="secondary"
        onclick={() => loadDashboardData(true)}
        disabled={refreshing}
      >
        {#if refreshing}
          Đang làm mới...
        {:else}
          Làm mới dữ liệu
        {/if}
      </Button>
    {/snippet}
  </PageHeader>

  <!-- 4 Real Metric Stat Cards -->
  <StatCardsGrid {metrics} />

  <!-- Quick Modules Overview Grid -->
  <div class="modules-grid">
    <!-- Module 1: Company -->
    <Card accent={CARD_ACCENTS.ORANGE}>
      <div class="module-card-body">
        <div class="module-badge-row">
          <Badge variant={BADGE_VARIANTS.SUCCESS}>Hoạt Động</Badge>
        </div>
        <h3 class="module-title">Thông Tin Doanh Nghiệp</h3>
        <p class="module-desc">
          Quản lý pháp nhân công ty, mã số thuế, cơ cấu 5 phòng ban và bảng phân định vai trò trách nhiệm.
        </p>
        <div class="module-footer">
          <a href="/company" class="module-action-link">
            Vào phân hệ Doanh nghiệp &rarr;
          </a>
        </div>
      </div>
    </Card>

    <!-- Module 2: Identity & Users -->
    <Card accent={CARD_ACCENTS.ORANGE}>
      <div class="module-card-body">
        <div class="module-badge-row">
          <Badge variant={BADGE_VARIANTS.SUCCESS}>Đã Sẵn Sàng</Badge>
        </div>
        <h3 class="module-title">Quản Trị Người Dùng & Phân Quyền</h3>
        <p class="module-desc">
          Quản lý nhân sự, cấp phát tài khoản nghiệp vụ và kiểm soát phân quyền bảo vệ quyền Admin.
        </p>
        <div class="module-footer">
          <a href="/identity" class="module-action-link">
            Quản lý tài khoản &rarr;
          </a>
        </div>
      </div>
    </Card>

    <!-- Module 3: Healthcheck -->
    <Card accent={CARD_ACCENTS.GREEN}>
      <div class="module-card-body">
        <div class="module-badge-row">
          <Badge variant={BADGE_VARIANTS.SUCCESS}>Trực Tuyến</Badge>
        </div>
        <h3 class="module-title">Giám Sát Hệ Thống</h3>
        <p class="module-desc">
          Kiểm tra trạng thái thời gian thực của API Gateway, Identity và cơ sở dữ liệu PostgreSQL.
        </p>
      <div class="module-footer">
        <a href="/health" class="module-action-link">
          Kiểm tra kết nối &rarr;
        </a>
      </div>
    </div>
  </Card>
</div>

<!-- Main Card: Recent Users Table (Dữ liệu thật 100% từ PostgreSQL) -->
<Card accent={CARD_ACCENTS.ORANGE} style="margin-top: 24px;">
  <div class="users-section">
    <div class="section-header">
      <div>
        <h3 class="section-title">Nhân sự hệ thống gần đây</h3>
        <p class="text-muted">Danh sách tài khoản nhân viên được cấp phát trong hệ thống</p>
      </div>
      <div class="header-actions">
        <a href="/identity" class="view-all-link">Xem tất cả người dùng &rarr;</a>
      </div>
    </div>

    <UserTable users={recentUsers} />
  </div>
</Card>
{/if}

<style>
  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .module-card-body {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .module-badge-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .module-title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 700;
    color: var(--pn-ink);
  }

  .module-desc {
    margin: 0 0 16px;
    font-size: 13.5px;
    line-height: 1.5;
    color: var(--pn-ink-soft);
    flex: 1;
  }

  .module-footer {
    padding-top: 12px;
    border-top: 1px solid var(--pn-line);
  }

  .module-action-link {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--pn-orange);
    text-decoration: none;
  }

  .module-action-link:hover {
    color: var(--pn-orange-hover);
    text-decoration: underline;
  }

  .users-section {
    padding: 4px 0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }

  .section-title {
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

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .view-all-link {
    font-size: 13px;
    font-weight: 600;
    color: var(--pn-orange);
    text-decoration: none;
  }

  .view-all-link:hover {
    color: var(--pn-orange-hover);
    text-decoration: underline;
  }
</style>
