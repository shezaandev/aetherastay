import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../firebase";
import AdminLogin from "./AdminLogin";
import Enquiries from "./tabs/Enquiries";
import ImageManager from "./tabs/ImageManager";
import RoomManager from "./tabs/RoomManager";
import { Mail, Image as ImageIcon, BedDouble, LogOut, Calendar, ShieldCheck } from "lucide-react";

export default function AdminShell() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/admin");
    } catch (err) {
      console.error("Sign out fail:", err);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-terracotta border-terracotta/10 animate-spin"></div>
        <span className="text-xs text-text-muted mt-4 uppercase tracking-widest font-sans">
          Verifying Admin Session...
        </span>
      </div>
    );
  }

  // Not signed in -> render Full-screen Login
  if (!user) {
    return <AdminLogin onSuccess={() => navigate("/admin/enquiries")} />;
  }

  const currentPath = location.pathname;

  const navItems = [
    { label: "Enquiries", path: "/admin/enquiries", icon: Mail, title: "Inbound Enquiries" },
    { label: "Image Manager", path: "/admin/images", icon: ImageIcon, title: "Site Media Manager" },
    { label: "Rooms", path: "/admin/rooms", icon: BedDouble, title: "Stay Accommodations" },
  ];

  const currentNav = navItems.find((item) => currentPath === item.path) || navItems[0];
  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg-dark flex text-text-light font-sans relative">
      {/* Absolute Grain overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>

      {/* FIXED SIDEBAR */}
      <aside className="w-64 bg-[#0c0804] border-r border-terracotta/10 flex flex-col justify-between shrink-0 relative z-10 select-none">
        <div>
          {/* Logo Heading */}
          <div className="p-6 border-b border-terracotta/10">
            <h1 className="font-serif italic text-2xl text-gold-light leading-none">Aethera Stay</h1>
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-terracotta font-semibold mt-2 block">
              Admin Panel
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 mt-4">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (currentPath === "/admin" && item.path === "/admin/enquiries");
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  id={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  to={item.path}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-terracotta/10 text-terracotta border-l-2 border-terracotta"
                      : "text-text-muted hover:text-text-light hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Sign out */}
        <div className="p-4 border-t border-terracotta/10 bg-[#070502]/60">
          <div className="flex items-center gap-2.5 mb-3 px-2">
            <div className="w-7 h-7 rounded-full bg-terracotta/20 border border-terracotta/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-terracotta" />
            </div>
            <div className="min-w-0 pr-1 flex-grow">
              <p className="text-[10px] text-text-light font-semibold truncate">
                {user.email}
              </p>
              <p className="text-[8px] text-text-muted uppercase tracking-wider leading-none">
                Verified Admin
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            id="admin-sign-out"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-dark rounded-xl text-xs uppercase tracking-wider text-text-muted hover:text-dusty-pink hover:bg-dusty-pink/10 border border-transparent hover:border-dusty-pink/15 transition-all text-center cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-grow flex flex-col min-w-0 relative z-10">
        {/* TOP VIEWBAR */}
        <header className="h-20 border-b border-terracotta/10 bg-[#0c0804]/30 px-8 flex justify-between items-center select-none">
          <div className="flex items-center gap-3">
            <h2 className="font-serif italic text-2xl text-gold-light leading-none">
              {currentNav.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-sans text-text-muted">
            <Calendar className="w-4 h-4 text-terracotta" />
            <span>{currentDateStr}</span>
          </div>
        </header>

        {/* CONTAINER VIEW */}
        <div className="p-8 flex-grow overflow-y-auto max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="images" element={<ImageManager />} />
            <Route path="rooms" element={<RoomManager />} />
            {/* Fallback endpoints */}
            <Route path="*" element={<Navigate to="/admin/enquiries" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
