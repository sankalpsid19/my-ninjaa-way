import LoadingSpinner from "@/components/LoadingSpinner";

export default function ClientsLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" text="Loading clients data..." />
    </div>
  );
}
