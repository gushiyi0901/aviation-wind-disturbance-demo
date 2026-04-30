import Navbar from '../components/home/Navbar';
import HeroSection from '../components/home/HeroSection';
import FeatureModules from '../components/home/FeatureModules';
import ValueSection from '../components/home/ValueSection';
import SafetyNotice from '../components/home/SafetyNotice';

function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
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
