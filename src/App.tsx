import { useState } from 'react';
import appBackground from './assets/approach-bg.jpg';
import HomePage from './pages/HomePage';
import ApproachAnimationPage from './pages/ApproachAnimationPage';
import AirportRiskPage from './pages/AirportRiskPage';
import EventAnalysisPage from './pages/EventAnalysisPage';
import LoginPage from './pages/LoginPage';
import TeamPage from './pages/TeamPage';
import { clearMockAuthSession, getMockAuthSession } from './utils/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getMockAuthSession()));
  const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/';
  const isApproachPage = pathname === '/approach' || pathname.startsWith('/approach/');
  const isAirportPage = pathname === '/airports' || pathname.startsWith('/airports/');
  const isEventAnalysisPage = pathname === '/event-analysis' || pathname.startsWith('/event-analysis/');
  const isTeamPage = pathname === '/team' || pathname.startsWith('/team/');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);

    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
  };

  const handleLogout = () => {
    clearMockAuthSession();
    setIsAuthenticated(false);

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div
        className="fixed inset-0 -z-30"
        style={{
          backgroundImage: `url(${appBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: isAuthenticated ? 'scale(1.02)' : 'none',
        }}
      />
      {isAuthenticated && (
        <>
          <div className="fixed inset-0 -z-20 bg-[linear-gradient(180deg,rgba(245,239,230,0.34),rgba(245,239,230,0.48)),radial-gradient(circle_at_top_left,rgba(92,124,108,0.14),transparent_24rem),radial-gradient(circle_at_85%_10%,rgba(181,107,74,0.12),transparent_20rem)]" />
          <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.12))]" />
        </>
      )}

      {!isAuthenticated ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : isApproachPage ? (
        <ApproachAnimationPage onLogout={handleLogout} />
      ) : isAirportPage ? (
        <AirportRiskPage onLogout={handleLogout} />
      ) : isEventAnalysisPage ? (
        <EventAnalysisPage onLogout={handleLogout} />
      ) : isTeamPage ? (
        <TeamPage onLogout={handleLogout} />
      ) : (
        <HomePage onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
