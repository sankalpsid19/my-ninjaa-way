"use client";

import { useState } from "react";

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

export default function BillingTable() {
  const [currentPage, setCurrentPage] = useState(1);
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

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Billing & Payments</h2>
        <button className="text-sm px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium">
          Record Payment
        </button>
      </div>
      
      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase text-zinc-500 dark:text-zinc-400 font-medium">
              <th className="py-4 px-5 whitespace-nowrap">Billing Period</th>
              <th className="py-4 px-5 whitespace-nowrap">Amount</th>
              <th className="py-4 px-5 whitespace-nowrap">Status</th>
              <th className="py-4 px-5 whitespace-nowrap">Date Paid</th>
              <th className="py-4 px-5 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {currentRecords.map((bill) => (
              <tr key={bill.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                <td className="py-4 px-5 text-sm font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{bill.month}</td>
                <td className="py-4 px-5 text-sm text-zinc-600 dark:text-zinc-300 whitespace-nowrap">{bill.amount}</td>
                <td className="py-4 px-5 text-sm whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    bill.status === 'Paid' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-500/90'
                  }`}>
                    {bill.status}
                  </span>
                </td>
                <td className="py-4 px-5 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{bill.datePaid}</td>
                <td className="py-4 px-5 text-sm text-right whitespace-nowrap">
                  <a href={bill.invoiceUri} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                    Receipt
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
          
          <div className="flex gap-1 hidden sm:flex">
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
    </div>
  );
}
