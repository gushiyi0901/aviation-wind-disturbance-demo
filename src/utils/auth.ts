export type MockLoginMethod = 'account';

export type DemoAccount = {
  username: string;
  password: string;
};

export type MockAuthSession = {
  isLoggedIn: true;
  username: string;
  loginMethod: MockLoginMethod;
  loggedInAt: string;
};

const AUTH_STORAGE_KEY = 'approach-risk-demo-auth';
const DEMO_ACCOUNTS_STORAGE_KEY = 'demoAccounts';
const DEFAULT_DEMO_ACCOUNTS: DemoAccount[] = [
  { username: 'fangfang', password: '123456' },
  { username: 'zyecnu', password: '123456' },
];

export function getMockAuthSession(): MockAuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as Partial<MockAuthSession>;

    if (
      session.isLoggedIn === true &&
      session.loginMethod === 'account' &&
      typeof session.username === 'string' &&
      session.username.trim() &&
      findDemoAccount(session.username)
    ) {
      return session as MockAuthSession;
    }
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  return null;
}

export function saveMockAuthSession(username: string, loginMethod: MockLoginMethod) {
  if (typeof window === 'undefined') {
    return;
  }

  const session: MockAuthSession = {
    isLoggedIn: true,
    username,
    loginMethod,
    loggedInAt: new Date().toISOString(),
  };

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearMockAuthSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getDemoAccounts(): DemoAccount[] {
  const storedAccounts: DemoAccount[] = [];

  if (typeof window === 'undefined') {
    return DEFAULT_DEMO_ACCOUNTS;
  }

  const rawAccounts = window.localStorage.getItem(DEMO_ACCOUNTS_STORAGE_KEY);

  if (rawAccounts) {
    try {
      const accounts = JSON.parse(rawAccounts);

      if (Array.isArray(accounts)) {
        storedAccounts.push(
          ...accounts.filter(
            (account): account is DemoAccount =>
              typeof account?.username === 'string' && typeof account?.password === 'string' && account.username.trim() !== '',
          ),
        );
      }
    } catch {
      window.localStorage.removeItem(DEMO_ACCOUNTS_STORAGE_KEY);
    }
  }

  return [...DEFAULT_DEMO_ACCOUNTS, ...storedAccounts.filter((account) => !DEFAULT_DEMO_ACCOUNTS.some((item) => item.username === account.username))];
}

export function saveDemoAccount(account: DemoAccount) {
  if (typeof window === 'undefined') {
    return [];
  }

  const accounts = getDemoAccounts();
  const nextAccounts = [...accounts.filter((item) => item.username !== account.username), account];
  window.localStorage.setItem(DEMO_ACCOUNTS_STORAGE_KEY, JSON.stringify(nextAccounts));

  return nextAccounts;
}

export function findDemoAccount(username: string) {
  const normalizedUsername = username.trim();
  return getDemoAccounts().find((account) => account.username === normalizedUsername) ?? null;
}

export function hasDemoAccounts() {
  return getDemoAccounts().length > 0;
}
