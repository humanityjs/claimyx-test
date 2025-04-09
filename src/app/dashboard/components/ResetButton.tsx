'use client';

import { resetBillingData } from '@/app/actions/billing';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function ResetButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleReset = () => {
    startTransition(async () => {
      await resetBillingData();
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleReset}
      disabled={isPending}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
      Reset Data
    </Button>
  );
}
