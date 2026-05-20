import Navbar from '../components/home/Navbar';
import HeroSection from '../components/home/HeroSection';
import FeatureModules from '../components/home/FeatureModules';
import ValueSection from '../components/home/ValueSection';
import SafetyNotice from '../components/home/SafetyNotice';

type HomePageProps = {
  onLogout: () => void;
};

function HomePage({ onLogout }: HomePageProps) {
  return (
    <div className="min-h-screen">
      <Navbar onLogout={onLogout} />
      <main>
        <HeroSection />
        <FeatureModules />
        <ValueSection />
        <SafetyNotice />
      </main>
    </div>
  );
}

export default HomePage;
