<script lang="ts">
  import {
    Button,
    Card,
    Tabs,
    PageHeader,
    Callout,
    toast
  } from '#lib/premier-ui';
  import { StatCardsGrid, getDashboardStats } from '#lib/modules/dashboard';
  import {
    InventoryTable,
    NewBatchModal,
    getInventoryBatches,
    type ProductBatch
  } from '#lib/modules/inventory';

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
      onclick={() => toast.info('Đang đồng bộ dữ liệu từ pn-api-gateway (:8080)...')}
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
            <p class="text-muted">Dữ liệu được quản lý bởi module nghiệp vụ <code>#lib/modules/inventory</code></p>
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
          <h3>Mô hình phân hệ nghiệp vụ (Feature-Based Architecture)</h3>
          <p class="text-muted">Mỗi nghiệp vụ được đóng gói độc lập gồm Types, API Service và Components.</p>
        </div>

        <div class="feature-cards-grid">
          <div class="feature-box">
            <div class="feature-title">1. Phân hệ Kho & Nguyên liệu</div>
            <div class="feature-path">src/lib/modules/inventory/</div>
            <p class="feature-desc">Quản lý lô hạt, đơn giá, kiểm kê tồn kho và tạo phiếu nhập kho.</p>
            <a href="/kho" class="feature-link">Truy cập màn hình Kho →</a>
          </div>

          <div class="feature-box">
            <div class="feature-title">2. Phân hệ Định danh & Phân quyền</div>
            <div class="feature-path">src/lib/modules/identity/</div>
            <p class="feature-desc">Kết nối microservice <code>pn-identity</code> (:8081) để cấp quyền Admin, Thủ kho, Kế toán.</p>
            <a href="/identity" class="feature-link">Truy cập Quản lý User →</a>
          </div>

          <div class="feature-box">
            <div class="feature-title">3. Cụm Gateway & Microservices</div>
            <div class="feature-path">src/lib/api/</div>
            <p class="feature-desc">HTTP client chuẩn hóa chuyển tiếp request qua <code>pn-api-gateway</code> (:8080).</p>
            <a href="/gateway" class="feature-link">Kiểm tra kết nối Gateway →</a>
          </div>
        </div>

        <Callout variant="info" title="Lợi ích kiến trúc">
          Khi cần thêm phân hệ mới (ví dụ: Bán hàng <code>orders</code>, Chế biến <code>manufacturing</code>), bạn chỉ cần tạo thêm 1 thư mục trong <code>src/lib/modules/</code> mà không lo ảnh hưởng tới các màn hình khác.
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
