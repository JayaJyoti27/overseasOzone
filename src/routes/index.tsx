import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Globe2,
  Users,
  Stethoscope,
  HardHat,
  Hotel,
  Quote,
  Plane,
  FileCheck2,
  Briefcase,
  Building2,
  Wrench,
  TrendingUp,
  ShieldCheck,
  Star,
  Mail,
  Phone,
  Award,
  Landmark,
  MapPin,
  GraduationCap,
  Languages,
  HeartPulse,
  ClipboardCheck,
  Handshake,
  Scale,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/footer";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import about1 from "@/assets/about-1.jpg";
import about2 from "@/assets/about-2.jpg";
import grid1 from "@/assets/grid-1.jpg";
import grid2 from "@/assets/grid-2.jpg";
import grid3 from "@/assets/grid-3.jpg";
import grid4 from "@/assets/grid-4.jpg";
import industryConstruction from "@/assets/industry-construction.jpg";
import vertical1 from "@/assets/vertical-1.jpg";
import vertical2 from "@/assets/vertical-2.jpg";
import vertical3 from "@/assets/vertical-3.jpg";
import ctaPerson from "@/assets/cta-person.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ozone Overseas — MEA-Licensed International Recruitment, India ↔ GCC" },
      {
        name: "description",
        content:
          "Connecting verified Indian talent with leading employers across the GCC. 5,000+ placements, 200+ employers, 48-hour shortlisting.",
      },
      { property: "og:title", content: "Ozone Overseas — India ↔ GCC Recruitment" },
      {
        property: "og:description",
        content: "MEA-licensed bridge between top Indian talent and verified GCC employers.",
      },
    ],
  }),
  component: Home,
});

/* ---------- shared decorative bits ---------- */

const Blob = ({
  className = "",
  color = "var(--blue-soft)",
}: {
  className?: string;
  color?: string;
}) => (
  <svg viewBox="0 0 600 600" className={className} aria-hidden>
    <path
      fill={color}
      d="M421,318Q406,386,343,418Q280,450,213,420Q146,390,116,325Q86,260,121,196Q156,132,222,108Q288,84,353,113Q418,142,431,201Q444,250,421,318Z"
    />
  </svg>
);

const DotGrid = ({ className = "" }: { className?: string }) => (
  <div className={`dot-grid ${className}`} aria-hidden />
);

const WaveBand = ({ className = "", flip = false }: { className?: string; flip?: boolean }) => (
  <svg
    viewBox="0 0 1440 80"
    className={className}
    preserveAspectRatio="none"
    aria-hidden
    style={{ transform: flip ? "scaleY(-1)" : undefined }}
  >
    <path
      d="M0,40 C240,90 480,0 720,30 C960,60 1200,80 1440,30 L1440,80 L0,80 Z"
      fill="currentColor"
    />
  </svg>
);

/* ---------- page ---------- */

function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <Hero />
      <TrustCredibility />
      <TrustedStrip />
      <WhyTrustUs />
      <WhyChoose />
      <LiveJobs />
      <Industries />
      <MatchEngine />
      <Process />
      <QualityAssurance />
      <Verticals />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

/* ---------- 1. header ---------- */

/* ---------- 2. hero ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Sweeping wave background (JobBox-style) */}
      <svg
        aria-hidden
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMaxYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="heroWave" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-blue-wash)" />
            <stop offset="100%" stopColor="var(--color-blue-soft)" />
          </linearGradient>
        </defs>
        <path
          d="M1440,0 L1440,900 L520,900 C620,720 420,640 520,460 C620,280 980,260 880,120 C820,40 1180,0 1440,0 Z"
          fill="url(#heroWave)"
        />
        <path
          d="M1440,120 C1240,180 1100,60 940,140 C780,220 720,440 880,540 C1040,640 1300,560 1440,640 L1440,120 Z"
          fill="var(--color-blue-soft)"
          opacity="0.55"
        />
      </svg>
      <DotGrid className="absolute left-6 top-32 h-24 w-24 opacity-70" />

      <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:py-12">
        {/* left */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" /> Govt. of India · MEA Licensed
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-navy md:text-5xl lg:text-6xl">
            Ethical, Compliant
            <br />
            <span className="text-blue">International Recruitment</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink md:text-lg">
            new version Ozone Overseas is a Government of India MEA-licensed recruitment partner delivering
            end-to-end workforce solutions — sourcing, screening, documentation, visa and deployment
            — for verified employers across the GCC.
          </p>

          {/* USP row */}
          <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-[0_10px_40px_-20px_rgba(11,31,58,0.18)] sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: "MEA-Licensed & Compliant" },
              { icon: Scale, label: "Ethical Recruitment" },
              { icon: Handshake, label: "End-to-End Workforce Solutions" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-wash text-blue">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-navy">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/Login"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-blue transition"
            >
              Hire Talent <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/For-Candidates"
              className="inline-flex items-center gap-2 rounded-full border-2 border-blue px-6 py-3 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition"
            >
              Apply for Jobs <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy ring-1 ring-border hover:ring-blue transition"
            >
              Contact Us <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* right collage */}
        <div className="relative mx-auto h-[440px] w-full max-w-[520px] lg:h-[480px]">
          <DotGrid className="absolute top-0 right-0 h-24 w-24" />
          <div className="absolute left-2 top-6 h-[360px] w-[78%] overflow-hidden rounded-[28px] ring-4 ring-blue/30 shadow-[0_30px_60px_-20px_rgba(30,77,140,0.55)]">
            <img
              src={hero}
              alt="Ozone Overseas recruitment consultant"
              className="h-full w-full object-cover"
              width={800}
              height={960}
            />
          </div>
          <div className="absolute bottom-0 right-0 h-[200px] w-[58%] overflow-hidden rounded-[24px] border-8 border-white ring-4 ring-blue/20 shadow-[0_30px_60px_-20px_rgba(30,77,140,0.45)]">
            <img
              src={hero2}
              alt="Employer onboarding"
              className="h-full w-full object-cover"
              width={640}
              height={640}
              loading="lazy"
            />
          </div>
          <div className="absolute -top-2 right-12 rounded-2xl bg-white px-4 py-3 shadow-lg ring-1 ring-border">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-navy">
                Live · 124 new roles this week
              </span>
            </div>
          </div>
          <DotGrid className="absolute -bottom-2 -left-2 h-20 w-20 opacity-80" />
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. trusted strip ---------- */

function TrustedStrip() {
  const logos = [
    "Apollo",
    "NMC Royal",
    "Cleveland",
    "Aster DM",
    "Burjeel",
    "Mediclinic",
    "SEHA",
    "KIMS",
  ];
  return (
    <section className="px-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[40px] bg-blue-wash px-8 py-10">
          <Blob
            className="absolute -top-20 -left-16 h-56 w-56 opacity-70"
            color="var(--blue-soft)"
          />
          <DotGrid className="absolute top-4 right-6 h-16 w-24 opacity-80" />
          <svg
            viewBox="0 0 1200 100"
            className="absolute inset-x-0 bottom-0 text-blue-soft opacity-60"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0,60 C200,20 400,90 600,50 C800,10 1000,80 1200,40 L1200,100 L0,100 Z"
              fill="currentColor"
            />
          </svg>
          <p className="relative text-center text-sm font-semibold uppercase tracking-widest text-blue">
            Trusted by Leading Employers Across the GCC
          </p>
          <div className="relative mt-6 grid grid-cols-2 items-center gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
            {logos.map((l) => (
              <div
                key={l}
                className="text-center font-display text-lg font-bold text-navy/70 hover:text-navy transition"
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. why trust us ---------- */

function WhyTrustUs() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <Blob
        className="absolute -bottom-40 -right-40 h-[500px] w-[500px] opacity-70"
        color="var(--blue-wash)"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        {/* photos */}
        <div className="relative h-[560px]">
          <div className="absolute left-0 top-0 h-[380px] w-[72%] overflow-hidden rounded-[28px] shadow-xl">
            <img
              src={about1}
              alt="Healthcare team placed by Ozone"
              className="h-full w-full object-cover"
              width={720}
              height={900}
              loading="lazy"
            />
          </div>
          <div className="absolute bottom-0 right-2 h-[300px] w-[60%] overflow-hidden rounded-[24px] border-[10px] border-white shadow-2xl">
            <img
              src={about2}
              alt="Ozone consultants in office"
              className="h-full w-full object-cover"
              width={640}
              height={720}
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-2 left-4 rounded-2xl bg-navy px-5 py-3 text-white shadow-xl">
            <div className="font-display text-2xl font-bold leading-none">15+</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-blue-soft">
              Years of Trust
            </div>
          </div>
          <DotGrid className="absolute right-0 top-8 h-24 w-24" />
        </div>

        {/* copy */}
        <div>
          <span className="inline-block rounded-full bg-blue-wash px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue">
            Why Ozone
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-navy md:text-5xl">
            One of the Fastest Ways to Hire <span className="italic text-blue">Top Talent</span>
          </h2>
          <p className="mt-5 text-ink">
            For 15+ years we've been the licensed channel between India's deep talent pool and the
            Gulf's most demanding employers — pre-screening every candidate before they ever reach
            your inbox.
          </p>
          <div className="mt-7 grid gap-4">
            {[
              {
                icon: ShieldCheck,
                t: "Pre-Screened, Verified Candidates",
                d: "Skills, documents, and references checked before shortlist.",
              },
              {
                icon: FileCheck2,
                t: "Visa & Documentation Handled End-to-End",
                d: "We manage paperwork from offer to arrival — no back-office work on you.",
              },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-4 rounded-2xl border border-border bg-white p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-wash text-blue">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-semibold text-navy">{t}</div>
                  <div className="mt-1 text-sm text-ink">{d}</div>
                </div>
              </div>
            ))}
          </div>
          <a
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-blue transition"
          >
            Get in Touch <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. why choose ---------- */

function WhyChoose() {
  return (
    <section className="relative overflow-hidden bg-blue-wash px-6 py-16">
      <Blob
        className="absolute -top-32 -left-40 h-[420px] w-[420px] opacity-60"
        color="oklch(0.94 0.025 250)"
      />
      <Blob
        className="absolute -bottom-32 -right-32 h-[340px] w-[340px] opacity-60"
        color="var(--blue-soft)"
      />
      <DotGrid className="absolute top-10 right-10 h-24 w-24 opacity-80" />
      <svg
        viewBox="0 0 1440 60"
        className="absolute inset-x-0 top-0 h-8 w-full text-white"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,30 C240,60 480,0 720,30 C960,60 1200,10 1440,30 L1440,0 L0,0 Z"
          fill="currentColor"
        />
      </svg>
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight text-navy md:text-4xl">
            Built on <span className="text-blue">Trust</span>, Backed by Results
          </h2>
          <p className="max-w-md text-sm text-ink">
            From ICU nurses in Riyadh to engineers in Doha, we've placed thousands of Indian
            professionals into roles where they thrive.
          </p>
        </div>

        {/* grid */}
        <div className="grid gap-4 md:grid-cols-12">
          <PhotoCard
            className="md:col-span-7 md:row-span-2 h-[380px]"
            src={grid1}
            label="Healthcare Placements"
            sub="ICU · OT · Critical Care"
          />
          <PhotoCard
            className="md:col-span-5 h-[180px]"
            src={grid2}
            label="Engineering & Skilled Trades"
            sub="Doha · Riyadh · Abu Dhabi"
          />
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            <PhotoCard
              className="h-[180px] col-span-1"
              src={grid3}
              label="Hospitality"
              sub="5-star groups"
              small
            />
            <PhotoCard
              className="h-[180px] col-span-1"
              src={grid4}
              label="Documentation"
              sub="Visa · Travel"
              small
            />
          </div>
        </div>

        {/* stat capsule */}
        <div className="mt-10 grid grid-cols-3 divide-x divide-white/15 rounded-full bg-navy px-6 py-5 text-white shadow-xl">
          {[
            { n: "15+", l: "Years of Experience" },
            { n: "5,000+", l: "Professionals Placed" },
            { n: "98%", l: "Success Rate" },
          ].map((s) => (
            <div key={s.l} className="px-4 text-center">
              <div className="font-display text-2xl font-bold md:text-3xl">{s.n}</div>
              <div className="mt-1 text-[10px] font-medium uppercase tracking-widest text-blue-soft">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhotoCard({
  src,
  label,
  sub,
  className = "",
  small = false,
}: {
  src: string;
  label: string;
  sub: string;
  className?: string;
  small?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] shadow-lg ${className}`}>
      <img src={src} alt={label} className="h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 backdrop-blur px-4 py-3">
        <div className={`font-semibold text-navy ${small ? "text-sm" : ""}`}>{label}</div>
        <div className="text-xs text-ink">{sub}</div>
      </div>
    </div>
  );
}

/* ---------- 6. live openings ---------- */

function LiveJobs() {
  const jobs = [
    { flag: "🇦🇪", role: "ICU Staff Nurse", loc: "Abu Dhabi, UAE", emp: "Burjeel Hospital" },
    { flag: "🇸🇦", role: "Biomedical Engineer", loc: "Riyadh, KSA", emp: "King Faisal Spec." },
    { flag: "🇶🇦", role: "Site Civil Engineer", loc: "Doha, Qatar", emp: "QDVC" },
    { flag: "🇰🇼", role: "Hotel F&B Supervisor", loc: "Kuwait City", emp: "Four Points" },
    { flag: "🇴🇲", role: "HVAC Technician", loc: "Muscat, Oman", emp: "Galfar" },
    { flag: "🇧🇭", role: "Caregiver — Elderly", loc: "Manama, Bahrain", emp: "Royal Care" },
  ];
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <Blob
        className="absolute top-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 opacity-60"
        color="var(--blue-wash)"
      />
      <DotGrid className="absolute bottom-10 right-10 h-28 w-28" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-blue">
              Live Openings
            </span>
            <h2 className="mt-2 font-display text-4xl font-bold text-navy md:text-5xl">
              Live <span className="text-blue">Openings</span>, Updated Weekly
            </h2>
          </div>
          <a href="/Login" className="text-sm font-semibold text-blue hover:text-navy">
            View all roles →
          </a>
        </div>

        <div className="-mx-6 overflow-x-auto px-6 pb-4 snap-x snap-mandatory">
          <div className="flex gap-5">
            {jobs.map((j) => (
              <article
                key={j.role}
                className="min-w-[280px] max-w-[280px] snap-start rounded-2xl bg-white p-6 shadow-[0_12px_40px_-24px_rgba(11,31,58,0.25)] ring-1 ring-border hover:-translate-y-1 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{j.flag}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    Open
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-navy">{j.role}</h3>
                <div className="mt-1 text-sm text-ink">{j.loc}</div>
                <div className="mt-3 inline-block rounded-full bg-blue-wash px-2.5 py-1 text-[11px] font-semibold text-blue">
                  {j.emp}
                </div>
                <a
                  href="/Login"
                  className="mt-5 flex items-center justify-between text-sm font-semibold text-navy hover:text-blue"
                >
                  View Role <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full ${i === 0 ? "w-8 bg-blue" : "w-2 bg-blue-soft"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 7. industries ---------- */

function Industries() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-bold text-navy md:text-5xl">
            Industries We <span className="text-blue">Serve</span>
          </h2>
          <p className="max-w-md text-ink">
            Decades of deep specialization across the sectors driving the GCC.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* navy */}
          <IndustryCard
            n="01."
            title="Healthcare & Nursing"
            text="ICU, OT, ward & specialty roles for hospital groups across UAE, KSA, Qatar."
            icon={<Stethoscope className="h-6 w-6" />}
            variant="dark"
          />
          {/* blue */}
          <IndustryCard
            n="02."
            title="Engineering & Technical"
            text="Civil, mechanical, electrical and biomedical talent for major projects."
            icon={<Wrench className="h-6 w-6" />}
            variant="blue"
          />
          {/* photo */}
          <IndustryCard
            n="03."
            title="Hospitality & Construction"
            text="Skilled crews for hotels, restaurants and high-rise developments."
            icon={<HardHat className="h-6 w-6" />}
            variant="photo"
            image={industryConstruction}
          />
        </div>
      </div>
    </section>
  );
}

function IndustryCard({
  n,
  title,
  text,
  icon,
  variant,
  image,
}: {
  n: string;
  title: string;
  text: string;
  icon: React.ReactNode;
  variant: "dark" | "blue" | "photo";
  image?: string;
}) {
  const styles = {
    dark: "bg-navy text-white",
    blue: "bg-blue text-white",
    photo: "text-white",
  }[variant];
  return (
    <article
      className={`relative flex h-[460px] flex-col justify-between overflow-hidden rounded-[28px] p-7 ${styles}`}
    >
      {variant === "photo" && image && (
        <>
          <img
            src={image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/10" />
        </>
      )}
      <div className="relative flex items-start justify-between">
        <span className="font-display text-sm font-semibold opacity-80">{n}</span>
        <span className="opacity-90">{icon}</span>
      </div>
      <div className="relative">
        <h3 className="font-display text-2xl font-bold leading-tight">{title}</h3>
        <p className="mt-3 text-sm opacity-85">{text}</p>
        <div className="mt-6 flex items-center justify-between">
          <a href="#" className="text-sm font-semibold underline-offset-4 hover:underline">
            Explore
          </a>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15 ring-1 ring-white/30">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </article>
  );
}

/* ---------- 8. match engine ---------- */

function MatchEngine() {
  const pills = [
    { t: "ICU Nurse", x: "10%", y: "12%" },
    { t: "Biomedical", x: "78%", y: "18%" },
    { t: "Hospitality", x: "5%", y: "70%" },
    { t: "Caregiver", x: "80%", y: "72%" },
    { t: "Civil Engineer", x: "44%", y: "-4%" },
    { t: "Welder", x: "44%", y: "100%" },
  ];
  return (
    <section className="relative overflow-hidden bg-blue-wash px-6 py-24">
      <Blob className="absolute -bottom-32 -right-32 h-[500px] w-[500px] opacity-70" />
      <Blob
        className="absolute -top-24 -left-24 h-[360px] w-[360px] opacity-60"
        color="oklch(0.94 0.025 250)"
      />
      <DotGrid className="absolute top-12 right-1/3 h-20 w-20 opacity-70" />
      <svg
        viewBox="0 0 1440 60"
        className="absolute inset-x-0 top-0 h-8 w-full text-white"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,30 C240,60 480,0 720,30 C960,60 1200,10 1440,30 L1440,0 L0,0 Z"
          fill="currentColor"
        />
      </svg>
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        {/* orbit */}
        <div className="relative mx-auto h-[480px] w-[480px] max-w-full">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue/30" />
          <div className="absolute inset-12 rounded-full border-2 border-dashed border-blue/40" />
          <div className="absolute inset-24 grid place-items-center rounded-full bg-navy text-white shadow-2xl">
            <div className="text-center">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-blue-soft">
                Ozone
              </div>
              <div className="font-display text-3xl font-bold leading-tight">Match</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-blue-soft">
                Engine
              </div>
            </div>
          </div>
          {pills.map((p) => (
            <div
              key={p.t}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-lg ring-1 ring-blue/10"
              style={{ left: p.x, top: p.y }}
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue" />
              {p.t}
            </div>
          ))}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-border">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue">
                Live Match
              </span>
            </div>
            <div className="mt-1 text-sm font-semibold text-navy">Candidate → Employer in 48h</div>
          </div>
        </div>

        {/* right */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-blue">
            Global Talent Match Engine
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-navy md:text-5xl">
            Where Great Talent Meets <span className="text-blue">Great Opportunity</span>
          </h2>
          <p className="mt-5 text-ink">
            Our internal match engine pairs verified candidate profiles with live employer mandates
            — so shortlists land in 48 hours, not weeks.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {[
              { t: "Hire Talent", d: "Shortlisted candidates in 48 hours", icon: Briefcase },
              { t: "Find Jobs", d: "Vacancies across 10+ countries", icon: Plane },
            ].map(({ t, d, icon: Icon }) => (
              <a
                key={t}
                href="#"
                className="group rounded-2xl border border-border bg-white p-5 hover:border-blue transition"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-wash text-blue">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-blue group-hover:translate-x-0.5 transition" />
                </div>
                <div className="mt-4 font-display text-lg font-semibold text-navy">{t}</div>
                <div className="text-sm text-ink">{d}</div>
              </a>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[avatar1, avatar2, avatar3].map((a, i) => (
                <img
                  key={i}
                  src={a}
                  alt=""
                  className="h-9 w-9 rounded-full border-2 border-white object-cover"
                  loading="lazy"
                />
              ))}
            </div>
            <div className="text-sm text-ink">
              <span className="font-semibold text-navy">Trusted by 200+ hospitals & companies</span>
              <br />
              5,000+ professionals placed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 9. process ---------- */

function Process() {
  const steps = [
    {
      n: "1",
      t: "Apply & Get Verified",
      d: "Profile, documents and credentials screened by our team.",
    },
    {
      n: "2",
      t: "Matched with Employers",
      d: "Our engine surfaces you to verified employers in 48 hours.",
    },
    {
      n: "3",
      t: "Visa, Travel & Deployment",
      d: "Paperwork, ticketing and on-ground onboarding handled end-to-end.",
    },
  ];
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <Blob
        className="absolute bottom-0 right-0 h-[500px] w-[500px] opacity-60"
        color="var(--blue-wash)"
      />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-blue">
              Our Process
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-navy md:text-5xl">
              We Have the Best Team and <span className="text-blue">Best Process</span>
            </h2>
            <p className="mt-5 text-ink">
              A three-step path designed for speed without cutting corners — from first application
              to your first day on the job abroad.
            </p>
            <a
              href="/For-Candidates"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-blue transition"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="relative">
            <svg
              viewBox="0 0 800 360"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M40,80 C200,80 240,280 400,280 C560,280 600,80 760,80"
                fill="none"
                stroke="var(--color-blue)"
                strokeWidth="2"
                strokeDasharray="6 8"
              />
            </svg>
            <div className="relative grid grid-cols-3 gap-4">
              {steps.map((s, i) => (
                <div key={s.n} className={`relative ${i === 1 ? "mt-32" : ""}`}>
                  <div className="font-display text-7xl font-extrabold text-blue-soft leading-none">
                    {s.n}
                  </div>
                  <div className="mt-2 font-display text-lg font-semibold text-navy">{s.t}</div>
                  <p className="mt-1 text-sm text-ink">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 10. verticals ---------- */

function Verticals() {
  const cards = [
    {
      img: vertical1,
      tag: "SKILLED MANPOWER",
      title: "Skilled Manpower",
      desc: "Welders, technicians and trade specialists for industrial and construction projects.",
    },
    {
      img: vertical2,
      tag: "HEALTHCARE STAFFING",
      title: "Healthcare Staffing",
      desc: "Doctors, nurses and allied health professionals into hospital groups GCC-wide.",
    },
    {
      img: vertical3,
      tag: "CORPORATE HIRING",
      title: "Corporate Hiring",
      desc: "Mid- to senior-level corporate roles across finance, ops and admin functions.",
    },
  ];
  return (
    <section className="relative overflow-hidden bg-blue-wash px-6 py-24">
      <Blob
        className="absolute -top-20 -right-24 h-[340px] w-[340px] opacity-60"
        color="var(--blue-soft)"
      />
      <Blob
        className="absolute -bottom-32 -left-32 h-[420px] w-[420px] opacity-60"
        color="oklch(0.94 0.025 250)"
      />
      <DotGrid className="absolute bottom-10 right-10 h-24 w-24 opacity-80" />
      <svg
        viewBox="0 0 1440 60"
        className="absolute inset-x-0 top-0 h-8 w-full text-white"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,30 C240,60 480,0 720,30 C960,60 1200,10 1440,30 L1440,0 L0,0 Z"
          fill="currentColor"
        />
      </svg>
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-blue">
              Business Verticals
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold text-navy md:text-5xl">
              Where We've Made an <span className="text-blue">Impact</span>
            </h2>
          </div>
          <p className="max-w-md text-ink">
            Leading employers have trusted Ozone across three core verticals.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.title}
              className="group overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_-30px_rgba(11,31,58,0.3)]"
            >
              <div className="relative h-[260px] overflow-hidden">
                <img
                  src={c.img}
                  alt={c.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-blue px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  {c.tag}
                </span>
                <span className="absolute top-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-white text-navy shadow-md">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-navy">{c.title}</h3>
                <p className="mt-2 text-sm text-ink">{c.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 11. testimonials ---------- */

function Testimonials() {
  const items = [
    {
      q: "Ozone shortlisted three ICU nurses for us in under 48 hours — all three are still with us two years later.",
      n: "Dr. Reema Al-Hadi",
      r: "HR Director, Burjeel Hospital",
    },
    {
      q: "From application to landing in Doha took five weeks. Every document, every flight — handled.",
      n: "Vinay Kumar",
      r: "Biomedical Engineer, Doha",
    },
    {
      q: "We hired an entire site crew through Ozone for our Riyadh tower project. Zero attrition in 18 months.",
      n: "Khalid Mansoor",
      r: "Project Director, QDVC",
    },
  ];
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <Blob
        className="absolute -top-24 right-0 h-[320px] w-[320px] opacity-50"
        color="var(--blue-wash)"
      />
      <DotGrid className="absolute bottom-10 left-10 h-20 w-20 opacity-70" />
      <div className="relative mx-auto max-w-7xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue">
          Testimonial
        </span>
        <h2 className="mt-3 font-display text-4xl font-bold text-navy md:text-5xl">
          Transformative Candidate & <span className="text-blue">Employer</span> Experiences
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3 text-left">
          {items.map((t) => (
            <figure key={t.n} className="relative rounded-[28px] bg-blue-wash p-7">
              <Quote className="absolute -top-3 left-6 h-10 w-10 rotate-180 text-blue" />
              <blockquote className="mt-4 text-navy/90 leading-relaxed">"{t.q}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-blue-soft pt-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy font-display text-sm font-bold text-white">
                  {t.n
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <div className="font-semibold text-navy">{t.n}</div>
                  <div className="text-xs text-ink">{t.r}</div>
                </div>
                <Star className="ml-auto h-4 w-4 fill-gold text-gold" />
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full ${i === 0 ? "w-8 bg-blue" : "w-2 bg-blue-soft"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 12. cta ---------- */

function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-blue-wash px-6 pt-24 pb-32">
      <div className="absolute inset-x-0 top-0 text-blue-wash">
        <WaveBand className="w-full h-12 -translate-y-full text-blue-wash" />
      </div>
      <Blob className="absolute -bottom-40 -left-40 h-[500px] w-[500px] opacity-70" />
      <Blob
        className="absolute -top-20 -right-24 h-[320px] w-[320px] opacity-60"
        color="var(--blue-soft)"
      />
      <DotGrid className="absolute top-20 left-1/3 h-24 w-24 opacity-70" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        {/* bento */}
        <div className="relative h-[520px]">
          <div className="absolute left-0 top-0 h-[420px] w-[70%] overflow-hidden rounded-[32px] shadow-2xl">
            <img
              src={ctaPerson}
              alt="Candidate placed abroad"
              className="h-full w-full object-cover"
              width={800}
              height={900}
              loading="lazy"
            />
          </div>
          {/* stat card top */}
          <div className="absolute right-0 top-6 w-[44%] rounded-2xl bg-white p-5 shadow-xl ring-1 ring-border">
            <div className="text-xs font-semibold uppercase tracking-widest text-blue">Placed</div>
            <div className="mt-1 font-display text-3xl font-bold text-navy">5,000+</div>
            <div className="text-xs text-ink">Candidates worldwide</div>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> +18% YoY
            </div>
          </div>
          {/* stat card middle */}
          <div className="absolute right-4 top-[200px] w-[48%] rounded-2xl bg-navy p-5 text-white shadow-xl">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-blue-soft">
              Partner Employers
            </div>
            <div className="mt-1 font-display text-3xl font-bold">200+</div>
            <div className="text-xs text-blue-soft">Hospitals & companies</div>
            <div className="mt-3 grid grid-cols-6 items-end gap-1 h-8">
              {[3, 5, 4, 7, 6, 9].map((h, i) => (
                <div
                  key={i}
                  className="rounded-sm bg-blue-soft/70"
                  style={{ height: `${h * 10}%` }}
                />
              ))}
            </div>
          </div>
          {/* bottom small */}
          <div className="absolute bottom-0 right-12 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-border flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-wash text-blue">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <div className="font-display text-lg font-bold text-navy leading-none">10+</div>
              <div className="text-xs text-ink">Countries served</div>
            </div>
          </div>
        </div>

        {/* copy */}
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight text-navy md:text-5xl">
            Ready to Hire or <span className="text-blue">Get Hired?</span>
          </h2>
          <p className="mt-5 text-ink max-w-md">
            Whether you're an employer needing pre-screened talent or a professional ready for the
            next chapter abroad — we'll move on it in 48 hours.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/employers"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-blue transition"
            >
              Hire Talent <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/For-Candidates"
              className="inline-flex items-center gap-2 rounded-full border-2 border-blue px-6 py-3 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition"
            >
              Apply Now <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-navy">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue" /> +91 80 4567 8900
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue" /> hello@ozoneoverseas.in
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 13. footer ---------- */

/* ---------- Trust & Credibility (counters) ---------- */

function TrustCredibility() {
  const stats = [
    { icon: Landmark, n: "MEA", l: "Govt. of India Licensed", sub: "Recruitment Licence" },
    { icon: Award, n: "15+", l: "Years of Experience", sub: "Since 2009" },
    { icon: MapPin, n: "10+", l: "Countries Served", sub: "GCC & beyond" },
    { icon: Users, n: "5,000+", l: "Candidates Deployed", sub: "Successfully placed" },
    { icon: Building2, n: "200+", l: "Global Employer Network", sub: "Verified partners" },
    { icon: Briefcase, n: "12+", l: "Industry Sectors Served", sub: "Healthcare to Energy" },
  ];
  return (
    <section className="relative overflow-hidden px-6 py-20">
      <Blob
        className="absolute -top-24 -right-24 h-[360px] w-[360px] opacity-60"
        color="var(--blue-wash)"
      />
      <Blob
        className="absolute -bottom-32 -left-24 h-[320px] w-[320px] opacity-50"
        color="var(--blue-soft)"
      />
      <DotGrid className="absolute top-10 left-1/3 h-20 w-20 opacity-70" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-blue">
              Trust & Credibility
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy md:text-4xl">
              A Track Record Built on <span className="text-blue">Compliance & Results</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-ink">
            Every number below reflects a commitment to ethical practice, government compliance and
            long-term partnerships with global employers.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(({ icon: Icon, n, l, sub }) => (
            <div
              key={l}
              className="group relative overflow-hidden rounded-[24px] border border-border bg-white p-6 shadow-[0_12px_40px_-28px_rgba(11,31,58,0.35)] hover:-translate-y-1 transition"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-wash text-blue">
                  <Icon className="h-6 w-6" />
                </span>
                <TrendingUp className="h-4 w-4 text-blue/40" />
              </div>
              <div className="mt-5 font-display text-4xl font-bold text-navy">{n}</div>
              <div className="mt-1 text-sm font-semibold text-navy">{l}</div>
              <div className="mt-0.5 text-xs text-ink">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Quality Assurance & Compliance ---------- */

function QualityAssurance() {
  const items = [
    {
      icon: ShieldCheck,
      t: "Rigorous Pre-Screening",
      d: "Structured screening of every candidate before any employer sees them.",
    },
    {
      icon: FileCheck2,
      t: "Qualification & Experience Verification",
      d: "Credentials, certificates and employment history verified at source.",
    },
    {
      icon: ClipboardCheck,
      t: "Skill Assessment",
      d: "Role-specific practical and theoretical assessments.",
    },
    {
      icon: Users,
      t: "Interview Preparation & Grooming",
      d: "Coaching and mock interviews before employer rounds.",
    },
    {
      icon: Languages,
      t: "Language Training Support",
      d: "English and Arabic support for client-facing roles.",
    },
    {
      icon: GraduationCap,
      t: "Prometric Coaching (Healthcare)",
      d: "Structured prep for DHA, HAAD, MOH and SCFHS exams.",
    },
    {
      icon: FileCheck2,
      t: "Documentation & Visa Support",
      d: "End-to-end paperwork, attestation and visa processing.",
    },
    {
      icon: HeartPulse,
      t: "Medical Fitness Coordination",
      d: "GAMCA-approved medicals scheduled and tracked centrally.",
    },
    {
      icon: Scale,
      t: "Government Compliance & Ethical Practice",
      d: "MEA-compliant contracts, zero-fee ethical recruitment for candidates.",
    },
    {
      icon: Plane,
      t: "Pre-Departure Orientation",
      d: "Country, culture and role briefings before travel.",
    },
    {
      icon: Handshake,
      t: "Continuous Employer–Candidate Coordination",
      d: "Single-point support from offer letter through onboarding.",
    },
    {
      icon: Check,
      t: "Final Quality Checks Before Deployment",
      d: "A last verification pass to guarantee deployment-ready talent.",
    },
  ];
  return (
    <section className="relative overflow-hidden bg-blue-wash px-6 py-24">
      <Blob
        className="absolute -top-32 -left-32 h-[420px] w-[420px] opacity-60"
        color="oklch(0.94 0.025 250)"
      />
      <Blob
        className="absolute -bottom-40 -right-32 h-[460px] w-[460px] opacity-60"
        color="var(--blue-soft)"
      />
      <DotGrid className="absolute top-14 right-14 h-24 w-24 opacity-80" />
      <svg
        viewBox="0 0 1440 60"
        className="absolute inset-x-0 top-0 h-8 w-full text-white"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,30 C240,60 480,0 720,30 C960,60 1200,10 1440,30 L1440,0 L0,0 Z"
          fill="currentColor"
        />
      </svg>
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue">
              Quality Assurance & Compliance
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-navy md:text-5xl">
              Qualified. Compliant. <span className="text-blue">Deployment-Ready.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-ink">
            Quality assurance runs through every stage of our recruitment lifecycle — so every
            candidate we deploy meets the standards of the world's most demanding employers.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, t, d }) => (
            <div
              key={t}
              className="flex gap-4 rounded-2xl border border-border bg-white p-5 hover:border-blue transition"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-wash text-blue">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="font-semibold text-navy">{t}</div>
                <div className="mt-1 text-sm text-ink">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
