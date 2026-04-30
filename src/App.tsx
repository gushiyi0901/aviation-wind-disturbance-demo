import appBackground from './assets/approach-bg.jpg';
import HomePage from './pages/HomePage';
import ApproachAnimationPage from './pages/ApproachAnimationPage';

function App() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/';
  const isApproachPage = pathname === '/approach' || pathname.startsWith('/approach/');

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div
        className="fixed inset-0 -z-20 bg-background"
        style={{
          backgroundImage: `linear-gradient(rgba(245, 239, 230, 0.66), rgba(245, 239, 230, 0.74)), url(${appBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(92,124,108,0.18),transparent_22rem),radial-gradient(circle_at_85%_10%,rgba(181,107,74,0.14),transparent_18rem)]" />

      {isApproachPage ? <ApproachAnimationPage /> : <HomePage />}
    </div>
  );
}

export default App;
