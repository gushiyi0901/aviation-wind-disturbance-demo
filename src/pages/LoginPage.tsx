import { type FormEvent, type ReactNode, useState } from 'react';
import { LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { findDemoAccount, saveMockAuthSession } from '../utils/auth';

type LoginPageProps = {
  onLoginSuccess: () => void;
};

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!account.trim()) {
      setError('请输入账号');
      return;
    }

    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    const registeredAccount = findDemoAccount(account);

    if (!registeredAccount || registeredAccount.password !== password) {
      setError('账号或密码不正确');
      return;
    }

    setError('');
    saveMockAuthSession(registeredAccount.username, 'account');
    onLoginSuccess();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid w-full max-w-[1120px] gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.72fr)] lg:items-center">
        <div className="surface-panel px-6 py-7 text-center sm:px-8 lg:px-10 lg:py-10 lg:text-left">
          <h1 className="flex flex-col text-[2.35rem] font-bold leading-[1.12] text-foreground sm:text-[3rem] lg:text-[3.55rem]">
            <span>进近风扰风险指数</span>
            <span className="text-[#465d54]">智能展示平台</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">
            民航进近阶段风扰风险可视化与运行分析 Demo
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['单次指数分析', '机场风险画像', '事件关联归因'].map((item) => (
              <div key={item} className="surface-tile bg-white/72">
                <div className="text-sm font-semibold text-foreground">{item}</div>
                <div className="mt-2 h-1.5 w-10 rounded-full bg-accent/55" />
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card bg-white/78">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-accent">安全访问</div>
              <h2 className="mt-1 text-2xl font-bold text-foreground">平台登录</h2>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
              <ShieldCheck size={23} />
            </div>
          </div>

          <p className="mt-5 rounded-[20px] border border-border/70 bg-background/68 px-4 py-3 text-sm leading-6 text-muted-foreground">
            账号密码由管理员统一提供，如对登录有疑问，请联系管理员获取。
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <FieldShell icon={<UserRound size={18} />} label="账号">
              <input
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                placeholder="请输入管理员提供的账号"
              />
            </FieldShell>

            <FieldShell icon={<LockKeyhole size={18} />} label="密码">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                placeholder="请输入密码"
              />
            </FieldShell>

            <Feedback error={error} />

            <button type="submit" className="action-primary w-full">
              登录
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function FieldShell({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <label className="block rounded-[22px] border border-border/75 bg-white/82 px-4 py-3 shadow-sm transition focus-within:border-accent/35 focus-within:shadow-soft">
      <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span className="text-accent">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

function Feedback({ error }: { error: string }) {
  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>;
  }

  return null;
}

export default LoginPage;
