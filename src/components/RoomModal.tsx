import { RoomSpace } from '../types';
import { X, Check, Users, Bed, BookmarkCheck, Star } from 'lucide-react';

interface RoomModalProps {
  room: RoomSpace | null;
  onClose: () => void;
  onBookRoom: (roomId: string) => void;
}

export default function RoomModal({ room, onClose, onBookRoom }: RoomModalProps) {
  if (!room) return null;

  const handleBookClick = () => {
    onBookRoom(room.id);
    onClose();
    const widget = document.getElementById('booking');
    if (widget) {
      widget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4" id="room-detail-modal">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#140f08]/92 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Card Content */}
      <div className="relative bg-[#1e1509] border border-terracotta/25 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[85vh] animate-in fade-in-50 zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#140f08]/80 text-[#e8c07a] hover:text-terracotta z-10 w-9 h-9 rounded-full flex items-center justify-center border border-terracotta/10 cursor-pointer focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Room Visual Left */}
        <div className="w-full md:w-1/2 relative h-[30vh] md:h-auto min-h-[250px] bg-bg-dark">
          <img 
            src={room.imageUrl} 
            alt={room.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {room.ratePerNight > 0 && (
            <div className="absolute top-4 left-4 bg-terracotta text-text-light font-sans text-xs uppercase tracking-widest px-3 py-1.5 rounded-md font-medium shadow-md">
              From ${room.ratePerNight} / Night
            </div>
          )}
        </div>

        {/* Room Features Right */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-1 text-[#e8c07a]">
              <Star className="w-3.5 h-3.5 fill-gold-light" />
              <span className="font-sans text-[10px] uppercase tracking-widest text-[#e8c07a]/80 font-medium font-mono">Boutique Curated</span>
            </div>
            
            <h3 className="font-display text-2xl text-text-light mt-1.5">{room.name}</h3>
            <p className="font-sans text-sm text-text-muted mt-2 leading-relaxed italic">{room.description}</p>
            
            {/* Bedding Cap */}
            <div className="grid grid-cols-2 gap-4 my-5 border-y border-terracotta/10 py-3.5 text-xs text-text-light/90">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-terracotta" />
                <span>{room.capacity}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-terracotta" />
                <span>{room.bedType}</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5">
              <span className="block font-sans text-[10.5px] uppercase tracking-widest text-text-muted font-semibold">Space Specifications</span>
              {room.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-text-light/85">
                  <span className="text-terracotta select-none mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-terracotta/10">
            {room.ratePerNight > 0 ? (
              <button
                onClick={handleBookClick}
                className="w-full bg-terracotta hover:bg-[#b06740] text-text-light font-sans text-xs uppercase tracking-widest py-3.5 rounded-full transition-all duration-300 font-medium text-center shadow-lg cursor-pointer flex items-center justify-center gap-2"
                id={`modal-book-cta-${room.id}`}
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Pre-select This Sanctuary</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full bg-transparent border border-text-muted/30 hover:border-gold-light text-text-light hover:text-gold-light font-sans text-xs uppercase tracking-widest py-3.5 rounded-full transition-all duration-300 font-medium text-center cursor-pointer"
              >
                Enjoy the Garden Grounds
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
