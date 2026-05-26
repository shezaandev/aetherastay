import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../firebase";
import { Mail, Check, X, Trash2, Eye, MessageSquare, ChevronDown, ChevronUp, Calendar, AlertCircle } from "lucide-react";

interface Enquiry {
  id: string;
  fullName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  selectedRoomId: string;
  selectedRoomName: string;
  message: string;
  totalPrice: number;
  nights: number;
  status: "new" | "read" | "confirmed" | "cancelled";
  receivedAt: Timestamp | any;
}

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "confirmed" | "cancelled">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "enquiries"), orderBy("receivedAt", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Enquiry[] = [];
        snapshot.forEach((docSnap) => {
          list.push({
            id: docSnap.id,
            ...docSnap.data()
          } as Enquiry);
        });
        setEnquiries(list);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
        setError("Error loading enquiries from database.");
        setLoading(false);
        try {
          handleFirestoreError(err, OperationType.GET, "enquiries");
        } catch (e) {
          // Keep logged
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const totalCount = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === "new").length;
  const confirmedCount = enquiries.filter((e) => e.status === "confirmed").length;
  const cancelledCount = enquiries.filter((e) => e.status === "cancelled").length;

  const filteredEnquiries = statusFilter === "all" 
    ? enquiries 
    : enquiries.filter((e) => e.status === statusFilter);

  const updateStatus = async (id: string, newStatus: "new" | "read" | "confirmed" | "cancelled") => {
    try {
      await updateDoc(doc(db, "enquiries", id), { status: newStatus });
    } catch (err) {
      console.error("Error updating status:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `enquiries/${id}`);
      } catch (firestoreErr: any) {
        alert("Failed to update status: " + firestoreErr.message);
      }
    }
  };

  const deleteEnquiry = async (id: string) => {
    if (window.confirm("Are you absolutely sure you want to delete this enquiry permanently?")) {
      try {
        await deleteDoc(doc(db, "enquiries", id));
      } catch (err) {
        console.error("Error deleting enquiry:", err);
        try {
          handleFirestoreError(err, OperationType.DELETE, `enquiries/${id}`);
        } catch (firestoreErr: any) {
          alert("Failed to delete: " + firestoreErr.message);
        }
      }
    }
  };

  const formatReceivedDate = (receivedAt: any) => {
    if (!receivedAt) return "";
    let date: Date;
    if (typeof receivedAt.toDate === "function") {
      date = receivedAt.toDate();
    } else {
      date = new Date(receivedAt);
    }
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }) + ", " + date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).toLowerCase();
  };

  const formatStay = (checkInStr: string, checkOutStr: string) => {
    const fIn = new Date(checkInStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const fOut = new Date(checkOutStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${fIn} to ${fOut}`;
  };

  const generateWhatsAppMessageText = (enquiry: Enquiry) => {
    const fIn = new Date(enquiry.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const fOut = new Date(enquiry.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `Hi Aethera Stay! 🌊

I would like to request a direct booking at your beautiful Mirissa refuge:

🏡 Room: *${enquiry.selectedRoomName}*
🗓️ Stay: *${fIn}* to *${fOut}* (${enquiry.nights} nights)
👥 Guests: *${enquiry.guestsCount}* person(s)
👤 Name: *${enquiry.fullName}*
✉️ Email: *${enquiry.email}*
💬 Message: _${enquiry.message || "None"}_

💵 Quoted Direct Price: *USD ${enquiry.totalPrice}*`;
  };

  const generateWhatsAppLink = (enquiry: Enquiry) => {
    return `https://wa.me/94771234567?text=${encodeURIComponent(generateWhatsAppMessageText(enquiry))}`;
  };

  return (
    <div className="space-y-8">
      {/* 4 Cards Stat Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="bg-[#1e1509] border border-terracotta/15 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
          <span className="text-[10px] uppercase font-sans tracking-wider text-text-muted select-none">Total Inquiries</span>
          <span className="font-serif text-3xl font-light text-text-light">{totalCount}</span>
        </div>
        {/* New Pulse Card */}
        <div className="bg-[#1e1509] border border-terracotta/15 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-sans tracking-wider text-text-muted select-none">New requests</span>
            {newCount > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-terracotta"></span>
              </span>
            )}
          </div>
          <span className="font-serif text-3xl font-light text-terracotta">{newCount}</span>
        </div>
        {/* Confirmed Card */}
        <div className="bg-[#1e1509] border border-terracotta/15 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
          <span className="text-[10px] uppercase font-sans tracking-wider text-text-muted select-none">Confirmed</span>
          <span className="font-serif text-3xl font-light text-sage">{confirmedCount}</span>
        </div>
        {/* Cancelled Card */}
        <div className="bg-[#1e1509] border border-terracotta/15 rounded-xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm">
          <span className="text-[10px] uppercase font-sans tracking-wider text-text-muted select-none">Cancelled</span>
          <span className="font-serif text-3xl font-light text-dusty-pink">{cancelledCount}</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 border-b border-terracotta/10 pb-5">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 text-xs font-sans tracking-widest uppercase rounded-full transition-all duration-200 cursor-pointer ${
            statusFilter === "all"
              ? "bg-terracotta text-text-light font-medium"
              : "bg-[#1e1509] border border-terracotta/10 text-text-muted hover:text-text-light"
          }`}
        >
          All ({totalCount})
        </button>
        <button
          onClick={() => setStatusFilter("new")}
          className={`px-4 py-2 text-xs font-sans tracking-widest uppercase rounded-full transition-all duration-200 cursor-pointer ${
            statusFilter === "new"
              ? "bg-terracotta text-text-light font-medium"
              : "bg-[#1e1509] border border-terracotta/10 text-text-muted hover:text-text-light"
          }`}
        >
          New ({newCount})
        </button>
        <button
          onClick={() => setStatusFilter("confirmed")}
          className={`px-4 py-2 text-xs font-sans tracking-widest uppercase rounded-full transition-all duration-200 cursor-pointer ${
            statusFilter === "confirmed"
              ? "bg-terracotta text-text-light font-medium"
              : "bg-[#1e1509] border border-terracotta/10 text-text-muted hover:text-text-light"
          }`}
        >
          Confirmed ({confirmedCount})
        </button>
        <button
          onClick={() => setStatusFilter("cancelled")}
          className={`px-4 py-2 text-xs font-sans tracking-widest uppercase rounded-full transition-all duration-200 cursor-pointer ${
            statusFilter === "cancelled"
              ? "bg-terracotta text-text-light font-medium"
              : "bg-[#1e1509] border border-terracotta/10 text-text-muted hover:text-text-light"
          }`}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-t-terracotta border-terracotta/10 animate-spin"></div>
          <span className="text-xs text-text-muted uppercase tracking-widest mt-4">Syncing inquiries...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-center border border-dusty-pink/15 bg-dusty-pink/5 rounded-xl max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-dusty-pink mx-auto mb-3" />
          <p className="text-sm text-text-light font-sans">{error}</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="text-center py-20 text-text-muted font-sans font-light text-sm">
          No inquiries found matching selected criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnquiries.map((enquiry) => {
            const isExpanded = expandedId === enquiry.id;
            return (
              <div
                key={enquiry.id}
                className={`bg-[#1e1509] border ${isExpanded ? "border-terracotta/40" : "border-terracotta/15"} rounded-xl p-6 transition-all duration-300 shadow-lg`}
              >
                {/* FIRST ROW: Guest Name + Time + Status Badge */}
                <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif italic text-xl text-text-light font-light">
                      {enquiry.fullName}
                    </h3>
                    <span className="text-[10px] text-text-muted font-sans font-light">
                      {formatReceivedDate(enquiry.receivedAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status badges */}
                    {enquiry.status === "new" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-terracotta/20 text-terracotta font-sans text-[10px] uppercase tracking-wider rounded-full font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse"></span>
                        New
                      </span>
                    )}
                    {enquiry.status === "read" && (
                      <span className="inline-flex items-center px-3 py-1 bg-text-muted/20 text-text-muted font-sans text-[10px] uppercase tracking-wider rounded-full">
                        Read
                      </span>
                    )}
                    {enquiry.status === "confirmed" && (
                      <span className="inline-flex items-center px-3 py-1 bg-sage/20 text-sage font-sans text-[10px] uppercase tracking-wider rounded-full font-semibold">
                        Confirmed
                      </span>
                    )}
                    {enquiry.status === "cancelled" && (
                      <span className="inline-flex items-center px-3 py-1 bg-dusty-pink/20 text-dusty-pink font-sans text-[10px] uppercase tracking-wider rounded-full">
                        Cancelled
                      </span>
                    )}

                    {/* Expand Trigger Button */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : enquiry.id)}
                      className="p-1 px-2 text-[11px] text-text-muted hover:text-text-light transition-colors flex items-center gap-1 border border-text-muted/15 rounded hover:border-text-muted/40"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {isExpanded ? "Hide" : "Expand"}
                    </button>
                  </div>
                </div>

                {/* SECOND ROW: Room + Dates + Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-3 border-t border-b border-text-muted/10 font-sans text-xs text-text-muted">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-text-muted/50 mb-0.5">ROOM REFERENCE</span>
                    <span className="text-text-light font-medium">{enquiry.selectedRoomName}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-text-muted/50 mb-0.5">STAY PERIOD</span>
                    <span className="text-text-light">{formatStay(enquiry.checkIn, enquiry.checkOut)} <span className="text-terracotta ml-1">({enquiry.nights} nights)</span></span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-text-muted/50 mb-0.5">GUESTS</span>
                    <span className="text-text-light font-medium">{enquiry.guestsCount} guest(s)</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-text-muted/50 mb-0.5">DIRECT PRICE QUOTE</span>
                    <span className="text-gold-light font-semibold text-sm">USD {enquiry.totalPrice}</span>
                  </div>
                </div>

                {/* THIRD ROW: Contact Info + Message */}
                <div className="mt-4 space-y-3 font-sans text-sm">
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="w-4 h-4 text-terracotta" />
                    <a href={`mailto:${enquiry.email}`} className="text-text-light hover:text-terracotta transition-colors underline decoration-terracotta/20">
                      {enquiry.email}
                    </a>
                  </div>

                  {enquiry.message && (
                    <div className="p-3 bg-bg-dark/40 rounded-lg text-xs leading-relaxed text-text-muted border border-text-muted/5 italic">
                      &ldquo;{enquiry.message}&rdquo;
                    </div>
                  )}
                </div>

                {/* FOURTH ROW / ACTION PANEL: Status state buttons */}
                <div className="mt-6 flex flex-wrap gap-2 justify-between items-center pt-4 border-t border-text-muted/5">
                  <div className="flex flex-wrap gap-2">
                    {enquiry.status !== "read" && enquiry.status !== "confirmed" && (
                      <button
                        onClick={() => updateStatus(enquiry.id, "read")}
                        className="px-3 py-1.5 bg-[#140f08] hover:bg-[#140f08]/85 text-text-light border border-text-muted/15 rounded-lg text-xs font-sans tracking-wide flex items-center gap-1.5 cursor-pointer hover:border-text-light/10"
                      >
                        <Eye className="w-3.5 h-3.5 text-text-muted" />
                        Mark Read
                      </button>
                    )}
                    {enquiry.status !== "confirmed" && (
                      <button
                        onClick={() => updateStatus(enquiry.id, "confirmed")}
                        className="px-3 py-1.5 bg-sage/10 hover:bg-sage/20 text-sage border border-sage/20 rounded-lg text-xs font-sans tracking-wide flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirm Booking
                      </button>
                    )}
                    {enquiry.status !== "cancelled" && (
                      <button
                        onClick={() => updateStatus(enquiry.id, "cancelled")}
                        className="px-3 py-1.5 bg-dusty-pink/10 hover:bg-dusty-pink/20 text-dusty-pink border border-dusty-pink/20 rounded-lg text-xs font-sans tracking-wide flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel Request
                      </button>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={() => deleteEnquiry(enquiry.id)}
                      className="px-3 py-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-400 border border-transparent rounded-lg text-xs font-sans flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Permanently
                    </button>
                  </div>
                </div>

                {/* EXPANDED SECTION: WhatsApp Preview */}
                {isExpanded && (
                  <div className="mt-5 p-5 bg-bg-dark border border-terracotta/10 rounded-lg space-y-4 animate-fade-in">
                    <span className="block font-sans text-[10px] uppercase tracking-widest text-terracotta font-semibold">
                      WhatsApp Dispatch Preview
                    </span>
                    <pre className="p-4 bg-bg-dark/40 rounded-lg text-xs font-mono text-text-muted whitespace-pre-wrap leading-relaxed border border-text-muted/5 max-h-[250px] overflow-y-auto">
                      {generateWhatsAppMessageText(enquiry)}
                    </pre>

                    <a
                      href={generateWhatsAppLink(enquiry)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 bg-terracotta hover:bg-[#b06740] text-text-light font-sans text-xs uppercase tracking-wider rounded-full font-semibold transition-all shadow-md cursor-pointer text-white"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Open In WhatsApp (Send Proposal)
                    </a>
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
