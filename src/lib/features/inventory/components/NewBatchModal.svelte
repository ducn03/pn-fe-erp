<script lang="ts">
  import { Modal, Input, Select, Button, toast } from '$ui';
  import { StringHelper } from '$core/utils';
  import { createInventoryBatch } from '../inventory.api';
  import type { ProductBatch } from '../inventory.types';

  interface Props {
    open: boolean;
    oncreated?: (newBatch: ProductBatch) => void;
  }

  let { open = $bindable(false), oncreated }: Props = $props();

  let name = $state('');
  let category = $state('Hạt điều');
  let origin = $state('Bình Phước');
  let quantityKg = $state('');
  let unitPrice = $state('');
  let loading = $state(false);

  async function handleSubmit() {
    const trimmedName = StringHelper.trim(name);
    if (StringHelper.isBlank(trimmedName)) {
      toast.error('Vui lòng nhập tên lô hạt!');
      return;
    }

    loading = true;
    try {
      const created = await createInventoryBatch({
        name: trimmedName,
        category,
        origin: StringHelper.trim(origin),
        quantityKg: Number(quantityKg) || 100,
        unitPrice: Number(unitPrice) || 250000
      });

      toast.success(`Đã thêm thành công lô hạt ${created.code}: ${created.name}`);
      name = '';
      quantityKg = '';
      unitPrice = '';
      open = false;
      if (oncreated) oncreated(created);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo mới lô hạt');
    } finally {
      loading = false;
    }
  }
</script>

<Modal
  bind:open
  title="Thêm Lô Hàng Hạt Mới Vào Kho"
  size="md"
>
  <p class="desc">Điền thông tin lô hạt nhập kho để đồng bộ vào hệ thống Premier Nuts ERP:</p>

  <div class="form-body">
    <Input
      label="Tên sản phẩm hạt"
      placeholder="Ví dụ: Hạt Điều Wasabi A1..."
      bind:value={name}
      required={true}
      hint="Ghi rõ tên thương mại và phân hạng"
    />

    <div class="form-row">
      <Select
        label="Phân loại hạt"
        bind:value={category}
        options={[
          { value: 'Hạt điều', label: 'Hạt điều Bình Phước' },
          { value: 'Macca', label: 'Hạt Macca Tây Nguyên' },
          { value: 'Hạnh nhân', label: 'Hạnh nhân nhập khẩu' },
          { value: 'Óc chó', label: 'Hạt óc chó' },
          { value: 'Dẻ cười', label: 'Hạt dẻ cười' }
        ]}
      />
      <Input
        label="Xuất xứ / Vùng trồng"
        placeholder="Ví dụ: Bình Phước, Đắk Lắk..."
        bind:value={origin}
      />
    </div>

    <div class="form-row">
      <Input
        label="Khối lượng nhập (kg)"
        type="number"
        placeholder="Ví dụ: 1000"
        bind:value={quantityKg}
        required={true}
      />
      <Input
        label="Đơn giá nhập (VNĐ/kg)"
        type="number"
        placeholder="Ví dụ: 250000"
        bind:value={unitPrice}
      />
    </div>
  </div>

  {#snippet footer()}
    <Button variant="secondary" onclick={() => (open = false)} disabled={loading}>
      Hủy bỏ
    </Button>
    <Button variant="primary" onclick={handleSubmit} disabled={loading}>
      {loading ? 'Đang lưu...' : 'Xác nhận nhập kho'}
    </Button>
  {/snippet}
</Modal>

<style>
  .desc {
    margin: 0 0 16px;
    font-size: 13.5px;
    color: var(--pn-ink-soft);
  }

  .form-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
</style>
