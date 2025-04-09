'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  BillingRecord,
  PaymentProbabilities,
  PaymentStatus,
  SimulationResult,
} from '@/types/billing';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const NUM_SIMULATIONS = 2000;

function runMonteCarloSimulation(
  data: BillingRecord[],
  probabilities: PaymentProbabilities
): SimulationResult {
  if (!data.length) {
    return {
      mean: 0,
      min: 0,
      max: 0,
      results: [],
    };
  }

  const results: number[] = [];

  const seed = 42;
  let randomState = seed;

  // Simple deterministic random number generator
  const seededRandom = () => {
    randomState = (randomState * 9301 + 49297) % 233280;
    return randomState / 233280;
  };

  for (let i = 0; i < NUM_SIMULATIONS; i++) {
    let totalRevenue = 0;

    for (const claim of data) {
      const random = seededRandom();
      let paymentProbability = 0;

      switch (claim.payment_status) {
        case 'Pending':
          paymentProbability = probabilities.pending;
          break;
        case 'Approved':
          paymentProbability = probabilities.approved;
          break;
        case 'Denied':
          paymentProbability = probabilities.denied;
          break;
        default:
          console.warn(`Unknown payment status: ${claim.payment_status}`);
          continue;
      }

      if (random <= paymentProbability) {
        totalRevenue += claim.amount;
      }
    }

    results.push(totalRevenue);
  }

  results.sort((a, b) => a - b);

  const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
  const min = results[0];
  const max = results[results.length - 1];

  return {
    mean,
    min,
    max,
    results: [...results],
  };
}

interface RevenueForecastProps {
  billingData: BillingRecord[];
}

export function RevenueForecast({ billingData }: RevenueForecastProps) {
  // Calculate initial probabilities based on billing data
  const initialProbabilities = useMemo(() => {
    const statusCounts = billingData.reduce((acc, claim) => {
      acc[claim.payment_status] = (acc[claim.payment_status] || 0) + 1;
      return acc;
    }, {} as Record<PaymentStatus, number>);

    const totalClaims = billingData.length;

    if (totalClaims === 0) {
      return {
        pending: 0.5,
        approved: 0.8,
        denied: 0.1,
      };
    }

    // Use realistic minimums even when no claims of that status exist
    const pendingProb = statusCounts.Pending
      ? Math.min(0.5, statusCounts.Pending / totalClaims + 0.2)
      : 0.5;

    const approvedProb = statusCounts.Approved
      ? Math.max(0.8, statusCounts.Approved / totalClaims + 0.5)
      : 0.8;

    const deniedProb = statusCounts.Denied
      ? Math.min(0.2, statusCounts.Denied / totalClaims + 0.05)
      : 0.1;

    return {
      pending: pendingProb,
      approved: approvedProb,
      denied: deniedProb,
    };
  }, [billingData]);

  const [probabilities, setProbabilities] =
    useState<PaymentProbabilities>(initialProbabilities);

  const simulationResult = useMemo(
    () => runMonteCarloSimulation(billingData, probabilities),
    [billingData, probabilities]
  );

  const chartData = useMemo(() => {
    const sortedResults = [...simulationResult.results].sort((a, b) => a - b);
    const dataPoints = 20;
    const step = Math.floor(sortedResults.length / dataPoints);

    return Array.from({ length: dataPoints }, (_, i) => {
      const index = i * step;
      const percentile = Math.round((index / sortedResults.length) * 100);
      return {
        percentile,
        percentileLabel: `Percentile: ${percentile}%`,
        revenue: sortedResults[index],
        revenueLabel: `Revenue: $${sortedResults[index].toLocaleString()}`,
      };
    });
  }, [simulationResult]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="percentile"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) =>
                  [25, 50, 75].includes(value) ? `${value}%` : ''
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                width={80}
                // domain={['dataMin', 'dataMax']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  fontSize: 13,
                }}
                formatter={(_, __, item) => {
                  return [undefined, item.payload.revenueLabel];
                }}
                labelFormatter={(_, items) => {
                  const item = items[0];
                  return item ? item.payload.percentileLabel : '';
                }}
              />
              <ReferenceLine
                y={simulationResult.mean}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                label={{
                  value: `Expected: $${simulationResult.mean
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
                  position: 'top',
                  fill: '#3b82f6',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Pending Claims Probability
            </label>
            <Slider
              value={[probabilities.pending * 100]}
              onValueChange={([value]) =>
                setProbabilities({ ...probabilities, pending: value / 100 })
              }
              max={100}
              step={1}
              className="mt-2"
            />
            <div className="text-sm text-gray-500 mt-1">
              {Math.round(probabilities.pending * 100)}%
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Approved Claims Probability
            </label>
            <Slider
              value={[probabilities.approved * 100]}
              onValueChange={([value]) =>
                setProbabilities({ ...probabilities, approved: value / 100 })
              }
              max={100}
              step={1}
              className="mt-2"
            />
            <div className="text-sm text-gray-500 mt-1">
              {Math.round(probabilities.approved * 100)}%
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Denied Claims Probability
            </label>
            <Slider
              value={[probabilities.denied * 100]}
              onValueChange={([value]) =>
                setProbabilities({ ...probabilities, denied: value / 100 })
              }
              max={100}
              step={1}
              className="mt-2"
            />
            <div className="text-sm text-gray-500 mt-1">
              {Math.round(probabilities.denied * 100)}%
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Simulation Results</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Expected Revenue</p>
              <p className="text-xl font-bold">
                $
                {simulationResult.mean
                  .toFixed(2)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Range</p>
              <p className="text-xl font-bold">
                ${simulationResult.min.toLocaleString()} - $
                {simulationResult.max.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
