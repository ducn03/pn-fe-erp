<script lang="ts">
  import {
    PageHeader,
    Card,
    Badge,
    Button,
    Forbidden403,
    toast,
    CARD_ACCENTS,
    BADGE_VARIANTS,
    type CardAccent,
    type BadgeVariant
  } from '$ui';
  import { authStore } from '$core/stores';
  import {
    getAllServicesHealth,
    HealthStatus,
    type ServiceHealthData
  } from '$features/health';

  let hasAccess = $derived(authStore.isAdmin || authStore.hasPermission('HEALTH_VIEW'));
  let services = $state<ServiceHealthData[]>([]);
  let loading = $state(true);
  let lastChecked = $state('');

  function getServiceAccent(status: HealthStatus): CardAccent {
    if (status === HealthStatus.UP) {
      return CARD_ACCENTS.GREEN;
    }
    return CARD_ACCENTS.ORANGE;
  }

  function getServiceBadgeVariant(status: HealthStatus): BadgeVariant {
    if (status === HealthStatus.UP) {
      return BADGE_VARIANTS.SUCCESS;
    }
    return BADGE_VARIANTS.ERROR;
  }

  function getServiceStatusText(status: HealthStatus): string {
    if (status === HealthStatus.UP) {
      return 'Đang Hoạt Động (UP)';
    }
    return 'Mất Kết Nối (DOWN)';
  }

  function getDatabaseIndicatorClass(status: string | HealthStatus): string {
    if (status === HealthStatus.UP) {
      return 'up';
    }
    return 'down';
  }

  function getDatabaseStatusText(status: string | HealthStatus): string {
    if (status === HealthStatus.UP) {
      return 'Kết nối tốt';
    }
    return 'Mất kết nối';
  }

  async function checkHealth() {
    if (!hasAccess) return;
    loading = true;
    try {
      services = await getAllServicesHealth();
      lastChecked = new Date().toLocaleTimeString('vi-VN');
      toast.success('Đã cập nhật trạng thái các dịch vụ');
    } catch (err: any) {
      let errMsg = 'Lỗi mạng';
      if (err && err.message) {
        errMsg = err.message;
      }
      toast.error('Lỗi khi kiểm tra trạng thái: ' + errMsg);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (hasAccess) {
      checkHealth();
    }
  });
</script>

<svelte:head>
  <title>Giám Sát Hệ Thống | Premier Nuts ERP</title>
</svelte:head>

{#if !hasAccess}
  <Forbidden403
    title="Quyền Truy Cập Bị Từ Chối"
    description="Bạn không có quyền hạn giám sát tình trạng hệ thống máy chủ và cơ sở dữ liệu."
    requiredPermission="HEALTH_VIEW"
  />
{:else}
  <PageHeader
    title="Giám Sát Hệ Thống"
    subtitle="Kiểm tra trạng thái hoạt động thực tế của API Gateway, Identity Service và Cơ sở dữ liệu PostgreSQL"
    breadcrumbs={[
      { label: 'Premier Nuts', href: '/' },
      { label: 'Hệ thống' },
      { label: 'Giám sát hệ thống' }
    ]}
  >
    {#snippet actions()}
      {#if lastChecked}
        <span class="last-checked">Cập nhật lúc: {lastChecked}</span>
      {/if}
      <Button variant="secondary" onclick={checkHealth} disabled={loading}>
        {#if loading}Đang kiểm tra...{:else}Kiểm tra lại{/if}
      </Button>
    {/snippet}
  </PageHeader>

<div class="health-grid">
  {#each services as s (s.serviceId)}
    <Card accent={getServiceAccent(s.status)}>
      <div class="service-card-header">
        <div>
          <span class="service-id-tag">{s.serviceId}</span>
          <h3 class="service-title">{s.name}</h3>
          <span class="port-label">Cổng mạng: :{s.port}</span>
        </div>
        <Badge variant={getServiceBadgeVariant(s.status)}>
          {getServiceStatusText(s.status)}
        </Badge>
      </div>

      <div class="metrics-list">
        <!-- Database metric if exists -->
        {#if s.database}
          <div class="metric-row">
            <span class="metric-name">Cơ sở dữ liệu ({s.database.type})</span>
            <div class="metric-val-group">
              <span class="status-indicator {getDatabaseIndicatorClass(s.database.status)}"></span>
              <span class="font-bold">{getDatabaseStatusText(s.database.status)}</span>
            </div>
          </div>
        {/if}

        <!-- Disk Space metric if exists -->
        {#if s.diskSpace}
          <div class="metric-row">
            <span class="metric-name">Dung lượng ổ đĩa (Disk Space)</span>
            <span class="font-bold">Trống {s.diskSpace.freeGb} GB / {s.diskSpace.totalGb} GB</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: {s.diskSpace.usagePercent}%"></div>
          </div>
        {/if}

        <!-- Endpoints & Liveness -->
        {#if s.components}
          <div class="metric-row">
            <span class="metric-name">Trạng thái Liveness State</span>
            <span class="badge-sub">{s.components.livenessState?.status || 'UP'}</span>
          </div>
          <div class="metric-row">
            <span class="metric-name">Trạng thái Readiness State</span>
            <span class="badge-sub">{s.components.readinessState?.status || 'UP'}</span>
          </div>
        {/if}
      </div>
    </Card>
  {/each}
</div>
{/if}

<style>
  .last-checked {
    font-size: 12.5px;
    color: var(--pn-ink-soft, #6B5D4F);
    align-self: center;
    margin-right: 8px;
  }

  .health-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    gap: 20px;
  }

  .service-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--pn-line, #EEE3D3);
  }

  .service-id-tag {
    font-family: monospace;
    font-size: 11px;
    color: var(--pn-orange, #F0821E);
    background: var(--pn-orange-mist, #FFF5EA);
    border: 1px solid var(--pn-orange-light, #FDEBD3);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 4px;
  }

  .service-title {
    margin: 0 0 2px;
    font-size: 16px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .port-label {
    font-size: 12px;
    color: var(--pn-ink-soft, #6B5D4F);
    font-family: monospace;
  }

  .metrics-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .metric-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }

  .metric-name {
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .metric-val-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .status-indicator.up {
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
  }

  .status-indicator.down {
    background: #ef4444;
    box-shadow: 0 0 6px #ef4444;
  }

  .font-bold {
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
  }

  .progress-bar-wrap {
    width: 100%;
    height: 6px;
    background: var(--pn-line, #EEE3D3);
    border-radius: 3px;
    overflow: hidden;
    margin-top: -6px;
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--pn-orange, #F0821E);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .badge-sub {
    font-size: 11.5px;
    font-weight: 600;
    background: var(--pn-sidebar-bg, #FDF9F2);
    border: 1px solid var(--pn-line-dark, #D6C5B3);
    padding: 1px 6px;
    border-radius: 4px;
    color: var(--pn-ink, #2B2116);
  }
</style>
