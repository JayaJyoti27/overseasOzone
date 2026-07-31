import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown, MessageCircle } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
// NOTE: paths below match routeTree.gen.ts exactly (case-sensitive).

const CANDIDATE_SERVICES = [
  { label: "For Candidates", to: "/For-Candidates", desc: "Overview & how it works" },
  { label: "Browse Jobs", to: "/candidate", desc: "42+ live roles across 17 countries" },
  { label: "My Dashboard", to: "/candidate", desc: "Track applications & profile" },
  { label: "Nursing Careers", to: "/Services/Nursing-rec", desc: "ICU, OT, Staff Nurse & more" },
  {
    label: "Prometric Coaching",
    to: "/Services/Prometric-coaching",
    desc: "Free — DHA, HAAD, SCFHS, QCHP",
  },
  {
    label: "Mock Interviews",
    to: "/Services/Mock-Interviews",
    desc: "Coordinator-led, role specific",
  },
  { label: "Grooming Sessions", to: "/Services/Grooming", desc: "Pre-departure prep" },
  { label: "Visa Services", to: "/Services/Visa", desc: "End-to-end managed" },
  {
    label: "Documentation",
    to: "/Services/Documentation",
    desc: "Dataflow, MOH portal, attestation",
  },
  { label: "Training & Coaching", to: "/Services/Training", desc: "Full free training package" },
];

const EMPLOYER_SERVICES = [
  { label: "For Employers", to: "/employers", desc: "Overview & how we work" },
  { label: "My Dashboard", to: "/employer", desc: "Sign in or register your company" },
  {
    label: "Healthcare Recruitment",
    to: "/Services/Healthcare-rec",
    desc: "Nurses, doctors, allied health",
  },
  { label: "For Nurses", to: "/Services/Nurses", desc: "All nursing specialties, GCC-licensed" },
  { label: "For Doctors", to: "/Services/Doctors", desc: "All specialties, MOH/DHA/HAAD" },
  {
    label: "Paramedical Technicians",
    to: "/Services/ParaMedical-tech",
    desc: "Biomedical, radiology, lab",
  },
  {
    label: "Technical Recruitment",
    to: "/Services/Technical-rec",
    desc: "Engineering & technical roles",
  },
  { label: "Visa Services", to: "/Services/Visa", desc: "94% first-attempt approval" },
  { label: "Documentation", to: "/Services/Documentation", desc: "Fully managed, in-house" },
];

const ADMIN_SERVICES = [{ label: "For Admin", to: "/Login", desc: "Internal admin dashboard" }];

const COUNTRY_LINKS = [
  { label: "Kuwait", to: "/Country/Kuwait" },
  { label: "Oman", to: "/Country/Oman" },
  { label: "Qatar", to: "/Country/Qatar" },
  { label: "Saudi Arabia", to: "/Country/Saudi-Arabia" },
  { label: "UAE", to: "/Country/UAE" },
  // Terms removed — no /terms route exists yet. Add back once that page is built.
];

const COMPANY_LINKS = [
  { label: "About Us", to: "/about", desc: "15 years, MEA licensed since 2009" },
  { label: "Contact", to: "/contact", desc: "We respond within one business day" },
  { label: "Privacy Policy", to: "/privacypolicy", desc: "" },
  // Terms removed — no /terms route exists yet. Add back once that page is built.
];

type DropdownKey = "countries" | "candidates" | "employers" | "admin" | "company" | null;

// ─── Panels ───────────────────────────────────────────────────────────────────

function ServicePanel({ items }: { items: { label: string; to: string; desc?: string }[] }) {
  return (
    <div className="w-72 rounded-2xl border border-blue/15 bg-card p-2 shadow-elevated">
      {items.map((item) => (
        <Link
          key={item.to + item.label}
          to={item.to}
          className="flex flex-col rounded-xl px-3 py-2.5 transition-colors hover:bg-lightblue"
        >
          <span className="text-sm font-semibold text-navy">{item.label}</span>
          {item.desc && (
            <span className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {item.desc}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

// ─── Dropdown trigger ─────────────────────────────────────────────────────────

function DropdownTrigger({
  label,
  id,
  open,
  onEnter,
  onLeave,
  children,
}: {
  label: string;
  id: DropdownKey;
  open: DropdownKey;
  onEnter: (id: DropdownKey) => void;
  onLeave: () => void;
  children: React.ReactNode;
}) {
  const active = open === id;
  return (
    <div className="relative" onMouseEnter={() => onEnter(id)} onMouseLeave={onLeave}>
      <button
        type="button"
        className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          active ? "bg-lightblue text-navy" : "text-navy/80 hover:bg-lightblue hover:text-navy"
        }`}
      >
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${active ? "rotate-180" : ""}`}
        />
      </button>

      {active && <div className="absolute left-0 top-full h-3 w-full" />}

      {active && (
        <div className="absolute left-1/2 top-[calc(100%+12px)] z-50 -translate-x-1/2">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Mobile helpers ───────────────────────────────────────────────────────────

function MobileLink({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-lightblue"
    >
      {label}
    </Link>
  );
}

function MobileGroup({
  label,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-lightblue"
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-blue/15 pl-3">{children}</div>
      )}
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────

export function Header() {
  const [open, setOpen] = useState<DropdownKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = (id: DropdownKey) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(id);
  };

  const handleLeave = () => {
    timerRef.current = setTimeout(() => setOpen(null), 150);
  };

  const toggleMobile = (key: string) => setMobileExpanded((v) => (v === key ? null : key));

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-blue/10 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-[17px] font-bold text-navy"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-navy-foreground text-sm">
              O
            </span>
            Ozone <span className="text-blue ml-1">Overseas</span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            <DropdownTrigger
              label="Country"
              id="countries"
              open={open}
              onEnter={handleEnter}
              onLeave={handleLeave}
            >
              <ServicePanel items={COUNTRY_LINKS} />
            </DropdownTrigger>

            <DropdownTrigger
              label="Candidates"
              id="candidates"
              open={open}
              onEnter={handleEnter}
              onLeave={handleLeave}
            >
              <ServicePanel items={CANDIDATE_SERVICES} />
            </DropdownTrigger>

            <DropdownTrigger
              label="Employers"
              id="employers"
              open={open}
              onEnter={handleEnter}
              onLeave={handleLeave}
            >
              <ServicePanel items={EMPLOYER_SERVICES} />
            </DropdownTrigger>

            <DropdownTrigger
              label="Admin"
              id="admin"
              open={open}
              onEnter={handleEnter}
              onLeave={handleLeave}
            >
              <ServicePanel items={ADMIN_SERVICES} />
            </DropdownTrigger>

            <DropdownTrigger
              label="Company"
              id="company"
              open={open}
              onEnter={handleEnter}
              onLeave={handleLeave}
            >
              <ServicePanel items={COMPANY_LINKS} />
            </DropdownTrigger>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="https://wa.me/919847000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border-2 border-whatsapp px-4 py-2 text-sm font-semibold text-whatsapp transition-colors hover:bg-whatsapp hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-navy lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-navy/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative ml-auto h-full w-80 overflow-y-auto bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue/10 px-5 py-4">
              <span className="font-display font-bold text-navy">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 space-y-0.5">
              <MobileLink to="/" label="Home" onClick={() => setMobileOpen(false)} />
              <MobileLink to="/Jobs" label="Jobs" onClick={() => setMobileOpen(false)} />

              <MobileGroup
                label="Countries"
                expanded={mobileExpanded === "countries"}
                onToggle={() => toggleMobile("countries")}
              >
                {COUNTRY_LINKS.map((c) => (
                  <MobileLink
                    key={c.to + c.label}
                    to={c.to}
                    label={c.label}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </MobileGroup>

              <MobileGroup
                label="Candidates"
                expanded={mobileExpanded === "candidates"}
                onToggle={() => toggleMobile("candidates")}
              >
                {CANDIDATE_SERVICES.map((s) => (
                  <MobileLink
                    key={s.to + s.label}
                    to={s.to}
                    label={s.label}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </MobileGroup>

              <MobileGroup
                label="Employers"
                expanded={mobileExpanded === "employers"}
                onToggle={() => toggleMobile("employers")}
              >
                {EMPLOYER_SERVICES.map((s) => (
                  <MobileLink
                    key={s.to + s.label}
                    to={s.to}
                    label={s.label}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </MobileGroup>

              <MobileGroup
                label="Admin"
                expanded={mobileExpanded === "admin"}
                onToggle={() => toggleMobile("admin")}
              >
                {ADMIN_SERVICES.map((s) => (
                  <MobileLink
                    key={s.to + s.label}
                    to={s.to}
                    label={s.label}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </MobileGroup>

              <MobileGroup
                label="Company"
                expanded={mobileExpanded === "company"}
                onToggle={() => toggleMobile("company")}
              >
                {COMPANY_LINKS.map((s) => (
                  <MobileLink
                    key={s.to}
                    to={s.to}
                    label={s.label}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </MobileGroup>
            </div>

            <div className="border-t border-blue/10 p-4 space-y-2.5">
              <a
                href="https://wa.me/919847000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border-2 border-whatsapp px-4 py-2.5 text-sm font-semibold text-whatsapp"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
