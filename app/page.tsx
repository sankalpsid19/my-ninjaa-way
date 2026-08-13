import { getUserModuleStatuses } from "@/lib/actions/auth-actions";
import ModuleCard from "@/components/ModuleCard";

export const dynamic = "force-dynamic";


export default async function Home() {
  const modules = await getUserModuleStatuses();

  return (
    <div className="py-12 px-6 sm:px-12 lg:px-24 font-sans max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">
          Application Modules
        </h1>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Browse available modules below. Log in and request access to unlock authorized features.
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
          No modules available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod) => (
            <ModuleCard key={mod.id} module={mod as any} />
          ))}
        </div>
      )}
    </div>
  );
}
