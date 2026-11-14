import React, { useEffect, useRef, useState } from 'react';

interface CinematicLandingProps {
  onEnter: () => void;
}

export const CinematicLanding: React.FC<CinematicLandingProps> = ({ onEnter }) => {
  const canvasStarsRef = useRef<HTMLCanvasElement | null>(null);
  const canvasLightningRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isEntered, setIsEntered] = useState<boolean>(false);

  useEffect(() => {
    const sc = canvasStarsRef.current;
    const lc = canvasLightningRef.current;
    if (!sc || !lc) return;

    const sx = sc.getContext('2d');
    const lx = lc.getContext('2d');
    if (!sx || !lx) return;

    let animId: number;
    let W = (sc.width = lc.width = window.innerWidth);
    let H = (sc.height = lc.height = window.innerHeight);

    interface Star {
      x: number;
      y: number;
      r: number;
      p: number;
      s: number;
    }

    let S: Star[] = [];

    const rs = () => {
      W = sc.width = lc.width = window.innerWidth;
      H = sc.height = lc.height = window.innerHeight;
      const r = Math.min(W * 0.8, H * 0.85);
      if (containerRef.current) {
        containerRef.current.style.setProperty('--d', `${2 * r}px`);
        containerRef.current.style.setProperty('--top', `${H * 0.5}px`);
      }
      S = Array.from({ length: 260 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.1 + 0.2,
        p: Math.random() * 6.28,
        s: Math.random() * 0.02 + 0.005,
      }));
    };

    rs();
    window.addEventListener('resize', rs);

    const geom = () => {
      const r = Math.min(W * 0.8, H * 0.85);
      return { cx: W / 2, cy: H * 0.5 + r, r };
    };

    const bolt = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      d: number,
      out: [number, number, number, number][]
    ) => {
      if (d < 3) {
        out.push([x1, y1, x2, y2]);
        return;
      }
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * d;
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * d;
      bolt(x1, y1, mx, my, d / 2, out);
      bolt(mx, my, x2, y2, d / 2, out);
    };

    interface Strike {
      x: number;
      y: number;
      segs: [number, number, number, number][];
      g: { cx: number; cy: number; r: number };
    }

    let strike: Strike | null = null;
    let t0 = 0;
    let next = performance.now() + 6500;

    const newStrike = () => {
      const g = geom();
      let x = 0;
      let y = 0;
      let attempts = 0;
      do {
        x = g.cx + (Math.random() - 0.5) * g.r * 1.6;
        y = g.cy - g.r * 0.95 + Math.random() * (H - (g.cy - g.r * 0.95)) * 0.75;
        attempts++;
      } while (
        (Math.hypot(x - g.cx, y - g.cy) > g.r * 0.88 || x < 0 || x > W) &&
        attempts < 100
      );

      const segs: [number, number, number, number][] = [];
      const len = g.r * (0.25 + Math.random() * 0.3);
      const ang = Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      bolt(x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len, len * 0.45, segs);

      for (let i = 0; i < 3; i++) {
        const s = segs[Math.floor(Math.random() * segs.length)];
        if (s) {
          const ba = ang + (Math.random() - 0.5) * 1.8;
          const bl = len * (0.2 + Math.random() * 0.3);
          bolt(s[0], s[1], s[0] + Math.cos(ba) * bl, s[1] + Math.sin(ba) * bl, bl * 0.5, segs);
        }
      }
      strike = { x, y, segs, g };
      t0 = performance.now();
    };

    const frame = (now: number) => {
      sx.clearRect(0, 0, W, H);
      for (const s of S) {
        s.p += s.s;
        sx.fillStyle = `rgba(255,255,255,${0.35 + 0.4 * Math.sin(s.p) ** 2})`;
        sx.fillRect(s.x, s.y, s.r, s.r);
      }

      lx.clearRect(0, 0, W, H);

      if (!strike && now > next && !isEntered) {
        newStrike();
      }

      if (strike) {
        const t = (now - t0) / 1000;
        const g = strike.g;
        const k = t < 0.08 ? t / 0.08 : t < 0.16 ? 0.35 : t < 0.24 ? 1 : Math.max(0, 1 - (t - 0.24) / 0.5);

        if (t > 0.8) {
          strike = null;
          next = now + 1800 + Math.random() * 3500;
        } else {
          lx.save();
          lx.beginPath();
          lx.arc(g.cx, g.cy, g.r, 0, 6.28);
          lx.clip();
          lx.globalCompositeOperation = 'screen';
          const gr = lx.createRadialGradient(strike.x, strike.y, 0, strike.x, strike.y, g.r * 0.9);
          gr.addColorStop(0, `rgba(190,215,255,${0.55 * k})`);
          gr.addColorStop(0.4, `rgba(120,160,255,${0.2 * k})`);
          gr.addColorStop(1, 'rgba(60,90,200,0)');
          lx.fillStyle = gr;
          lx.fillRect(0, 0, W, H);

          lx.lineCap = 'round';
          lx.shadowColor = 'rgba(150,190,255,1)';
          lx.shadowBlur = 18 * k;
          lx.strokeStyle = `rgba(170,200,255,${0.6 * k})`;
          lx.lineWidth = 4;
          lx.beginPath();
          for (const s of strike.segs) {
            lx.moveTo(s[0], s[1]);
            lx.lineTo(s[2], s[3]);
          }
          lx.stroke();

          lx.shadowBlur = 6 * k;
          lx.strokeStyle = `rgba(255,255,255,${k})`;
          lx.lineWidth = 1.4;
          lx.beginPath();
          for (const s of strike.segs) {
            lx.moveTo(s[0], s[1]);
            lx.lineTo(s[2], s[3]);
          }
          lx.stroke();
          lx.restore();
        }
      }
      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', rs);
      cancelAnimationFrame(animId);
    };
  }, [isEntered]);

  const handleEnterClick = () => {
    setIsEntered(true);
    // Smooth transition delay matching the CSS animation duration
    setTimeout(() => {
      onEnter();
    }, 1100);
  };

  const letters = 'FIRECHRONOS'.split('');

  return (
    <div
      ref={containerRef}
      className={`cinematic-landing ${isEntered ? 'entered' : ''}`}
    >
      <style>{`
        .cinematic-landing {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          background: #000;
          color: #eef3fa;
          font-family: 'Cormorant Garamond', Georgia, serif;
          overflow: hidden;
          z-index: 100;
          box-sizing: border-box;
        }
        .cinematic-landing canvas {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .cinematic-landing .rise {
          position: fixed;
          left: 50%;
          top: var(--top, 50vh);
          width: var(--d, 120vmin);
          height: var(--d, 120vmin);
          margin-left: calc(var(--d, 120vmin) / -2);
          transform: translateY(120vh);
          animation: cinematicRise 5s cubic-bezier(.16, .8, .25, 1) .3s forwards;
          pointer-events: none;
        }
        @keyframes cinematicRise {
          to { transform: none; }
        }
        .cinematic-landing .earth {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: url('/earth.jpg') center/cover;
          animation: cinematicSpin 140s linear infinite;
        }
        @keyframes cinematicSpin {
          to { transform: rotate(360deg); }
        }
        .cinematic-landing .rise::after {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(circle at 32% 38%, transparent 45%, rgba(0,0,10,.55) 85%, rgba(0,0,10,.85));
          box-shadow: 0 0 50px 4px rgba(90,140,255,.35), 0 0 140px 20px rgba(60,100,220,.18), inset 0 0 40px 6px rgba(120,170,255,.35);
        }
        .cinematic-landing .hero {
          position: fixed;
          inset: 0 0 48% 0;
          display: grid;
          place-content: center;
          justify-items: center;
          text-align: center;
          padding: 24px;
          transition: opacity .9s cubic-bezier(.16, 1, .3, 1), transform .9s cubic-bezier(.16, 1, .3, 1), filter .9s;
          z-index: 10;
        }
        .cinematic-landing h1 {
          margin: 0;
          font-weight: 500;
          font-size: clamp(2.2rem, 9vw, 7.5rem);
          letter-spacing: .14em;
          line-height: 1;
          display: flex;
          text-shadow: 0 2px 24px rgba(0,0,0,.8);
        }
        .cinematic-landing h1 span {
          display: inline-block;
          opacity: 0;
          letter-spacing: .4em;
          filter: blur(8px);
          background: linear-gradient(180deg, #fff, #c9d6ea 60%, #8fa3c4);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: cinematicLetterIn 1.8s cubic-bezier(.2, .7, .2, 1) forwards;
          animation-delay: calc(3.2s + var(--i) * .12s);
        }
        @keyframes cinematicLetterIn {
          to { opacity: 1; letter-spacing: .04em; filter: blur(0); }
        }
        .cinematic-landing .tag {
          margin: 14px 0 30px;
          font-style: italic;
          font-size: clamp(1.15rem, 2.6vw, 1.6rem);
          letter-spacing: .12em;
          color: #d5deee;
          opacity: 0;
          animation: cinematicFade 1.5s ease 4.9s forwards;
          text-shadow: 0 1px 14px #000;
        }
        @keyframes cinematicFade {
          to { opacity: 1; }
        }
        .cinematic-landing .btn {
          font: 600 1.15rem 'Cormorant Garamond', Georgia, serif;
          letter-spacing: .32em;
          color: #eef3fa;
          background: rgba(255, 255, 255, .08);
          border: 1px solid rgba(255, 255, 255, .55);
          padding: 15px 48px;
          border-radius: 999px;
          cursor: pointer;
          opacity: 0;
          animation: cinematicFade 1.2s ease 5.5s forwards;
          backdrop-filter: blur(8px);
          transition: background .3s, color .3s, border-color .3s, transform .2s;
        }
        .cinematic-landing .btn:hover {
          background: #eef3fa;
          color: #06101f;
          border-color: #fff;
          transform: scale(1.04);
        }
        .cinematic-landing .btn:focus-visible {
          outline: 2px solid #7fa8ff;
          outline-offset: 4px;
        }
        .cinematic-landing.entered .hero {
          opacity: 0;
          transform: scale(1.2);
          filter: blur(10px);
          pointer-events: none;
        }
        .cinematic-landing.entered .rise {
          animation: cinematicOut 1.4s ease-in forwards;
        }
        @keyframes cinematicOut {
          from { transform: none; }
          to { transform: scale(2.2) translateY(12vh); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cinematic-landing * {
            animation-duration: .01s !important;
            animation-delay: 0s !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Canvas for Twinkling Starfield */}
      <canvas ref={canvasStarsRef} aria-hidden="true" />

      {/* Rising Rotating Earth with Rim Light */}
      <div className="rise" role="img" aria-label="Earth rising into view">
        <div className="earth" />
      </div>

      {/* Canvas for Electrical Plasma Discharges */}
      <canvas ref={canvasLightningRef} aria-hidden="true" />

      {/* Hero Typography & CTA */}
      <main className="hero">
        <h1 aria-label="FIRECHRONOS">
          {letters.map((char, index) => (
            <span
              key={index}
              style={{ '--i': index } as React.CSSProperties}
              aria-hidden="true"
            >
              {char}
            </span>
          ))}
        </h1>
        <p className="tag">WHERE TIME BURNS</p>
        <button
          className="btn"
          id="enter"
          onClick={handleEnterClick}
          aria-label="Enter FIRECHRONOS Dashboard"
        >
          ENTER
        </button>
      </main>
    </div>
  );
};
