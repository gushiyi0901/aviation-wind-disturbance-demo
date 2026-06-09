import { useState } from 'react';
import appBackground from './assets/comac-aircraft-bg.jpg';
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
          filter: 'brightness(0.82) contrast(1.04) saturate(1.05)',
        }}
      />
      {isAuthenticated && (
        <>
          <div className="fixed inset-0 -z-20 bg-[linear-gradient(180deg,rgba(10,42,82,0.24),rgba(5,24,52,0.34)),radial-gradient(circle_at_top_left,rgba(34,91,150,0.16),transparent_24rem),radial-gradient(circle_at_85%_10%,rgba(20,66,126,0.14),transparent_20rem)] mix-blend-multiply" />
          <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgba(235,246,255,0.06),rgba(188,214,244,0.10))]" />
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
