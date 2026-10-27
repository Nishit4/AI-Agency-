export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-orange-100/60 to-cream">
      <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="container-page relative flex min-h-[calc(100vh-4rem)] items-start justify-center py-10 sm:items-center">
        {children}
      </div>
    </div>
  );
}
