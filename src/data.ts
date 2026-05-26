import { RoomSpace, AmenityItem, ExperienceItem, GalleryItem, TestimonialPostcard, LocationMilestone } from "./types";

export const ROOMS_AND_SPACES: RoomSpace[] = [
  {
    id: "colonial-room",
    name: "The Colonial Room",
    description: "Dark wood, warm light, and the sound of the garden outside.",
    details: [
      "Original Sri Lankan antiques",
      "Air-conditioned interior",
      "Private shuttered veranda entrance",
      "Complimentary organic yoga mats",
      "Private ensuite with hot rainfall shower"
    ],
    capacity: "2 Guests",
    bedType: "King Bed (Teak Wood)",
    ratePerNight: 85,
    imageUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "md:aspect-[3/4]"
  },
  {
    id: "terrace-suite",
    name: "The Terrace Suite",
    description: "Your own slice of sky — coffee, the breeze, and nowhere to be.",
    details: [
      "Direct overhead canopy views",
      "French doors opening to private deck",
      "Harnessed sea breeze cooling",
      "Built-in desk for slow mornings or writing",
      "Sun lounger chairs"
    ],
    capacity: "2 Guests",
    bedType: "Queen Canopy Bed",
    ratePerNight: 95,
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "md:aspect-[4/5]"
  },
  {
    id: "tub-terrace",
    name: "The Tub Terrace",
    description: "Warm water, open sky, and the sound of absolutely nothing.",
    details: [
      "Direct access to iconic circular soaking tub",
      "Lush foliage wall cover for complete privacy",
      "Curated rain-lily planters",
      "Handmade local bath salts and botanical oils",
      "Linen hammocks"
    ],
    capacity: "2 Guests",
    bedType: "Imperial King Size",
    ratePerNight: 120,
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "md:aspect-[3/4]"
  },
  {
    id: "garden-courtyard",
    name: "The Garden & Courtyard",
    description: "Peacocks at dawn. Music at dusk. The garden belongs to everyone.",
    details: [
      "Restored colonial brick walkways",
      "Resident peacocks roaming at 6am",
      "Repurposed communal wooden dining table",
      "Veranda seating with vintage acoustic guitar",
      "Hammocks strung between jackfruit trees"
    ],
    capacity: "Social Space",
    bedType: "Communal Sanctuary",
    ratePerNight: 0,
    imageUrl: "https://images.unsplash.com/photo-1540333211167-934375d812ed?auto=format&fit=crop&w=800&q=80",
    aspectRatio: "md:aspect-[4/5]"
  }
];

export const AMENITIES: AmenityItem[] = [
  { icon: "🏄", label: "1 min to surf", description: "Step out the back gate directly into Mirissa's best breaks." },
  { icon: "🛁", label: "Outdoor soaking tub", description: "Our stone circular tub, hidden in the creepers." },
  { icon: "🦚", label: "Garden & wildlife", description: "Peacocks, rain lily buds, and butterflies with breakfast." },
  { icon: "🧘", label: "Yoga mats included", description: "Complimentary mats placed in your room for solar sessions." },
  { icon: "🐢", label: "Turtle season (Nov–Apr)", description: "Watch newborn hatchlings crawl to the ocean next door." },
  { icon: "🐋", label: "Whale watching arranged", description: "We book trusted, ethical local conservationist sunrise boats." },
  { icon: "🎸", label: "Veranda sessions", description: "Pick up the house wood guitar or simply listen at dusk." },
  { icon: "🎉", label: "Doctor's House connection", description: "We handle RSVPs for Mirissa's legendary Wednesday night out." }
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: "surf",
    title: "Surf",
    tag: "MORNING BREAK",
    description: "The break is a 1-minute walk. The board is ready. The wave is waiting. High-fidelity surf culture, zero attitude. Ask us for customized longboards and the best tides.",
    imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "soak",
    title: "Slow",
    tag: "NOON STILLNESS",
    description: "Outdoor tub. Evening garden. Guitar at dusk. Peacocks at dawn. We didn't build this lifestyle — we just let it take over after a salt-crusted session in the Indian Ocean.",
    imageUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "stay",
    title: "Stay",
    tag: "HERITAGE COMFORT",
    description: "A heritage colonial home turned refuge. High ceilings, warm terracotta brickwork, and old wooden shutters that invite Mirissa’s coastal breeze to sweep inside from dawn to dark.",
    imageUrl: "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=800&q=80"
  }
];

export const ACTIVITIES: ExperienceItem[] = [
  {
    id: "act-surf",
    title: "SURF GUIDE",
    tag: "1-minute walk to the break",
    description: "Mirissa's main break is literally behind our wall. Lessons arranged with trusted local instructors for all levels. Longboards and fish boards are available right on-site.",
    imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "act-whale",
    title: "WHALE WATCHING",
    tag: "November to April season",
    description: "We'll book your early morning ocean vessel with small-cohort, conservationist crews. Observe blue whales, sperm whales, and super-pods of dolphins in their natural migratory pathways.",
    imageUrl: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "act-yoga",
    title: "YOGA & SLOW MORNINGS",
    tag: "The veranda is yours",
    description: "Yoga mats in every room. Wake up to find the garden completely silent before the world wakes up. Walk the red-tiled halls with a freshly-brewed Sri Lankan coffee in hand.",
    imageUrl: "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "act-doctors",
    title: "THE DOCTOR'S HOUSE",
    tag: "Vibrant Wednesday Nights",
    description: "The legendary south coast weekly event. Connect with surfers, expats, and creatives. It's next door, meaning you can walk home under the stars in under 90 seconds flat.",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "act-turtle",
    title: "TURTLE SEASON",
    tag: "A tender coastal wonder",
    description: "Watch baby green turtles hatch and make their brave first journey down the beach sand to the active ocean spray. An raw, untouched sight that reminds you why you travel.",
    imageUrl: "https://images.unsplash.com/photo-1437622368342-7a3d7ebea3cf?auto=format&fit=crop&w=800&q=80"
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: "g1", imageUrl: "https://images.unsplash.com/photo-1437622368342-7a3d7ebea3cf?auto=format&fit=crop&w=800&q=80", category: "Nature", caption: "Brave baby turtle hatching under the Mirissa moon." },
  { id: "g2", imageUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80", category: "The Spaces", caption: "Soft amber lamp light dancing on high teak wood shutters." },
  { id: "g3", imageUrl: "https://images.unsplash.com/photo-1520121401995-928cd50d4e27?auto=format&fit=crop&w=800&q=80", category: "Wildlife", caption: "Our resident peacock perched in the early morning jackfruit treetops." },
  { id: "g4", imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80", category: "Sanctuary", caption: "The outdoor soaking stone tub nestled directly beneath growing tropical vines." },
  { id: "g5", imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80", category: "Culture", caption: "Golden hour jams on our antique-furnished veranda." },
  { id: "g6", imageUrl: "https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=800&q=80", category: "Nature", caption: "Rain lily flower blooming in the garden after an afternoon monsoon." },
  { id: "g7", imageUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80", category: "Surf", caption: "Catching the last peeling light at Mirissa's primary right-hand reef point break." },
  { id: "g8", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", category: "Indian Ocean", caption: "Local ocean fishermen sitting on stilt poles in the misty distance." },
  { id: "g9", imageUrl: "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80", category: "The Spaces", caption: "The dynamic colonial brick facade at the heights of golden hour." }
];

export const TESTIMONIALS: TestimonialPostcard[] = [
  {
    id: "test-1",
    quote: "I came for three nights and left after twelve days. I still haven't figured out why I stayed so long. Maybe that's the point.",
    author: "L.",
    country: "Amsterdam",
    rotation: "md:rotate-[-1.5deg]"
  },
  {
    id: "test-2",
    quote: "The tub. The peacock in the morning. The fact that the surf is literally one minute away. This place ruined other accommodations for me.",
    author: "T.",
    country: "Sydney",
    rotation: "md:rotate-[1deg]"
  },
  {
    id: "test-3",
    quote: "The kind of place that makes you feel like you're living rather than travelling. Sunset veranda sessions with high-fidelity sound. We'll be back.",
    author: "S. & M.",
    country: "Berlin",
    rotation: "md:rotate-[-0.8deg]"
  }
];

export const MILESTONES: LocationMilestone[] = [
  { icon: "🏄", name: "Surf Beach", distance: "1 min walk", highlight: true },
  { icon: "🥥", name: "Coconut Tree Hill", distance: "8 min walk" },
  { icon: "🎉", name: "Doctor's House (Wed nights)", distance: "Next door" },
  { icon: "🐋", name: "Whale Watching Harbour", distance: "5 min tuk-tuk" },
  { icon: "🌊", name: "Mirissa Secret Beach", distance: "12 min walk" },
  { icon: "🏙️", name: "Galle Fort", distance: "45 min drive" },
  { icon: "✈️", name: "Colombo Airport", distance: "~2.5 hrs" }
];
