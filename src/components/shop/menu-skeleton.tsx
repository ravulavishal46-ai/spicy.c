import { FoodCardSkeleton } from "./food-card";

export function MenuSkeleton() {
  return (
    <div className="container-x" role="status" aria-label="Loading menu">
      <div className="skeleton mt-3 h-12 w-full max-w-md rounded-full" />
      <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <FoodCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
