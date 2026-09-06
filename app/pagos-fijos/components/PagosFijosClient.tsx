'use client';

import { useState, useMemo } from 'react';
import { MetricsSummary } from './MetricsSummary';
import { SearchAndFilters, FilterType } from './SearchAndFilters';
import { PaymentCard, FixedPayment } from './PaymentCard';
import { togglePaymentStatus } from '@/app/actions/fixed_payments';

interface PagosFijosClientProps {
  initialPayments: FixedPayment[];
}

export function PagosFijosClient({ initialPayments }: PagosFijosClientProps) {
  const [payments, setPayments] = useState<FixedPayment[]>(initialPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === id ? { ...payment, is_paid: !payment.is_paid } : payment
      )
    );
    try {
      await togglePaymentStatus(id, currentStatus);
    } catch (e) {
      // Revert if error
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === id ? { ...payment, is_paid: currentStatus } : payment
        )
      );
    }
  };

  // Metrics calculation
  const { totalPaid, totalPending, paidCount, pendingCount } = useMemo(() => {
    let tPaid = 0;
    let tPending = 0;
    let pCount = 0;
    let pendCount = 0;

    payments.forEach((payment) => {
      if (payment.is_paid) {
        tPaid += payment.amount;
        pCount++;
      } else {
        tPending += payment.amount;
        pendCount++;
      }
    });

    return {
      totalPaid: tPaid,
      totalPending: tPending,
      paidCount: pCount,
      pendingCount: pendCount,
    };
  }, [payments]);

  const totalItems = paidCount + pendingCount;
  const progressPercent = totalItems > 0 ? Math.round((paidCount / totalItems) * 100) : 0;

  // Filtering and Searching
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Filter by status
      if (currentFilter === 'pending' && payment.is_paid) return false;
      if (currentFilter === 'paid' && !payment.is_paid) return false;

      // Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        if (!payment.title.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [payments, currentFilter, searchQuery]);

  return (
    <>
      <MetricsSummary
        totalPaid={totalPaid}
        totalPending={totalPending}
        paidCount={paidCount}
        pendingCount={pendingCount}
        progressPercent={progressPercent}
      />

      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        totalCount={totalItems}
        pendingCount={pendingCount}
        paidCount={paidCount}
      />

      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            Obligaciones Predeterminadas
          </h3>
          <span className="text-xs text-slate-600">Toque directo para registrar pago</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPayments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} onToggleStatus={handleToggleStatus} />
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 mt-2">
            <svg
              className="mx-auto h-12 w-12 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-slate-900">No se encontraron pagos</h3>
            <p className="mt-1 text-xs text-slate-600">
              Intente buscar con otro término como 'luz', 'seguro' o 'guardería'.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
