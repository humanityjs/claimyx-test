export type PaymentStatus = 'Pending' | 'Approved' | 'Denied';

export interface BillingRecord {
  patient_id: string;
  patient_name: string;
  billing_code: string;
  amount: number;
  insurance_provider: string;
  payment_status: PaymentStatus;
  claim_date: string;
}

export interface PaymentProbabilities {
  pending: number;
  approved: number;
  denied: number;
}

export interface SimulationResult {
  mean: number;
  min: number;
  max: number;
  results: number[];
}
