import { useState, useEffect, FormEvent } from 'react';
import { ROOMS_AND_SPACES } from '../data';
import { Calendar, Users, Home, ShieldCheck, Mail, ArrowRight, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export default function BookingWidget() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 5);

  const formatDateString = (d: Date) => d.toISOString().split('T')[0];

  const [rooms, setRooms] = useState<any[]>(ROOMS_AND_SPACES);
  const [checkIn, setCheckIn] = useState<string>(formatDateString(tomorrow));
  const [checkOut, setCheckOut] = useState<string>(formatDateString(nextWeek));
  const [selectedRoom, setSelectedRoom] = useState<string>('colonial-room');
  const [guests, setGuests] = useState<number>(2);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  
  const [success, setSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [nights, setNights] = useState<number>(4);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [otaPrice, setOtaPrice] = useState<number>(0);

  // Firestore Snapshot for Rooms and Rates
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data());
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
    }, (err) => {
      console.error("Firestore rooms fetch error in BookingWidget:", err);
      setRooms(ROOMS_AND_SPACES);
    });

    return () => unsubscribe();
  }, []);

  const currentRoomObj = rooms.find(r => r.id === selectedRoom) || rooms[0] || ROOMS_AND_SPACES[0];

  // Calculate nights and prices
  useEffect(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start && currentRoomObj) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const calculatedNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(calculatedNights);
      
      const BaseRate = currentRoomObj.ratePerNight || 0;
      const subTotal = BaseRate * calculatedNights;
      setTotalPrice(subTotal);
      // OTA platforms charge markup
      setOtaPrice(Math.round(subTotal * 1.18));
    } else {
      setNights(0);
      setTotalPrice(0);
      setOtaPrice(0);
    }
  }, [checkIn, checkOut, selectedRoom, currentRoomObj]);

  const generateWhatsAppMessageText = () => {
    const roomName = currentRoomObj ? currentRoomObj.name : 'Unknown Room';
    const formattedIn = new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedOut = new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return `Hi Aethera Stay! 🌊

I would like to request a direct booking at your beautiful Mirissa refuge:

🏡 Room: *${roomName}*
🗓️ Stay: *${formattedIn}* to *${formattedOut}* (${nights} nights)
👥 Guests: *${guests}* person(s)
👤 Name: *${fullName || 'Interested Traveler'}*
✉️ Contact: *${email || 'Not provided'}*
💬 Message: *${message || 'Looking forward to the sunrise surf.'}*

Please let me know if this space is open for me! Warmly.`;
  };

  const generateWhatsAppLink = () => {
    return `https://wa.me/94771234567?text=${encodeURIComponent(generateWhatsAppMessageText())}`;
  };

  const handleBookingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      alert("Please fill in your name and email to submit your enquiry.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Save Enquiry document to Firestore 
      await addDoc(collection(db, 'enquiries'), {
        fullName,
        email,
        checkIn,
        checkOut,
        selectedRoomId: currentRoomObj.id,
        selectedRoomName: currentRoomObj.name,
        guestsCount: guests,
        message: message || "",
        totalPrice,
        nights,
        status: 'new',
        receivedAt: serverTimestamp()
      });

      setSuccess(true);
    } catch (err: any) {
      console.error("Firestore booking submit crash:", err);
      setErrorMsg("Failed to store booking enquiry to the database.");
      
      try {
        handleFirestoreError(err, OperationType.CREATE, "enquiries");
      } catch (firestoreErr: any) {
        // Log details
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFullName('');
    setEmail('');
    setMessage('');
    setSuccess(false);
    setErrorMsg(null);
  };

  if (success) {
    return (
      <div id="booking-success-screen" className="bg-[#1e1509] border border-terracotta/30 rounded-2xl p-8 md:p-12 text-text-light shadow-2xl relative overflow-hidden backdrop-blur-md text-center max-w-3xl mx-auto animate-fade-in">
        <div className="absolute top-0 right-0 w-48 h-48 bg-sage/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-light/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage/10 border border-sage/20 text-sage mb-2">
            <ShieldCheck className="w-8 h-8 animate-pulse" />
          </div>
          
          <h3 className="font-serif italic text-3xl md:text-4xl text-gold-light">
            Your booking journal is recorded.
          </h3>
          
          <p className="font-sans text-xs md:text-sm text-text-muted leading-relaxed max-w-md mx-auto">
            Your inquiry has been stored securely in our colonial register database. To guarantee host priority, tap below to forward your formulated WhatsApp dispatch directly to our Sri Lankan hosts.
          </p>

          <div className="p-4 bg-[#140f08]/90 rounded-xl text-left border border-white/5 font-mono text-[11px] text-text-muted leading-relaxed whitespace-pre-wrap select-all max-h-[160px] overflow-y-auto">
            {generateWhatsAppMessageText()}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 bg-terracotta hover:bg-[#b06740] text-text-light font-sans text-xs font-semibold uppercase tracking-widest py-4 px-6 rounded-full transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-transparent hover:border-gold-light/10 text-white"
            >
              <MessageSquare className="w-4.5 h-4.5" />
              Send WhatsApp Dispatch
            </a>
            
            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-6 py-4 border border-text-muted/20 hover:border-text-muted/50 text-text-muted hover:text-text-light uppercase tracking-widest text-xs rounded-full transition-colors font-medium cursor-pointer"
            >
              New Booking Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="booking-panel" className="bg-[#1e1509] border border-terracotta/20 rounded-2xl p-6 md:p-10 text-text-light shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 right-0 w-48 h-48 bg-terracotta/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-light/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-terracotta/15 border border-terracotta/30 px-3 py-1 rounded-full text-xs tracking-widest text-[#e8c07a] uppercase font-sans mb-3 select-none">
            <Sparkles className="w-3 h-3 text-terracotta" /> Live Rate Matcher
          </div>
          <h3 className="font-display text-2xl md:text-3xl text-gold-light">
            Direct Booking Journal
          </h3>
          <p className="font-sans text-sm text-text-muted mt-2 max-w-lg mx-auto">
            Booking directly bypassing OTAs locks in a complimentary organic tea kit, yoga mats, and an automatic 15% rate advantage.
          </p>
        </div>

        <form onSubmit={handleBookingSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check-In Date */}
            <div>
              <label className="block font-sans text-xs uppercase tracking-widest text-text-muted mb-2 font-medium">Check-In Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-terracotta" />
                <input
                  type="date"
                  value={checkIn}
                  min={formatDateString(new Date())}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-[#140f08]/80 border border-text-muted/20 rounded-xl py-3 pl-11 pr-4 text-sm font-sans focus:outline-none focus:border-terracotta text-text-light"
                  required
                />
              </div>
            </div>

            {/* Check-Out Date */}
            <div>
              <label className="block font-sans text-xs uppercase tracking-widest text-text-muted mb-2 font-medium">Check-Out Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-terracotta" />
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-[#140f08]/80 border border-text-muted/20 rounded-xl py-3 pl-11 pr-4 text-sm font-sans focus:outline-none focus:border-terracotta text-text-light"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Space Preference */}
            <div className="md:col-span-2">
              <label className="block font-sans text-xs uppercase tracking-widest text-text-muted mb-2 font-medium">Space Reference</label>
              <div className="relative">
                <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-terracotta pointer-events-none" />
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full appearance-none bg-[#140f08]/80 border border-text-muted/20 rounded-xl py-3 pl-11 pr-10 text-sm font-sans focus:outline-none focus:border-terracotta text-text-light cursor-pointer"
                >
                  {rooms.filter(r => r.ratePerNight > 0).map((room) => (
                    <option key={room.id} value={room.id} className="bg-[#140f08]">
                      {room.name} — {room.ratePerNight > 0 ? `$${room.ratePerNight}` : 'Social space'} / night ({room.bedType})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-text-muted text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Guest Count */}
            <div>
              <label className="block font-sans text-xs uppercase tracking-widest text-text-muted mb-2 font-medium">Travelers</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-terracotta pointer-events-none" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full appearance-none bg-[#140f08]/80 border border-text-muted/20 rounded-xl py-3 pl-11 pr-10 text-sm font-sans focus:outline-none focus:border-terracotta text-text-light cursor-pointer"
                >
                  <option value="1" className="bg-[#140f08]">1 Explorer</option>
                  <option value="2" className="bg-[#140f08]">2 Explorers</option>
                  <option value="3" className="bg-[#140f08]">3 Explorers</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-text-muted text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Guest Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-text-muted/10 pt-5">
            <div>
              <input
                type="text"
                placeholder="Your Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#140f08]/60 border border-text-muted/20 rounded-xl py-3 px-4 text-sm font-sans focus:outline-none focus:border-terracotta placeholder:text-text-muted/50 text-text-light"
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email Address (for safety backup)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#140f08]/60 border border-text-muted/20 rounded-xl py-3 px-4 text-sm font-sans focus:outline-none focus:border-terracotta placeholder:text-text-muted/50 text-text-light"
                required
              />
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <textarea
              placeholder="Tell us anything (e.g. dawn surfboards preference, Wednesday party reservations, early arrivals...)"
              value={message}
              rows={2}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#140f08]/60 border border-text-muted/20 rounded-xl py-3 px-4 text-sm font-sans focus:outline-none focus:border-terracotta placeholder:text-text-muted/50 text-text-light resize-none"
            ></textarea>
          </div>

          {/* Dynamic Rate Summary Board */}
          {nights > 0 && totalPrice > 0 && (
            <div className="bg-[#140f08]/40 border border-gold-light/10 rounded-xl p-4 md:p-6 space-y-3">
              <div className="flex justify-between items-center text-xs text-text-muted font-mono uppercase tracking-widest">
                <span>Direct Rate Comparison</span>
                <span>{nights} Nights Reserved</span>
              </div>
              <div className="flex justify-between items-end border-b border-text-muted/5 pb-2.5">
                <span className="text-sm font-sans text-text-light/90">Booking agency platforms (H-world/Expedia)</span>
                <span className="text-sm font-sans text-text-muted/70 line-through decoration-dusty-pink">$ {otaPrice} USD</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-sm font-semibold text-gold-light block">Direct Sanctuary Rate <span className="text-[10px] bg-terracotta/20 text-[#e8c07a] font-normal px-2 py-0.5 rounded ml-1 uppercase tracking-wide">15% Saved</span></span>
                  <span className="text-xs text-text-muted block mt-0.5">Complementary tea kit & garden logs included</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl text-text-light font-medium">$ {totalPrice}</span>
                  <span className="text-xs text-text-muted block">USD total</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Feed */}
          {errorMsg && (
            <div className="p-3 bg-dusty-pink/10 border border-dusty-pink/30 text-dusty-pink text-xs rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          {/* Submit Action Block */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:flex-1 bg-terracotta hover:bg-[#b06740] text-text-light font-medium uppercase tracking-widest text-xs py-4 px-6 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:pointer-events-none"
              id="whatsapp-booking-button"
            >
              {submitting ? (
                <span>Registering Direct Request... <RefreshCw className="inline w-3 h-3 animate-spin" /></span>
              ) : (
                <>
                  <span>File Booking Request</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            
            <a
              href="mailto:stay@aetheramirissa.com"
              className="w-full sm:w-auto text-center border border-text-muted/30 hover:border-gold-light text-text-light hover:text-gold-light uppercase tracking-widest text-xs py-4 px-6 rounded-full transition-all duration-300 font-medium whitespace-nowrap"
              id="email-booking-button"
            >
              Backup Email Inquiry
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 text-center text-xs text-text-muted font-light pt-2 select-none">
            <ShieldCheck className="w-4 h-4 text-sage" />
            <span>Encrypted directly to our host desk · No deposit required to lock in availability</span>
          </div>
        </form>
      </div>
    </div>
  );
}
