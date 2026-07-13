import Link from "next/link";

const navItems = [
  { href: "/remove-white-background-from-logo", label: "Logo" },
  { href: "/signature-background-remover", label: "Signature" },
  { href: "/product-photo-background-remover", label: "Product Photo" },
  { href: "/remove-white-background", label: "White Background" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-sm font-bold text-white">
            CP
          </span>
          <span className="text-lg">ClearPNG</span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link
          href="/#tool"
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Upload
        </Link>
      </nav>
    </header>
  );
}
