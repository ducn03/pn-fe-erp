<script lang="ts">
  import { Table, Badge, Button, toast } from '#lib/premier-ui';
  import type { ProductBatch } from '../inventory.types';

  interface Props {
    batches: ProductBatch[];
    onviewdetail?: (batch: ProductBatch) => void;
  }

  let { batches, onviewdetail }: Props = $props();

  function formatPrice(val: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }

  function getBadgeVariant(status: ProductBatch['status']) {
    switch (status) {
      case 'IN_STOCK':
        return 'success';
      case 'LOW_STOCK':
        return 'warning';
      case 'OUT_OF_STOCK':
        return 'error';
      default:
        return 'neutral';
    }
  }

  function getStatusLabel(status: ProductBatch['status']) {
    switch (status) {
      case 'IN_STOCK':
        return 'Còn hàng';
      case 'LOW_STOCK':
        return 'Sắp hết';
      case 'OUT_OF_STOCK':
        return 'Hết hàng';
      default:
        return status;
    }
  }
</script>

<div class="inventory-table-wrap">
  <Table striped={true} hover={true}>
    <thead>
      <tr>
        <th>Mã lô</th>
        <th>Tên sản phẩm</th>
        <th>Phân loại</th>
        <th>Xuất xứ</th>
        <th style="text-align: right;">Tồn kho</th>
        <th style="text-align: right;">Đơn giá</th>
        <th>Trạng thái</th>
        <th>Cập nhật</th>
        <th style="text-align: right;">Thao tác</th>
      </tr>
    </thead>
    <tbody>
      {#each batches as b (b.id)}
        <tr>
          <td><strong>{b.code}</strong></td>
          <td>{b.name}</td>
          <td>{b.category}</td>
          <td>{b.origin}</td>
          <td style="text-align: right;">{b.quantityKg.toLocaleString('vi-VN')} kg</td>
          <td style="text-align: right;">{formatPrice(b.unitPrice)}</td>
          <td>
            <Badge variant={getBadgeVariant(b.status)}>{getStatusLabel(b.status)}</Badge>
          </td>
          <td>{b.updatedAt}</td>
          <td style="text-align: right;">
            <Button
              size="sm"
              variant="ghost"
              onclick={() => {
                if (onviewdetail) onviewdetail(b);
                else toast.info(`Đang xem chi tiết lô hạt: ${b.code} - ${b.name}`);
              }}
            >
              Chi tiết
            </Button>
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="9" class="empty-state">Không có lô hạt nào trong kho</td>
        </tr>
      {/each}
    </tbody>
  </Table>
</div>

<style>
  .inventory-table-wrap {
    background: var(--pn-paper);
    border-radius: var(--pn-radius);
    overflow: hidden;
  }

  .empty-state {
    text-align: center;
    padding: 32px;
    color: var(--pn-ink-soft);
    font-style: italic;
  }
</style>
