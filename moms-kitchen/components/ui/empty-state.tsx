import Link from "next/link";

export function EmptyState({
  emoji = "🍽️",
  title,
  description,
  actionHref,
  actionLabel,
}: {
  emoji?: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <span className="text-5xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-stone-600">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-5">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
