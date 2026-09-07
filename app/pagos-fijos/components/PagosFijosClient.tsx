'use client';

import { useState, useMemo, useEffect } from 'react';
import { MetricsSummary } from './MetricsSummary';
import { SearchAndFilters, FilterType } from './SearchAndFilters';
import { PaymentCard, FixedPayment } from './PaymentCard';
import { togglePaymentStatus, partialPayment as partialPaymentAction } from '@/app/actions/fixed_payments';
import { PartialPaymentModal } from './PartialPaymentModal';
import { DailyExpense } from '@/app/actions/daily_expenses';

interface PagosFijosClientProps {
  initialPayments: FixedPayment[];
  initialDailyExpenses?: DailyExpense[];
}

export function PagosFijosClient({ initialPayments, initialDailyExpenses = [] }: PagosFijosClientProps) {
  const [payments, setPayments] = useState<FixedPayment[]>(initialPayments);
  
  // Partial payment state
  const [selectedForPartial, setSelectedForPartial] = useState<FixedPayment | null>(null);
  
  // Sync state with server prop on revalidation
  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  
  // Default to current month YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  });

  // Filter payments by selectedMonth (rollover logic)
  const monthFilteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (!p.period) return true; // If no period, include it always just in case
      // Include if it belongs to selected month
      if (p.period === selectedMonth) return true;
      // Rollover: Include if it belongs to a past month AND is unpaid
      if (p.period < selectedMonth && !p.is_paid) {
        // Do not rollover smart budgets like Supermercado or Gasolina
        if (p.title === 'Supermercado' || p.title === 'Gasolina') return false;
        return true;
      }
      return false;
    });
  }, [payments, selectedMonth]);

  // Compute accumulated amounts from daily expenses for smart cards
  const { superSpent, gasSpent, luzSpent } = useMemo(() => {
    let superAcc = 0;
    let gasAcc = 0;
    let luzAcc = 0;
    initialDailyExpenses.forEach(e => {
      if (e.date.startsWith(selectedMonth)) {
        if (e.category === 'Supermercado' || e.category === 'Compras Super y tiendas') {
          superAcc += e.amount;
        } else if (e.category === 'Gasolina' || e.category === 'Transporte') {
          gasAcc += e.amount;
        } else if (e.category === 'Luz (Electricidad)') {
          luzAcc += e.amount;
        }
      }
    });
    return { superSpent: superAcc, gasSpent: gasAcc, luzSpent: luzAcc };
  }, [initialDailyExpenses, selectedMonth]);

  // Group payments by title (using only the month-filtered ones)
  const groupedPayments = useMemo(() => {
    const groups = new Map<string, FixedPayment[]>();
    monthFilteredPayments.forEach(p => {
      if (!groups.has(p.title)) {
        groups.set(p.title, []);
      }
      groups.get(p.title)!.push(p);
    });

    const grouped = Array.from(groups.values()).map(group => {
      const unpaid = group.filter(p => !p.is_paid);
      const isPaid = unpaid.length === 0;
      
      // If paid, show the most recent amount. If unpaid, sum the unpaid amounts.
      const amount = isPaid 
        ? group[0].amount // Arbitrarily take first if all paid
        : unpaid.reduce((sum, p) => sum + p.amount, 0);

      const isAccumulated = unpaid.length > 1;

        const isSmartCard = group[0].title === 'Supermercado' || group[0].title === 'Gasolina' || group[0].title === 'Luz (Electricidad)' || group[0].title === 'Electricidad Naturgy';
        const accumulatedSpent = group[0].title === 'Supermercado' ? superSpent : (group[0].title === 'Gasolina' ? gasSpent : luzSpent);

        return {
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
            : (isPaid ? group[group.length - 1].period : unpaid[0].period),
          isSmartCard,
          accumulatedSpent
        };
    });
    
    // Sort so pending items (is_paid === false) appear first
    return grouped.sort((a, b) => {
      if (a.is_paid === b.is_paid) return 0;
      return a.is_paid ? 1 : -1;
    });
  }, [monthFilteredPayments]);

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

  const handlePartialPaymentSubmit = async (partialAmount: number) => {
    if (!selectedForPartial) return;
    
    const originalRecord = payments.find(p => p.id === (selectedForPartial as any).originalIds?.[0] || p.id === selectedForPartial.id);
    if (!originalRecord) return;

    // Optimistic update
    const newPaidRecord: FixedPayment = {
      ...originalRecord,
      id: `temp-${Date.now()}`,
      is_paid: true,
      amount: partialAmount,
    };

    setPayments((prev) => {
      const updated = prev.map(p => 
        p.id === originalRecord.id ? { ...p, amount: p.amount - partialAmount } : p
      );
      return [...updated, newPaidRecord];
    });

    try {
      await partialPaymentAction(originalRecord.id, partialAmount);
    } catch (e) {
      // Very simple revert (relies on next revalidation to fully fix if error happens)
      setPayments(initialPayments);
    }
  };

  // Metrics calculation based on RAW month-filtered payments
  const { totalPaid, totalPending, paidCount, pendingCount } = useMemo(() => {
    let tPaid = 0;
    let tPending = 0;
    let pCount = 0;
    let pendCount = 0;

    monthFilteredPayments.forEach((payment) => {
      const isSmart = payment.title === 'Supermercado' || payment.title === 'Gasolina' || payment.title === 'Luz (Electricidad)' || payment.title === 'Electricidad Naturgy';
      
      if (isSmart) {
        const spent = payment.title === 'Supermercado' ? superSpent : (payment.title === 'Gasolina' ? gasSpent : luzSpent);
        const pending = Math.max(payment.amount - spent, 0);
        
        tPaid += spent;
        tPending += pending;
        
        if (spent >= payment.amount) pCount++;
        else pendCount++;
      } else {
        if (payment.is_paid) {
          tPaid += payment.amount;
          pCount++;
        } else {
          tPending += payment.amount;
          pendCount++;
        }
      }
    });

    return {
      totalPaid: tPaid,
      totalPending: tPending,
      paidCount: pCount,
      pendingCount: pendCount,
    };
  }, [monthFilteredPayments]);

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

  // Helper for Month Selector UI
  const handleMonthChange = (increment: number) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + increment, 1);
    const newM = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${d.getFullYear()}-${newM}`);
  };

  const getMonthLabel = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1, 1);
    const name = d.toLocaleString('es-ES', { month: 'long' });
    return `${name.charAt(0).toUpperCase() + name.slice(1)} ${y}`;
  };

  return (
    <>
      {/* Month Selector */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center bg-white border border-slate-200 rounded-full shadow-sm p-1">
          <button 
            onClick={() => handleMonthChange(-1)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <span className="w-40 text-center text-sm font-bold text-slate-800">
            {getMonthLabel()}
          </span>
          <button 
            onClick={() => handleMonthChange(1)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>

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
              onPartialPayment={!payment.is_paid ? () => setSelectedForPartial(payment as any) : undefined}
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
      
      <PartialPaymentModal 
        isOpen={!!selectedForPartial}
        payment={selectedForPartial}
        onClose={() => setSelectedForPartial(null)}
        onSubmit={handlePartialPaymentSubmit}
      />
    </>
  );
}
