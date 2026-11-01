<script lang="ts">
  import {
    Button,
    Card,
    PageHeader,
    Input,
    Select,
    Forbidden403,
    toast
  } from '$ui';
  import { authStore } from '$core/stores';
  import {
    InventoryTable,
    NewBatchModal,
    getInventoryBatches,
    type ProductBatch
  } from '$features/inventory';

  let hasAccess = $derived(authStore.hasPermission('INVENTORY_VIEW'));

  let batches = $state<ProductBatch[]>([]);
  let searchQuery = $state('');
  let selectedCategory = $state('ALL');
  let isModalOpen = $state(false);

  $effect(() => {
    getInventoryBatches().then((data) => (batches = data));
  });

  // Filter batches reactively
  let filteredBatches = $derived(
    batches.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.origin.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'ALL' || b.category.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchSearch && matchCategory;
    })
  );

  let totalKg = $derived(filteredBatches.reduce((acc, cur) => acc + cur.quantityKg, 0));
  let totalValue = $derived(
    filteredBatches.reduce((acc, cur) => acc + cur.quantityKg * cur.unitPrice, 0)
  );

  function formatCurrency(val: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }

  function handleBatchCreated(newBatch: ProductBatch) {
    batches = [newBatch, ...batches];
  }
</script>

{#if !hasAccess}
  <Forbidden403
    title="Quyền Truy Cập Kho Bị Từ Chối"
    description="Bạn không có quyền hạn tra cứu hoặc quản lý tồn kho nguyên liệu."
    requiredPermission="INVENTORY_VIEW"
  />
{:else}
<PageHeader>
  {#snippet actions()}
    <Button variant="secondary" onclick={() => toast.info('Đang xuất báo cáo tồn kho Excel...')}>
      Xuất báo cáo
    </Button>
    <Button variant="primary" onclick={() => (isModalOpen = true)}>
      + Nhập lô hạt mới
    </Button>
  {/snippet}
</PageHeader>

<!-- Mini metric cards for warehouse -->
<div class="warehouse-metrics">
  <div class="metric-box">
    <span class="metric-label">Tổng khối lượng tồn kho</span>
    <span class="metric-val">{totalKg.toLocaleString('vi-VN')} kg</span>
  </div>
  <div class="metric-box">
    <span class="metric-label">Ước tính giá trị kho</span>
    <span class="metric-val">{formatCurrency(totalValue)}</span>
  </div>
  <div class="metric-box">
    <span class="metric-label">Số lô hạt đang lưu kho</span>
    <span class="metric-val">{filteredBatches.length} lô</span>
  </div>
</div>

<!-- Filter & Search Toolbar -->
<Card accent="orange">
  <div class="filter-bar">
    <div class="filter-inputs">
      <Input
        placeholder="Tìm theo tên hạt, mã lô, vùng trồng..."
        bind:value={searchQuery}
      />
      <Select
        placeholder="Tất cả phân loại"
        bind:value={selectedCategory}
        options={[
          { value: 'ALL', label: 'Tất cả loại hạt' },
          { value: 'Hạt điều', label: 'Hạt điều' },
          { value: 'Macca', label: 'Hạt Macca' },
          { value: 'Hạnh nhân', label: 'Hạnh nhân' },
          { value: 'Óc chó', label: 'Hạt óc chó' },
          { value: 'Dẻ cười', label: 'Hạt dẻ cười' }
        ]}
      />
    </div>

    <Button variant="outline" size="sm" onclick={() => { searchQuery = ''; selectedCategory = 'ALL'; }}>
      Đặt lại bộ lọc
    </Button>
  </div>

  <InventoryTable batches={filteredBatches} />
</Card>

<NewBatchModal
  bind:open={isModalOpen}
  oncreated={handleBatchCreated}
/>
{/if}

<style>
  .warehouse-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .metric-box {
    background: var(--pn-paper);
    border: 1px solid var(--pn-line);
    border-radius: var(--pn-radius);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .metric-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--pn-ink-soft);
  }

  .metric-val {
    font-size: 20px;
    font-weight: 800;
    color: var(--pn-ink);
  }

  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  .filter-inputs {
    display: flex;
    gap: 14px;
    flex: 1;
    min-width: 280px;
  }
</style>
