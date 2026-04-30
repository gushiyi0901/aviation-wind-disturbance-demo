const navItems = [
  { label: '项目概览', href: '#overview' },
  { label: '单次进近', href: '/approach' },
  { label: '机场画像', href: '#airport-module' },
  { label: '事件归因', href: '#analysis-module' },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="glass-nav mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between">
        <a href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 items-center rounded-full border border-accent/20 bg-accent/10 px-3 text-sm font-semibold text-accent">
            进近风扰风险指数
          </span>
        </a>

        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
