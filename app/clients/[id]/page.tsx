import Link from "next/link";
import { notFound } from "next/navigation";
import StatusToggle from "@/components/StatusToggle";
import ClientFinancials from "@/components/ClientFinancials";

// Extended mock data
const mockClients = [
  { id: "1", name: "Infinity Realtors", email: "alice@example.com", status: "Active", phone: "+1 234 567 8900", company: "Infinity Realtors", website: "https://infinity-realtors.vercel.app/", joinDate: "Jan 12, 2025", pocName: "Sharmistha Dey", pocEmail: "sharmisthamayur@gmail.com", clientName: "Alison Johnson", services: [{ id: "s1", name: "Web Application Development", startDate: "2026-01-15", endDate: "2027-01-14", price: 5000, status: "Active" }, { id: "s2", name: "SEO Optimization", startDate: "2026-03-01", endDate: "2026-08-31", price: 1200, status: "Active" }, { id: "s3", name: "Platform Maintenance", startDate: "2026-03-01", endDate: "2026-03-31", price: 300, status: "Active" }] },
  { id: "2", name: "Bob Smith", email: "bob@example.com", status: "Inactive", phone: "+1 987 654 3210", company: "Global Corp", website: "", joinDate: "Sep 05, 2024", pocName: "John Doe", pocEmail: "john@globalcorp.com", clientName: "Bob Smith", services: [{ id: "s4", name: "Cloud Hosting", startDate: "2025-09-01", endDate: "2026-08-31", price: 2400, status: "Inactive" }] },
  { id: "3", name: "Charlie Davis", email: "charlie@example.com", status: "Active", phone: "+1 555 123 4567", company: "StartUp Inc", website: "", joinDate: "Mar 22, 2026", pocName: "Sarah Connor", pocEmail: "sarah@startup.inc", clientName: "Charlie Davis", services: [{ id: "s5", name: "Mobile App Development", startDate: "2026-04-01", endDate: "2026-10-31", price: 8500, status: "Active" }] },
  { id: "4", name: "Diana Prince", email: "diana@example.com", status: "Active", phone: "+1 800 123 4567", company: "Wonder Corp", website: "", joinDate: "Dec 10, 2025", pocName: "Steve Trevor", pocEmail: "steve@wonder.corp", clientName: "Diana Prince", services: [{ id: "s6", name: "Cybersecurity Audit", startDate: "2026-02-15", endDate: "2026-03-15", price: 3500, status: "Active" }] },
  { id: "5", name: "Evan Wright", email: "evan@example.com", status: "Inactive", phone: "+1 555 987 6543", company: "Wright Enterprises", website: "", joinDate: "Jun 15, 2023", pocName: "Oliver Queen", pocEmail: "oliver@wright.ent", clientName: "Evan Wright", services: [{ id: "s7", name: "IT Consulting", startDate: "2023-06-15", endDate: "2024-06-14", price: 5000, status: "Inactive" }] },
];

export default async function ClientProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = mockClients.find((c) => c.id === id);

  if (!client) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link href="/clients" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors inline-flex items-center">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Clients
          </Link>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{client.name}</h1>
                <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-1">{client.company}</p>
              </div>
              <StatusToggle initialStatus={client.status} />
            </div>
          </div>

          <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/50">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Client Name</p>
                <p className="text-zinc-900 dark:text-zinc-100">{client.clientName || 'N/A'}</p>
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

          <ClientFinancials 
            initialServices={client.services || []} 
            clientInfo={{
              name: client.clientName || client.name,
              company: client.company,
              email: client.email,
              phone: client.phone,
            }}
          />
        </div>
      </div>
    </div>
  );
}
