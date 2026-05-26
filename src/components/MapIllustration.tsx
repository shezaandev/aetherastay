import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, MapPin, Navigation, Anchor, HelpCircle } from 'lucide-react';

interface MapLocation {
  id: string;
  name: string;
  distance: string;
  description: string;
  icon: string;
  x: number; // percentage coordinate on SVG grid
  y: number; // percentage coordinate on SVG grid
}

export default function MapIllustration() {
  const [selectedPoint, setSelectedPoint] = useState<string>('aethera');

  const locations: MapLocation[] = [
    {
      id: 'aethera',
      name: 'Aethera Stay',
      distance: 'Our Sanctuary',
      description: 'Your home base. Tucked in behind the ocean treeline, open to the sea breeze and visiting peacocks.',
      icon: '🏡',
      x: 48,
      y: 45,
    },
    {
      id: 'surf-beach',
      name: 'Mirissa Surf Point',
      distance: '1 min walk',
      description: 'The primary right-hand reef break peals beautifully. Direct access from our back garden path.',
      icon: '🏄',
      x: 35,
      y: 55,
    },
    {
      id: 'coconut-hill',
      name: 'Coconut Tree Hill',
      distance: '8 min walk',
      description: 'The iconic high red-cliff lookout lined with towering coconut palms poking out over the active ocean spray.',
      icon: '🥥',
      x: 75,
      y: 65,
    },
    {
      id: 'doctors-house',
      name: "The Doctor's House",
      distance: '90 seconds walk',
      description: 'A legendary restored 200-year-old colonial venue. Live acoustic music, wood-fired pizzas, and cold draft beers on Wednesday nights.',
      icon: '🥁',
      x: 58,
      y: 35,
    },
    {
      id: 'harbour',
      name: 'Whale Watching Harbour',
      distance: '5 mins tuk-tuk',
      description: 'The historic Mirissa bay. Board early-morning ethical research boats to catch blue whales breaching.',
      icon: '🐋',
      x: 20,
      y: 30,
    },
    {
      id: 'secret-beach',
      name: 'Secret Beach',
      distance: '12 min walk',
      description: 'A secluded blue-lagoon cove hidden behind steep rocky paths. Perfect for cocktails and quiet sunset snorkels.',
      icon: '🍍',
      x: 18,
      y: 65,
    },
  ];

  const activeLoc = locations.find(l => l.id === selectedPoint) || locations[0];

  return (
    <div id="interactive-map" className="relative bg-bg-warm/50 border border-terracotta/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl flex flex-col justify-between h-[480px]">
      {/* Hand-drawn SVG Coastline Background */}
      <div className="absolute inset-0 overflow-hidden opacity-25 pointer-events-none rounded-2xl">
        <svg className="w-full h-full" viewBox="0 0 500 400" fill="none" preserveAspectRatio="none">
          {/* Wave ripple decorations */}
          <path d="M40 320 C100 310, 180 340, 260 320 C340 300, 420 350, 480 330" stroke="#c47a52" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M20 340 C110 330, 200 360, 290 340 C380 320, 440 370, 490 350" stroke="#c47a52" strokeWidth="0.5" />
          
          {/* Compass Rose */}
          <g transform="translate(430, 70)">
            <circle cx="0" cy="0" r="22" stroke="#e8c07a" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="-30" x2="0" y2="30" stroke="#c47a52" strokeWidth="0.75" />
            <line x1="-30" y1="0" x2="30" y2="0" stroke="#c47a52" strokeWidth="0.75" />
            <polygon points="0,-25 4,-5 0,0" fill="#c47a52" />
            <polygon points="0,-25 -4,-5 0,0" fill="#e8c07a" />
            <polygon points="0,25 4,5 0,0" fill="#e8c07a" />
            <polygon points="0,25 -4,5 0,0" fill="#c47a52" />
            <text x="-4" y="-33" className="font-sans text-[9px] fill-gold-light tracking-widest font-normal">N</text>
          </g>

          {/* Tropical Coast sand border */}
          <path d="M-20 180 Q 150 150, 280 200 T 520 160" stroke="#e8c07a" strokeWidth="1.5" />
          {/* Palm vectors along the beach */}
          <path d="M120 145 L125 130 M124 135 L118 132 M125 130 L132 133" stroke="#7d9e7a" strokeWidth="1" />
          <path d="M320 185 L322 170 M321 176 L316 174 M322 170 L328 171" stroke="#7d9e7a" strokeWidth="1" />
          <path d="M410 150 L413 135 M412 141 L406 139 M413 135 L419 137" stroke="#7d9e7a" strokeWidth="1" />
        </svg>
      </div>

      {/* Map Interactive Canvas */}
      <div className="relative flex-grow w-full h-[280px]">
        {/* Draw Custom connecting dotted pathways */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Curved track between Harbour and Aethera */}
          <path d="M 20 30 Q 35 30, 48 45" stroke="#8a7a68" strokeOpacity="0.3" strokeWidth="0.5" strokeDasharray="1 2" fill="none" />
          {/* Curved track between Aethera and Surf */}
          <path d="M 48 45 L 35 55" stroke="#8a7a68" strokeOpacity="0.3" strokeWidth="0.5" strokeDasharray="1 2" fill="none" />
          {/* Curved track between Aethera and Doctor's House */}
          <path d="M 48 45 L 58 35" stroke="#c47a52" strokeOpacity="0.5" strokeWidth="0.5" strokeDasharray="1 1" fill="none" />
          {/* Curved track between Aethera and Coconut */}
          <path d="M 48 45 Q 60 55, 75 65" stroke="#8a7a68" strokeOpacity="0.3" strokeWidth="0.5" strokeDasharray="1 2" fill="none" />
        </svg>

        {/* Render Interactive Pins */}
        {locations.map((loc) => {
          const isAethera = loc.id === 'aethera';
          const isSelected = loc.id === selectedPoint;
          
          return (
            <button
              key={loc.id}
              onClick={() => setSelectedPoint(loc.id)}
              className="absolute group transition-transform duration-300 hover:scale-110 focus:outline-none"
              style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: 'translate(-50%, -50%)' }}
              title={loc.name}
              id={`map-pin-${loc.id}`}
            >
              {/* Ripple Effect for Aethera or selected pin */}
              {(isAethera || isSelected) && (
                <span className="absolute inline-flex h-12 w-12 rounded-full -left-2 -top-2 animate-ping opacity-15 bg-terracotta" />
              )}

              {/* Pin design */}
              <div className={`relative flex items-center justify-center rounded-all p-2.5 transition-all duration-300 ${isAethera ? 'bg-terracotta text-text-light scale-110 shadow-lg border border-gold-light/40' : isSelected ? 'bg-gold-light text-text-dark shadow' : 'bg-bg-dark/90 border border-text-muted/20 text-gold-light'} rounded-full w-10 h-10`}>
                <span className="text-sm select-none">{loc.icon}</span>
                
                {/* Micro Tooltip */}
                <span className="absolute bottom-11 whitespace-nowrap bg-bg-dark border border-terracotta/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-sans text-gold-light opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow">
                  {loc.name}
                </span>

                {/* Pulsing indicator block */}
                {isAethera && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-light opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-light"></span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Narrative Legend Panel */}
      <div className="relative border-t border-terracotta/10 pt-4 mt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLoc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col sm:flex-row justify-between items-start gap-2"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-terracotta uppercase text-[11px] tracking-widest font-mono font-medium">
                  {activeLoc.distance}
                </span>
                <span className="w-1 h-1 rounded-full bg-text-muted opacity-50" />
                <span className="font-sans text-[12px] text-text-muted font-light uppercase tracking-wider">
                  Coastal Route
                </span>
              </div>
              <h4 className="font-display text-xl text-gold-light mt-0.5">
                {activeLoc.name}
              </h4>
              <p className="font-sans text-[13px] text-text-light/80 leading-relaxed mt-1.5 max-w-xl">
                {activeLoc.description}
              </p>
            </div>

            <div className="self-end shrink-0 text-right mt-3 sm:mt-0">
              <span className="font-serif italic text-xs text-text-muted/60">
                Click map markers to explore distances
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
