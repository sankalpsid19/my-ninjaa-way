import Link from "next/link";
import { getClients } from "@/lib/actions/client-actions";
import AddClientButton from "@/components/AddClientButton";
import ClientSearch from "@/components/ClientSearch";

export default async function ClientsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams?.q === 'string' ? searchParams.q : undefined;
  
  const clients = await getClients(query);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors inline-flex items-center">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="w-full bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100">Clients</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage and view your clients details.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              <ClientSearch />
              <div className="w-full sm:w-auto">
                <AddClientButton />
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs uppercase text-zinc-500 dark:text-zinc-400 font-medium">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {clients.map((client: any) => {
                  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
                  const hasPaidCurrentMonth = client.bills?.some((b: any) => b.month === currentMonth && b.status === "Paid");
                  const needsWarning = client.status === 'Active' && !hasPaidCurrentMonth;

                  return (
                  <tr
                    key={client.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                  >
                    <td className="py-4 px-6 text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <div className="flex items-center gap-2">
                        <Link href={`/clients/${client.id}`} className="block h-full">
                          {client.name}
                        </Link>
                        {needsWarning && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100/80 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30" title="Active but unpaid for current month. Action Required.">
                            ⚠️ Unpaid
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-zinc-500 dark:text-zinc-400">
                      <Link href={`/clients/${client.id}`} className="block w-full h-full">
                        {client.email}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <Link href={`/clients/${client.id}`} className="block w-full h-full">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {client.status}
                        </span>
                      </Link>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
            {clients.map((client: any) => {
              const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
              const hasPaidCurrentMonth = client.bills?.some((b: any) => b.month === currentMonth && b.status === "Paid");
              const needsWarning = client.status === 'Active' && !hasPaidCurrentMonth;

              return (
              <Link
                href={`/clients/${client.id}`}
                key={client.id}
                className="block p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors active:bg-zinc-100 dark:active:bg-zinc-800"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{client.name}</span>
                    {needsWarning && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100/80 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30">
                        ⚠️ Unpaid
                      </span>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    client.status === 'Active' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {client.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{client.email}</p>
              </Link>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
}
