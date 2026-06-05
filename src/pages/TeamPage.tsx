import { ArrowLeft, LogOut } from 'lucide-react';
import FeatureModules from '../components/home/FeatureModules';
import ValueSection from '../components/home/ValueSection';

type TeamPageProps = {
  onLogout: () => void;
};

function TeamPage({ onLogout }: TeamPageProps) {
  return (
    <div className="min-h-screen">
      <header className="px-4 pt-4 sm:px-6 lg:px-8">
        <nav className="glass-nav mx-auto flex max-w-[1680px] flex-col gap-4 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
          <div>
            <a
              href="/"
              className="inline-flex h-10 items-center rounded-full border border-accent/20 bg-accent/10 px-3 text-sm font-semibold text-accent"
            >
              进近风扰风险指数
            </a>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">价值说明</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a href="/" className="action-secondary h-10 rounded-full px-4">
              <ArrowLeft size={15} />
              返回首页
            </a>
            <button type="button" onClick={onLogout} className="action-secondary h-10 rounded-full px-4">
              <LogOut size={15} />
              退出登录
            </button>
          </div>
        </nav>
      </header>

      <main className="pb-12">
        <FeatureModules compact />
        <ValueSection />
      </main>
    </div>
  );
}

export default TeamPage;
