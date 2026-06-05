import Navbar from '../components/home/Navbar';
import HeroSection from '../components/home/HeroSection';

type HomePageProps = {
  onLogout: () => void;
};

function HomePage({ onLogout }: HomePageProps) {
  return (
    <div className="min-h-screen">
      <Navbar onLogout={onLogout} />
      <main>
        <HeroSection />
      </main>
    </div>
  );
}

export default HomePage;
