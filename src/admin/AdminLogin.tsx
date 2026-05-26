import { useState, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

interface AdminLoginProps {
  onSuccess?: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      // Give semantic error descriptions
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid credentials. Please verify your email and password.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-login-screen" className="min-h-screen bg-bg-dark flex flex-col justify-center items-center px-6 relative">
      {/* Absolute Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>
      
      <div className="relative z-10 w-full max-w-md bg-bg-warm border border-terracotta/20 rounded-2xl p-8 md:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-terracotta/20 mb-4 bg-bg-dark/40">
            <ShieldCheck className="w-6 h-6 text-terracotta animate-pulse" />
          </div>
          <h1 className="font-serif italic text-3.5xl text-gold-light leading-none">Aethera Stay</h1>
          <span className="font-sans text-[10px] uppercase tracking-[0.35em] text-terracotta font-semibold mt-2.5 block">
            Admin Access
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block font-sans text-[10px] uppercase tracking-widest text-text-muted mb-2 font-medium">
              Email Address
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aetherastay.com"
              className="w-full bg-bg-dark/80 border border-text-muted/20 focus:border-terracotta rounded-xl py-3 px-4 text-sm font-sans focus:outline-none text-text-light transition-colors"
            />
          </div>

          {/* Password input */}
          <div>
            <label className="block font-sans text-[10px] uppercase tracking-widest text-text-muted mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-dark/80 border border-text-muted/20 focus:border-terracotta rounded-xl py-3 pl-4 pr-11 text-sm font-sans focus:outline-none text-text-light transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-light transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-dusty-pink text-xs bg-dusty-pink/10 border border-dusty-pink/20 rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-[#b06740] text-text-light font-sans text-xs font-semibold uppercase tracking-widest py-3.5 rounded-full transition-all duration-300 shadow-xl border border-transparent hover:border-gold-light/15 hover:scale-101 active:scale-99 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-text-muted/65 leading-relaxed">
            Authorized personnel only.<br />All sessions and accesses are monitored securely.
          </p>
        </div>
      </div>
    </div>
  );
}
