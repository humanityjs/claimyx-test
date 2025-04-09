'use client';

import { updateClaimStatus } from '@/app/actions/billing';
import { Badge } from '@/components/ui/badge';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BillingRecord, PaymentStatus } from '@/types/billing';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface ClaimsTableProps {
  billingData: BillingRecord[];
}

const STATUS_CONFIG = {
  Pending: {
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    icon: AlertCircle,
    message: 'This claim is pending review',
  },
  Approved: {
    color: 'bg-green-100 text-green-800 hover:bg-green-200',
    icon: CheckCircle,
    message: 'This claim has been approved and cannot be modified',
  },
  Denied: {
    color: 'bg-red-100 text-red-800 hover:bg-red-200',
    icon: XCircle,
    message: 'This claim has been denied and cannot be modified',
  },
};

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

  // Helper to render claim status with appropriate styling
  const renderStatus = (status: PaymentStatus) => {
    const { color, icon: Icon, message } = STATUS_CONFIG[status];

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={color}>
              <Icon className="h-3.5 w-3.5 mr-1" />
              {status}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderActionButtons = (record: BillingRecord) => {
    const { payment_status, patient_id } = record;

    if (payment_status === 'Approved' || payment_status === 'Denied') {
      return null;
    }

    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate(patient_id, 'Approved')}
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate(patient_id, 'Denied')}
        >
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Deny
        </Button>
      </div>
    );
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
              <TableRow
                key={record.patient_id}
                className={
                  record.payment_status === 'Approved'
                    ? 'bg-green-50'
                    : record.payment_status === 'Denied'
                    ? 'bg-red-50'
                    : ''
                }
              >
                <TableCell>{record.patient_name}</TableCell>
                <TableCell>{record.billing_code}</TableCell>
                <TableCell>${record.amount.toLocaleString()}</TableCell>
                <TableCell>{record.insurance_provider}</TableCell>
                <TableCell>{renderStatus(record.payment_status)}</TableCell>
                <TableCell>
                  {new Date(record.claim_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>{renderActionButtons(record)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
