import { useState, useEffect, useRef } from 'react';
import {
  Waves,
  Leaf,
  Bird,
  ArrowRight,
  Calendar,
  Users,
  Instagram,
  PhoneCall,
  Compass,
  Check,
  MapPin,
  Anchor,
  Clock,
  Eye,
  Heart,
  HelpCircle,
  Volume2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import Header from './components/Header';
import MapIllustration from './components/MapIllustration';
import BookingWidget from './components/BookingWidget';
import RoomModal from './components/RoomModal';
import {
  ROOMS_AND_SPACES,
  AMENITIES,
  EXPERIENCES,
  ACTIVITIES,
  GALLERY_ITEMS,
  TESTIMONIALS,
  MILESTONES
} from './data';
import { RoomSpace } from './types';
import { collection, onSnapshot, doc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_SITE_IMAGES = {
  heroImage: "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1920&q=80",
  storyTurtle: "https://images.unsplash.com/photo-1437622368342-7a3d7ebea3cf?auto=format&fit=crop&w=400&q=80",
  storyInterior: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80",
  storyLily: "https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=400&q=80",
  storyPeacock: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=400&q=80",
  bookingBg: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1920&q=80",
  videoPoster: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80"
};

export default function App() {
  const [rooms, setRooms] = useState<RoomSpace[]>(ROOMS_AND_SPACES);
  const [gallery, setGallery] = useState<any[]>(GALLERY_ITEMS);
  const [villaGallery, setVillaGallery] = useState<any[]>([]);
  const [siteImages, setSiteImages] = useState<any>(DEFAULT_SITE_IMAGES);
  const [loading, setLoading] = useState(true);

  const [selectedRoom, setSelectedRoom] = useState<RoomSpace | null>(null);
  const [bookingRoomId, setBookingRoomId] = useState<string>('colonial-room');
  const [galleryFilter, setGalleryFilter] = useState<string>('All');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Custom video playback controller fallback
  const [videoPlaybackSupported, setVideoPlaybackSupported] = useState<boolean>(true);

  // Firestore real-time snapshots
  useEffect(() => {
    let siteImagesDone = false;
    let roomsDone = false;
    let galleryDone = false;
    let villaGalleryDone = false;

    const checkFinished = () => {
      if (siteImagesDone && roomsDone && galleryDone && villaGalleryDone) {
        setLoading(false);
      }
    };

    const unsubscribeSite = onSnapshot(doc(db, "siteImages", "main"), (docSnap) => {
      if (docSnap.exists()) {
        setSiteImages(docSnap.data());
      } else {
        setSiteImages(DEFAULT_SITE_IMAGES);
      }
      siteImagesDone = true;
      checkFinished();
    }, (err) => {
      console.error("SiteImages fetch error:", err);
      setSiteImages(DEFAULT_SITE_IMAGES);
      siteImagesDone = true;
      checkFinished();
    });

    const unsubscribeRooms = onSnapshot(collection(db, "rooms"), (snapshot) => {
      if (!snapshot.empty) {
        const list: RoomSpace[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as RoomSpace);
        });
        // Sort to match default ordering
        list.sort((a, b) => {
          const idxA = ROOMS_AND_SPACES.findIndex(r => r.id === a.id);
          const idxB = ROOMS_AND_SPACES.findIndex(r => r.id === b.id);
          return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
        });
        setRooms(list);
      } else {
        setRooms(ROOMS_AND_SPACES);
      }
      roomsDone = true;
      checkFinished();
    }, (err) => {
      console.error("Rooms fetch error:", err);
      setRooms(ROOMS_AND_SPACES);
      roomsDone = true;
      checkFinished();
    });

    const unsubscribeGallery = onSnapshot(collection(db, "gallery"), (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setGallery(list);
      } else {
        setGallery(GALLERY_ITEMS);
      }
      galleryDone = true;
      checkFinished();
    }, (err) => {
      console.error("Gallery fetch error:", err);
      setGallery(GALLERY_ITEMS);
      galleryDone = true;
      checkFinished();
    });

    const villaQ = query(collection(db, "villaGallery"), orderBy("order", "asc"));
    const unsubscribeVilla = onSnapshot(villaQ, (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setVillaGallery(list);
      } else {
        setVillaGallery([]);
      }
      villaGalleryDone = true;
      checkFinished();
    }, (err) => {
      console.error("Villa gallery fetch error:", err);
      setVillaGallery([]);
      villaGalleryDone = true;
      checkFinished();
    });

    // Max threshold guard of 3.5 seconds
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 3500);

    return () => {
      unsubscribeSite();
      unsubscribeRooms();
      unsubscribeGallery();
      unsubscribeVilla();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const getActivityImage = (actId: string, defaultUrl: string) => {
    if (!siteImages) return defaultUrl;
    switch (actId) {
      case "act-surf": return siteImages.actSurf || defaultUrl;
      case "act-whale": return siteImages.actWhale || defaultUrl;
      case "act-yoga": return siteImages.actYoga || defaultUrl;
      case "act-doctors": return siteImages.actDoctors || defaultUrl;
      case "act-turtle": return siteImages.actTurtle || defaultUrl;
      default: return defaultUrl;
    }
  };

  // Intersection Observer for scroll triggers
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animatedElements = document.querySelectorAll('.fade-up-element');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handlePreSelectRoom = (roomId: string) => {
    setBookingRoomId(roomId);
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const categories = ['All', 'The Spaces', 'Surf', 'Nature', 'Sanctuary'];
  const filteredGallery = galleryFilter === 'All'
    ? gallery
    : gallery.filter(item => item.category === galleryFilter || (galleryFilter === 'The Spaces' && item.category === 'The Spaces'));

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="font-serif italic text-3xl text-gold-light leading-none mb-4 animate-pulse">Aethera Stay</h1>
          <div className="w-6 h-6 rounded-full border-2 border-t-terracotta border-terracotta/10 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-text-light selection:bg-terracotta selection:text-text-light relative font-sans">

      {/* Sticky Modular Header */}
      <Header />

      {/* SECTION 1 — HERO & PHILOSOPHY DUAL-PANEL (EDITORIAL AESTHETIC) */}
      <section
        id="hero"
        className="relative min-h-[calc(100vh-80px)] xl:min-h-screen bg-[#140f08] text-[#f2e8d8] flex flex-col justify-center px-6 md:px-12 lg:px-12 xl:px-16 pt-24 pb-12 overflow-hidden"
      >
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_bottom_left,rgba(196,122,82,0.18),transparent_50%)]"></div>

        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col lg:flex-row gap-8 xl:gap-14 items-stretch relative z-10">

          {/* LEFT HALF — HERO PRESENTATION CARD (3/5 width on desktop) */}
          <div className="w-full lg:w-3/5 flex flex-col justify-between">
            {/* The main picture frame with asymmetric curves */}
            <div className="flex-1 bg-[#1e1509] relative rounded-tl-[120px] rounded-br-[60px] overflow-hidden border border-terracotta/20 flex flex-col justify-end p-8 md:p-12 min-h-[460px] lg:min-h-[500px] group shadow-xl">
              {/* Backing image with elegant parallax scale zoom */}
              <div className="absolute inset-0 z-0">
                <img
                  src={siteImages?.heroImage || DEFAULT_SITE_IMAGES.heroImage}
                  alt="Aethera Colonial Facade"
                  className="w-full h-full object-cover scale-102 transition-transform duration-[12000s] animate-pulse opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140f08] via-[#140f08]/40 to-transparent"></div>
              </div>

              {/* Text content overlay */}
              <div className="relative z-10 max-w-lg">
                <span className="text-terracotta text-[10px] md:text-[11px] tracking-[0.3em] uppercase block mb-4 font-semibold">
                  🌴 Mirissa · Sri Lanka
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] italic font-light text-white mb-6 font-serif">
                  Where Inside <br />Meets Outside
                </h1>
                <p className="text-text-muted text-sm leading-relaxed font-light mb-8 max-w-md">
                  A colonial home turned refuge — 1 minute from the surf, open to the peacocks, the turtles, and the evening sky.
                </p>

                {/* Left card Actions */}
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="#booking"
                    className="bg-terracotta hover:bg-[#b06740] text-text-light font-sans text-[11px] font-semibold uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300"
                  >
                    Book Your Stay
                  </a>
                  <a
                    href="#spaces"
                    className="bg-transparent border border-white/20 hover:border-white/50 text-white font-sans text-[11px] font-semibold uppercase tracking-widest px-6 py-3.5 rounded-full transition-all duration-300"
                  >
                    View The Spaces
                  </a>
                </div>
              </div>
            </div>

            {/* Core aesthetic info row under the main picture frame */}
            <div className="flex mt-6 gap-6 md:gap-12 items-center pb-2 md:pb-0">
              <div className="flex gap-3">
                <div
                  onClick={() => {
                    const colonialSpace = ROOMS_AND_SPACES.find(s => s.id === 'colonial-room');
                    if (colonialSpace) setSelectedRoom(colonialSpace);
                  }}
                  className="w-11 h-11 rounded-full border border-terracotta/40 hover:border-terracotta flex items-center justify-center text-lg cursor-pointer bg-bg-dark/45 hover:scale-105 transition-all text-terracotta select-none"
                  title="Surf Culture - Click to View Room"
                >
                  🌊
                </div>
                <div
                  onClick={() => {
                    const gardenSpace = ROOMS_AND_SPACES.find(s => s.id === 'garden-courtyard');
                    if (gardenSpace) setSelectedRoom(gardenSpace);
                  }}
                  className="w-11 h-11 rounded-full border border-sage/40 hover:border-sage flex items-center justify-center text-lg cursor-pointer bg-bg-dark/45 hover:scale-105 transition-all text-sage select-none"
                  title="Nature & Wildlife"
                >
                  🌿
                </div>
                <div
                  onClick={() => {
                    const tubSpace = ROOMS_AND_SPACES.find(s => s.id === 'tub-terrace');
                    if (tubSpace) setSelectedRoom(tubSpace);
                  }}
                  className="w-11 h-11 rounded-full border border-gold-light/40 hover:border-gold-light flex items-center justify-center text-lg cursor-pointer bg-bg-dark/45 hover:scale-105 transition-all text-gold-light select-none"
                  title="Peaceful Sanctuary"
                >
                  🕊️
                </div>
              </div>
              <div className="h-[1px] flex-1 bg-terracotta/20"></div>
              <div className="text-[10px] md:text-[11px] uppercase tracking-widest text-text-muted font-light whitespace-nowrap select-none">
                Est. 1924
              </div>
            </div>
          </div>

          {/* RIGHT HALF — PHILOSOPHY & FAST DIRECT PASS (2/5 width on desktop) */}
          <div className="w-full lg:w-2/5 flex flex-col relative" id="philosophy">

            {/* The parchment narrative block */}
            <div className="bg-bg-parchment p-8 md:p-10 flex-1 rounded-tr-[80px] rounded-bl-[30px] lg:rounded-bl-none text-text-dark flex flex-col justify-between relative shadow-2xl border border-terracotta/10">
              <div>
                <div className="w-8 h-[2px] bg-terracotta mb-8"></div>
                <h2 className="text-3xl md:text-4xl italic mb-6 leading-tight font-serif text-text-dark">
                  &ldquo;Almost forgot — this was the whole point.&rdquo;
                </h2>
                <p className="text-xs md:text-sm leading-[1.8] font-light mb-8 text-text-dark/85">
                  Aethera Stay was built for the ones who came to surf and stayed for the feeling. Behind red-tiled roofs and wooden shutters is where the inside world and the outside world become the same thing. You&rsquo;ll hear peacocks before 7am. You&rsquo;ll find the tub after sunset. Somewhere between the two, you&rsquo;ll remember why you left home.
                </p>
              </div>

              {/* Fast links matching the template's specs */}
              <div className="space-y-3 pt-4 border-t border-text-dark/10 font-sans">
                <div
                  onClick={() => {
                    const space = ROOMS_AND_SPACES.find(s => s.id === 'terrace-suite');
                    if (space) setSelectedRoom(space);
                  }}
                  className="flex items-center gap-4 py-2 border-b border-text-dark/10 hover:border-terracotta/30 group cursor-pointer"
                >
                  <span className="text-xs text-terracotta font-mono font-medium">01</span>
                  <span className="text-[12.5px] tracking-wide uppercase font-medium group-hover:text-terracotta transition-colors">
                    The Terrace Suite
                  </span>
                  <span className="ml-auto text-[11px] opacity-45 italic group-hover:translate-x-1 transition-transform">View Details →</span>
                </div>
                <div
                  onClick={() => {
                    const space = ROOMS_AND_SPACES.find(s => s.id === 'tub-terrace');
                    if (space) setSelectedRoom(space);
                  }}
                  className="flex items-center gap-4 py-2 border-b border-text-dark/10 hover:border-terracotta/30 group cursor-pointer"
                >
                  <span className="text-xs text-terracotta font-mono font-medium">02</span>
                  <span className="text-[12.5px] tracking-wide uppercase font-medium group-hover:text-terracotta transition-colors">
                    The Outdoor Soaking Tub
                  </span>
                  <span className="ml-auto text-[11px] opacity-45 italic group-hover:translate-x-1 transition-transform">View Details →</span>
                </div>
                <div
                  onClick={() => {
                    const space = ROOMS_AND_SPACES.find(s => s.id === 'garden-courtyard');
                    if (space) setSelectedRoom(space);
                  }}
                  className="flex items-center gap-4 py-2 group hover:border-terracotta/30 cursor-pointer"
                >
                  <span className="text-xs text-terracotta font-mono font-medium">03</span>
                  <span className="text-[12.5px] tracking-wide uppercase font-medium group-hover:text-terracotta transition-colors">
                    The Garden Courtyard
                  </span>
                  <span className="ml-auto text-[11px] opacity-45 italic group-hover:translate-x-1 transition-transform">View Details →</span>
                </div>
              </div>

              {/* Book Direct badge sticking in the dynamic position */}
              <a
                href="#booking"
                className="absolute xl:-bottom-6 xl:-right-6 -bottom-4 right-4 w-28 h-28 md:w-32 md:h-32 bg-[#c47a52] hover:bg-[#b06740] rounded-full flex flex-col items-center justify-center text-text-light text-[10px] tracking-[0.2em] uppercase text-center font-semibold leading-tight shadow-xl border border-gold-light/10 hover:scale-105 active:scale-95 transition-all duration-300 select-none z-20 cursor-pointer text-white"
              >
                <span>Book</span>
                <span>Direct</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3 — THE PROPERTY (Rooms & Spaces) */}
      <section
        id="spaces"
        className="py-18 md:py-28 bg-bg-parchment text-text-dark px-6 md:px-12 relative"
      >
        <div className="max-w-7xl mx-auto">

          <div className="mb-10 text-center md:text-left">
            <span className="font-sans text-xs uppercase tracking-widest text-terracotta font-semibold block mb-2">
              THE SPACES
            </span>
            <h2 className="font-serif italic text-4xl md:text-5xl text-text-dark max-w-2xl">
              &ldquo;Crafted for comfort, open to the world&rdquo;
            </h2>
          </div>

          {/* Bento dynamic grid for Spaces */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 items-start">
            {ROOMS_AND_SPACES.map((space) => {
              const isSocial = space.ratePerNight === 0;
              return (
                <div
                  key={space.id}
                  className={`bg-white border border-terracotta/20 rounded-tl-[48px] rounded-br-[24px] overflow-hidden hover:shadow-xl hover:border-terracotta/40 transition-all duration-500 flex flex-col justify-between ${space.aspectRatio} group`}
                  id={`space-card-${space.id}`}
                >
                  <div className="relative overflow-hidden cursor-pointer h-56 md:h-64 lg:h-52 shrink-0" onClick={() => setSelectedRoom(space)}>
                    <img
                      src={space.imageUrl}
                      alt={space.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent"></div>
                    {!isSocial && (
                      <span className="absolute bottom-3 right-4 bg-bg-dark text-text-light font-sans text-[10px] uppercase tracking-widest font-semibold py-1 px-2.5 rounded-md">
                        ${space.ratePerNight}/Night
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-xl text-text-dark font-medium group-hover:text-terracotta transition-colors duration-300">
                        {space.name}
                      </h3>
                      <p className="font-sans text-[13px] text-text-muted mt-2 leading-relaxed min-h-[40px]">
                        {space.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedRoom(space)}
                        className="font-sans text-xs text-text-dark font-medium underline decoration-terracotta/40 hover:decoration-terracotta underline-offset-4 transition-all uppercase tracking-wider flex items-center gap-1 cursor-pointer focus:outline-none"
                      >
                        → View details
                      </button>

                      {!isSocial && (
                        <button
                          onClick={() => handlePreSelectRoom(space.id)}
                          className="font-sans text-[10px] uppercase tracking-widest font-semibold text-terracotta border border-terracotta/30 hover:bg-terracotta hover:text-white px-3 py-1.5 rounded-full transition-all cursor-pointer"
                        >
                          Book Form
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Amenities Strip Divider */}
          <div className="border-t border-terracotta/20 pt-8 mt-18">
            <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none pb-4 md:pb-0 gap-6 md:justify-between items-center text-text-dark">
              {AMENITIES.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 shrink-0"
                >
                  <span className="text-sm select-none bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm border border-stone-200">{amenity.icon}</span>
                  <div className="flex flex-col">
                    <span className="font-sans text-[12.5px] text-text-dark font-semibold tracking-wide">
                      {amenity.label}
                    </span>
                  </div>
                  {index < AMENITIES.length - 1 && (
                    <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-terracotta opacity-30 ml-4 select-none" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4 — THE EXPERIENCE (Cinematic Video / Story Columns) */}
      <section
        id="experience"
        className="relative bg-bg-dark text-[#f2e8d8] overflow-hidden"
      >
        {/* Background Looping Atmospheric Video */}
        <div className="relative w-full h-[55vh] min-h-[350px] md:h-[70vh] bg-stone-900 overflow-hidden flex items-center justify-center">

          <video
            className="absolute inset-0 w-full h-full object-cover opacity-50 select-none pointer-events-none scale-102"
            autoPlay
            muted
            loop
            playsInline
            poster={siteImages?.videoPoster || DEFAULT_SITE_IMAGES.videoPoster}
          >
            <source src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054273b1851755c0e18987ec347ebfb&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Vignette styling overlays */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-bg-dark to-transparent"></div>
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-bg-dark to-transparent"></div>
          <div className="absolute inset-x-0 inset-y-0 bg-[#140f08]/30"></div>

          {/* Centered Overlay Headline */}
          <div className="relative text-center z-10 px-6 max-w-xl fade-up-element">
            <span className="block font-sans text-xs uppercase tracking-[0.2em] text-[#e8c07a] font-semibold mb-3">Cinema Still</span>
            <h2 className="font-serif italic text-5xl md:text-7xl lg:text-8xl text-text-light drop-shadow-sm leading-none">
              Surf. Soak. Stay.
            </h2>
            <div className="w-16 h-[1.5px] bg-terracotta mx-auto mt-6"></div>
          </div>
        </div>

        {/* Feature Story Blocks columns */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t border-terracotta/10">

          <div className="space-y-4">
            <span className="font-sans text-xs uppercase tracking-widest text-[#c47a52] font-semibold block">SURF</span>
            <h4 className="font-serif italic text-2xl text-[#e8c07a]">The break is 1-minute walk.</h4>
            <p className="font-sans font-light text-sm text-[#f2e8d8]/80 leading-relaxed">
              We keep simple local longboards ready. Walk past the courtyard gate, step round the quiet Zouk palms, and dive straight into clean tropical waves.
            </p>
          </div>

          <div className="space-y-4 md:border-l md:border-terracotta/20 md:pl-8 lg:pl-12">
            <span className="font-sans text-xs uppercase tracking-widest text-[#c47a52] font-semibold block">SLOW</span>
            <h4 className="font-serif italic text-2xl text-[#e8c07a]">Outdoor tub. Evening garden.</h4>
            <p className="font-sans font-light text-sm text-[#f2e8d8]/80 leading-relaxed">
              Unwind while listening to calling peacocks at 6am. Or draw a deep natural flower wash in the garden soaking circle once dusk light spills through.
            </p>
          </div>

          <div className="space-y-4 md:border-l md:border-terracotta/20 md:pl-8 lg:pl-12">
            <span className="font-sans text-xs uppercase tracking-widest text-[#c47a52] font-semibold block">STAY</span>
            <h4 className="font-serif italic text-2xl text-[#e8c07a]">A heritage refuge.</h4>
            <p className="font-sans font-light text-sm text-[#f2e8d8]/80 leading-relaxed">
              Preserved Sri Lankan architecture combined with organic linen fibers, hot overhead rainfall fixtures, and cool air-conditioning when you need a quiet breath.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 5 — THE STORY */}
      <section
        id="story"
        className="py-18 md:py-28 bg-bg-linen text-text-dark px-6 md:px-12 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column long text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="font-sans text-xs uppercase tracking-widest text-terracotta font-semibold block mb-2">
              OUR STORY
            </span>
            <h2 className="font-serif italic text-4xl md:text-5xl text-text-dark leading-tight max-w-xl">
              &ldquo;A place that knew what it was before anyone named it.&rdquo;
            </h2>

            <div className="font-sans font-light text-base text-text-dark/90 leading-relaxed space-y-6 max-w-2xl pr-4">
              <p>
                Aethera began as a colonial home — the kind that takes decades to acquire the quality of light that falls through its shuttered windows at 6am. The kind where a peacock showing up in the courtyard feels less like a surprise and more like something that was always meant to happen.
              </p>
              <p>
                We didn&rsquo;t build this place to mimic trendy internet hotspots. We listened to what the layout already wanted to be — and then we made space for the right kind of slow-traveling souls to find it.
              </p>
              <p className="font-serif italic text-lg text-terracotta">
                If you&rsquo;re here, you probably know what we mean.
              </p>
            </div>
          </div>

          {/* Right Column 2x2 organic Photo Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">

            <div className="space-y-4">
              {/* Baby turtles */}
              <div className="overflow-hidden rounded-tl-[48px] rounded-br-[24px] shadow-md border border-[#dfcda2]">
                <img
                  src={siteImages?.storyTurtle || DEFAULT_SITE_IMAGES.storyTurtle}
                  alt="Turtle on sand"
                  className="w-full h-40 md:h-48 object-cover hover:scale-103 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Cozy Room lamp lights */}
              <div className="overflow-hidden rounded-tr-[48px] rounded-bl-[24px] shadow-md border border-[#dfcda2]">
                <img
                  src={siteImages?.storyInterior || DEFAULT_SITE_IMAGES.storyInterior}
                  alt="Cozy interior room lamp"
                  className="w-full h-56 md:h-64 object-cover hover:scale-103 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="space-y-4 pt-8">
              {/* Water hyacinth bloom */}
              <div className="overflow-hidden rounded-tr-[48px] rounded-bl-[24px] shadow-md border border-[#dfcda2]">
                <img
                  src={siteImages?.storyLily || DEFAULT_SITE_IMAGES.storyLily}
                  alt="Water lily bloom"
                  className="w-full h-56 md:h-64 object-cover hover:scale-103 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Peacock on stone brick */}
              <div className="overflow-hidden rounded-tl-[48px] rounded-br-[24px] shadow-md border border-[#dfcda2]">
                <img
                  src={siteImages?.storyPeacock || DEFAULT_SITE_IMAGES.storyPeacock}
                  alt="Peacock on courtyard brick"
                  className="w-full h-40 md:h-48 object-cover hover:scale-103 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5.5 — THE VILLA GALLERY */}
      <section
        id="villa-gallery"
        className="py-18 md:py-28 bg-bg-dark px-6 md:px-12 relative border-t border-terracotta/10"
      >
        <div className="max-w-7xl mx-auto">

          {/* Header block (centered) */}
          <div className="text-center">
            <span className="font-sans text-xs uppercase tracking-widest text-terracotta font-semibold block mb-2">
              THE VILLA
            </span>
            <h2 className="font-serif italic text-4xl md:text-5xl text-text-light leading-tight">
              &ldquo;Better shown than told.&rdquo;
            </h2>
            {/* Thin decorative line below the headline */}
            <div className="w-14 h-[1.5px] bg-terracotta mx-auto mt-5 mb-12"></div>
          </div>

          {/* Image grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {(villaGallery.length > 0 ? villaGallery : []).map((item, idx) => (
              <div
                key={item.id || idx}
                id={`villa-gallery-item-${idx}`}
                className="break-inside-avoid relative overflow-hidden rounded-xl border border-terracotta/10 shadow-lg group cursor-pointer"
                onClick={() => setLightboxImage(item.imageUrl)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.caption}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-104"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />

                {/* Cover Overlay hover state */}
                <div className="absolute inset-0 bg-bg-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <div className="border-l-2 border-terracotta pl-3">
                    <span className="text-[10px] text-terracotta uppercase font-mono tracking-widest block">
                      {item.category}
                    </span>
                    <p className="font-serif italic text-sm text-text-light mt-1">
                      {item.caption}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom tagline row */}
          <div className="mt-10 text-center">
            <p className="font-serif italic text-sm text-text-muted">
              Every corner has a story. Come find yours.
            </p>
            <a
              href="#booking"
              id="villa-gallery-cta"
              className="font-sans text-xs uppercase tracking-widest text-terracotta hover:text-gold-light font-semibold mt-2 inline-block transition-colors"
            >
              Book Your Stay &rarr;
            </a>
          </div>

        </div>
      </section>

      {/* SECTION 6 — LOCATION */}
      <section
        id="location"
        className="py-18 md:py-28 bg-[#140f08] px-6 md:px-12 relative border-t border-b border-terracotta/10"
      >
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-12">
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#e8c07a] font-medium block mb-2">
              LOCATION
            </span>
            <h2 className="font-serif italic text-4xl md:text-5xl text-text-light max-w-xl mx-auto">
              In the heart of Mirissa. Away from the noise.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">

            {/* Custom Interactive SVG coastline map on Left */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <MapIllustration />
            </div>

            {/* Distance specifications grid card on Right */}
            <div className="lg:col-span-5 bg-[#1e1509] border border-terracotta/15 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-lg">
              <div>
                <h4 className="font-serif italic text-2xl text-[#e8c07a] mb-6 border-b border-terracotta/10 pb-4">
                  Walking & Travel Distances
                </h4>
                <div className="space-y-4">
                  {MILESTONES.map((milestone, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center pb-3 border-b border-text-muted/10 text-sm ${milestone.highlight ? 'text-[#e8c07a] font-semibold' : 'text-text-light/85'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base select-none">{milestone.icon}</span>
                        <span className="font-sans tracking-wide">{milestone.name}</span>
                      </div>
                      <span className="font-sans text-xs text-text-muted font-mono">{milestone.distance}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-terracotta/10 text-center lg:text-left">
                <p className="font-serif italic text-sm text-text-muted">
                  &ldquo;The best things in Mirissa are all within walking distance. We&rsquo;re right in the middle of them.&rdquo;
                </p>
                <a
                  href="https://maps.google.com/?q=Mirissa+Sri+Lanka"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-sans text-xs text-terracotta uppercase tracking-wider font-semibold mt-4 hover:text-gold-light transition-colors"
                >
                  <span>Launch Google Navigation Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 7 — EXPERIENCES / ACTIVITIES (Horizontal Scroll snap strip) */}
      <section
        id="activities"
        className="py-18 md:py-28 bg-bg-parchment text-text-dark px-6 md:px-12 relative"
      >
        <div className="max-w-7xl mx-auto">

          <div className="mb-10 text-center md:text-left">
            <span className="font-sans text-xs uppercase tracking-widest text-[#c47a52] font-semibold block mb-2 select-none">
              THINGS TO DO
            </span>
            <h2 className="font-serif italic text-4xl md:text-5xl text-text-dark max-w-2xl">
              More than a place to sleep.
            </h2>
          </div>

          {/* Activities snapper container scroll */}
          <div className="flex gap-6 overflow-x-auto pb-8 snap-inline-scroll scrollbar-thin scrollbar-thumb-terracotta/30 justify-start">
            {ACTIVITIES.map((act) => (
              <div
                key={act.id}
                className="w-80 md:w-96 shrink-0 relative rounded-2xl overflow-hidden aspect-[4/5] bg-bg-dark text-text-light snap-inline-item shadow-xl border border-stone-200/50 group"
              >
                {/* Image */}
                <img
                  src={getActivityImage(act.id, act.imageUrl)}
                  alt={act.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />

                {/* Warm black/terracotta bottom card gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent"></div>

                {/* Text overlays */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                  <span className="text-[10px] bg-terracotta/90 text-text-light font-sans font-semibold tracking-widest uppercase py-1 px-2.5 rounded-md w-fit mb-3">
                    {act.tag}
                  </span>

                  <h3 className="font-serif italic text-2xl text-gold-light mb-2">
                    {act.title}
                  </h3>

                  <p className="font-sans font-light text-xs md:text-[13px] text-text-light/90 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 8 — GALLERY */}
      <section
        id="gallery"
        className="py-18 md:py-28 bg-[#140f08] px-6 md:px-12 relative"
      >
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-10">
            <span className="font-sans text-xs uppercase tracking-widest text-[#e8c07a] font-semibold block mb-2 select-none">
              THE AETHERA LIFE
            </span>
            <h2 className="font-serif italic text-4xl md:text-5xl text-gold-light">
              Some things are better shown.
            </h2>
          </div>

          {/* Filtering Category Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10 select-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryFilter(cat)}
                className={`font-sans text-xs uppercase tracking-widest px-4.5 py-2 rounded-full cursor-pointer transition-all duration-300 ${galleryFilter === cat ? 'bg-terracotta text-text-light font-medium' : 'bg-[#1e1509] border border-terracotta/10 text-text-muted hover:text-gold-light hover:border-terracotta/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry Image Feed */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid relative overflow-hidden rounded-xl border border-terracotta/10 shadow-lg group cursor-pointer"
                onClick={() => setLightboxImage(item.imageUrl)}
                id={`gallery-item-${item.id}`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.caption}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-104"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />

                {/* Cover Overlay hover state */}
                <div className="absolute inset-0 bg-bg-dark/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <div className="border-l-2 border-terracotta pl-3">
                    <span className="text-[10px] text-terracotta uppercase font-mono tracking-widest block">{item.category}</span>
                    <p className="font-serif italic text-sm text-text-light mt-1">{item.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Instagram prompt link */}
          <div className="text-center mt-12">
            <span className="font-sans text-xs text-text-muted block mb-3">Follow the story</span>
            <a
              href="https://instagram.com/aethera.stay"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-serif italic text-2xl text-gold-light hover:text-terracotta transition-colors group"
            >
              <Instagram className="w-5 h-5 text-terracotta group-hover:rotate-6 transition-transform duration-300" />
              <span>@aethera.stay on Instagram</span>
              <ExternalLink className="w-4 h-4 text-text-muted opacity-50" />
            </a>
          </div>

        </div>
      </section>

      {/* SECTION 9 — TESTIMONIAL POSTCARDS */}
      <section
        id="testimonials"
        className="py-18 md:py-28 bg-[#1e1509] px-6 md:px-12 relative overflow-hidden text-text-dark"
      >
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-terracotta/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">

          <span className="block font-sans text-xs uppercase tracking-widest text-text-light/60 font-semibold mb-3">RESONANCE</span>
          <h2 className="font-serif italic text-4xl md:text-5xl text-text-light mb-16">
            Reflections written on the veranda
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-stretch pt-2 pb-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((post) => (
              <div
                key={post.id}
                className={`bg-bg-parchment p-8 md:p-10 rounded-xl relative shadow-2xl flex flex-col justify-between transform transition-transform duration-500 hover:rotate-0 hover:scale-103 ${post.rotation}`}
                id={`testimonial-postcard-${post.id}`}
              >
                {/* Hand-drawn vector brushstroke on top */}
                <div className="text-center mb-6">
                  <svg className="w-20 h-2 bg-transparent text-terracotta/40 mx-auto select-none pointer-events-none opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M5 C30 8, 70 2, 95 5 C80 9, 40 4, 5 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>

                <p className="font-serif italic text-lg md:text-xl text-text-dark leading-relaxed mb-8 max-w-md mx-auto text-center font-normal">
                  &ldquo;{post.quote}&rdquo;
                </p>

                <div className="border-t border-terracotta/15 pt-4 text-center">
                  <span className="font-sans text-xs uppercase tracking-widest text-[#8a7a68] font-semibold">
                    — {post.author}, {post.country}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 10 — BOOKING DIRECT CTA / WIDGET */}
      <section
        id="booking"
        className="py-18 md:py-28 relative overflow-hidden"
      >
        {/* Full background Golden Hour Overlay block */}
        <div className="absolute inset-0 z-0">
          <img
            src={siteImages?.bookingBg || DEFAULT_SITE_IMAGES.bookingBg}
            alt="Golden Hour Soaking tub background"
            className="w-full h-full object-cover scale-102 filter brightness-[0.35]"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">

          <div className="text-center mb-16 max-w-xl mx-auto">
            <h2 className="font-serif italic text-5xl md:text-6xl text-text-light mb-4">
              Come as you are. <br />
              Leave as you needed.
            </h2>
            <p className="font-sans font-light text-sm md:text-base text-text-light/85 mt-4 leading-relaxed">
              Book directly with us for the best rate. Or reach out over WhatsApp — we will help you plan the rest of your south coast journey.
            </p>
          </div>

          {/* Highly dynamic Booking Form widget compiled component */}
          <BookingWidget />

          {/* Minimalist Booking Alternate channels list inline */}
          <div className="mt-14 pt-8 border-t border-text-light/15 text-center flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-text-muted">
            <span className="uppercase tracking-wider font-semibold">Preferred OTA Channels:</span>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://www.hostelworld.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-gold-light underline underline-offset-4 decoration-current transition-colors flex items-center gap-1"
              >
                <span>Find Us on Hostelworld</span>
                <ExternalLink className="w-3 h-3 text-terracotta" />
              </a>
              <span className="h-2 w-[1px] bg-text-muted/30 hidden md:block"></span>
              <a
                href="https://www.booking.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-gold-light underline underline-offset-4 decoration-current transition-colors flex items-center gap-1"
              >
                <span>Find Us on Booking.com</span>
                <ExternalLink className="w-3 h-3 text-terracotta" />
              </a>
              <span className="h-2 w-[1px] bg-text-muted/30 hidden md:block"></span>
              <a
                href="https://wa.me/94765618401"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#e8c07a] font-semibold text-terracotta flex items-center gap-1 transition-colors"
                id="footer-whatspp-lead"
              >
                <span>WhatsApp Coordinator Directly</span>
                <PhoneCall className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 11 — FOOTER */}
      <footer
        id="footer"
        className="bg-[#0c0804] text-text-light/80 border-t border-terracotta/15 py-16 px-6 md:px-12"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

          {/* Left Column Brand info */}
          <div className="space-y-4">
            <h4 className="font-serif italic text-2xl text-gold-light">Aethera Stay</h4>
            <div className="font-sans text-xs md:text-[13px] text-text-muted leading-relaxed">
              <p>Mirissa South, Southern Province</p>
              <p>Sri Lanka, 81700</p>
              <p className="mt-2 text-[11px] text-text-muted/70">Tucked behind the Zouk Beach Club, 1 min walk from the main surf break.</p>
            </div>
          </div>

          {/* Center Column links */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-terracotta">Sanctuary Routes</h4>
            <nav className="flex flex-col gap-2.5 font-sans text-xs md:text-[13px]">
              <a href="#hero" className="hover:text-gold-light transition-colors w-fit">Home Directory</a>
              <a href="#philosophy" className="hover:text-gold-light transition-colors w-fit">Veranda Philosophy</a>
              <a href="#spaces" className="hover:text-gold-light transition-colors w-fit">Curated Rooms & Yards</a>
              <a href="#location" className="hover:text-gold-light transition-colors w-fit">Coastal Route Map</a>
              <a href="#booking" className="hover:text-gold-light transition-colors w-fit font-medium text-gold-light">Secure Direct Spot</a>
            </nav>
          </div>

          {/* Right Column Social contacts */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-terracotta">Inquiries & Stories</h4>
            <div className="font-sans text-xs md:text-[13px] space-y-2">
              <p>
                <span className="text-text-muted block">Direct Desk WhatsApp:</span>
                <a href="https://wa.me/94765618401" className="text-gold-light hover:underline font-medium hover:text-[#f2e8d8] transition-colors">+94 76 561 8401</a>
              </p>
              <p className="pt-1.5">
                <span className="text-text-muted block">Direct Desk Email:</span>
                <a href="mailto:stay@aetheramirissa.com" className="text-text-light hover:underline font-medium hover:text-[#e8c07a] transition-colors">stay@aetheramirissa.com</a>
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/aethera.stay"
                target="_blank"
                rel="noreferrer"
                className="bg-bg-dark border border-terracotta/15 w-9 h-9 rounded-full flex items-center justify-center text-gold-light hover:text-terracotta transition-all shadow-sm"
                title="Follow Aethera on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto border-t border-terracotta/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
          <span className="italic font-serif font-light text-[13px] text-text-muted/80">Where Inside Meets Outside</span>
          <span>&copy; 2026 Aethera Stay, Mirissa. All rights reserved. Made for the slow traveler.</span>
        </div>
      </footer>

      {/* Lightbox / Gallery Fullscreen Image Viewer Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 w-full h-full bg-[#140f08]/96 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
          id="gallery-fullscreen-lightbox"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-[#e8c07a] hover:text-terracotta w-10 h-10 rounded-full border border-terracotta/10 flex items-center justify-center bg-bg-dark/80 cursor-pointer"
          >
            &times;
          </button>
          <img
            src={lightboxImage}
            alt="Fullscreen Galleried snapshot"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Reusable Room Detail Display Portal Popup dialog */}
      {selectedRoom && (
        <RoomModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onBookRoom={handlePreSelectRoom}
        />
      )}

    </div>
  );
}

