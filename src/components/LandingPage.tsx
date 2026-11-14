import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  Compass,
  Map as MapIcon,
  Minus,
  Moon,
  Plus,
  Sun,
  Sunset,
} from 'lucide-react';
import { MotionConfig, motion, useScroll, useTransform } from 'motion/react';
import { HeroStudyDiorama } from './HeroStudyDiorama';
import {
  PASS_TIERS,
  PASS_TIER_MAP,
  formatNpr,
  type BookingPlan,
  type BookingRecord,
  type CameraPresetId,
  type LightingMode,
} from '../types/space';

interface LandingPageProps {
  lightingMode: LightingMode;
  bookings: BookingRecord[];
  onLightingChange: (mode: LightingMode) => void;
  onEnter3D: (preset?: CameraPresetId) => void;
  onReserveHeroDesk: () => void;
  onOpenBookings: () => void;
}

interface PhotoFrameProps {
  src: string;
  alt: string;
  className?: string;
}

const ArchitecturalPhoto: React.FC<PhotoFrameProps> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#dce4d9] via-[#eae5dc] to-[#d9e2e8] text-stone-700 p-8 text-center min-h-[240px] ${className}`}
      >
        <Compass className="w-7 h-7 mb-2 opacity-60" />
        <span className="text-xs font-medium">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

interface FullPictureShowcaseItem {
  id: CameraPresetId;
  index: string;
  title: string;
  meta: string;
  description: string;
  highlights: string[];
  image: string;
  cta: string;
  surfaceClass: string;
  reverse?: boolean;
}

const FULL_PICTURE_ROOMS: FullPictureShowcaseItem[] = [
  {
    id: 'reading-hall',
    index: '01.',
    title: 'Main Reading Hall & Collaborative Library',
    meta: '11.0m × 7.5m · Marble Collaborative Table, Study Desks & Lounge',
    description:
      'Floor-to-ceiling walnut bookshelves, chevron oak flooring, and tall sunlit windows frame a twelve-seat Calacatta marble collaborative table, three solid wood study rows, and single reading armchairs.',
    highlights: [
      '24 individual study desk seats (S1–S12, M1–M12, W1–W6)',
      'Single leather & fabric lounge armchairs bookable individually',
      'Warm brass table domes & floor lamps respond to Day / Evening / Night',
    ],
    image: '/assets/aistudio/Modern_Library_Reading_Hall_8702bf49.png',
    cta: 'Walk Reading Hall in 3D',
    surfaceClass: 'bg-[#edeae2] dark:bg-[#191f24] border-stone-300/80 dark:border-slate-800',
  },
  {
    id: 'quiet-studio',
    index: '02.',
    title: 'Quiet Study Studio',
    meta: '6.0m × 4.2m · 6 Acoustic Carrel Desks (Q1–Q6)',
    description:
      'Soft sage acoustic walls enclose six private walnut study stations with integrated book hutches, task lamps, power outlets, and ergonomic swivel chairs designed for deep solitary concentration.',
    highlights: [
      'Six acoustic walnut carrels (Q1–Q6) with upper library shelving',
      'Independent warm brass task lighting & under-hutch LED strips',
      'Click any carrel chair in 3D to glide it backward and reserve',
    ],
    image: '/assets/aistudio/Modern_Quiet_Study_Studio_627be306.png',
    cta: 'Explore Quiet Studio in 3D',
    surfaceClass: 'bg-[#e4ebe2] dark:bg-[#19231b] border-[#c8d5c5] dark:border-[#2a392d]',
    reverse: true,
  },
  {
    id: 'innovation-hub',
    index: '03.',
    title: 'Innovation Hub Conference Suite',
    meta: '5.5m × 4.0m · 12-Seat Private Suite · Room-Only Reservation',
    description:
      'Muted slate-blue architectural walls surround a 12-seat Calacatta marble conference table, built-in credenza, and illuminated glass whiteboard. Reserved strictly as a full private room.',
    highlights: [
      'Full 12-seat conference room booking from NPR 1,200/hr',
      'Wall sconces, illuminated signage & glass whiteboard surface',
      'Clicking any conference chair opens full-suite room booking',
    ],
    image: '/assets/aistudio/Modern_Innovation_Hub_Meeting_Room_0fcd03ed.png',
    cta: 'Inspect Innovation Hub in 3D',
    surfaceClass: 'bg-[#e1e8ee] dark:bg-[#19212a] border-[#c4d0da] dark:border-[#2a3644]',
  },
  {
    id: 'reception',
    index: '04.',
    title: 'Reception, Lounge & Dual Pantries',
    meta: '5.2m × 3.8m · Curved Walnut Desk, Maya Guide & Espresso Pantries',
    description:
      'Arrive directly from the common stairwell into the reception lobby where 3D concierge Maya assists from behind the curved walnut counter beside cognac armchairs and two full espresso break pantries.',
    highlights: [
      'Interactive 3D concierge Maya offers live seat suggestions',
      'Two bookable cognac lobby armchairs (RA1–RA2) & pantry seats (P1–P2)',
      'Adjacent upper pantry, lower break room, and slate-tiled W.C.',
    ],
    image: '/assets/aistudio/Warm_Modern_Reception_Floor_Plan_62db75e0.png',
    cta: 'Meet Maya in Reception',
    surfaceClass: 'bg-[#ebe6dc] dark:bg-[#201e1a] border-[#d6cec0] dark:border-[#34302a]',
    reverse: true,
  },
];

const LIGHTING_MODES: {
  id: LightingMode;
  label: string;
  note: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'day',
    label: 'Daylight',
    note: 'Crisp natural daylight pouring across warm oak and sage walls.',
    Icon: Sun,
  },
  {
    id: 'evening',
    label: 'Evening',
    note: 'Animated golden-hour shafts with warm ambient sconces & dust motes.',
    Icon: Sunset,
  },
  {
    id: 'night',
    label: 'Night',
    note: 'Deep muted twilight exterior paired with glowing brass task lamps.',
    Icon: Moon,
  },
];

const ScrollPictureRow: React.FC<{
  item: FullPictureShowcaseItem;
  onEnter3D: (preset: CameraPresetId) => void;
}> = ({ item, onEnter3D }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1, 0.99]);

  return (
    <motion.article
      ref={rowRef}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-center ${item.surfaceClass}`}
    >
      {/* Full Uncropped Architectural Picture with Smooth Scroll Motion */}
      <div className={`lg:col-span-7 ${item.reverse ? 'lg:order-2' : 'lg:order-1'}`}>
        <motion.div
          style={{ y: imageY, scale: imageScale }}
          className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-[#1e2328] shadow-md"
        >
          <ArchitecturalPhoto
            src={item.image}
            alt={`${item.title} full architectural render`}
            className="w-full h-auto block object-contain"
          />
        </motion.div>
      </div>

      {/* Architectural Spec & Action Column */}
      <div className={`lg:col-span-5 space-y-5 ${item.reverse ? 'lg:order-1' : 'lg:order-2'}`}>
        <div>
          <p className="text-xs font-medium text-[#4a6352] dark:text-[#98b8a2]">
            <span className="font-mono-tabular mr-1.5">{item.index}</span>
            {item.meta}
          </p>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            {item.title}
          </h3>
          <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-stone-700 dark:text-slate-300">
            {item.description}
          </p>
        </div>

        <ul className="space-y-2 border-t border-black/10 dark:border-white/10 pt-4 text-xs sm:text-sm text-stone-700 dark:text-slate-300">
          {item.highlights.map((h) => (
            <li key={h} className="leading-relaxed">
              {h}
            </li>
          ))}
        </ul>

        <div className="pt-1 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onEnter3D(item.id)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2e473b] hover:bg-[#23382e] dark:bg-[#8fb09c] dark:hover:bg-[#a2c2ae] text-white dark:text-[#111914] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>{item.cta}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  lightingMode,
  bookings,
  onLightingChange,
  onEnter3D,
  onReserveHeroDesk,
  onOpenBookings,
}) => {
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<'all' | CameraPresetId>('all');
  const [calcPlan, setCalcPlan] = useState<BookingPlan>('monthly-unlimited');
  const [calcUnits, setCalcUnits] = useState<number>(1);

  const floorplanRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: planProgress } = useScroll({
    target: floorplanRef,
    offset: ['start end', 'end start'],
  });
  const planY = useTransform(planProgress, [0, 1], [16, -16]);

  const bookedSeatCount = bookings.filter((b) => b.chairId !== 'INNOVATION-HUB-ROOM').length;
  const openDeskCount = Math.max(0, 46 - bookedSeatCount);

  const activeCalcTier = PASS_TIER_MAP[calcPlan];
  const activeCalcTotal = activeCalcTier.defaultPriceNpr * calcUnits;

  const visibleRooms =
    selectedRoomFilter === 'all'
      ? FULL_PICTURE_ROOMS
      : FULL_PICTURE_ROOMS.filter((r) => r.id === selectedRoomFilter);

  return (
    <MotionConfig reducedMotion="user">
      <div
        id="top"
        className="min-h-screen bg-[#f4f1ea] dark:bg-[#14191f] text-[#1c2329] dark:text-[#eef1ef] transition-colors duration-300"
      >
        {/* Top Bar Contract: Single Row, Three Zones */}
        <header className="sticky top-0 z-30 border-b border-stone-300/80 dark:border-slate-800/80 bg-[#f4f1ea]/92 dark:bg-[#14191f]/92 backdrop-blur-md">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-8">
            <a
              href="#top"
              className="font-display text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50 whitespace-nowrap shrink-0"
            >
              Atelier Study
            </a>

            <nav
              aria-label="Primary navigation"
              className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600 dark:text-slate-300"
            >
              <a
                href="#spaces"
                className="hover:text-stone-950 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Spaces
              </a>
              <a
                href="#floorplan"
                className="hover:text-stone-950 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Floorplan
              </a>
              <a
                href="#passes"
                className="hover:text-stone-950 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Passes
              </a>
              <a
                href="#tour"
                className="hover:text-stone-950 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Walkthrough
              </a>
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onEnter3D('entrance')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#2e473b] hover:bg-[#23382e] dark:bg-[#8fb09c] dark:hover:bg-[#a2c2ae] text-white dark:text-[#111914] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e473b]"
              >
                Enter 3D Tour
              </button>
            </div>
          </div>
        </header>

        {/* Section 1: Hero Split with Live 3D Animated Table & Chair Showcase */}
        <section className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-7 pb-12 sm:pt-11 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Value Proposition */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex flex-col justify-between py-2"
            >
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#4a6352] dark:text-[#98b8a2] tracking-wide">
                  First Floor Study Sanctuary · 204 sq.m. · Kathmandu
                </p>

                <h1 className="mt-4 font-display text-[clamp(2.2rem,3.9vw,3.35rem)] leading-[1.06] font-semibold tracking-tight text-stone-900 dark:text-stone-50 text-balance">
                  Walk the rooms in 3D, then reserve your exact chair.
                </h1>

                <p className="mt-5 text-[15px] sm:text-base leading-relaxed text-stone-600 dark:text-slate-300 max-w-[54ch]">
                  Inspect our study carrel desk and swivel chair directly in 3D—drag to
                  orbit, toggle Day, Evening, and Night lighting to watch the brass lamp
                  glow, then enter the full 204 sq.m. architectural flat to book your seat.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => onEnter3D('entrance')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2e473b] hover:bg-[#23382e] dark:bg-[#8fb09c] dark:hover:bg-[#a2c2ae] text-white dark:text-[#111914] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2e473b]"
                  >
                    <span>Enter Full 3D Flat</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onEnter3D('overview')}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-stone-300 dark:border-slate-700 bg-[#ebe7de] dark:bg-[#1c232b] hover:bg-[#e1dcd1] dark:hover:bg-[#252e38] text-stone-800 dark:text-stone-100 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <MapIcon className="w-4 h-4 shrink-0 text-[#3b5569] dark:text-[#8eb1cb]" />
                    <span>3D Bird’s-Eye View</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-300/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600 dark:text-slate-400">
                <span>Click the 3D chair on the right or drag to inspect</span>
                {bookings.length > 0 && (
                  <button
                    type="button"
                    onClick={onOpenBookings}
                    className="font-semibold text-[#3b5569] dark:text-[#93b5cf] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                  >
                    Bookings ({bookings.length})
                  </button>
                )}
              </div>
            </motion.div>

            {/* Right Column: Live Interactive 3D Table & Chair Model */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              <HeroStudyDiorama
                lightingMode={lightingMode}
                onLightingChange={onLightingChange}
                onReserveFromHero={onReserveHeroDesk}
              />
            </motion.div>
          </div>

          {/* 4-Column Structural Metrics Strip */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-xl border border-stone-300/80 dark:border-slate-800 bg-[#eae6dc] dark:bg-[#1a2128]">
              <p className="font-mono-tabular text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-50">
                204 sq.m.
              </p>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-slate-400">
                Walkable 17.0m × 12.0m flat
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-xl border border-[#ccd7c9] dark:border-[#2c3a2f] bg-[#e6ece4] dark:bg-[#1a231c]">
              <p className="font-mono-tabular text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-50">
                {openDeskCount} Open
              </p>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-slate-400">
                Bookable chairs across 4 rooms
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-xl border border-[#c8d3dc] dark:border-[#2a3644] bg-[#e3e9ee] dark:bg-[#1a222b]">
              <p className="font-mono-tabular text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-50">
                3 Light Modes
              </p>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-slate-400">
                Day, Evening glow & Night lamps
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-xl border border-stone-300/80 dark:border-slate-800 bg-[#eae6dc] dark:bg-[#1a2128]">
              <p className="font-mono-tabular text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-50">
                NPR 100
              </p>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-slate-400">
                Hourly walk-ins to Monthly Pods
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Full-Picture Scroll Showcase (Uncropped Architectural Renders) */}
        <section
          id="spaces"
          className="border-t border-stone-300/80 dark:border-slate-800/80 bg-[#ede9e0] dark:bg-[#171d24] py-14 sm:py-20"
        >
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs sm:text-sm font-medium text-[#3b5569] dark:text-[#8eb1cb]">
                  Architectural Room Gallery
                </p>
                <h2 className="mt-2 font-display text-2xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 text-balance">
                  Every furnished room rendered in full, ready to walk inside.
                </h2>
              </div>

              {/* Interactive Room Filter Bar */}
              <div
                className="flex items-center gap-1 p-1 rounded-xl border border-stone-300/80 dark:border-slate-700 bg-[#f4f1ea] dark:bg-[#14191f] overflow-x-auto no-scrollbar shrink-0"
                role="group"
                aria-label="Filter room showcase"
              >
                {(
                  [
                    { id: 'all', label: 'All Rooms' },
                    { id: 'reading-hall', label: 'Reading Hall' },
                    { id: 'quiet-studio', label: 'Quiet Studio' },
                    { id: 'innovation-hub', label: 'Innovation Hub' },
                    { id: 'reception', label: 'Reception' },
                  ] as const
                ).map((tab) => {
                  const active = selectedRoomFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedRoomFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#2e473b] text-white dark:bg-[#8fb09c] dark:text-[#111914]'
                          : 'text-stone-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 space-y-8">
              {visibleRooms.map((item) => (
                <ScrollPictureRow key={item.id} item={item} onEnter3D={onEnter3D} />
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Full 2D Structural Plan & Lighting Choreography */}
        <section
          id="floorplan"
          ref={floorplanRef}
          className="border-t border-stone-300/80 dark:border-slate-800/80 py-14 sm:py-20 bg-[#f4f1ea] dark:bg-[#14191f]"
        >
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Full Uncropped 2D Structural Plan with Scroll Motion */}
            <div className="lg:col-span-7">
              <motion.div
                style={{ y: planY }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl overflow-hidden border border-stone-300/80 dark:border-slate-800 bg-[#23282e] shadow-md"
              >
                <ArchitecturalPhoto
                  src="/assets/aistudio/Code_Generated_Image_9743945c.png"
                  alt="Complete First Floor Reading and Study Flat 2D architectural plan with scale 1:100, key, dimensions, and room designations"
                  className="w-full h-auto block object-contain"
                />
              </motion.div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 dark:text-slate-400">
                <span>First Floor: Reading & Study Flat (Scale 1:100 · 17.0m × 12.0m)</span>
                <span>Live 2D Mini-Map synced inside 3D walkthrough</span>
              </div>
            </div>

            {/* Atmosphere Selector & Interactive Features */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#4a6352] dark:text-[#98b8a2]">
                  From Blueprint to Walkable 3D
                </p>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 text-balance">
                  Every wall, doorway, bookshelf, and lamp aligned to the structural plan.
                </h2>
                <p className="mt-3 text-sm sm:text-base text-stone-600 dark:text-slate-300 leading-relaxed">
                  Use WASD, arrow keys, mouse drag, or the mobile walk pad to enter from the
                  common corridor, ask concierge Maya for recommendations, or jump rooms via
                  the 2D Mini-Map.
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-[#c8d3dc] dark:border-[#2a3644] bg-[#e3e9ee] dark:bg-[#1a222b]">
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-100">
                  Select 3D Starting Lighting Mode
                </p>
                <div
                  className="mt-3 grid grid-cols-3 gap-2"
                  role="group"
                  aria-label="Choose starting 3D lighting mode"
                >
                  {LIGHTING_MODES.map(({ id, label, Icon }) => {
                    const active = lightingMode === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onLightingChange(id)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-[#2e473b] text-white dark:bg-[#8fb09c] dark:text-[#111914]'
                            : 'bg-[#f4f1ea]/85 dark:bg-[#14191f]/75 text-stone-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-stone-600 dark:text-slate-300">
                  {LIGHTING_MODES.find((m) => m.id === lightingMode)?.note}
                </p>
                <button
                  type="button"
                  onClick={() => onEnter3D('entrance')}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Launch 3D Scene ({lightingMode.charAt(0).toUpperCase() + lightingMode.slice(1)})
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Interactive Pass Rate Estimator & Full NPR Tiers */}
        <section
          id="passes"
          className="border-t border-stone-300/80 dark:border-slate-800/80 bg-[#e6ece4]/65 dark:bg-[#18201b] py-14 sm:py-20"
        >
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs sm:text-sm font-medium text-[#4a6352] dark:text-[#98b8a2]">
                  Nepali Rupee (NPR) Desk & Room Passes
                </p>
                <h2 className="mt-2 font-display text-2xl sm:text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 text-balance">
                  Estimate your study pass and book any seat directly in 3D.
                </h2>
              </div>

              {/* Interactive Live Rate Estimator */}
              <div className="p-4 sm:p-5 rounded-2xl border border-[#ccd7c9] dark:border-[#2c3a2f] bg-[#f4f1ea] dark:bg-[#14191f] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-stone-500 dark:text-slate-400">
                    {activeCalcTier.name} · {calcUnits}{' '}
                    {calcUnits === 1 ? activeCalcTier.unitLabel : activeCalcTier.unitPlural}
                  </p>
                  <p className="font-mono-tabular text-xl sm:text-2xl font-semibold text-[#2e473b] dark:text-[#9ec2ac]">
                    {formatNpr(activeCalcTotal)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease duration"
                    onClick={() => setCalcUnits((u) => Math.max(1, u - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-300 dark:border-slate-700 hover:bg-stone-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono-tabular text-sm font-semibold w-6 text-center">
                    {calcUnits}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase duration"
                    onClick={() => setCalcUnits((u) => Math.min(12, u + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-300 dark:border-slate-700 hover:bg-stone-200 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onReserveHeroDesk}
                    className="ml-1 px-4 py-2 rounded-lg bg-[#2e473b] hover:bg-[#23382e] dark:bg-[#8fb09c] dark:hover:bg-[#a2c2ae] text-white dark:text-[#111914] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Book in 3D
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PASS_TIERS.map((tier) => {
                const isSelected = calcPlan === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setCalcPlan(tier.id)}
                    className={`flex flex-col justify-between p-6 rounded-2xl border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#f4f1ea] dark:bg-[#1c2520] border-[#2e473b] dark:border-[#8fb09c]'
                        : 'bg-[#f4f1ea]/90 dark:bg-[#14191f] border-stone-300/80 dark:border-slate-800 hover:border-stone-400 dark:hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-stone-50">
                          {tier.name}
                        </h3>
                        {isSelected && (
                          <span className="text-xs font-semibold text-[#2e473b] dark:text-[#9ec2ac]">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="mt-2 font-mono-tabular text-2xl font-semibold text-[#2e473b] dark:text-[#9ec2ac]">
                        {formatNpr(tier.defaultPriceNpr)}
                        <span className="text-xs font-sans font-normal text-stone-500 dark:text-slate-400">
                          {' '}
                          / {tier.unitLabel}
                        </span>
                      </p>

                      <div className="mt-4 pt-4 border-t border-stone-300/70 dark:border-slate-800 space-y-2 text-sm">
                        <p className="text-stone-800 dark:text-stone-200 leading-relaxed">
                          {tier.accessAndSeatType}
                        </p>
                        <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
                          Best for: {tier.bestFor}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReserveHeroDesk();
                      }}
                      className="mt-6 w-full py-2.5 px-4 rounded-xl border border-stone-300 dark:border-slate-700 bg-[#ebe7de] dark:bg-[#1e262d] hover:bg-[#2e473b] hover:text-white hover:border-[#2e473b] dark:hover:bg-[#8fb09c] dark:hover:text-[#111914] text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Pick Seat in 3D
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Innovation Hub Room-Only Suite Callout */}
            <div className="mt-6 p-6 rounded-2xl border border-[#c8d3dc] dark:border-[#2a3644] bg-[#e3e9ee] dark:bg-[#1a222b] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#3b5569] dark:text-[#93b5cf]">
                  Private Conference Suite Policy · Innovation Hub
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-stone-900 dark:text-stone-50">
                  Innovation Hub (12-Seat Suite) — From NPR 1,200 / hr or NPR 6,000 / day
                </h3>
                <p className="mt-1 text-sm text-stone-700 dark:text-slate-300">
                  Individual conference chairs cannot be sold separately; clicking any chair
                  inside the Innovation Hub books the entire private suite.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEnter3D('innovation-hub')}
                className="px-5 py-3 rounded-xl bg-[#3b5569] hover:bg-[#2e4354] dark:bg-[#8eb1cb] dark:hover:bg-[#a3c2d8] text-white dark:text-[#101820] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Book Innovation Hub in 3D
              </button>
            </div>
          </div>
        </section>

        {/* Section 5: Launch Band & Quiet Footer */}
        <section
          id="tour"
          className="border-t border-stone-300/80 dark:border-slate-800/80 py-14 sm:py-20 bg-[#f4f1ea] dark:bg-[#14191f]"
        >
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
            <div className="p-7 sm:p-12 rounded-2xl border border-stone-300/80 dark:border-slate-800 bg-[#eae6dc] dark:bg-[#1a2128] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-xl">
                <p className="text-xs sm:text-sm font-medium text-[#4a6352] dark:text-[#98b8a2]">
                  Interactive 3D Walkthrough
                </p>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 text-balance">
                  Step inside at the entrance and explore every seat before you book.
                </h2>
                <p className="mt-2.5 text-sm sm:text-base text-stone-600 dark:text-slate-300">
                  Works smoothly on desktop and mobile with 2D Mini-Map navigation, Day /
                  Evening / Night lighting choreography, and Maya concierge guidance.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onEnter3D('entrance')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2e473b] hover:bg-[#23382e] dark:bg-[#8fb09c] dark:hover:bg-[#a2c2ae] text-white dark:text-[#111914] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Enter 3D Walkthrough</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={onOpenBookings}
                  className="px-5 py-3.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-[#f4f1ea] dark:bg-[#14191f] hover:bg-white dark:hover:bg-slate-800 text-stone-800 dark:text-stone-100 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Bookings ({bookings.length})
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-stone-300/80 dark:border-slate-800/80 py-8 bg-[#ede9e0] dark:bg-[#11151b]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-600 dark:text-slate-400">
            <div>
              <span className="font-display font-semibold text-stone-900 dark:text-stone-100">
                Atelier Study
              </span>
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              <span>First Floor Reading & Study Flat (204 sq.m.) · NPR Desk Passes</span>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <a href="#spaces" className="hover:text-stone-900 dark:hover:text-stone-100">
                Spaces
              </a>
              <a href="#floorplan" className="hover:text-stone-900 dark:hover:text-stone-100">
                Floorplan
              </a>
              <a href="#passes" className="hover:text-stone-900 dark:hover:text-stone-100">
                Passes
              </a>
              <button
                type="button"
                onClick={() => onEnter3D('entrance')}
                className="font-semibold text-[#2e473b] dark:text-[#9ec2ac] hover:underline underline-offset-4 cursor-pointer"
              >
                Open 3D Tour
              </button>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
};
