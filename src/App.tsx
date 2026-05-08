import appBackground from './assets/approach-bg.jpg';
import HomePage from './pages/HomePage';
import ApproachAnimationPage from './pages/ApproachAnimationPage';
import AirportRiskPage from './pages/AirportRiskPage';
import EventAnalysisPage from './pages/EventAnalysisPage';

function App() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/';
  const isApproachPage = pathname === '/approach' || pathname.startsWith('/approach/');
  const isAirportPage = pathname === '/airports' || pathname.startsWith('/airports/');
  const isEventAnalysisPage = pathname === '/event-analysis' || pathname.startsWith('/event-analysis/');

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div
        className="fixed inset-0 -z-30"
        style={{
          backgroundImage: `url(${appBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: 'scale(1.02)',
        }}
      />
      <div className="fixed inset-0 -z-20 bg-[linear-gradient(180deg,rgba(245,239,230,0.34),rgba(245,239,230,0.48)),radial-gradient(circle_at_top_left,rgba(92,124,108,0.14),transparent_24rem),radial-gradient(circle_at_85%_10%,rgba(181,107,74,0.12),transparent_20rem)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.12))]" />

      {isApproachPage ? (
        <ApproachAnimationPage />
      ) : isAirportPage ? (
        <AirportRiskPage />
      ) : isEventAnalysisPage ? (
        <EventAnalysisPage />
      ) : (
        <HomePage />
      )}
    </div>
  );
}

export default App;
