export type BatchStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface ProductBatch {
  id: string;
  code: string;
  name: string;
  category: string;
  origin: string;
  quantityKg: number;
  unitPrice: number;
  status: BatchStatus;
  updatedAt: string;
}

export interface CreateBatchInput {
  name: string;
  category: string;
  origin: string;
  quantityKg: number;
  unitPrice: number;
}
