<script lang="ts">
  import {
    Button,
    Card,
    Badge,
    PageHeader,
    Callout,
    StatCard,
    Forbidden403,
    toast
  } from '$ui';
  import { goto } from '$app/navigation';
  import { authStore } from '$core/stores';
  import { DateHelper } from '$core/utils';
  import { getLoginLogs, type LoginLogItem } from '$features/identity';

  // Constants
  const STATUS_FILTER = {
    ALL: 'ALL',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED'
  } as const;

  type StatusFilterType = (typeof STATUS_FILTER)[keyof typeof STATUS_FILTER];

  let hasAccess = $derived(authStore.hasPermission('LOG_VIEW'));
  let logs = $state<LoginLogItem[]>([]);
  let totalElements = $state(0);
  let loading = $state(true);

  // Filters state
  let selectedStatus = $state<StatusFilterType>(STATUS_FILTER.ALL);
  let searchKeyword = $state('');
  let currentPage = $state(1);
  const pageSize = 15;

  // Stats computed from current logs
  let successCount = $state(0);
  let failedCount = $state(0);
  let abnormalRate = $state('0%');

  async function loadLogs(isManual = false) {
    loading = true;
    try {
      let statusParam: string | undefined = undefined;
      if (selectedStatus !== STATUS_FILTER.ALL) {
        statusParam = selectedStatus;
      }

      let keywordParam: string | undefined = undefined;
      if (searchKeyword.trim().length > 0) {
        keywordParam = searchKeyword.trim();
      }

      const res = await getLoginLogs({
        page: currentPage,
        size: pageSize,
        status: statusParam,
        keyword: keywordParam
      });

      logs = res.items;
      totalElements = res.total;

      // Calculate overview metrics
      let sc = 0;
      let fc = 0;
      for (const item of logs) {
        if (item.status === 'SUCCESS') {
          sc += 1;
        } else {
          fc += 1;
        }
      }
      successCount = sc;
      failedCount = fc;

      if (logs.length > 0) {
        const rate = Math.round((fc / logs.length) * 100);
        abnormalRate = `${rate}%`;
      } else {
        abnormalRate = '0%';
      }

      if (isManual) {
        toast.success('Đã làm mới dữ liệu nhật ký hệ thống!');
      }
    } catch (err: any) {
      toast.error('Lỗi khi tải nhật ký: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      loading = false;
    }
  }

  function handleFilter() {
    currentPage = 1;
    loadLogs(false);
  }

  function handleReset() {
    selectedStatus = STATUS_FILTER.ALL;
    searchKeyword = '';
    currentPage = 1;
    loadLogs(false);
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage -= 1;
      loadLogs(false);
    }
  }

  function nextPage() {
    const maxPage = Math.ceil(totalElements / pageSize);
    if (currentPage < maxPage) {
      currentPage += 1;
      loadLogs(false);
    }
  }

  function parseDevice(userAgent?: string): string {
    if (!userAgent) {
      return 'Không xác định';
    }
    if (userAgent.includes('Edg/')) {
      return 'Microsoft Edge';
    }
    if (userAgent.includes('Chrome/')) {
      return 'Google Chrome';
    }
    if (userAgent.includes('Firefox/')) {
      return 'Mozilla Firefox';
    }
    if (userAgent.includes('Safari/')) {
      return 'Apple Safari';
    }
    if (userAgent.includes('PostmanRuntime/')) {
      return 'Postman Client';
    }
    if (userAgent.includes('curl/')) {
      return 'cURL Terminal';
    }
    return userAgent.slice(0, 32);
  }

  $effect(() => {
    if (hasAccess) {
      loadLogs(false);
    }
  });
</script>

<svelte:head>
  <title>Nhật Ký Truy Cập & Bất Thường | Premier Nuts ERP</title>
</svelte:head>

<PageHeader
  title="Nhật Ký Truy Cập & Giám Sát Bất Thường"
  subtitle="Theo dõi lịch sử đăng nhập, thiết bị và các cảnh báo an ninh bảo mật hệ thống"
  breadcrumbs={[
    { label: 'Premier Nuts', href: '/' },
    { label: 'Hệ thống' },
    { label: 'Nhật ký truy cập' }
  ]}
>
  {#snippet actions()}
    <Button variant="secondary" onclick={() => loadLogs(true)} disabled={loading}>
      {#if loading}
        Đang làm mới...
      {:else}
        Làm mới dữ liệu
      {/if}
    </Button>
  {/snippet}
</PageHeader>

{#if !hasAccess}
  <Forbidden403
    title="Quyền Truy Cập Bị Từ Chối"
    description="Màn hình theo dõi nhật ký truy cập và kiểm toán an toàn thông tin chỉ dành riêng cho tài khoản được cấp quyền xem nhật ký."
    requiredPermission="LOG_VIEW"
  />
{:else}
  <!-- Stat Metrics -->
  <div class="stat-grid">
    <StatCard
      title="Tổng số lượt truy cập (Trang này)"
      value={logs.length}
      trend="neutral"
      change="Tổng bản ghi login hiện tại"
    />
    <StatCard
      title="Đăng nhập Thành công"
      value={successCount}
      trend="up"
      change="Xác thực danh tính hợp lệ"
    />
    <StatCard
      title="Thất bại / Bất thường"
      value={failedCount}
      trend="down"
      change="Sai mật khẩu hoặc bị chặn"
    />
    <StatCard
      title="Tỷ lệ Bất thường"
      value={abnormalRate}
      trend="neutral"
      change="Nguy cơ rủi ro an ninh"
    />
  </div>

  <!-- Filter Toolbar -->
  <Card accent="orange">
    <div class="filter-bar">
      <div class="filter-field search-box">
        <label for="log-search-input">Tìm kiếm nhanh:</label>
        <div class="input-with-icon">
          <span class="icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            id="log-search-input"
            type="text"
            placeholder="Tên đăng nhập, IP hoặc lý do..."
            bind:value={searchKeyword}
            onkeydown={(e) => {
              if (e.key === 'Enter') handleFilter();
            }}
          />
        </div>
      </div>

      <div class="filter-field">
        <label for="log-status-select">Trạng thái xác thực:</label>
        <select id="log-status-select" bind:value={selectedStatus} onchange={handleFilter}>
          <option value={STATUS_FILTER.ALL}>Toàn bộ trạng thái</option>
          <option value={STATUS_FILTER.SUCCESS}>Thành công (SUCCESS)</option>
          <option value={STATUS_FILTER.FAILED}>Thất bại / Bất thường (FAILED)</option>
        </select>
      </div>

      <div class="filter-actions">
        <Button variant="primary" size="sm" onclick={handleFilter}>
          Áp dụng
        </Button>
        <Button variant="ghost" size="sm" onclick={handleReset}>
          Làm sạch
        </Button>
      </div>
    </div>
  </Card>

  <!-- Logs Table -->
  <Card>
    <div class="table-header">
      <div>
        <h3 class="table-title">Chi tiết lịch sử đăng nhập</h3>
        <p class="table-sub">
          Tổng cộng {totalElements} lượt ghi nhận trên toàn bộ máy chủ Premier Nuts
        </p>
      </div>
      {#if failedCount > 0}
        <div class="warning-pill">
          Cảnh báo: Có {failedCount} lần đăng nhập bất thường
        </div>
      {/if}
    </div>

    {#if loading}
      <div class="table-state-box">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu nhật ký hệ thống...</p>
      </div>
    {:else if logs.length === 0}
      <div class="table-state-box empty">
        <p class="empty-title">Không tìm thấy bản ghi nhật ký phù hợp</p>
        <p class="empty-sub">Hãy thử thay đổi từ khóa hoặc bộ lọc trạng thái</p>
      </div>
    {:else}
      <div class="table-responsive">
        <table class="log-table">
          <thead>
            <tr>
              <th style="width: 170px;">Thời Gian</th>
              <th style="width: 180px;">Tài Khoản</th>
              <th style="width: 140px;">Trạng Thái</th>
              <th style="width: 150px;">Địa Chỉ IP</th>
              <th style="width: 180px;">Thiết Bị / Trình Duyệt</th>
              <th>Chi Tiết / Lý Do</th>
            </tr>
          </thead>
          <tbody>
            {#each logs as log (log.id)}
              <tr class:row-abnormal={log.status !== 'SUCCESS'}>
                <td class="col-time">
                  <span class="time-main">{DateHelper.formatDateTime(log.createdAt)}</span>
                </td>
                <td class="col-user">
                  <div class="user-chip">
                    <span class="user-avatar-tiny">
                      {log.username.slice(0, 2).toUpperCase()}
                    </span>
                    <span class="user-name-text">{log.username}</span>
                  </div>
                </td>
                <td class="col-status">
                  {#if log.status === 'SUCCESS'}
                    <span class="status-badge success">
                      <span class="dot"></span> Thành công
                    </span>
                  {:else}
                    <span class="status-badge failed">
                      <span class="dot"></span> Bất thường / Lỗi
                    </span>
                  {/if}
                </td>
                <td class="col-ip">
                  <code class="ip-code">{log.ipAddress || '127.0.0.1'}</code>
                </td>
                <td class="col-device">
                  <span class="device-text">{parseDevice(log.userAgent)}</span>
                </td>
                <td class="col-reason">
                  {#if log.status === 'SUCCESS'}
                    <span class="reason-ok">Xác thực thành công</span>
                  {:else}
                    <span class="reason-err">
                      {log.failureReason || 'Sai mật khẩu hoặc tài khoản chưa kích hoạt'}
                    </span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-footer">
        <div class="page-info">
          Hiển thị trang <strong>{currentPage}</strong> / {Math.ceil(totalElements / pageSize) || 1}
          ({logs.length} bản ghi)
        </div>
        <div class="pagination-buttons">
          <Button
            variant="secondary"
            size="sm"
            onclick={prevPage}
            disabled={currentPage <= 1 || loading}
          >
            ← Trang trước
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onclick={nextPage}
            disabled={currentPage >= Math.ceil(totalElements / pageSize) || loading}
          >
            Trang tiếp →
          </Button>
        </div>
      </div>
    {/if}
  </Card>
{/if}

<style>

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 16px;
  }

  .filter-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .filter-field label {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .filter-field.search-box {
    flex: 1;
    min-width: 260px;
  }

  .input-with-icon {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-with-icon .icon {
    position: absolute;
    left: 12px;
    font-size: 14px;
    pointer-events: none;
  }

  .input-with-icon input {
    width: 100%;
    padding: 9px 12px 9px 36px;
    border: 1.5px solid var(--pn-border, #E8DFD8);
    border-radius: 8px;
    font-size: 13.5px;
    background: #FFF;
    color: var(--pn-ink, #2B2116);
    outline: none;
    transition: border-color 0.2s ease;
  }

  .input-with-icon input:focus {
    border-color: var(--pn-brand, #D96B27);
  }

  .filter-field select {
    padding: 9px 14px;
    border: 1.5px solid var(--pn-border, #E8DFD8);
    border-radius: 8px;
    font-size: 13.5px;
    background: #FFF;
    color: var(--pn-ink, #2B2116);
    outline: none;
    min-width: 220px;
  }

  .filter-field select:focus {
    border-color: var(--pn-brand, #D96B27);
  }

  .filter-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .table-title {
    margin: 0 0 4px;
    font-size: 16.5px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .table-sub {
    margin: 0;
    font-size: 13px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .warning-pill {
    background: #FEE2E2;
    color: #DC2626;
    border: 1px solid #FCA5A5;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12.5px;
    font-weight: 600;
  }

  .table-state-box {
    padding: 48px;
    text-align: center;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .table-state-box.empty {
    padding: 60px 20px;
  }

  .empty-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px;
    color: var(--pn-ink, #2B2116);
  }

  .empty-sub {
    font-size: 13px;
    margin: 0;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(217, 107, 39, 0.2);
    border-top-color: var(--pn-brand, #D96B27);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 14px;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .table-responsive {
    overflow-x: auto;
    border: 1px solid var(--pn-border, #E8DFD8);
    border-radius: 8px;
  }

  .log-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
  }

  .log-table th {
    background: #FAF6F0;
    color: var(--pn-ink-soft, #6B5D4F);
    font-weight: 700;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 12px 14px;
    text-align: left;
    border-bottom: 1.5px solid var(--pn-border, #E8DFD8);
    white-space: nowrap;
  }

  .log-table td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--pn-border, #E8DFD8);
    color: var(--pn-ink, #2B2116);
    vertical-align: middle;
  }

  .log-table tr:last-child td {
    border-bottom: none;
  }

  .log-table tr:hover {
    background: #FCFAF7;
  }

  .log-table tr.row-abnormal {
    background: #FFF5F5;
  }

  .log-table tr.row-abnormal:hover {
    background: #FEE8E8;
  }

  .col-time .time-main {
    font-size: 13px;
    font-weight: 500;
    color: var(--pn-ink, #2B2116);
  }

  .user-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .user-avatar-tiny {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #E8DFD8;
    color: var(--pn-ink, #2B2116);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10.5px;
    font-weight: 700;
  }

  .user-name-text {
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .status-badge .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .status-badge.success {
    background: #DCFCE7;
    color: #166534;
  }

  .status-badge.success .dot {
    background: #16A34A;
  }

  .status-badge.failed {
    background: #FEE2E2;
    color: #991B1B;
  }

  .status-badge.failed .dot {
    background: #DC2626;
  }

  .ip-code {
    background: #F3ECE2;
    padding: 3px 8px;
    border-radius: 4px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 12.5px;
    color: var(--pn-ink, #2B2116);
  }

  .device-text {
    font-size: 12.5px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .reason-ok {
    font-size: 12.5px;
    color: #16A34A;
  }

  .reason-err {
    font-size: 12.5px;
    font-weight: 600;
    color: #DC2626;
  }

  .pagination-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 18px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .page-info {
    font-size: 13px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .pagination-buttons {
    display: flex;
    gap: 8px;
  }
</style>
