"use client";

import { useState } from "react";
import { Service } from "./ServicesTable";

// Generate 14 mock bills for pagination demonstration
const mockBills = Array.from({ length: 14 }).map((_, i) => {
  const date = new Date(2026, 2 - i, 1);
  return {
    id: `b${i + 1}`,
    month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
    amount: `$${(Math.random() * 500 + 500).toFixed(2)}`,
    status: i === 0 ? "Pending" : "Paid",
    datePaid: i === 0 ? "-" : new Date(2026, 2 - i, Math.floor(Math.random() * 10) + 1).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    invoiceUri: "#"
  };
});

export default function BillingTable({ clientServices = [] }: { clientServices?: Service[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const recordsPerPage = 5;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = mockBills.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(mockBills.length / recordsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const validServices = clientServices.filter(s => {
    if (s.status !== 'Active') return false;
    const today = new Date().toISOString().split('T')[0];
    if (s.startDate && s.endDate) {
      if (today < s.startDate || today > s.endDate) return false;
    }
    return true;
  });

  const payableTotal = validServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="p-5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Billing & Payments</h2>
        <button 
          onClick={() => setIsRecordPaymentOpen(true)}
          className="text-sm px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium text-center"
        >
          Record Payment
        </button>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm mb-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase text-zinc-500 dark:text-zinc-400 font-medium">
              <th className="py-2.5 px-4 whitespace-nowrap">Billing Period</th>
              <th className="py-2.5 px-4 whitespace-nowrap">Amount</th>
              <th className="py-2.5 px-4 whitespace-nowrap">Status</th>
              <th className="py-2.5 px-4 whitespace-nowrap">Date Paid</th>
              <th className="py-2.5 px-4 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {currentRecords.map((bill) => (
              <tr key={bill.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                <td className="py-2.5 px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{bill.month}</td>
                <td className="py-2.5 px-4 text-sm text-zinc-600 dark:text-zinc-300 whitespace-nowrap">{bill.amount}</td>
                <td className="py-2.5 px-4 text-sm whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    bill.status === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-500/90'
                  }`}>
                    {bill.status}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{bill.datePaid}</td>
                <td className="py-2.5 px-4 text-sm text-right whitespace-nowrap">
                  <a href={bill.invoiceUri} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                    Receipt
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden space-y-3 mb-4">
        {currentRecords.map((bill) => (
          <div key={bill.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{bill.month}</span>
              <span className={`inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                bill.status === 'Paid' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-500/90'
              }`}>
                {bill.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-zinc-900 dark:text-white">{bill.amount}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{bill.datePaid !== '-' ? `Paid ${bill.datePaid}` : 'Unpaid'}</p>
              </div>
              <a href={bill.invoiceUri} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                Receipt
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing <span className="font-medium text-zinc-900 dark:text-zinc-100">{indexOfFirstRecord + 1}</span> to <span className="font-medium text-zinc-900 dark:text-zinc-100">{Math.min(indexOfLastRecord, mockBills.length)}</span> of <span className="font-medium text-zinc-900 dark:text-zinc-100">{mockBills.length}</span> records
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="sr-only">Previous</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div className="hidden sm:flex gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === idx + 1 
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                    : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="sm:hidden text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Page {currentPage} of {totalPages}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="sr-only">Next</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Record Payment</h3>
              <button 
                onClick={() => setIsRecordPaymentOpen(false)} 
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/30 max-h-[60vh] overflow-y-auto">
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 uppercase tracking-wider">Valid Active Services</h4>
              {validServices.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {validServices.map(service => (
                    <div key={service.id} className="flex justify-between items-center bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{service.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 whitespace-nowrap">{service.startDate} to {service.endDate}</p>
                      </div>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 pl-4">
                        ${service.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 mb-6 bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No active or currently valid services available to bill right now.</p>
                </div>
              )}
              
              <div className="flex justify-between items-center p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Total Payable Amount</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${payableTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-end gap-3 bg-white dark:bg-zinc-900">
              <button 
                type="button"
                onClick={() => setIsRecordPaymentOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                className="px-6 py-2 rounded-xl text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={validServices.length === 0}
                onClick={() => {
                  alert('Payment integration is ready to proceed!');
                  setIsRecordPaymentOpen(false);
                }}
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
