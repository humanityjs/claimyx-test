'use client';

import { updateClaimStatus } from '@/app/actions/billing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BillingRecord, PaymentStatus } from '@/types/billing';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useState } from 'react';

interface ClaimsTableProps {
  billingData: BillingRecord[];
}

export function ClaimsTable({ billingData }: ClaimsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>(
    'all'
  );
  const [sortField, setSortField] = useState<keyof BillingRecord>('claim_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleStatusUpdate = async (
    patientId: string,
    newStatus: PaymentStatus
  ) => {
    await updateClaimStatus(patientId, newStatus);
  };

  const filteredData = billingData
    .filter((record) => {
      const matchesSearch = Object.values(record).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus =
        statusFilter === 'all' || record.payment_status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });

  const handleSort = (field: keyof BillingRecord) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIndicator = (field: keyof BillingRecord) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? (
        <ArrowUp className="inline ml-1 h-4 w-4" />
      ) : (
        <ArrowDown className="inline ml-1 h-4 w-4" />
      );
    }

    return <ArrowDown className="inline ml-1 h-4 w-4 text-gray-300" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search all fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as PaymentStatus | 'all')
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('patient_name')}
              >
                Patient Name {renderSortIndicator('patient_name')}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('billing_code')}
              >
                Billing Code {renderSortIndicator('billing_code')}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                Amount {renderSortIndicator('amount')}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('insurance_provider')}
              >
                Insurance Provider {renderSortIndicator('insurance_provider')}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('payment_status')}
              >
                Status {renderSortIndicator('payment_status')}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('claim_date')}
              >
                Claim Date {renderSortIndicator('claim_date')}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((record) => (
              <TableRow key={record.patient_id}>
                <TableCell>{record.patient_name}</TableCell>
                <TableCell>{record.billing_code}</TableCell>
                <TableCell>${record.amount.toLocaleString()}</TableCell>
                <TableCell>{record.insurance_provider}</TableCell>
                <TableCell>{record.payment_status}</TableCell>
                <TableCell>
                  {new Date(record.claim_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleStatusUpdate(record.patient_id, 'Approved')
                      }
                      disabled={record.payment_status === 'Approved'}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleStatusUpdate(record.patient_id, 'Denied')
                      }
                      disabled={record.payment_status === 'Denied'}
                    >
                      Deny
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
