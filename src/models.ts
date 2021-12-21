export interface MetaDataObject {
  batchId: string;
  productTitle: string;
  productId: string | number;
}

export interface GeneratorRequest {
  callback_url: string;
  product_data: any;
  writer_id: string;
  categories: any;
  field_mapping: any;
  metadata: string;
  test: boolean;
}

export interface GeneratorResponse {
  generation_id: string;
  status: string;
  created_at: string;
  metadata: string;
  account: any;
}

export interface GenerationBatch {
  batchId: string;
  length: number;
  results: any[];
  processed: any[];
  errors: any[];
}
