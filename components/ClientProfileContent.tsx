"use client";

import { useState } from "react";
import StatusToggle from "./StatusToggle";
import ClientFinancials from "./ClientFinancials";
import { ClientInfo } from "./ReceiptPreview";
import { Service } from "./ServicesTable";

type ClientData = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string | null;
  joinDate: string;
  pocName: string | null;
  pocEmail: string | null;
  status: string;
  services: Service[];
  bills: any[]; // We'll handle this more specifically if needed
};

export default function ClientProfileContent({ client }: { client: ClientData }) {
  const [status, setStatus] = useState(client.status);

  // Current month's bill is "Pending" if there's any bill with status "Pending" in the related bills
  const isCurrentMonthUnpaid = client.bills?.some(bill => bill.status === "Pending") || false;
  const showWarning = status === "Active" && isCurrentMonthUnpaid;

  const clientInfo: ClientInfo = {
    name: client.name,
    company: client.company,
    email: client.email,
    phone: client.phone,
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      
      {/* Payment Warning Banner */}
      {showWarning && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 px-4 sm:px-5 py-3.5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Payment Overdue — Turn Off Website
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5 leading-relaxed">
                Current month payment is still pending. Turn off the client&apos;s website and mark them as <strong>Inactive</strong> to dismiss this warning.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with name + status toggle */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{client.name}</h1>
            <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-1">{client.company}</p>
          </div>
          <StatusToggle initialStatus={client.status} onStatusChange={setStatus} />
        </div>
      </div>

      {/* Contact Information */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/50">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Client Name</p>
            <p className="text-zinc-900 dark:text-zinc-100">{client.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Email Address</p>
            <p className="text-zinc-900 dark:text-zinc-100">{client.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Phone Number</p>
            <p className="text-zinc-900 dark:text-zinc-100">{client.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Member Since</p>
            <p className="text-zinc-900 dark:text-zinc-100">{client.joinDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Company Website</p>
            <p className="text-zinc-900 dark:text-zinc-100 break-all">
              {client.website ? (
                <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm sm:text-base">
                  {client.website}
                </a>
              ) : (
                "N/A"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* POC */}
      <div className="p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">Point of Contact (POC)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">POC Name</p>
            <p className="text-zinc-900 dark:text-zinc-100">{client.pocName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">POC Email</p>
            <p className="text-zinc-900 dark:text-zinc-100">{client.pocEmail || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Financials */}
      <ClientFinancials 
        clientId={client.id}
        initialServices={client.services || []} 
        initialBills={client.bills || []}
        clientInfo={clientInfo}
      />
    </div>
  );
}
