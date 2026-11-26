// Single source of truth for every word, price and contact detail on the site.
// Edit here; both the desktop site and the mobile app view read from this file.
//
// TODO(owner) markers = details only SMART can confirm (address, hours, Google
// review link, testimonials). Placeholders tagged `placeholder: true` render in
// `npm run dev` only and are stripped from the production build, so nothing
// unverified ever goes live by accident.

export const SITE_URL = 'https://findoursmart.com';

export const company = {
  name: 'SMART [PVT] LTD',
  short: 'SMART',
  legalName: 'SMART (Pvt) Ltd',
  tagline: 'Intelligent solutions. Smarter future.',
  description:
    'SMART is a Sri Lankan software company. We build portfolio websites, restaurant ordering systems, mobile apps, WhatsApp AI assistants and custom business software at clear, fixed prices.',
  vision: 'To be the most trusted technology partner for growing businesses in Sri Lanka and beyond.',
  mission:
    'To give every business, from a single shop to a growing company, software that is simple to use, fairly priced and built to last.',
  values: [
    { title: 'Clear prices', text: 'You know the cost before we start. No surprise invoices.' },
    { title: 'Built to last', text: 'We write software we are happy to support for years, not weeks.' },
    { title: 'Plain talk', text: 'We explain things in your language, without the jargon.' },
    { title: 'Always reachable', text: 'A real person answers your WhatsApp, before and after launch.' },
  ],
  contact: {
    phone: '+94786786286',
    phoneDisplay: '+94 786 786 286',
    // TODO(owner): confirm WhatsApp uses the same number as the phone line.
    whatsapp: '94786786286',
    // TODO(owner): create this mailbox on findoursmart.com (Google Workspace / Zoho).
    email: 'info@findoursmart.com',
    // TODO(owner): full registered address, e.g. 'No. 12, Main Street, Trincomalee'.
    address: '',
    city: '',
    country: 'Sri Lanka',
    // TODO(owner): real opening hours.
    hours: [
      { days: 'Monday to Saturday', time: '9:00 AM – 6:00 PM' },
      { days: 'Sunday', time: 'WhatsApp only' },
    ],
    // TODO(owner): paste the "Write a review" link from Google Business Profile.
    googleReviewUrl: '',
    // TODO(owner): paste the Google Maps share link of the office.
    googleMapsUrl: '',
  },
  social: {
    // TODO(owner): fill in the real profile links; empty ones are hidden.
    facebook: '',
    instagram: '',
    linkedin: '',
    tiktok: '',
  },
};

export type Service = {
  id: string;
  name: string;
  /** Short label for the hero orbit. */
  orbit: string;
  short: string;
  forWho: string;
  problem: string;
  includes: string[];
  price: string;
  priceNote?: string;
  delivery?: string;
  icon: IconName;
  badge?: string;
};

export type IconName =
  | 'profile' | 'order' | 'book' | 'chat' | 'megaphone' | 'globe' | 'phone' | 'cog'
  | 'check' | 'arrow' | 'close' | 'mail' | 'pin' | 'clock' | 'whatsapp' | 'star'
  | 'home' | 'grid' | 'briefcase' | 'info' | 'qr' | 'shield' | 'spark' | 'chev';

export const services: Service[] = [
  {
    id: 'portfolio-website',
    orbit: 'Portfolio Sites',
    name: 'Portfolio Website',
    short: 'A one-page website that shows who you are and how to reach you.',
    forWho: 'Doctors, lawyers, teachers, consultants, artists and freelancers.',
    problem: 'People search your name and find nothing, or an old social media page.',
    includes: [
      'One-page design: about, services, gallery and contact',
      'Looks right on every phone and laptop',
      'WhatsApp, call and email buttons',
      'Your location on Google Maps',
      'Domain name and hosting for the first year',
      'Basic Google search setup',
    ],
    price: 'LKR 14,999',
    priceNote: 'One-time. Renewal from year two.',
    delivery: '5 to 7 days',
    icon: 'profile',
    badge: 'Most popular',
  },
  {
    id: 'restaurant-ordering',
    orbit: 'Restaurant Ordering',
    name: 'Restaurant Online Ordering',
    short: 'Your own ordering website. Customers scan, order, and it lands on your WhatsApp.',
    forWho: 'Restaurants, cafés, bakeries and take-away shops.',
    problem: 'Delivery apps take 20–30% of every order, and phone orders get mixed up.',
    includes: [
      'Menu website your customers order from',
      'Admin panel to change dishes, prices and photos',
      'Mark any item available or sold out in one tap',
      'Every order arrives on your WhatsApp',
      'QR codes for tables, counter and flyers',
      'Regular updates after launch',
    ],
    price: 'LKR 29,999',
    priceNote: 'One-time setup. No commission on orders.',
    delivery: '7 to 10 days',
    icon: 'order',
  },
  {
    id: 'kadabook',
    orbit: 'KadaBook',
    name: 'KadaBook Shop App',
    short: 'Billing, stock and credit book for your shop, on your phone.',
    forWho: 'Grocery shops, pharmacies, hardware stores and small retailers.',
    problem: 'Accounts in a notebook, credit customers you lose track of, no idea of daily profit.',
    includes: [
      'Fast billing with printed or shared receipts',
      'Stock that updates with every sale',
      'Credit book with reminders',
      'Daily and monthly reports',
      'Cloud backup so nothing is lost',
      'Works in English, Tamil and Sinhala',
    ],
    price: 'Coming to Google Play',
    priceNote: 'Free to start. Plans inside the app.',
    icon: 'book',
    badge: 'Our product',
  },
  {
    id: 'whatsapp-ai',
    orbit: 'WhatsApp AI',
    name: 'WhatsApp AI Assistant',
    short: 'Replies to your customers instantly, day and night, in your business voice.',
    forWho: 'Any business that gets the same questions on WhatsApp every day.',
    problem: 'You cannot answer every message on time, and slow replies lose customers.',
    includes: [
      'Instant replies to prices, hours and common questions',
      'Takes orders and bookings in the chat',
      'Shares your catalog and location',
      'Hands over to you when a person is needed',
      'Set up on WhatsApp Business',
      'Monthly report of what customers asked',
    ],
    price: 'Free demo, then a quote',
    priceNote: 'Setup plus a small monthly plan.',
    icon: 'chat',
    badge: 'New',
  },
  {
    id: 'digital-marketing',
    orbit: 'Marketing',
    name: 'Digital Marketing',
    short: 'Posts, reels and ads that bring customers to your door.',
    forWho: 'Businesses that are good at what they do, but not yet known.',
    problem: 'Your business is great, but the people nearby do not know it exists.',
    includes: [
      'Google Business Profile setup',
      'Monthly social media posts and reels',
      'Facebook and Instagram ad campaigns',
      'Monthly results report',
    ],
    price: 'Monthly plans',
    priceNote: 'Ad budget is paid separately, directly to the platform.',
    icon: 'megaphone',
  },
  {
    id: 'websites-web-apps',
    orbit: 'Web Apps',
    name: 'Business Websites & Web Apps',
    short: 'Multi-page websites, booking systems, portals and dashboards.',
    forWho: 'Companies, schools, clinics and organisations.',
    problem: 'You need more than a single page, or a system your customers log in to.',
    includes: [
      'Multi-page website with your own content manager',
      'Online booking, forms and payments',
      'Client portals and dashboards',
      'Fast, secure and search friendly',
    ],
    price: 'Quote per project',
    icon: 'globe',
  },
  {
    id: 'mobile-apps',
    orbit: 'Mobile Apps',
    name: 'Mobile Apps',
    short: 'Android and iOS apps, from idea to the app stores.',
    forWho: 'Businesses and founders with an app idea.',
    problem: 'You have an idea for an app and need a team to design, build and publish it.',
    includes: [
      'Design that feels native on Android and iPhone',
      'One codebase for both platforms',
      'Play Store and App Store publishing',
      'Updates and support after launch',
    ],
    price: 'Quote per project',
    icon: 'phone',
  },
  {
    id: 'custom-software',
    orbit: 'Custom Software',
    name: 'Custom Software & Support',
    short: 'Systems built around how your business already works, and kept running.',
    forWho: 'Growing businesses with processes that off-the-shelf tools do not fit.',
    problem: 'Spreadsheets and paper are slowing your team down and causing mistakes.',
    includes: [
      'Inventory, POS, HR and ERP systems',
      'Reports that answer your real questions',
      'Training for your staff',
      'Maintenance and support plans',
    ],
    price: 'Quote per project',
    icon: 'cog',
  },
];

export type Project = {
  name: string;
  url?: string;
  kind: string;
  summary: string;
  image?: string;
  status?: string;
};

export const projects: Project[] = [
  {
    name: 'mehala.me',
    url: 'https://mehala.me',
    kind: 'Portfolio Website',
    summary: 'Portfolio for a business development and operations professional based in Dubai.',
    image: '/img/work-mehala.webp',
  },
  {
    name: 'vaikunthan.com',
    url: 'https://vaikunthan.com',
    kind: 'Portfolio Website',
    summary: 'Portfolio for a Sri Lankan business connector working between Dubai and Sri Lanka.',
    image: '/img/work-vaikunthan.webp',
  },
  {
    name: 'KadaBook',
    kind: 'Mobile App',
    summary: 'Our own shop billing and accounting app, built in Sri Lanka for Sri Lankan shops.',
    status: 'Coming to Google Play',
  },
];

export const process = [
  { title: 'Talk to us', text: 'Message us on WhatsApp or call. Tell us what you need. It is free.' },
  { title: 'Get a fixed quote', text: 'We send a clear plan, the price and the delivery date.' },
  { title: 'We build, you review', text: 'You see progress as we go and ask for changes before launch.' },
  { title: 'Launch and support', text: 'We put it live, show you how it works, and stay on WhatsApp for help.' },
];

export type Testimonial = { quote: string; name: string; role: string; placeholder?: boolean };

// TODO(owner): replace with real client words (with their permission).
// Entries marked `placeholder` only show in dev, never in production.
export const testimonials: Testimonial[] = [
  { quote: 'Placeholder. Ask Mehala for two lines about working with SMART.', name: 'Mehala', role: 'mehala.me', placeholder: true },
  { quote: 'Placeholder. Ask Vaikunthan for two lines about the website.', name: 'Vaikunthan', role: 'vaikunthan.com', placeholder: true },
];

export const faqs = [
  {
    q: 'How long does a portfolio website take?',
    a: 'Five to seven days after we receive your photos and details. We share a preview link before it goes live.',
  },
  {
    q: 'Do I own my website and domain?',
    a: 'Yes. The domain is registered in your name and the website is yours.',
  },
  {
    q: 'Is there a commission on restaurant orders?',
    a: 'No. You pay the one-time setup. Every order and every rupee goes straight to you.',
  },
  {
    q: 'Can I change my menu or prices myself?',
    a: 'Yes. The admin panel lets you edit dishes, prices and photos, and mark items sold out, from your phone.',
  },
  {
    q: 'Do you work with businesses outside Sri Lanka?',
    a: 'Yes. We work over WhatsApp and video calls, so location is not a problem.',
  },
  {
    q: 'How do I pay?',
    a: 'Bank transfer. For larger projects we split the payment into milestones.',
  },
];

export const waLink = (text: string) =>
  `https://wa.me/${company.contact.whatsapp}?text=${encodeURIComponent(text)}`;

export const isDev = import.meta.env.DEV;
export const visibleTestimonials = testimonials.filter((t) => isDev || !t.placeholder);
