import { Search, SlidersHorizontal, ArrowRight, Images } from "lucide-react";

export function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm animate-pulse">
      <div className="h-64 w-full bg-gray-200" />
      <div className="flex flex-1 flex-col p-7">
        <div className="h-6 w-3/4 rounded-md bg-gray-200 mb-4" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded-md bg-gray-100" />
          <div className="h-4 w-5/6 rounded-md bg-gray-100" />
          <div className="h-4 w-4/6 rounded-md bg-gray-100" />
        </div>
        <div className="mt-6 flex gap-2">
          <div className="h-6 w-16 rounded-full bg-gray-200" />
          <div className="h-6 w-20 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function TrabajosSkeleton() {
  return (
    <>
      <div className="sticky top-[57px] z-40 border-b border-gray-200/60 bg-white/95 backdrop-blur-xl animate-pulse">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="mx-auto max-w-xl h-12 rounded-full bg-gray-200" />
          <div className="mt-5 flex justify-center gap-2">
            <div className="h-8 w-16 rounded-full bg-gray-200" />
            <div className="h-8 w-20 rounded-full bg-gray-200" />
            <div className="h-8 w-24 rounded-full bg-gray-200" />
          </div>
          <div className="mt-4 mx-auto h-4 w-32 rounded-md bg-gray-200" />
        </div>
      </div>
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      <section className="relative min-h-[90vh] bg-carbon flex items-center justify-center">
        <div className="text-center px-6 max-w-4xl w-full">
          <div className="mx-auto h-6 w-32 rounded-full bg-white/10 mb-8" />
          <div className="mx-auto h-16 w-3/4 rounded-md bg-white/10 mb-6" />
          <div className="mx-auto h-6 w-1/2 rounded-md bg-white/5 mb-10" />
          <div className="mx-auto h-12 w-48 rounded-full bg-white/10" />
        </div>
      </section>
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto h-10 w-64 rounded-md bg-gray-200 mb-16" />
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white p-8">
                <div className="h-12 w-12 rounded-xl bg-gray-200 mb-6" />
                <div className="h-6 w-3/4 rounded-md bg-gray-200 mb-4" />
                <div className="h-4 w-full rounded-md bg-gray-100 mb-2" />
                <div className="h-4 w-5/6 rounded-md bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="h-6 w-3/4 rounded-md bg-gray-200 mb-4" />
        <div className="h-4 w-full rounded-md bg-gray-100 mb-2" />
        <div className="h-4 w-5/6 rounded-md bg-gray-100 mb-8" />
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-gray-200 shrink-0" />
              <div className="flex-1">
                <div className="h-3 w-16 rounded-md bg-gray-200 mb-2" />
                <div className="h-4 w-3/4 rounded-md bg-gray-200 mb-2" />
                <div className="h-3 w-1/2 rounded-md bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
