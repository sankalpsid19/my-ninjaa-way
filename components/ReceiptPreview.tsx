"use client";

import { useRef } from "react";
import { Service } from "./ServicesTable";

type Bill = {
  id: string;
  month: string;
  amount: string;
  status: string;
  datePaid: string;
};

export type ClientInfo = {
  name: string;
  company: string;
  email: string;
  phone: string;
};

export default function ReceiptPreview({
  bill,
  clientInfo,
  services,
  onClose,
}: {
  bill: Bill;
  clientInfo: ClientInfo;
  services: Service[];
  onClose: () => void;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Generate a deterministic invoice number from bill id
  const invoiceNumber = `INV-${bill.month.replace(/\s+/g, "-").toUpperCase()}-${bill.id.toUpperCase()}`;

  const activeServices = services.filter((s) => s.status === "Active");
  const numericAmount = parseFloat(bill.amount.replace("$", ""));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm print:bg-white print:backdrop-blur-none print:static print:inset-auto print:z-auto">
      {/* Modal wrapper — hidden on print */}
      <div className="w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden print:shadow-none print:border-0 print:rounded-none print:max-w-none print:max-h-none print:mx-0">
        
        {/* Action bar — hidden on print */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Receipt Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Receipt Content — this is what gets printed */}
        <div
          id="receipt-print-area"
          ref={receiptRef}
          className="overflow-y-auto p-6 sm:p-8 print:p-0 print:overflow-visible"
          style={{ colorScheme: "light" }}
        >
          <div className="bg-white text-zinc-900 print:bg-white">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 pb-6 border-b-2 border-zinc-200">
              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">MY NINJAA WAY</h1>
                <p className="text-sm text-zinc-500 mt-1">Software & Digital Services</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-2xl font-bold text-zinc-900 uppercase tracking-wider">Receipt</p>
                <p className="text-xs text-zinc-500 mt-1 font-mono">{invoiceNumber}</p>
              </div>
            </div>

            {/* Bill To + Invoice Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Bill To</p>
                <p className="text-sm font-semibold text-zinc-900">{clientInfo.name}</p>
                <p className="text-sm text-zinc-600">{clientInfo.company}</p>
                <p className="text-sm text-zinc-600">{clientInfo.email}</p>
                <p className="text-sm text-zinc-600">{clientInfo.phone}</p>
              </div>
              <div className="sm:text-right">
                <div className="space-y-1.5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Billing Period</p>
                    <p className="text-sm font-medium text-zinc-900">{bill.month}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Status</p>
                    <p className={`text-sm font-bold ${bill.status === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                      {bill.status}
                    </p>
                  </div>
                  {bill.datePaid !== "-" && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Date Paid</p>
                      <p className="text-sm font-medium text-zinc-900">{bill.datePaid}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-300">
                    <th className="py-2.5 pr-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">#</th>
                    <th className="py-2.5 pr-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Service</th>
                    <th className="py-2.5 pr-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hidden sm:table-cell print:table-cell">Period</th>
                    <th className="py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {activeServices.length > 0 ? (
                    activeServices.map((service, idx) => (
                      <tr key={service.id}>
                        <td className="py-3 pr-4 text-sm text-zinc-500 align-top">{idx + 1}</td>
                        <td className="py-3 pr-4">
                          <p className="text-sm font-medium text-zinc-900">{service.name}</p>
                          <p className="text-xs text-zinc-500 sm:hidden print:hidden">{service.startDate} → {service.endDate}</p>
                        </td>
                        <td className="py-3 pr-4 text-sm text-zinc-500 hidden sm:table-cell print:table-cell whitespace-nowrap">
                          {service.startDate} → {service.endDate}
                        </td>
                        <td className="py-3 text-sm font-medium text-zinc-900 text-right whitespace-nowrap">
                          ${service.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-sm text-zinc-400 text-center italic">
                        Service details not available for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="border-t-2 border-zinc-300 pt-4 mb-8">
              <div className="flex justify-end">
                <div className="w-full sm:w-64">
                  {activeServices.length > 0 && (
                    <div className="flex justify-between text-sm text-zinc-600 mb-2">
                      <span>Subtotal ({activeServices.length} service{activeServices.length > 1 ? "s" : ""})</span>
                      <span>${activeServices.reduce((sum, s) => sum + s.price, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-zinc-900 pt-2 border-t border-zinc-200">
                    <span>Total</span>
                    <span>{bill.amount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status Banner */}
            <div className={`rounded-lg p-4 text-center mb-8 ${
              bill.status === "Paid" 
                ? "bg-emerald-50 border border-emerald-200" 
                : "bg-amber-50 border border-amber-200"
            }`}>
              <p className={`text-sm font-bold uppercase tracking-wider ${
                bill.status === "Paid" ? "text-emerald-700" : "text-amber-700"
              }`}>
                {bill.status === "Paid" 
                  ? `✓ Payment Received — ${bill.datePaid}` 
                  : "⏳ Payment Pending"}
              </p>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-zinc-200 pt-6">
              <p className="text-sm font-medium text-zinc-700">Thank you for your business!</p>
              <p className="text-xs text-zinc-400 mt-1">My Ninjaa Way · Software & Digital Services</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
