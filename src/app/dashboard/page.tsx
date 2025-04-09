import { getBillingData } from '@/app/actions/billing';
import { ClaimsTable } from '@/app/dashboard/components/ClaimsTable';
import { DashboardSummary } from '@/app/dashboard/components/DashboardSummary';
import { ResetButton } from '@/app/dashboard/components/ResetButton';
import { RevenueForecast } from '@/app/dashboard/components/RevenueForecast';

export default async function DashboardPage() {
  const billingData = await getBillingData();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Healthcare Billing Dashboard</h1>
        <ResetButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSummary billingData={billingData} />
        <RevenueForecast billingData={billingData} />
      </div>

      <div className="mt-8">
        <ClaimsTable billingData={billingData} />
      </div>
    </div>
  );
}
