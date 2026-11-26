// Single source of truth for every word, price and contact detail on the site.
// Edit here; both the desktop site and the mobile app view read from this file.
//
// TODO(owner) markers = details only SMART can confirm (hours, socials,
// testimonials). Placeholders tagged `placeholder: true` render in
// `npm run dev` only and are stripped from the production build, so nothing
// unverified ever goes live by accident.

export const SITE_URL = 'https://findoursmart.com';

export const company = {
  name: 'SMART [PVT] LTD',
  short: 'SMART',
  legalName: 'SMART (Pvt) Ltd',
  tagline: 'Intelligent solutions. Smarter future.',
  description:
    'SMART is a Sri Lankan software company. We build portfolio websites, restaurant ordering systems, mobile apps, WhatsApp AI assistants and custom business software at clear, honest price ranges.',
  vision: 'To be the most trusted technology partner for growing businesses in Sri Lanka and beyond.',
  mission:
    'To give every business, from a single shop to a growing company, software that is simple to use, fairly priced and built to last.',
  values: [
    { title: 'Clear prices', text: 'You see the price range up front and agree the final price before we start.' },
    { title: 'Built to last', text: 'We write software we are happy to support for years, not weeks.' },
    { title: 'Plain talk', text: 'We explain things in your language, without the jargon.' },
    { title: 'Always reachable', text: 'A real person answers your WhatsApp, before and after launch.' },
  ],
  contact: {
    phone: '+94789999687',
    phoneDisplay: '+94 789 999 687',
    whatsapp: '94789999687',
    email: 'info@findoursmart.com',
    address: '135C, 2nd Floor, Inner Harbour Road',
    city: 'Trincomalee',
    postalCode: '31000',
    country: 'Sri Lanka',
    // TODO(owner): real opening hours.
    hours: [
      { days: 'Monday to Saturday', time: '9:00 AM – 6:00 PM' },
      { days: 'Sunday', time: 'WhatsApp only' },
    ],
    // Google Business Profile (reviews, directions, photos).
    googleProfileUrl: 'https://share.google/J00mA7hLxUJEKLkek',
    googleReviewUrl: 'https://share.google/J00mA7hLxUJEKLkek',
    googleMapsUrl: 'https://share.google/J00mA7hLxUJEKLkek',
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
  /** Shown as the price everywhere. Ranges, never a single fixed number. */
  price: string;
  /** Compact form for tight list cells, e.g. 'From 14,999'. */
  priceFrom?: string;
  /** Numbers for search engines (LKR). */
  priceMin?: number;
  priceMax?: number;
  priceNote?: string;
  delivery?: string;
  icon: IconName;
  /** Service emblem image. */
  logo: string;
  /** Optional own website (e.g. KadaBook). */
  url?: string;
  badge?: string;
};

export type IconName =
  | 'profile' | 'order' | 'book' | 'chat' | 'megaphone' | 'globe' | 'phone' | 'cog'
  | 'check' | 'arrow' | 'close' | 'mail' | 'pin' | 'clock' | 'whatsapp' | 'star'
  | 'home' | 'grid' | 'briefcase' | 'info' | 'qr' | 'shield' | 'spark' | 'chev';

export const services: Service[] = [
  {
    id: 'portfolio-website',
    logo: '/img/svc/portfolio-website.svg',
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
    price: 'LKR 14,999 – 24,999',
    priceFrom: 'From 14,999',
    priceMin: 14999,
    priceMax: 24999,
    priceNote: 'One-time. Depends on sections, photos and extras. Domain and hosting renew from year two.',
    delivery: '5 to 7 days',
    icon: 'profile',
    badge: 'Most popular',
  },
  {
    id: 'restaurant-ordering',
    logo: '/img/svc/restaurant-ordering.svg',
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
    price: 'LKR 29,999 – 59,999',
    priceFrom: 'From 29,999',
    priceMin: 29999,
    priceMax: 59999,
    priceNote: 'One-time setup. Depends on menu size and features. No commission on orders.',
    delivery: '7 to 10 days',
    icon: 'order',
  },
  {
    id: 'kadabook',
    logo: '/img/svc/kadabook.webp',
    url: 'https://kadabook.app',
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
    logo: '/img/svc/whatsapp-ai.svg',
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
    price: 'LKR 15,000 – 45,000',
    priceFrom: 'From 15,000',
    priceMin: 15000,
    priceMax: 45000,
    priceNote: 'One-time setup, depending on how much the assistant handles. Plus a small monthly plan. Free demo first.',
    icon: 'chat',
    badge: 'New',
  },
  {
    id: 'digital-marketing',
    logo: '/img/svc/digital-marketing.svg',
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
    price: 'LKR 15,000 – 40,000 / month',
    priceFrom: 'From 15,000/mo',
    priceMin: 15000,
    priceMax: 40000,
    priceNote: 'Depends on posts, reels and ad management. Ad budget is paid separately, directly to the platform.',
    icon: 'megaphone',
  },
  {
    id: 'websites-web-apps',
    logo: '/img/svc/websites-web-apps.svg',
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
    price: 'LKR 50,000 – 250,000',
    priceFrom: 'From 50,000',
    priceMin: 50000,
    priceMax: 250000,
    priceNote: 'Depends on features and scope. Exact price after a free call.',
    icon: 'globe',
  },
  {
    id: 'mobile-apps',
    logo: '/img/svc/mobile-apps.svg',
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
    price: 'LKR 150,000 – 750,000',
    priceFrom: 'From 150,000',
    priceMin: 150000,
    priceMax: 750000,
    priceNote: 'Depends on features and scope. Exact price after a free call.',
    icon: 'phone',
  },
  {
    id: 'custom-software',
    logo: '/img/svc/custom-software.svg',
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
    price: 'LKR 100,000 – 1,000,000',
    priceFrom: 'From 100,000',
    priceMin: 100000,
    priceMax: 1000000,
    priceNote: 'Depends on features and scope. Exact price after a free call.',
    icon: 'cog',
  },
];

export type Project = {
  name: string;
  url?: string;
  kind: string;
  summary: string;
  image?: string;
  /** True when image is a tall phone screenshot, not a browser one. */
  phone?: boolean;
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
    name: 'lovecakehouse.com',
    url: 'https://lovecakehouse.com',
    kind: 'Business Website',
    summary: 'Website for a homemade cake shop in Trincomalee, with their full cake gallery and WhatsApp ordering.',
    image: '/img/work-lovecakehouse.webp',
  },
  {
    name: 'uncampusacademy.com',
    url: 'https://uncampusacademy.com',
    kind: 'Business Website',
    summary: 'Website for UnCampus Academy, an education academy.',
    // TODO(owner): replace this cover with a real screenshot of the site.
    image: '/img/work-uncampus.webp',
  },
  {
    name: 'KadaBook',
    url: 'https://kadabook.app',
    kind: 'Mobile App',
    summary: 'Our own shop billing and accounting app, built in Sri Lanka for Sri Lankan shops.',
    image: '/img/kadabook-ui-home.webp',
    phone: true,
    status: 'Coming to Google Play',
  },
];

export const process = [
  { title: 'Talk to us', text: 'Message us on WhatsApp or call. Tell us what you need. It is free.' },
  { title: 'Get your exact price', text: 'We send a clear plan, the final price within the range, and the delivery date.' },
  { title: 'We build, you review', text: 'You see progress as we go and ask for changes before launch.' },
  { title: 'Launch and support', text: 'We put it live, show you how it works, and stay on WhatsApp for help.' },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  photo: string;
  site?: string;
  /**
   * Drafted from what the client told SMART. Only shows on the live site once
   * the client has read and OK'd the exact words. Set to true after they agree.
   */
  approved: boolean;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "I wanted a website that looked as professional as my CV, and SMART got it right the first time. They understood exactly the style I had in mind, kept me updated on WhatsApp the whole way, and the site was live within the week. I now share mehala.me with recruiters without a second thought.",
    name: 'Mehala Thandayuthapani',
    role: 'Business Development & Operations Professional, Dubai',
    photo: '/img/client-mehala.webp',
    site: 'https://mehala.me',
    approved: true,
  },
  {
    quote:
      "I work with investors in Dubai and Sri Lanka, so first impressions matter. SMART built exactly what I pictured, a clean and confident site that explains all my ventures in one place. I'm very happy with it, and I trust the team with whatever we build next.",
    name: 'K. Vaikunthan',
    role: 'Business Connector, Dubai and Sri Lanka',
    photo: '/img/client-vaikunthan.webp',
    site: 'https://vaikunthan.com',
    approved: true,
  },
  {
    quote:
      "Now our customers see all our cakes online and message us straight away to order. SMART took our ideas and made them look even better than we imagined. Friendly people, quick replies, and they still help whenever we need a change. We trust SMART completely.",
    name: 'Love Cake House',
    role: 'Homemade cakes, Trincomalee',
    photo: '/img/client-lovecakehouse.webp',
    site: 'https://lovecakehouse.com',
    approved: true,
  },
];

export const faqs = [
  {
    q: 'Why are prices shown as a range?',
    a: 'Every business needs something a little different. The range covers the usual options. After a short chat we give you one exact price, and that is the price you pay.',
  },
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
export const visibleTestimonials = testimonials.filter((t) => isDev || t.approved);

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent('SMART PVT LTD, 135C Inner Harbour Road, Trincomalee 31000, Sri Lanka')}`;
