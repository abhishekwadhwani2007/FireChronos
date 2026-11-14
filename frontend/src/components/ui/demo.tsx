import React from 'react';
import ResponsiveHeroBanner from './responsive-hero-banner';

export const HeroDemo: React.FC = () => {
    return (
        <ResponsiveHeroBanner
            badgeLabel="NASA FIRMS"
            badgeText="Pan-Asian Planetary Fire Observation Array 2020–2026"
            title="Harmonized Planetary"
            titleLine2="Wildfire Intelligence"
            description="Synthesizing multi-satellite thermal radiometry across 9 Asian nations. Bridging MODIS 1km and VIIRS 375m observations into a high-fidelity continuous climatology."
            primaryButtonText="Explore Satellite Array"
            secondaryButtonText="View 7-Day Forecast"
            ctaButtonText="Launch Telemetry"
            partnersTitle="Synthesizing authentic multi-sensor active-fire constellations"
            partners={[
                { name: "NASA FIRMS", href: "https://firms.modaps.eosdis.nasa.gov/" },
                { name: "MODIS Terra/Aqua", href: "#" },
                { name: "VIIRS NOAA-20", href: "#" },
                { name: "VIIRS NOAA-21", href: "#" },
                { name: "JPSS Constellation", href: "#" }
            ]}
        />
    );
};

export default HeroDemo;
