import Link from "next/link";
import { notFound } from "next/navigation";
import ClientProfileContent from "@/components/ClientProfileContent";
import { getClientById } from "@/lib/actions/client-actions";

export default async function ClientProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);

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

        <ClientProfileContent client={client} />
      </div>
    </div>
  );
}

