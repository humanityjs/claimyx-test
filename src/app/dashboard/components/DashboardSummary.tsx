'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BillingRecord, PaymentStatus } from '@/types/billing';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

interface DashboardSummaryProps {
  billingData: BillingRecord[];
}

const STATUS_COLORS = {
  Pending: '#3b82f6',
  Approved: '#22c55e',
  Denied: '#ef4444',
};

const chartConfig = {
  pending: {
    label: 'Pending',
    color: STATUS_COLORS.Pending,
  },
  approved: {
    label: 'Approved',
    color: STATUS_COLORS.Approved,
  },
  denied: {
    label: 'Denied',
    color: STATUS_COLORS.Denied,
  },
} satisfies ChartConfig;

export function DashboardSummary({ billingData }: DashboardSummaryProps) {
  const totalAmount = billingData.reduce((sum, claim) => sum + claim.amount, 0);
  const claimCount = billingData.length;

  const statusCounts = billingData.reduce((acc, claim) => {
    acc[claim.payment_status] = (acc[claim.payment_status] || 0) + 1;
    return acc;
  }, {} as Record<PaymentStatus, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    fill: STATUS_COLORS[status as PaymentStatus],
  }));

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Dashboard Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 h-full flex flex-col">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Total Billing Amount
            </h3>
            <p className="text-2xl font-bold">
              ${totalAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Claims</h3>
            <p className="text-2xl font-bold">{claimCount}</p>
          </div>
        </div>

        <div className="space-y-4 h-full flex-1">
          <div className="flex flex-col gap-4 h-full">
            <h3 className="text-sm font-medium text-gray-500">
              Claim Distribution
            </h3>
            <div className="flex-1">
              <div className="flex h-full items-center justify-center">
                <CardContent className="flex-1">
                  <ChartContainer config={chartConfig} className="">
                    <BarChart accessibilityLayer data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="status"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--color-desktop)"
                        radius={8}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
