import { useState, useEffect, MouseEvent } from 'react';
import { Menu, X, ArrowRight, Instagram } from 'lucide-react';

export default function Header() {
  const [scrollActive, setScrollActive] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollActive(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Philosophy', href: '#philosophy' },
    { label: 'Rooms & Spaces', href: '#spaces' },
    { label: 'The Experience', href: '#experience' },
    { label: 'Our Story', href: '#story' },
    { label: 'Location', href: '#location' },
    { label: 'Things To Do', href: '#activities' },
    { label: 'Gallery', href: '#gallery' },
  ];

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrollActive
            ? 'bg-bg-dark/85 backdrop-blur-md py-4 border-b border-terracotta/10 shadow-lg'
            : 'bg-transparent py-6 md:py-8'
        }`}
        id="main-navigation-header"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo Brand */}
          <a
            href="#hero"
            onClick={(e) => handleLinkClick(e, '#hero')}
            className="flex flex-col items-start select-none group"
          >
            <span className="font-serif italic text-xl md:text-2xl text-gold-light tracking-wide transition-colors group-hover:text-terracotta duration-300">
              Aethera Stay
            </span>
            <span className="font-sans text-[9px] uppercase tracking-widest text-[#c98a92] mt-0.5 font-light">
              Where Inside Meets Outside
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="font-sans text-[12px] text-text-light/80 hover:text-gold-light tracking-widest uppercase transition-all duration-300 relative py-1.5 after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[1px] after:bg-terracotta after:transition-all after:duration-300 hover:after:w-full hover:after:left-0"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Call To Action Block Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="#booking"
              onClick={(e) => handleLinkClick(e, '#booking')}
              className="bg-terracotta hover:bg-[#b06740] text-text-light font-sans text-[11px] font-medium tracking-widest uppercase px-6 py-2.5 rounded-full transition-all duration-300 flex items-center gap-2 group cursor-pointer shadow-md"
            >
              <span>Book Direct</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.75" />
            </a>
          </div>

          {/* Hamburger Menu Icon (Mobile/Tablet) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-gold-light hover:text-terracotta focus:outline-none p-1 transition-colors z-50 cursor-pointer"
            aria-label="Toggle Navigation Drawer"
            id="mobile-drawer-trigger"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer */}
      <div
        className={`fixed inset-0 w-full h-full bg-bg-dark/98 z-40 flex flex-col justify-between p-8 md:p-16 transition-opacity duration-500 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Subtle Watermark background within menu */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif italic text-[12vw] text-bg-warm/80 opacity-40 select-none leading-none pointer-events-none whitespace-nowrap">
          Aethera Stay
        </div>

        <div className="flex justify-between items-center border-b border-terracotta/10 pb-6 mt-16">
          <span className="font-serif italic text-lg text-gold-light">Sanctuary Menu</span>
          <span className="font-sans text-[10px] tracking-widest text-[#8a7a68] uppercase font-light">Mirissa, Sri Lanka</span>
        </div>

        {/* Big Navigation Links */}
        <nav className="flex flex-col gap-6 my-auto pt-6 text-left relative z-10">
          {navLinks.map((link, idx) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="font-serif italic text-3xl md:text-4xl text-text-light hover:text-gold-light transition-all duration-300 w-fit relative pl-4 border-l-2 border-transparent hover:border-terracotta"
              style={{ transitionDelay: `${idx * 40}ms` }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#booking"
            onClick={(e) => handleLinkClick(e, '#booking')}
            className="font-serif italic text-3xl md:text-4xl text-terracotta hover:text-gold-light transition-all duration-300 w-fit pl-4 border-l-2 border-transparent hover:border-gold-light"
          >
            Direct Reservation
          </a>
        </nav>

        {/* Footer Details within Menu */}
        <div className="border-t border-terracotta/10 pt-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="font-sans text-xs text-text-muted">Mirissa, Sri Lanka</p>
            <p className="font-sans text-[11px] text-text-muted/60 mt-1">1 minute walk behind Zouk Beach Club</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/aethera.stay"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-sans text-xs text-[#e8c07a]/80 hover:text-gold-light transition-colors"
            >
              <Instagram className="w-4 h-4 text-terracotta" />
              <span>@aethera.stay</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
