import Link from "next/link";

export default function Home() {
  const modules = [
    { title: "Clients", href: "/clients", description: "Manage and view client details", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">Modules</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-12">Select a module below to get started.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod) => (
            <Link 
              key={mod.title} 
              href={mod.href}
              {...('external' in mod && mod.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex flex-col p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-lg hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300"
            >
              <div className="text-4xl mb-6 opacity-80 group-hover:opacity-100 group-hover:scale-110 transform transition-all transform-origin-left">
                {mod.icon}
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                {mod.title}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {mod.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

