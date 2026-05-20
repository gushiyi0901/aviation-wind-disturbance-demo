import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { findDemoAccount, getDemoAccounts, saveDemoAccount, saveMockAuthSession } from '../utils/auth';

type LoginPageProps = {
  onLoginSuccess: () => void;
};

type PageMode = 'login' | 'register' | 'resetPassword';

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [pageMode, setPageMode] = useState<PageMode>('login');
  const [hasRegisteredAccount, setHasRegisteredAccount] = useState(() => getDemoAccounts().length > 0);
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetName, setResetName] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const activeTitle = useMemo(() => {
    if (pageMode === 'register') {
      return '账号注册';
    }

    if (pageMode === 'resetPassword') {
      return '设置新密码';
    }

    return '平台登录';
  }, [pageMode]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');

    if (!hasRegisteredAccount) {
      setError('当前没有本地账号，请先注册');
      return;
    }

    if (!account.trim()) {
      setError('请输入账号或用户名');
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

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');

    const username = registerName.trim();

    if (!username) {
      setError('请输入账号或用户名');
      return;
    }

    if (!registerPassword.trim()) {
      setError('请输入密码');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    saveDemoAccount({ username, password: registerPassword });
    setHasRegisteredAccount(true);
    setAccount(username);
    setPassword('');
    setRegisterName('');
    setRegisterPassword('');
    setConfirmPassword('');
    setPageMode('login');
    setError('');
    setNotice('注册成功，请使用刚注册的账号密码登录');
  };

  const handleResetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');

    const username = resetName.trim();

    if (!username) {
      setError('请输入账号或用户名');
      return;
    }

    const registeredAccount = findDemoAccount(username);

    if (!registeredAccount) {
      setError('未找到该账号，请先注册');
      return;
    }

    if (!resetPassword.trim()) {
      setError('请输入新密码');
      return;
    }

    if (resetPassword !== confirmResetPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    saveDemoAccount({ username: registeredAccount.username, password: resetPassword });
    setAccount(registeredAccount.username);
    setPassword('');
    setResetName('');
    setResetPassword('');
    setConfirmResetPassword('');
    setPageMode('login');
    setError('');
    setNotice('密码已更新，请使用新密码登录');
  };

  const switchToLogin = () => {
    setPageMode('login');
    setError('');
    setNotice('');
  };

  const switchToRegister = () => {
    setPageMode('register');
    setError('');
    setNotice('');
  };

  const switchToResetPassword = () => {
    setPageMode('resetPassword');
    setError('');
    setNotice('');
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid w-full max-w-[1120px] gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.72fr)] lg:items-center">
        <div className="surface-panel px-6 py-7 sm:px-8 lg:px-10 lg:py-12">
          <h1 className="text-3xl font-bold leading-[1.28] text-foreground sm:text-4xl sm:leading-[1.24] lg:text-[3.4rem] lg:leading-[1.18]">
            进近风扰风险指数智能展示平台
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
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
              <h2 className="mt-1 text-2xl font-bold text-foreground">{activeTitle}</h2>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
              <ShieldCheck size={23} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-[20px] border border-border/70 bg-background/70 p-1.5">
            <button
              type="button"
              onClick={switchToLogin}
              className={`h-11 rounded-2xl text-sm font-semibold transition ${
                pageMode === 'login' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              账号登录
            </button>
            <button
              type="button"
              onClick={switchToRegister}
              className={`h-11 rounded-2xl text-sm font-semibold transition ${
                pageMode === 'register' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              注册账号
            </button>
          </div>

          {pageMode === 'login' ? (
            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <FieldShell icon={<UserRound size={18} />} label="账号 / 用户名">
                <input
                  value={account}
                  onChange={(event) => setAccount(event.target.value)}
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                  placeholder="请输入已注册账号"
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

              <Feedback error={error} notice={notice} />

              <button type="submit" className="action-primary w-full">
                登录
              </button>

              {!hasRegisteredAccount && <p className="text-center text-xs leading-6 text-muted-foreground">当前没有本地账号，请先注册</p>}

              <div className="text-center text-sm text-muted-foreground">
                没有账号？
                <button type="button" onClick={switchToRegister} className="ml-2 font-semibold text-accent hover:text-foreground">
                  注册
                </button>
                <button type="button" onClick={switchToResetPassword} className="ml-4 font-semibold text-accent hover:text-foreground">
                  忘记密码？
                </button>
              </div>
            </form>
          ) : pageMode === 'register' ? (
            <form className="mt-6 space-y-4" onSubmit={handleRegister}>
              <FieldShell icon={<UserRound size={18} />} label="账号 / 用户名">
                <input
                  value={registerName}
                  onChange={(event) => setRegisterName(event.target.value)}
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                  placeholder="请输入账号或用户名"
                />
              </FieldShell>

              <FieldShell icon={<LockKeyhole size={18} />} label="密码">
                <input
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  type="password"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                  placeholder="请输入密码"
                />
              </FieldShell>

              <FieldShell icon={<LockKeyhole size={18} />} label="确认密码">
                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                  placeholder="请再次输入密码"
                />
              </FieldShell>

              <Feedback error={error} notice={notice} />

              <button type="submit" className="action-primary w-full">
                注册
              </button>

              <div className="text-center text-sm text-muted-foreground">
                已有账号？
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="ml-2 font-semibold text-accent hover:text-foreground"
                >
                  返回登录
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
              <FieldShell icon={<UserRound size={18} />} label="账号 / 用户名">
                <input
                  value={resetName}
                  onChange={(event) => setResetName(event.target.value)}
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                  placeholder="请输入需要重设密码的账号"
                />
              </FieldShell>

              <FieldShell icon={<LockKeyhole size={18} />} label="新密码">
                <input
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  type="password"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                  placeholder="请输入新密码"
                />
              </FieldShell>

              <FieldShell icon={<LockKeyhole size={18} />} label="确认新密码">
                <input
                  value={confirmResetPassword}
                  onChange={(event) => setConfirmResetPassword(event.target.value)}
                  type="password"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                  placeholder="请再次输入新密码"
                />
              </FieldShell>

              <Feedback error={error} notice={notice} />

              <button type="submit" className="action-primary w-full">
                保存新密码
              </button>

              <div className="text-center text-sm text-muted-foreground">
                想起密码？
                <button type="button" onClick={switchToLogin} className="ml-2 font-semibold text-accent hover:text-foreground">
                  返回登录
                </button>
              </div>
            </form>
          )}
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

function Feedback({ error, notice }: { error: string; notice: string }) {
  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>;
  }

  if (notice) {
    return <div className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">{notice}</div>;
  }

  return null;
}

export default LoginPage;
