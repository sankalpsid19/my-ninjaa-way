"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusToggle from "./StatusToggle";
import ClientFinancials from "./ClientFinancials";
import { ClientInfo } from "./ReceiptPreview";
import { Service } from "./ServicesTable";
import DeleteClientModal from "./DeleteClientModal";
import { deleteClient } from "@/lib/actions/client-actions";

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
  const router = useRouter();
  const [status, setStatus] = useState(client.status);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const hasPaidCurrentMonth = client.bills?.some(b => b.month === currentMonth && b.status === "Paid");
  const showWarning = status === "Active" && !hasPaidCurrentMonth;

  const clientInfo: ClientInfo = {
    name: client.name,
    company: client.company,
    email: client.email,
    phone: client.phone,
  };

  const handleDeleteClient = async () => {
    const res = await deleteClient(client.id);
    if (!res.success) {
      throw new Error(res.error || "Failed to delete client.");
    }
    router.push("/clients");
    router.refresh();
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
          <div className="flex items-center gap-3">
            <StatusToggle initialStatus={client.status} onStatusChange={setStatus} />
          </div>
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

      {/* Danger Zone / Delete Section */}
      <div className="p-4 sm:p-5 bg-red-50/40 dark:bg-red-950/20 border-t border-red-200/60 dark:border-red-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Danger Zone</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Permanently delete this client and remove all associated bills, services, and records.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Client
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteClientModal
        isOpen={isDeleteModalOpen}
        clientName={client.name}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteClient}
      />
    </div>
  );
}

