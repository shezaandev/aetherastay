import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../firebase";
import { ROOMS_AND_SPACES } from "../../data";
import { Edit3, RefreshCw, Layers, Bed, Users2, DollarSign, Plus, Trash2, Check, X } from "lucide-react";

interface RoomSpace {
  id: string;
  name: string;
  description: string;
  details: string[];
  capacity: string;
  bedType: string;
  ratePerNight: number;
  imageUrl: string;
  aspectRatio: string;
}

export default function RoomManager() {
  const [rooms, setRooms] = useState<RoomSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editRate, setEditRate] = useState(0);
  const [editBed, setEditBed] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editDetails, setEditDetails] = useState<string[]>([]);
  const [editAspectRatio, setEditAspectRatio] = useState("");

  useEffect(() => {
    // Listen to "rooms" collection
    const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
      if (snapshot.empty) {
        // Bootstrap with default ROOMS_AND_SPACES from data.ts
        const promises = ROOMS_AND_SPACES.map((room) =>
          setDoc(doc(db, "rooms", room.id), room)
        );
        Promise.all(promises)
          .then(() => {
            console.log("Successfully bootstrapped rooms collection.");
          })
          .catch((err) => {
            console.error("Failed to bootstrap rooms:", err);
            handleFirestoreError(err, OperationType.WRITE, "rooms");
          });
      } else {
        const list: RoomSpace[] = [];
        snapshot.forEach((snap) => {
          list.push(snap.data() as RoomSpace);
        });
        // Maintain consistent booking order as defined in source data.ts or custom alphabetical
        const ordered = list.sort((a, b) => {
          const idxA = ROOMS_AND_SPACES.findIndex(r => r.id === a.id);
          const idxB = ROOMS_AND_SPACES.findIndex(r => r.id === b.id);
          return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
        });
        setRooms(ordered);
        setLoading(false);
      }
    }, (err) => {
      console.error("Firestore loading rooms failed:", err);
      handleFirestoreError(err, OperationType.GET, "rooms");
    });

    return () => unsubscribe();
  }, []);

  const handleStartEdit = (room: RoomSpace) => {
    setEditingId(room.id);
    setEditName(room.name);
    setEditDesc(room.description);
    setEditRate(room.ratePerNight);
    setEditBed(room.bedType);
    setEditCapacity(room.capacity);
    setEditImageUrl(room.imageUrl);
    setEditDetails([...room.details]);
    setEditAspectRatio(room.aspectRatio);
  };

  const handleTriggerCloudinary = () => {
    if (!(window as any).cloudinary) {
      alert("Cloudinary script is not loaded yet.");
      return;
    }
    const metaEnv = (import.meta as any).env || {};
    const cloudName = metaEnv.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Configure your Cloudinary keys in your .env configuration!");
      return;
    }

    (window as any).cloudinary.openUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: false,
        folder: "aethera-stay-rooms",
        resourceType: "image"
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          setEditImageUrl(result.info.secure_url);
        }
      }
    );
  };

  const handleSave = async (id: string) => {
    if (!editName) {
      alert("Room name is mandatory.");
      return;
    }

    const updatedRoom: RoomSpace = {
      id,
      name: editName,
      description: editDesc,
      ratePerNight: editRate,
      bedType: editBed,
      capacity: editCapacity,
      imageUrl: editImageUrl,
      details: editDetails.filter(d => d.trim() !== ""),
      aspectRatio: editAspectRatio || "md:aspect-[3/4]"
    };

    try {
      await setDoc(doc(db, "rooms", id), updatedRoom);
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save room details:", err);
      handleFirestoreError(err, OperationType.WRITE, `rooms/${id}`);
    }
  };

  const handleAddDetail = () => {
    setEditDetails([...editDetails, ""]);
  };

  const handleDetailChange = (index: number, val: string) => {
    const updated = [...editDetails];
    updated[index] = val;
    setEditDetails(updated);
  };

  const handleRemoveDetail = (index: number) => {
    const updated = [...editDetails];
    updated.splice(index, 1);
    setEditDetails(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif italic text-lg text-gold-light">Rooms and Spaces</h3>
        <p className="text-xs text-text-muted">Manage rates, inventory descriptions, and detail lists</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-t-terracotta border-terracotta/10 animate-spin"></div>
          <span className="text-xs text-text-muted uppercase tracking-widest mt-4">Syncing rooms...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {rooms.map((room) => {
            const isEditing = editingId === room.id;
            return (
              <div
                key={room.id}
                className="bg-[#1e1509] border border-terracotta/20 rounded-2xl overflow-hidden shadow-lg"
              >
                {isEditing ? (
                  /* EDIT STATE */
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="border-b border-terracotta/15 pb-3 flex justify-between items-center">
                      <span className="font-sans text-xs uppercase tracking-widest text-terracotta font-semibold">
                        Editing: {room.name}
                      </span>
                      <span className="font-mono text-[9px] text-text-muted">ID: {room.id}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: Image Editor */}
                      <div className="space-y-3">
                        <label className="block text-[10px] uppercase tracking-wider text-text-muted">
                          Room Cover Photo
                        </label>
                        <div className="relative aspect-video lg:aspect-[4/3] rounded-xl overflow-hidden border border-text-muted/20">
                          <img src={editImageUrl} className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={handleTriggerCloudinary}
                          className="w-full bg-[#140f08] border border-terracotta/15 hover:border-terracotta/40 text-text-light py-2 rounded-lg text-xs font-sans tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-terracotta" />
                          Replace Image
                        </button>
                      </div>

                      {/* Middle & Right: Inputs */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-text-muted mb-1">
                              Room / Area Title
                            </label>
                            <input
                              type="text"
                              required
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-[#140f08]/80 border border-text-muted/20 focus:border-terracotta rounded-xl py-3 px-4 text-sm font-sans focus:outline-none text-text-light"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-text-muted mb-1">
                              Nightly Rate (USD)
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-terracotta" />
                              <input
                                type="number"
                                required
                                value={editRate}
                                onChange={(e) => setEditRate(Number(e.target.value))}
                                className="w-full bg-[#140f08]/80 border border-text-muted/20 focus:border-terracotta rounded-xl py-3 pl-9 pr-4 text-sm font-sans focus:outline-none text-text-light"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-text-muted mb-1">
                            Catchy Description
                          </label>
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={2}
                            className="w-full bg-[#140f08]/80 border border-text-muted/20 focus:border-terracotta rounded-xl py-3 px-4 text-sm font-sans focus:outline-none text-text-light"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-text-muted mb-1">
                              Beds Arrangement
                            </label>
                            <div className="relative">
                              <Bed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-terracotta" />
                              <input
                                type="text"
                                value={editBed}
                                onChange={(e) => setEditBed(e.target.value)}
                                className="w-full bg-[#140f08]/80 border border-text-muted/20 focus:border-terracotta rounded-xl py-3 pl-9 pr-4 text-sm font-sans focus:outline-none text-text-light"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-text-muted mb-1">
                              Total Capacity limits
                            </label>
                            <div className="relative">
                              <Users2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-terracotta" />
                              <input
                                type="text"
                                value={editCapacity}
                                onChange={(e) => setEditCapacity(e.target.value)}
                                className="w-full bg-[#140f08]/80 border border-text-muted/20 focus:border-terracotta rounded-xl py-3 pl-9 pr-4 text-sm font-sans focus:outline-none text-text-light"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Room Details Sub-Manager */}
                    <div className="space-y-3 pt-4 border-t border-text-muted/10">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] uppercase tracking-wider text-text-muted font-medium">
                          Amenities & Detail Highlights
                        </label>
                        <button
                          type="button"
                          onClick={handleAddDetail}
                          className="text-terracotta hover:text-gold-light text-xs font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add detail tag
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {editDetails.map((detail, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={detail}
                              onChange={(e) => handleDetailChange(index, e.target.value)}
                              placeholder="e.g. Complimentary organic yoga mats"
                              className="w-full bg-bg-dark/80 border border-text-muted/20 focus:border-terracotta rounded-xl py-2 px-3 text-xs text-text-light focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveDetail(index)}
                              className="p-2 text-dusty-pink hover:text-red-400 hover:bg-black/20 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-5 border-t border-text-muted/15">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-5 py-2.5 text-xs text-text-muted border border-text-muted/15 rounded-full hover:text-text-light select-none hover:bg-bg-dark cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(room.id)}
                        className="px-6 py-2.5 text-xs bg-terracotta hover:bg-[#b06740] text-text-light font-semibold rounded-full shadow-lg cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  /* VIEW STATE */
                  <div className="flex flex-col md:flex-row min-h-[160px]">
                    <div className="md:w-48 aspect-video md:aspect-auto h-auto md:h-40 shrink-0 relative overflow-hidden bg-black/10">
                      <img src={room.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    <div className="p-6 flex flex-col justify-between flex-grow">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <h4 className="font-serif italic text-2xl text-gold-light leading-none">
                              {room.name}
                            </h4>
                            <div className="flex items-center gap-4 text-[11px] text-text-muted font-sans mt-2">
                              <span className="flex items-center gap-1">
                                <Bed className="w-3.5 h-3.5 text-terracotta" /> {room.bedType}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users2 className="w-3.5 h-3.5 text-terracotta" /> {room.capacity}
                              </span>
                            </div>
                          </div>

                          <div className="px-3.5 py-1.5 bg-terracotta/10 border border-terracotta/25 rounded-xl">
                            <span className="font-sans text-[10px] text-terracotta uppercase tracking-wider block leading-none mb-1">
                              NIGHTLY RATE
                            </span>
                            <span className="font-serif text-lg text-text-light font-medium self-end">
                              {room.ratePerNight > 0 ? `$${room.ratePerNight}` : "Social Sanctuary"}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-text-muted leading-relaxed font-sans max-w-2xl pt-1">
                          {room.description}
                        </p>

                        {/* details list preview */}
                        {room.details.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {room.details.map((detail, dIdx) => (
                              <span
                                key={dIdx}
                                className="px-2.5 py-1 bg-[#140f08]/50 border border-terracotta/10 rounded-full text-[10px] font-sans text-text-muted"
                              >
                                {detail}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end pt-4 border-t border-text-muted/5 mt-4">
                        <button
                          onClick={() => handleStartEdit(room)}
                          className="px-4 py-2 hover:bg-[#140f08]/60 text-terracotta hover:text-gold-light border border-terracotta/15 hover:border-terracotta/40 rounded-full text-xs font-sans font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Room
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
