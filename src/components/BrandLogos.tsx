import collegeLogo from '../assets/college-of-stat.png';
import keyLabLogo from '../assets/keylab-logo-type.svg';

function BrandLogos() {
  return (
    <a
      href="/"
      className="brand-logos"
      aria-label="华东师范大学统计学院与实验室标志"
    >
      <img src={collegeLogo} alt="华东师范大学统计学院院徽" className="h-12 w-12 shrink-0 object-contain" />
      <span className="h-9 w-px shrink-0 bg-border/80" aria-hidden="true" />
      <img src={keyLabLogo} alt="实验室标志" className="h-12 max-w-[8.5rem] shrink object-contain" />
    </a>
  );
}

export default BrandLogos;
