import { useState, useEffect } from "react";
import {
  doc, getDoc, setDoc, collection, onSnapshot,
  addDoc, deleteDoc, updateDoc, query, orderBy
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../firebase";
import {
  Image as ImageIcon, Plus, Trash2, Edit2, Check, X,
  AlertCircle, GalleryHorizontal, LayoutGrid
} from "lucide-react";
import CloudinaryImageUpload from "../../components/admin/CloudinaryImageUpload";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SiteImages {
  heroImage: string;
  storyTurtle: string;
  storyInterior: string;
  storyLily: string;
  storyPeacock: string;
  bookingBg: string;
  actSurf: string;
  actWhale: string;
  actYoga: string;
  actDoctors: string;
  actTurtle: string;
  videoPoster: string;
}

interface GalleryItem {
  id: string;
  imageUrl: string;
  category: string;
  caption: string;
}

interface VillaGalleryItem {
  id: string;
  imageUrl: string;
  category: string;
  caption: string;
  order: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SITE_IMAGES: SiteImages = {
  heroImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
  storyTurtle: "https://images.unsplash.com/photo-1437622368342-7a3d7ebea3cf?auto=format&fit=crop&w=400&q=80",
  storyInterior: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80",
  storyLily: "https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=400&q=80",
  storyPeacock: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=400&q=80",
  bookingBg: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80",
  actSurf: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
  actWhale: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=800&q=80",
  actYoga: "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?auto=format&fit=crop&w=800&q=80",
  actDoctors: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
  actTurtle: "https://images.unsplash.com/photo-1437622368342-7a3d7ebea3cf?auto=format&fit=crop&w=400&q=80",
  videoPoster: "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=800&q=80",
};

const SITE_IMAGE_META: { key: keyof SiteImages; label: string; aspect: string }[] = [
  { key: "heroImage",      label: "Hero Section Background",        aspect: "16:9 — full-width banner" },
  { key: "storyTurtle",    label: "Story Section — Turtle",         aspect: "Square or portrait" },
  { key: "storyInterior",  label: "Story Section — Interior Room",  aspect: "Square or portrait" },
  { key: "storyLily",      label: "Story Section — Water Lily",     aspect: "Square or portrait" },
  { key: "storyPeacock",   label: "Story Section — Peacock",        aspect: "Square or portrait" },
  { key: "bookingBg",      label: "Booking Section Background",     aspect: "16:9 — full-width banner" },
  { key: "actSurf",        label: "Activities — Surf Guide",        aspect: "3:2 landscape" },
  { key: "actWhale",       label: "Activities — Whale Watching",    aspect: "3:2 landscape" },
  { key: "actYoga",        label: "Activities — Yoga Veranda",      aspect: "3:2 landscape" },
  { key: "actDoctors",     label: "Activities — Doctor's House",    aspect: "3:2 landscape" },
  { key: "actTurtle",      label: "Activities — Turtle Season",     aspect: "3:2 landscape" },
  { key: "videoPoster",    label: "Experience Section Video Poster",aspect: "16:9 recommended" },
];

const GALLERY_CATEGORIES = ["The Spaces", "Nature & Wildlife", "Food & Experience", "Around Mirissa"];
const VILLA_CATEGORIES = ["Pool & Terrace", "Villa Design", "Courtyard Garden", "Signature Tub", "Ocean Vistas", "Colonial Architecture"];

// Default villa gallery items (used only to bootstrap Firestore on first load)
const DEFAULT_VILLA_ITEMS: Omit<VillaGalleryItem, "id">[] = [
  { imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80", category: "Pool & Terrace",        caption: "Plunge into local rhythms by the water.", order: 0 },
  { imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", category: "Villa Design",           caption: "Every morning meets custom wooden structures.", order: 1 },
  { imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80", category: "Courtyard Garden",       caption: "Sunbeams streaming through wild jackfruit trees.", order: 2 },
  { imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80", category: "Signature Tub",          caption: "Bask under stars in terracotta solace.", order: 3 },
  { imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80", category: "Ocean Vistas",           caption: "Dawn breaking along the golden shorelines.", order: 4 },
  { imageUrl: "https://images.unsplash.com/photo-1602002418082-dd4a3f5b3a0b?auto=format&fit=crop&w=800&q=80", category: "Colonial Architecture",  caption: "Century-old history meets modern retreat design.", order: 5 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageManager() {
  const [tab, setTab] = useState<"site" | "villa" | "gallery">("site");

  // Site images state
  const [siteImages, setSiteImages] = useState<SiteImages | null>(null);
  const [siteSaving, setSiteSaving] = useState<Partial<Record<keyof SiteImages, boolean>>>({});

  // Villa gallery state
  const [villaItems, setVillaItems] = useState<VillaGalleryItem[]>([]);
  const [villaSaving, setVillaSaving] = useState(false);
  const [villaEditId, setVillaEditId] = useState<string | null>(null);
  const [villaEditCaption, setVillaEditCaption] = useState("");
  const [villaEditCategory, setVillaEditCategory] = useState("");
  const [showVillaAddForm, setShowVillaAddForm] = useState(false);
  const [newVillaUrl, setNewVillaUrl] = useState("");
  const [newVillaCaption, setNewVillaCaption] = useState("");
  const [newVillaCategory, setNewVillaCategory] = useState(VILLA_CATEGORIES[0]);

  // Gallery state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [gallerySaving, setGallerySaving] = useState(false);
  const [galleryEditId, setGalleryEditId] = useState<string | null>(null);
  const [galleryEditCaption, setGalleryEditCaption] = useState("");
  const [galleryEditCategory, setGalleryEditCategory] = useState("");
  const [showGalleryAddForm, setShowGalleryAddForm] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryCaption, setNewGalleryCaption] = useState("");
  const [newGalleryCategory, setNewGalleryCategory] = useState(GALLERY_CATEGORIES[0]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Firestore listeners ──────────────────────────────────────────────────

  useEffect(() => {
    let done = 0;
    const checkDone = () => { done++; if (done === 3) setLoading(false); };

    // 1. siteImages/main
    const siteRef = doc(db, "siteImages", "main");
    const unsubSite = onSnapshot(siteRef, async (snap) => {
      if (snap.exists()) {
        setSiteImages(snap.data() as SiteImages);
      } else {
        await setDoc(siteRef, DEFAULT_SITE_IMAGES).catch(console.error);
        setSiteImages(DEFAULT_SITE_IMAGES);
      }
      checkDone();
    }, (err) => {
      setError("Failed to load site images.");
      console.error(err);
      checkDone();
    });

    // 2. villaGallery collection
    const villaQ = query(collection(db, "villaGallery"), orderBy("order", "asc"));
    const unsubVilla = onSnapshot(villaQ, async (snap) => {
      if (snap.empty) {
        // Bootstrap from defaults on first load
        const batch = DEFAULT_VILLA_ITEMS.map((item) =>
          addDoc(collection(db, "villaGallery"), item)
        );
        await Promise.all(batch).catch(console.error);
      } else {
        const items: VillaGalleryItem[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() } as VillaGalleryItem));
        setVillaItems(items);
      }
      checkDone();
    }, (err) => {
      setError("Failed to load villa gallery.");
      console.error(err);
      checkDone();
    });

    // 3. gallery collection
    const unsubGallery = onSnapshot(collection(db, "gallery"), (snap) => {
      const items: GalleryItem[] = [];
      snap.forEach((d) => items.push({ id: d.id, ...d.data() } as GalleryItem));
      setGalleryItems(items);
      checkDone();
    }, (err) => {
      setError("Failed to load gallery.");
      console.error(err);
      checkDone();
    });

    return () => { unsubSite(); unsubVilla(); unsubGallery(); };
  }, []);

  // ── Site Images handlers ─────────────────────────────────────────────────

  const handleSiteImageUpdate = async (key: keyof SiteImages, newUrl: string) => {
    if (!siteImages || !newUrl.trim()) return;
    setSiteSaving((prev) => ({ ...prev, [key]: true }));
    try {
      await updateDoc(doc(db, "siteImages", "main"), { [key]: newUrl });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "siteImages/main");
    } finally {
      setSiteSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  // ── Villa Gallery handlers ───────────────────────────────────────────────

  const handleVillaAdd = async () => {
    if (!newVillaUrl.trim()) return;
    setVillaSaving(true);
    try {
      await addDoc(collection(db, "villaGallery"), {
        imageUrl: newVillaUrl.trim(),
        caption: newVillaCaption.trim(),
        category: newVillaCategory,
        order: villaItems.length,
      });
      setNewVillaUrl(""); setNewVillaCaption(""); setNewVillaCategory(VILLA_CATEGORIES[0]);
      setShowVillaAddForm(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "villaGallery");
    } finally {
      setVillaSaving(false);
    }
  };

  const handleVillaDelete = async (id: string) => {
    if (!confirm("Delete this villa gallery image?")) return;
    await deleteDoc(doc(db, "villaGallery", id)).catch(console.error);
  };

  const handleVillaSaveEdit = async (id: string) => {
    await updateDoc(doc(db, "villaGallery", id), {
      caption: villaEditCaption,
      category: villaEditCategory,
    }).catch(console.error);
    setVillaEditId(null);
  };

  const handleVillaImageUpload = async (id: string, url: string) => {
    await updateDoc(doc(db, "villaGallery", id), { imageUrl: url }).catch(console.error);
  };

  // ── Gallery handlers ─────────────────────────────────────────────────────

  const handleGalleryAdd = async () => {
    if (!newGalleryUrl.trim()) return;
    setGallerySaving(true);
    try {
      await addDoc(collection(db, "gallery"), {
        imageUrl: newGalleryUrl.trim(),
        caption: newGalleryCaption.trim(),
        category: newGalleryCategory,
      });
      setNewGalleryUrl(""); setNewGalleryCaption(""); setNewGalleryCategory(GALLERY_CATEGORIES[0]);
      setShowGalleryAddForm(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "gallery");
    } finally {
      setGallerySaving(false);
    }
  };

  const handleGalleryDelete = async (id: string) => {
    if (!confirm("Delete this gallery image?")) return;
    await deleteDoc(doc(db, "gallery", id)).catch(console.error);
  };

  const handleGallerySaveEdit = async (id: string) => {
    await updateDoc(doc(db, "gallery", id), {
      caption: galleryEditCaption,
      category: galleryEditCategory,
    }).catch(console.error);
    setGalleryEditId(null);
  };

  const handleGalleryImageUpload = async (id: string, url: string) => {
    await updateDoc(doc(db, "gallery", id), { imageUrl: url }).catch(console.error);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif italic text-2xl text-text-light">Image Manager</h2>
        <p className="text-xs text-text-muted font-sans mt-1">
          Manage all photos across the website. Upload via Cloudinary or paste a URL.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/40 rounded-lg px-4 py-3 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-terracotta/10 pb-0">
        {[
          { id: "site",    label: "Site Images",    icon: <ImageIcon className="w-3.5 h-3.5" /> },
          { id: "villa",   label: "Villa Gallery",  icon: <GalleryHorizontal className="w-3.5 h-3.5" /> },
          { id: "gallery", label: "Gallery",        icon: <LayoutGrid className="w-3.5 h-3.5" /> },
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-sans uppercase tracking-widest font-semibold border-b-2 transition-colors ${
              tab === id
                ? "border-terracotta text-terracotta"
                : "border-transparent text-text-muted hover:text-gold-light"
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ── TAB: SITE IMAGES ─────────────────────────────────────────────── */}
      {tab === "site" && siteImages && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SITE_IMAGE_META.map(({ key, label, aspect }) => (
            <div key={key} className="bg-[#1a1206] border border-terracotta/15 rounded-xl p-4 space-y-3">
              <CloudinaryImageUpload
                label={label}
                currentUrl={siteImages[key]}
                folder="aethera/site"
                aspectHint={aspect}
                onUploadSuccess={(url) => handleSiteImageUpdate(key, url)}
              />
              {/* URL paste fallback */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Or paste image URL…"
                  defaultValue={siteImages[key]}
                  key={siteImages[key]} // reset on external update
                  onBlur={(e) => {
                    if (e.target.value !== siteImages[key]) {
                      handleSiteImageUpdate(key, e.target.value);
                    }
                  }}
                  className="flex-1 bg-[#120d04] border border-terracotta/20 rounded-lg px-3 py-1.5 text-xs text-text-light font-sans focus:outline-none focus:border-terracotta/60 placeholder-text-muted/40"
                />
                {siteSaving[key] && (
                  <div className="w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full animate-spin self-center" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: VILLA GALLERY ───────────────────────────────────────────── */}
      {tab === "villa" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted font-sans">
              These images appear in the <strong className="text-text-light">"The Villa"</strong> section on the website (the masonry grid above the gallery).
            </p>
            <button
              onClick={() => setShowVillaAddForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-terracotta/90 hover:bg-terracotta text-white rounded-lg text-xs font-sans font-semibold uppercase tracking-widest transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Image
            </button>
          </div>

          {/* Add form */}
          {showVillaAddForm && (
            <div className="bg-[#1a1206] border border-terracotta/20 rounded-xl p-4 space-y-3">
              <p className="text-xs font-sans uppercase tracking-widest text-terracotta font-semibold">New Villa Gallery Image</p>
              <CloudinaryImageUpload
                label="Upload image"
                folder="aethera/villa"
                onUploadSuccess={(url) => setNewVillaUrl(url)}
              />
              <input
                type="url"
                placeholder="Or paste Cloudinary / image URL…"
                value={newVillaUrl}
                onChange={(e) => setNewVillaUrl(e.target.value)}
                className="w-full bg-[#120d04] border border-terracotta/20 rounded-lg px-3 py-2 text-sm text-text-light font-sans focus:outline-none focus:border-terracotta/60"
              />
              <input
                type="text"
                placeholder="Caption (e.g. Plunge into local rhythms)"
                value={newVillaCaption}
                onChange={(e) => setNewVillaCaption(e.target.value)}
                className="w-full bg-[#120d04] border border-terracotta/20 rounded-lg px-3 py-2 text-sm text-text-light font-sans focus:outline-none focus:border-terracotta/60"
              />
              <select
                value={newVillaCategory}
                onChange={(e) => setNewVillaCategory(e.target.value)}
                className="w-full bg-[#120d04] border border-terracotta/20 rounded-lg px-3 py-2 text-sm text-text-light font-sans focus:outline-none focus:border-terracotta/60"
              >
                {VILLA_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={handleVillaAdd} disabled={!newVillaUrl || villaSaving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-terracotta text-white rounded-lg text-xs font-sans font-semibold disabled:opacity-50">
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => setShowVillaAddForm(false)}
                  className="px-4 py-2 border border-terracotta/30 text-text-muted rounded-lg text-xs font-sans hover:text-text-light">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Items grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {villaItems.map((item) => (
              <div key={item.id} className="bg-[#1a1206] border border-terracotta/15 rounded-xl overflow-hidden">
                {/* Image with upload overlay */}
                <div className="relative group">
                  <img src={item.imageUrl} alt={item.caption} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-bg-dark/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <CloudinaryImageUpload
                      folder="aethera/villa"
                      onUploadSuccess={(url) => handleVillaImageUpload(item.id, url)}
                    />
                  </div>
                </div>

                {/* Info / edit */}
                <div className="p-3 space-y-2">
                  {villaEditId === item.id ? (
                    <>
                      <input value={villaEditCaption} onChange={(e) => setVillaEditCaption(e.target.value)}
                        className="w-full bg-[#120d04] border border-terracotta/20 rounded px-2 py-1 text-xs text-text-light font-sans" />
                      <select value={villaEditCategory} onChange={(e) => setVillaEditCategory(e.target.value)}
                        className="w-full bg-[#120d04] border border-terracotta/20 rounded px-2 py-1 text-xs text-text-light font-sans">
                        {VILLA_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => handleVillaSaveEdit(item.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-terracotta text-white rounded text-xs">
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button onClick={() => setVillaEditId(null)}
                          className="flex items-center gap-1 px-2 py-1 border border-terracotta/30 text-text-muted rounded text-xs">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-text-light font-sans leading-snug">{item.caption || <span className="text-text-muted italic">No caption</span>}</p>
                      <span className="text-[10px] text-terracotta font-mono uppercase">{item.category}</span>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => { setVillaEditId(item.id); setVillaEditCaption(item.caption); setVillaEditCategory(item.category); }}
                          className="flex items-center gap-1 px-2 py-1 border border-terracotta/30 text-text-muted hover:text-gold-light rounded text-xs">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => handleVillaDelete(item.id)}
                          className="flex items-center gap-1 px-2 py-1 border border-red-500/30 text-red-400 hover:text-red-300 rounded text-xs">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: GALLERY ─────────────────────────────────────────────────── */}
      {tab === "gallery" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted font-sans">
              These images appear in the <strong className="text-text-light">Gallery</strong> section with the category filter tabs.
            </p>
            <button
              onClick={() => setShowGalleryAddForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-terracotta/90 hover:bg-terracotta text-white rounded-lg text-xs font-sans font-semibold uppercase tracking-widest transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Image
            </button>
          </div>

          {/* Add form */}
          {showGalleryAddForm && (
            <div className="bg-[#1a1206] border border-terracotta/20 rounded-xl p-4 space-y-3">
              <p className="text-xs font-sans uppercase tracking-widest text-terracotta font-semibold">New Gallery Image</p>
              <CloudinaryImageUpload
                label="Upload image"
                folder="aethera/gallery"
                onUploadSuccess={(url) => setNewGalleryUrl(url)}
              />
              <input type="url" placeholder="Or paste image URL…" value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                className="w-full bg-[#120d04] border border-terracotta/20 rounded-lg px-3 py-2 text-sm text-text-light font-sans focus:outline-none focus:border-terracotta/60" />
              <input type="text" placeholder="Caption" value={newGalleryCaption}
                onChange={(e) => setNewGalleryCaption(e.target.value)}
                className="w-full bg-[#120d04] border border-terracotta/20 rounded-lg px-3 py-2 text-sm text-text-light font-sans focus:outline-none focus:border-terracotta/60" />
              <select value={newGalleryCategory} onChange={(e) => setNewGalleryCategory(e.target.value)}
                className="w-full bg-[#120d04] border border-terracotta/20 rounded-lg px-3 py-2 text-sm text-text-light font-sans focus:outline-none focus:border-terracotta/60">
                {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={handleGalleryAdd} disabled={!newGalleryUrl || gallerySaving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-terracotta text-white rounded-lg text-xs font-sans font-semibold disabled:opacity-50">
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => setShowGalleryAddForm(false)}
                  className="px-4 py-2 border border-terracotta/30 text-text-muted rounded-lg text-xs font-sans">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Items grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryItems.map((item) => (
              <div key={item.id} className="bg-[#1a1206] border border-terracotta/15 rounded-xl overflow-hidden">
                <div className="relative group">
                  <img src={item.imageUrl} alt={item.caption} className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-bg-dark/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <CloudinaryImageUpload
                      folder="aethera/gallery"
                      onUploadSuccess={(url) => handleGalleryImageUpload(item.id, url)}
                    />
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {galleryEditId === item.id ? (
                    <>
                      <input value={galleryEditCaption} onChange={(e) => setGalleryEditCaption(e.target.value)}
                        className="w-full bg-[#120d04] border border-terracotta/20 rounded px-2 py-1 text-xs text-text-light font-sans" />
                      <select value={galleryEditCategory} onChange={(e) => setGalleryEditCategory(e.target.value)}
                        className="w-full bg-[#120d04] border border-terracotta/20 rounded px-2 py-1 text-xs text-text-light font-sans">
                        {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => handleGallerySaveEdit(item.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-terracotta text-white rounded text-xs">
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button onClick={() => setGalleryEditId(null)}
                          className="flex items-center gap-1 px-2 py-1 border border-terracotta/30 text-text-muted rounded text-xs">
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-text-light font-sans">{item.caption || <span className="text-text-muted italic">No caption</span>}</p>
                      <span className="text-[10px] text-terracotta font-mono uppercase">{item.category}</span>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => { setGalleryEditId(item.id); setGalleryEditCaption(item.caption); setGalleryEditCategory(item.category); }}
                          className="flex items-center gap-1 px-2 py-1 border border-terracotta/30 text-text-muted hover:text-gold-light rounded text-xs">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => handleGalleryDelete(item.id)}
                          className="flex items-center gap-1 px-2 py-1 border border-red-500/30 text-red-400 hover:text-red-300 rounded text-xs">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
