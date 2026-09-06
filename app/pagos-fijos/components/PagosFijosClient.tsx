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

  // Group payments by title
  const groupedPayments = useMemo(() => {
    const groups = new Map<string, FixedPayment[]>();
    payments.forEach(p => {
      if (!groups.has(p.title)) {
        groups.set(p.title, []);
      }
      groups.get(p.title)!.push(p);
    });

    return Array.from(groups.values()).map(group => {
      const unpaid = group.filter(p => !p.is_paid);
      const isPaid = unpaid.length === 0;
      
      // If paid, show the most recent amount. If unpaid, sum the unpaid amounts.
      const amount = isPaid 
        ? group[0].amount // Arbitrarily take first if all paid
        : unpaid.reduce((sum, p) => sum + p.amount, 0);

      const isAccumulated = unpaid.length > 1;

      return {
        // We use a composite ID or just pass all IDs to the card
        id: isPaid ? group.map(p => p.id).join(',') : unpaid.map(p => p.id).join(','),
        originalIds: isPaid ? group.map(p => p.id) : unpaid.map(p => p.id),
        category: group[0].category,
        is_paid: isPaid,
        responsible: group[0].responsible,
        title: group[0].title,
        amount,
        subtitle: isAccumulated ? `Acumulado (${unpaid.length} meses)` : group[0].subtitle,
        period: isAccumulated 
          ? unpaid.map(p => p.period || '').join(', ') 
          : (isPaid ? group[group.length - 1].period : unpaid[0].period)
      };
    });
  }, [payments]);

  const handleToggleStatus = async (compositeId: string, currentStatus: boolean, originalIds?: string[]) => {
    const idsToToggle = originalIds || [compositeId];
    // Optimistic update
    setPayments((prev) =>
      prev.map((payment) =>
        idsToToggle.includes(payment.id) ? { ...payment, is_paid: !currentStatus } : payment
      )
    );
    try {
      await togglePaymentStatus(idsToToggle, currentStatus);
    } catch (e) {
      // Revert if error
      setPayments((prev) =>
        prev.map((payment) =>
          idsToToggle.includes(payment.id) ? { ...payment, is_paid: currentStatus } : payment
        )
      );
    }
  };

  // Metrics calculation based on GROUPED payments (so 1 group = 1 obligation)
  const { totalPaid, totalPending, paidCount, pendingCount } = useMemo(() => {
    let tPaid = 0;
    let tPending = 0;
    let pCount = 0;
    let pendCount = 0;

    groupedPayments.forEach((payment) => {
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
  }, [groupedPayments]);

  const totalItems = paidCount + pendingCount;
  const progressPercent = totalItems > 0 ? Math.round((paidCount / totalItems) * 100) : 0;

  // Filtering and Searching
  const filteredPayments = useMemo(() => {
    return groupedPayments.filter((payment) => {
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
  }, [groupedPayments, currentFilter, searchQuery]);

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
            <PaymentCard 
              key={payment.id} 
              payment={payment as any} 
              onToggleStatus={(id, status) => handleToggleStatus(id, status, (payment as any).originalIds)} 
            />
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
