import { ChevronDown, LogOut } from 'lucide-react';

const navItems = [
  { label: '项目概览', href: '#overview' },
  { label: '价值说明', href: '/team' },
];

const featureItems = [
  { label: '单次指数', href: '/approach' },
  { label: '机场画像', href: '/airports' },
  { label: '事件归因', href: '/event-analysis' },
];

type NavbarProps = {
  onLogout: () => void;
};

function Navbar({ onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav className="glass-nav mx-auto flex max-w-[1680px] flex-col gap-3 px-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between">
        <a href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 items-center rounded-full border border-accent/20 bg-accent/10 px-3 text-sm font-semibold text-accent">
            进近风扰风险指数
          </span>
        </a>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={navItems[0].href}
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:text-foreground"
          >
            {navItems[0].label}
          </a>

          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:text-foreground">
              <span>亮点功能</span>
              <ChevronDown size={15} className="transition duration-200 group-open:rotate-180" />
            </summary>

            <div className="absolute right-0 top-[calc(100%+0.55rem)] z-20 min-w-[9rem] rounded-[22px] border border-white/75 bg-white/86 p-2 shadow-soft backdrop-blur-xl">
              {featureItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition duration-200 hover:bg-background/90 hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </details>

          <a
            href={navItems[1].href}
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:text-foreground"
          >
            {navItems[1].label}
          </a>

          <button type="button" onClick={onLogout} className="action-secondary h-10 rounded-full px-4">
            <LogOut size={15} />
            退出登录
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
