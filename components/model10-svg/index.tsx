'use client'

/* ================================================================
   Handcrafted SVG Illustrations — Model 10-10-10
   All inline, no emojis, no React Icons, no external assets.
   ================================================================ */

export function SilentWorkSvg({ size = 120, color = '#4F46E5' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Desk */}
      <rect x="20" y="70" width="80" height="4" rx="2" fill={color} opacity="0.15" />
      <rect x="25" y="74" width="3" height="20" rx="1.5" fill={color} opacity="0.1" />
      <rect x="92" y="74" width="3" height="20" rx="1.5" fill={color} opacity="0.1" />
      {/* Person sitting */}
      <circle cx="60" cy="48" r="10" stroke={color} strokeWidth="2" fill="none" />
      <path d="M50 62 Q60 56 70 62" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Book on desk */}
      <rect x="45" y="63" width="18" height="7" rx="1.5" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="49" y1="65" x2="59" y2="65" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="49" y1="67.5" x2="55" y2="67.5" stroke={color} strokeWidth="1" opacity="0.3" />
      {/* Pencil */}
      <line x1="68" y1="61" x2="76" y2="55" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="76" cy="54.5" r="1.2" fill={color} opacity="0.5" />
      {/* Focus lines */}
      <line x1="30" y1="42" x2="36" y2="42" stroke={color} strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      <line x1="84" y1="42" x2="90" y2="42" stroke={color} strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      <line x1="44" y1="34" x2="48" y2="34" stroke={color} strokeWidth="1.2" opacity="0.15" strokeLinecap="round" />
      {/* Thought bubble */}
      <circle cx="82" cy="32" r="4" stroke={color} strokeWidth="1" opacity="0.15" fill="none" />
      <circle cx="88" cy="26" r="2.5" stroke={color} strokeWidth="1" opacity="0.1" fill="none" />
    </svg>
  )
}

export function PairWorkSvg({ size = 120, color = '#2A9D8F' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Person 1 */}
      <circle cx="42" cy="44" r="9" stroke={color} strokeWidth="2" fill="none" />
      <path d="M34 56 Q42 50 50 56" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Person 2 */}
      <circle cx="78" cy="44" r="9" stroke={color} strokeWidth="2" fill="none" />
      <path d="M70 56 Q78 50 86 56" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Connection arc */}
      <path d="M50 40 Q60 32 70 40" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" strokeDasharray="3 3" />
      {/* Shared desk */}
      <rect x="28" y="66" width="64" height="4" rx="2" fill={color} opacity="0.15" />
      {/* Shared book */}
      <rect x="44" y="58" width="24" height="8" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="56" y1="58" x2="56" y2="66" stroke={color} strokeWidth="1" opacity="0.3" />
      {/* Discussion lines */}
      <circle cx="36" cy="36" r="2" fill={color} opacity="0.15" />
      <circle cx="84" cy="36" r="2" fill={color} opacity="0.15" />
      {/* Hands reaching */}
      <path d="M50 58 L48 62" stroke={color} strokeWidth="1.2" opacity="0.3" strokeLinecap="round" />
      <path d="M70 58 L72 62" stroke={color} strokeWidth="1.2" opacity="0.3" strokeLinecap="round" />
    </svg>
  )
}

export function GroupDiscussSvg({ size = 120, color = '#F4A261' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Table */}
      <ellipse cx="60" cy="68" rx="34" ry="10" stroke={color} strokeWidth="1.5" fill="none" opacity="0.2" />
      {/* People around */}
      <circle cx="30" cy="52" r="7" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="60" cy="44" r="7" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="90" cy="52" r="7" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="42" cy="72" r="7" stroke={color} strokeWidth="1.8" fill="none" opacity="0.5" />
      <circle cx="78" cy="72" r="7" stroke={color} strokeWidth="1.8" fill="none" opacity="0.5" />
      {/* Speech arcs */}
      <path d="M38 46 Q42 40 46 46" stroke={color} strokeWidth="1.2" fill="none" opacity="0.3" />
      <path d="M54 38 Q60 32 66 38" stroke={color} strokeWidth="1.2" fill="none" opacity="0.3" />
      <path d="M82 46 Q86 40 90 46" stroke={color} strokeWidth="1.2" fill="none" opacity="0.3" />
      {/* Center idea */}
      <circle cx="60" cy="56" r="3" fill={color} opacity="0.15" />
      <circle cx="60" cy="56" r="1.5" fill={color} opacity="0.3" />
    </svg>
  )
}

export function StudentsSvg({ size = 120, color = '#2A9D8F' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Row of students */}
      <circle cx="30" cy="44" r="8" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="54" cy="40" r="8" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="78" cy="44" r="8" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="102" cy="48" r="8" stroke={color} strokeWidth="1.8" fill="none" opacity="0.5" />
      {/* Desks */}
      <rect x="18" y="58" width="24" height="3" rx="1.5" fill={color} opacity="0.12" />
      <rect x="42" y="54" width="24" height="3" rx="1.5" fill={color} opacity="0.12" />
      <rect x="66" y="58" width="24" height="3" rx="1.5" fill={color} opacity="0.12" />
      {/* Raised hand */}
      <path d="M54 32 L54 24" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <circle cx="54" cy="22" r="2.5" stroke={color} strokeWidth="1" opacity="0.3" fill="none" />
      {/* Connection dots */}
      <circle cx="42" cy="44" r="1.5" fill={color} opacity="0.15" />
      <circle cx="66" cy="44" r="1.5" fill={color} opacity="0.15" />
      <circle cx="90" cy="48" r="1.5" fill={color} opacity="0.15" />
    </svg>
  )
}

export function TimerSvg({ size = 120, color = '#E76F51' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Clock face */}
      <circle cx="60" cy="56" r="30" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="60" cy="56" r="26" stroke={color} strokeWidth="0.5" fill="none" opacity="0.15" />
      {/* Hour marks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
        <line
          key={i}
          x1={60 + 22 * Math.cos((deg - 90) * Math.PI / 180)}
          y1={56 + 22 * Math.sin((deg - 90) * Math.PI / 180)}
          x2={60 + 25 * Math.cos((deg - 90) * Math.PI / 180)}
          y2={56 + 25 * Math.sin((deg - 90) * Math.PI / 180)}
          stroke={color}
          strokeWidth={deg % 90 === 0 ? 2 : 1}
          opacity={deg % 90 === 0 ? 0.4 : 0.2}
          strokeLinecap="round"
        />
      ))}
      {/* Hands */}
      <line x1="60" y1="56" x2="60" y2="38" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="60" y1="56" x2="74" y2="50" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <circle cx="60" cy="56" r="2.5" fill={color} opacity="0.4" />
      {/* Button */}
      <rect x="54" y="22" width="12" height="6" rx="2" stroke={color} strokeWidth="1.5" fill="none" opacity="0.3" />
      {/* 10-10-10 marks */}
      <text x="60" y="72" textAnchor="middle" fontSize="7" fontWeight="700" fill={color} opacity="0.3" fontFamily="Tajawal, sans-serif">10:10:10</text>
    </svg>
  )
}

export function ConfidenceSvg({ size = 120, color = '#22C55E' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Person standing tall */}
      <circle cx="60" cy="36" r="10" stroke={color} strokeWidth="2" fill="none" />
      <line x1="60" y1="46" x2="60" y2="72" stroke={color} strokeWidth="2" opacity="0.5" />
      <line x1="48" y1="72" x2="72" y2="72" stroke={color} strokeWidth="2" opacity="0.3" strokeLinecap="round" />
      {/* Arms raised */}
      <path d="M60 56 L44 44" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M60 56 L76 44" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      {/* Crown/star */}
      <path d="M52 22 L56 16 L60 22 L64 16 L68 22" stroke={color} strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Radiating lines */}
      <line x1="36" y1="36" x2="30" y2="32" stroke={color} strokeWidth="1.2" opacity="0.15" strokeLinecap="round" />
      <line x1="84" y1="36" x2="90" y2="32" stroke={color} strokeWidth="1.2" opacity="0.15" strokeLinecap="round" />
      <line x1="60" y1="18" x2="60" y2="12" stroke={color} strokeWidth="1.2" opacity="0.15" strokeLinecap="round" />
    </svg>
  )
}

export function PhaseOneSvg({ size = 80, color = '#4F46E5' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="1.5" opacity="0.1" fill="none" />
      <circle cx="40" cy="40" r="28" stroke={color} strokeWidth="1" opacity="0.08" fill="none" />
      {/* Person alone at desk */}
      <circle cx="40" cy="28" r="6" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M33 38 Q40 33 47 38" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <rect x="30" y="44" width="20" height="2" rx="1" fill={color} opacity="0.15" />
      <rect x="34" y="40" width="12" height="4" rx="1" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
      {/* Focus sparkle */}
      <circle cx="56" cy="22" r="1.5" fill={color} opacity="0.2" />
    </svg>
  )
}

export function PhaseTwoSvg({ size = 80, color = '#2A9D8F' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="1.5" opacity="0.1" fill="none" />
      {/* Two people */}
      <circle cx="28" cy="30" r="5.5" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="52" cy="30" r="5.5" stroke={color} strokeWidth="1.8" fill="none" />
      {/* Connection */}
      <path d="M34 28 Q40 22 46 28" stroke={color} strokeWidth="1.2" fill="none" opacity="0.3" strokeDasharray="2 2" />
      {/* Shared desk */}
      <rect x="20" y="42" width="40" height="2.5" rx="1.2" fill={color} opacity="0.12" />
      {/* Shared work */}
      <rect x="30" y="38" width="20" height="4" rx="1.5" stroke={color} strokeWidth="1" fill="none" opacity="0.25" />
    </svg>
  )
}

export function PhaseThreeSvg({ size = 80, color = '#F4A261' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="1.5" opacity="0.1" fill="none" />
      {/* Group around table */}
      <ellipse cx="40" cy="44" rx="20" ry="7" stroke={color} strokeWidth="1.2" fill="none" opacity="0.15" />
      <circle cx="22" cy="34" r="5" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="40" cy="28" r="5" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="58" cy="34" r="5" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Speech */}
      <path d="M30 30 Q32 26 34 30" stroke={color} strokeWidth="1" fill="none" opacity="0.25" />
      <path d="M46 24 Q48 20 50 24" stroke={color} strokeWidth="1" fill="none" opacity="0.25" />
    </svg>
  )
}
