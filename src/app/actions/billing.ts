'use server';

import { mockBillingData } from '@/data/mockData';
import { BillingRecord, PaymentStatus } from '@/types/billing';
import { revalidatePath } from 'next/cache';

let billingData = [...mockBillingData];

export async function getBillingData(): Promise<BillingRecord[]> {
  return [...billingData];
}

export async function updateClaimStatus(
  patientId: string,
  newStatus: PaymentStatus
): Promise<BillingRecord> {
  const updatedData = billingData.map((record) =>
    record.patient_id === patientId
      ? { ...record, payment_status: newStatus }
      : record
  );

  billingData = updatedData;

  revalidatePath('/dashboard');

  return billingData.find((record) => record.patient_id === patientId)!;
}

export async function resetBillingData(): Promise<void> {
  billingData = [...mockBillingData];
  revalidatePath('/dashboard');
}
