"use client";

import React, { useState } from 'react';

export interface NavLink {
    label: string;
    href: string;
    isActive?: boolean;
}

export interface Partner {
    name?: string;
    logoUrl?: string;
    href: string;
}

export interface ResponsiveHeroBannerProps {
    logoUrl?: string;
    backgroundImageUrl?: string;
    navLinks?: NavLink[];
    ctaButtonText?: string;
    ctaButtonHref?: string;
    badgeText?: string;
    badgeLabel?: string;
    title?: string;
    titleLine2?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonHref?: string;
    secondaryButtonText?: string;
    secondaryButtonHref?: string;
    partnersTitle?: string;
    partners?: Partner[];
}

export const ResponsiveHeroBanner: React.FC<ResponsiveHeroBannerProps> = ({
    logoUrl = "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=200&auto=format&fit=crop",
    backgroundImageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
    navLinks = [
        { label: "Home", href: "#", isActive: true },
        { label: "Missions", href: "#" },
        { label: "Destinations", href: "#" },
        { label: "Technology", href: "#" },
        { label: "Book Flight", href: "#" }
    ],
    ctaButtonText = "Reserve Seat",
    ctaButtonHref = "#",
    badgeLabel = "New",
    badgeText = "First Commercial Flight to Mars 2026",
    title = "Journey Beyond Earth",
    titleLine2 = "Into the Cosmos",
    description = "Experience the cosmos like never before. Our advanced spacecraft and cutting-edge technology make interplanetary travel accessible, safe, and unforgettable.",
    primaryButtonText = "Book Your Journey",
    primaryButtonHref = "#",
    secondaryButtonText = "Watch Launch",
    secondaryButtonHref = "#",
    partnersTitle = "Partnering with leading space agencies worldwide",
    partners = [
        { name: "NASA", logoUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=120&auto=format&fit=crop", href: "#" },
        { name: "ESA", logoUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=120&auto=format&fit=crop", href: "#" },
        { name: "JAXA", logoUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=120&auto=format&fit=crop", href: "#" },
        { name: "ISRO", logoUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=120&auto=format&fit=crop", href: "#" },
        { name: "COPERNICUS", logoUrl: "https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?q=80&w=120&auto=format&fit=crop", href: "#" }
    ]
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <section className="w-full isolate min-h-[580px] lg:min-h-[640px] overflow-hidden relative rounded-3xl border border-blue-500/20 shadow-2xl">
            <img
                src={backgroundImageUrl}
                alt="Earth observation and cosmic horizon"
                className="w-full h-full object-cover absolute top-0 right-0 bottom-0 left-0 brightness-[0.7] saturate-[1.2]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#060913]/80 via-transparent to-[#060913]/90" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-blue-500/20" />

            <header className="z-10 xl:top-4 relative">
                <div className="mx-6">
                    <div className="flex items-center justify-between pt-4">
                        <a
                            href="#"
                            className="inline-flex items-center justify-center bg-center w-[120px] h-[40px] bg-cover rounded-lg border border-white/20 shadow-lg"
                            style={{ backgroundImage: `url(${logoUrl})` }}
                            aria-label="Space Home"
                        />

                        <nav className="hidden md:flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded-full bg-slate-950/60 px-1 py-1 ring-1 ring-white/10 backdrop-blur-md">
                                {navLinks.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.href}
                                        className={`px-3 py-1.5 text-xs font-medium hover:text-white font-sans transition-colors rounded-full ${link.isActive ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-400/30' : 'text-white/80'
                                            }`}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <a
                                    href={ctaButtonHref}
                                    className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-400 font-sans transition-all shadow-md shadow-blue-500/25"
                                >
                                    {ctaButtonText}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                                        <path d="M7 7h10v10" />
                                        <path d="M7 17 17 7" />
                                    </svg>
                                </a>
                            </div>
                        </nav>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur"
                            aria-expanded={mobileMenuOpen}
                            aria-label="Toggle menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white/90">
                                <path d="M4 5h16" />
                                <path d="M4 12h16" />
                                <path d="M4 19h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <div className="z-10 relative">
                <div className="sm:pt-20 md:pt-24 lg:pt-28 max-w-7xl mx-auto pt-16 px-6 pb-14">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-blue-950/60 px-3 py-1.5 ring-1 ring-blue-400/30 backdrop-blur-md animate-fade-slide-in-1">
                            <span className="inline-flex items-center text-xs font-bold text-white bg-blue-600 rounded-full py-0.5 px-2.5 font-sans">
                                {badgeLabel}
                            </span>
                            <span className="text-xs font-medium text-blue-200 font-mono">
                                {badgeText}
                            </span>
                        </div>

                        <h1 className="sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-4xl text-white tracking-tight font-serif font-normal animate-fade-slide-in-2">
                            {title}
                            <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-teal-200">
                                {titleLine2}
                            </span>
                        </h1>

                        <p className="sm:text-lg animate-fade-slide-in-3 text-sm text-slate-300 max-w-2xl mt-5 mx-auto leading-relaxed">
                            {description}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:gap-4 mt-8 gap-3 items-center justify-center animate-fade-slide-in-4">
                            <a
                                href={primaryButtonHref}
                                className="inline-flex items-center gap-2 hover:bg-blue-600 text-sm font-semibold text-white bg-blue-500 shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/40 rounded-full py-2.5 px-6 font-sans transition-all"
                            >
                                {primaryButtonText}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </a>
                            <a
                                href={secondaryButtonHref}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 hover:bg-slate-800/80 px-5 py-2.5 text-sm font-medium text-slate-200 hover:text-white font-sans ring-1 ring-white/15 transition-all backdrop-blur-md"
                            >
                                {secondaryButtonText}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-sky-400">
                                    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="mx-auto mt-14 max-w-5xl">
                        <p className="animate-fade-slide-in-1 text-xs uppercase tracking-wider font-mono text-slate-400 text-center font-semibold">
                            {partnersTitle}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 animate-fade-slide-in-2 text-white/70 mt-5 items-center justify-items-center gap-4">
                            {partners.map((partner, index) => (
                                <a
                                    key={index}
                                    href={partner.href}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-slate-900/40 ring-1 ring-white/10 rounded-full text-xs font-mono font-bold text-slate-300 hover:text-white hover:ring-blue-400/40 transition-all backdrop-blur-sm"
                                >
                                    🛰️ {partner.name || `Partner ${index + 1}`}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ResponsiveHeroBanner;
