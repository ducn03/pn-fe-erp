<script lang="ts">
  import {
    Button,
    Card,
    Tabs,
    PageHeader,
    Callout,
    toast
  } from '$ui';
  import { StatCardsGrid, getDashboardStats } from '$features/dashboard';
  import {
    InventoryTable,
    NewBatchModal,
    getInventoryBatches,
    type ProductBatch
  } from '$features/inventory';

  // Metrics & Inventory data (Svelte 5 runes)
  let metrics = $state<any[]>([]);
  let batches = $state<ProductBatch[]>([]);
  let activeTab = $state('tab-inventory');
  let isNewBatchModalOpen = $state(false);

  // Tabs list (No icons/emojis)
  const tabs = [
    { id: 'tab-inventory', label: 'Tồn kho nhanh (Inventory Preview)' },
    { id: 'tab-architecture', label: 'Cấu trúc hệ thống (Feature-Based Architecture)' }
  ];

  // Load initial data
  $effect(() => {
    getDashboardStats().then((data) => (metrics = data));
    getInventoryBatches().then((data) => (batches = data));
  });

  function handleBatchCreated(newBatch: ProductBatch) {
    batches = [newBatch, ...batches];
  }
</script>

<PageHeader
  title="Bàn Làm Việc Quản Trị"
  subtitle="Hệ thống Premier Nuts ERP – Kiến trúc Feature-Based phân hệ theo nghiệp vụ"
  breadcrumbs={[
    { label: 'Premier Nuts', href: '/' },
    { label: 'Quản trị' },
    { label: 'Dashboard' }
  ]}
>
  {#snippet actions()}
    <Button
      variant="secondary"
      onclick={() => toast.info('Đang đồng bộ dữ liệu từ pn-api-gateway (:9000)...')}
    >
      Đồng bộ dữ liệu
    </Button>
    <Button
      variant="primary"
      onclick={() => (isNewBatchModalOpen = true)}
    >
      + Nhập lô hạt mới
    </Button>
  {/snippet}
</PageHeader>

<!-- 4 Stat Cards from Dashboard Module -->
<StatCardsGrid {metrics} />

<!-- Main Card with Tabs -->
<Card accent="orange">
  <Tabs items={tabs} bind:active={activeTab}>
    {#if activeTab === 'tab-inventory'}
      <div class="tab-content">
        <div class="tab-header">
          <div>
            <h3>Tổng quan các lô hạt tồn kho</h3>
            <p class="text-muted">Dữ liệu được quản lý bởi feature nghiệp vụ <code>$features/inventory</code></p>
          </div>
          <Button variant="outline" size="sm" onclick={() => (isNewBatchModalOpen = true)}>
            + Thêm lô hạt
          </Button>
        </div>

        <InventoryTable {batches} />
      </div>
    {:else if activeTab === 'tab-architecture'}
      <div class="tab-content">
        <div class="tab-header">
          <h3>Kiến Trúc Frontend Linh Hoạt (3 Trụ Cột Tương Ứng Backend)</h3>
          <p class="text-muted">Phân tách rõ ràng giữa Hạ tầng Core, Thư viện UI thuần túy và các Phân hệ Nghiệp vụ.</p>
        </div>

        <div class="feature-cards-grid">
          <div class="feature-box">
            <div class="feature-title">Trụ cột 1: Hạ tầng Core</div>
            <div class="feature-path">$core/ (src/lib/core/)</div>
            <p class="feature-desc">ApiClient, Auth Interceptor, Auth Store (Svelte 5 Runes), StringHelper & DateHelper.</p>
            <span class="feature-link">Dùng chung toàn app</span>
          </div>

          <div class="feature-box">
            <div class="feature-title">Trụ cột 2: Design System UI</div>
            <div class="feature-path">$ui/ (src/lib/premier-ui/)</div>
            <p class="feature-desc">Thư viện UI thuần túy: Button, Table, Modal, Input, Badge, Sidebar, Theme tokens (100% độc lập nghiệp vụ).</p>
            <span class="feature-link">Sẵn sàng tách thành NPM Lib</span>
          </div>

          <div class="feature-box">
            <div class="feature-title">Trụ cột 3: Feature Modules</div>
            <div class="feature-path">$features/ (src/lib/features/)</div>
            <p class="feature-desc">Khớp 1-1 với microservices BE: <code>identity</code> (:9001), <code>inventory</code>, <code>dashboard</code>, <code>navigation</code>.</p>
            <a href="/identity" class="feature-link">Truy cập Quản lý User →</a>
          </div>
        </div>

        <Callout variant="info" title="Lợi ích kiến trúc 3 Trụ Cột">
          Khi cần thêm tính năng mới, bạn chỉ cần tạo thư mục trong <code>src/lib/features/</code>. Thư viện <code>premier-ui</code> có thể tái sử dụng cho bất kỳ web app hoặc portal nào khác mà không bị dính logic ERP!
        </Callout>
      </div>
    {/if}
  </Tabs>
</Card>

<!-- Modal thêm lô hạt từ Inventory Module -->
<NewBatchModal
  bind:open={isNewBatchModalOpen}
  oncreated={handleBatchCreated}
/>

<style>
  .tab-content {
    padding: 8px 0;
  }

  .tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }

  .tab-header h3 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
    color: var(--pn-ink);
  }

  .text-muted {
    margin: 0;
    font-size: 13px;
    color: var(--pn-ink-soft);
  }

  .feature-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .feature-box {
    background: var(--pn-paper);
    border: 1px solid var(--pn-line);
    border-radius: var(--pn-radius);
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .feature-title {
    font-size: 14.5px;
    font-weight: 700;
    color: var(--pn-ink);
    margin-bottom: 4px;
  }

  .feature-path {
    font-family: monospace;
    font-size: 11.5px;
    color: var(--pn-orange-hover);
    background: var(--pn-orange-mist);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 10px;
    width: fit-content;
  }

  .feature-desc {
    font-size: 13px;
    color: var(--pn-ink-soft);
    margin: 0 0 12px;
    line-height: 1.5;
  }

  .feature-link {
    font-size: 13px;
    font-weight: 600;
    color: var(--pn-orange);
    text-decoration: none;
  }

  .feature-link:hover {
    text-decoration: underline;
  }

  code {
    background: var(--pn-orange-light);
    color: var(--pn-orange-hover);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }
</style>
