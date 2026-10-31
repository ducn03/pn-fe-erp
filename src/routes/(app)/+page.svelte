<script lang="ts">
  import {
    Button,
    Card,
    PageHeader,
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
  let isNewBatchModalOpen = $state(false);

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
  subtitle="Hệ thống quản lý nguồn lực doanh nghiệp Premier Nuts ERP"
  breadcrumbs={[
    { label: 'Premier Nuts', href: '/' },
    { label: 'Quản trị' },
    { label: 'Dashboard' }
  ]}
>
  {#snippet actions()}
    <Button
      variant="secondary"
      onclick={() => toast.info('Đang làm mới dữ liệu tổng quan...')}
    >
      Làm mới dữ liệu
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

<!-- Main Card: Inventory Overview -->
<Card accent="orange">
  <div class="inventory-section">
    <div class="section-header">
      <div>
        <h3>Lô hạt tồn kho gần đây</h3>
        <p class="text-muted">Danh sách các lô hạt mới nhất đang lưu kho tại xưởng chế biến</p>
      </div>
      <div class="header-actions">
        <a href="/kho" class="view-all-link">Xem tất cả kho hạt →</a>
        <Button variant="outline" size="sm" onclick={() => (isNewBatchModalOpen = true)}>
          + Thêm lô hạt
        </Button>
      </div>
    </div>

    <InventoryTable {batches} />
  </div>
</Card>

<!-- Modal thêm lô hạt từ Inventory Module -->
<NewBatchModal
  bind:open={isNewBatchModalOpen}
  oncreated={handleBatchCreated}
/>

<style>
  .inventory-section {
    padding: 4px 0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }

  .section-header h3 {
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
