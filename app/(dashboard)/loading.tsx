export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-editorial">
        <div className="h-7 bg-slate-100 rounded-lg w-64 mb-3" />
        <div className="h-4 bg-slate-100 rounded w-96" />
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-editorial"
          >
            <div className="h-3 bg-slate-100 rounded w-24 mb-3" />
            <div className="h-8 bg-slate-100 rounded w-32 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-editorial p-6 space-y-4">
        <div className="h-5 bg-slate-100 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-80 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 bg-slate-100 rounded flex-1" />
              <div className="h-4 bg-slate-100 rounded w-20" />
              <div className="h-4 bg-slate-100 rounded w-24" />
              <div className="h-4 bg-slate-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
