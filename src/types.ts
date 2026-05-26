export interface RoomSpace {
  id: string;
  name: string;
  description: string;
  details: string[];
  capacity: string;
  bedType: string;
  ratePerNight: number;
  imageUrl: string;
  aspectRatio: string; // for uneven masonry layouts on desktop (e.g., 'aspect-[4/5]' or 'aspect-[3/4]')
}

export interface AmenityItem {
  icon: string; // Lucide or Emoji
  label: string;
  description?: string;
}

export interface PracticeStory {
  title: string;
  tagline: string;
  description: string;
  details: string[];
}

export interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tag: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  category: string;
  caption: string;
  colSpan?: string; // desktop col layout behavior
}

export interface TestimonialPostcard {
  id: string;
  quote: string;
  author: string;
  country: string;
  rotation: string; // e.g., 'rotate-[-1.5deg]'
}

export interface LocationMilestone {
  icon: string;
  name: string;
  distance: string;
  highlight?: boolean;
}

export interface BookingFormState {
  fullName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  selectedRoomId: string;
  message: string;
}
