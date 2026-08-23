"use client";

import { useRef } from "react";

export default function TiltCard({
  children,
  className = "",
  glow = true,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;

    const rotateY = (px - 0.5) * 14;
    const rotateX = (0.5 - py) * 14;

    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
    el.style.setProperty("--glow-x", `${px * 100}%`);
    el.style.setProperty("--glow-y", `${py * 100}%`);
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
  }

  return (
    <div className="perspective">
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className={`group relative transition-transform duration-300 ease-out will-change-transform ${className}`}
      >
        {glow && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(320px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(255,215,0,0.35), transparent 65%)",
            }}
          />
        )}
        {children}
      </div>
    </div>
  );
}
