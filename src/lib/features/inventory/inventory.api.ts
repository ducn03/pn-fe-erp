import { apiClient } from '$core/api';
import { ENDPOINTS } from '$core/api';
import { InventoryStockStatus } from '$core/constants';
import type { ProductBatch, CreateBatchInput } from './inventory.types';

function calculateStockStatus(quantityKg: number): InventoryStockStatus {
  if (quantityKg > 500) {
    return InventoryStockStatus.IN_STOCK;
  }
  if (quantityKg > 0) {
    return InventoryStockStatus.LOW_STOCK;
  }
  return InventoryStockStatus.OUT_OF_STOCK;
}

// Mock database simulating Spring Boot backend persistence
let mockBatches: ProductBatch[] = [
  {
    id: '1',
    code: 'PN-01',
    name: 'Hạt điều rang muối A-Grade',
    category: 'Hạt điều',
    origin: 'Bình Phước',
    quantityKg: 1250,
    unitPrice: 285000,
    status: InventoryStockStatus.IN_STOCK,
    updatedAt: '31/10/2026'
  },
  {
    id: '2',
    code: 'PN-02',
    name: 'Hạt Macca sấy nứt vỏ Úc',
    category: 'Macca',
    origin: 'Đắk Lắk',
    quantityKg: 480,
    unitPrice: 320000,
    status: InventoryStockStatus.LOW_STOCK,
    updatedAt: '30/10/2026'
  },
  {
    id: '3',
    code: 'PN-03',
    name: 'Hạnh nhân sấy mộc Organic',
    category: 'Hạnh nhân',
    origin: 'California',
    quantityKg: 820,
    unitPrice: 260000,
    status: InventoryStockStatus.IN_STOCK,
    updatedAt: '29/10/2026'
  },
  {
    id: '4',
    code: 'PN-04',
    name: 'Hạt dẻ cười không tẩy trắng',
    category: 'Dẻ cười',
    origin: 'Mỹ',
    quantityKg: 0,
    unitPrice: 390000,
    status: InventoryStockStatus.OUT_OF_STOCK,
    updatedAt: '28/10/2026'
  },
  {
    id: '5',
    code: 'PN-05',
    name: 'Hạt óc chó vàng nguyên vỏ',
    category: 'Óc chó',
    origin: 'Chile',
    quantityKg: 650,
    unitPrice: 210000,
    status: InventoryStockStatus.IN_STOCK,
    updatedAt: '27/10/2026'
  }
];

export async function getInventoryBatches(): Promise<ProductBatch[]> {
  try {
    const res = await apiClient.get<ProductBatch[]>(ENDPOINTS.INVENTORY.BATCHES);
    if (res && Array.isArray(res)) return res;
    return [...mockBatches];
  } catch {
    return [...mockBatches];
  }
}

export async function createInventoryBatch(input: CreateBatchInput): Promise<ProductBatch> {
  try {
    const res = await apiClient.post<ProductBatch>(ENDPOINTS.INVENTORY.BATCHES, input);
    if (res && res.code) return res;
  } catch {
    // fallback
  }

  let qty = 100;
  if (input.quantityKg) {
    qty = input.quantityKg;
  }

  let price = 250000;
  if (input.unitPrice) {
    price = input.unitPrice;
  }

  const newBatch: ProductBatch = {
    id: String(mockBatches.length + 1),
    code: `PN-0${mockBatches.length + 1}`,
    name: input.name,
    category: input.category || 'Hạt các loại',
    origin: input.origin || 'Việt Nam',
    quantityKg: qty,
    unitPrice: price,
    status: calculateStockStatus(qty),
    updatedAt: new Date().toLocaleDateString('vi-VN')
  };

  mockBatches = [newBatch, ...mockBatches];
  return newBatch;
}
