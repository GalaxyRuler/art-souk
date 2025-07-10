import { cn } from "@/lib/utils";

interface SoukkLogoProps {
  variant?: "icon" | "wordmark" | "emblem";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTagline?: boolean;
  bilingual?: boolean;
}

export function SoukkLogo({ 
  variant = "wordmark", 
  size = "md", 
  className,
  showTagline = false,
  bilingual = true
}: SoukkLogoProps) {
  const sizes = {
    sm: { width: 120, height: 40 },
    md: { width: 180, height: 60 },
    lg: { width: 240, height: 80 },
    xl: { width: 320, height: 100 },
  };

  const { width, height } = sizes[size];

  if (variant === "icon") {
    return (
      <svg
        width={height}
        height={height}
        viewBox="0 0 100 100"
        className={cn("soukk-logo-icon", className)}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 8-point star with arch */}
        <g>
          {/* Arch background */}
          <path
            d="M20 100 L20 40 Q20 10 50 10 Q80 10 80 40 L80 100 Z"
            fill="var(--soukk-majorelle-blue)"
            opacity="0.1"
          />
          {/* 8-point star */}
          <path
            d="M50 20 L55 40 L75 45 L55 50 L50 70 L45 50 L25 45 L45 40 Z"
            fill="var(--soukk-gold)"
          />
          {/* Center dot */}
          <circle cx="50" cy="45" r="3" fill="var(--soukk-terracotta)" />
        </g>
      </svg>
    );
  }

  if (variant === "emblem") {
    return (
      <div className={cn("soukk-logo-emblem flex flex-col items-center", className)}>
        <svg
          width={width}
          height={height}
          viewBox="0 0 200 80"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Emblem with arch frame */}
          <g>
            {/* Left arch */}
            <path
              d="M10 80 L10 30 Q10 0 40 0 Q70 0 70 30 L70 80 Z"
              fill="var(--soukk-majorelle-blue)"
              opacity="0.15"
            />
            {/* Right arch */}
            <path
              d="M130 80 L130 30 Q130 0 160 0 Q190 0 190 30 L190 80 Z"
              fill="var(--soukk-majorelle-blue)"
              opacity="0.15"
            />
            {/* Center star */}
            <path
              d="M100 15 L108 35 L128 43 L108 51 L100 71 L92 51 L72 43 L92 35 Z"
              fill="var(--soukk-gold)"
            />
            {/* Text */}
            <text x="100" y="50" textAnchor="middle" className="heading-4" fill="var(--soukk-charcoal)">
              Souk
            </text>
          </g>
        </svg>
        {showTagline && (
          <div className="text-center mt-2">
            <p className="caption text-soukk-text-secondary">Where Craft Meets Canvas</p>
            {bilingual && (
              <p className="caption text-soukk-text-secondary" dir="rtl">
                ملتقى الحِرفة والفن
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default wordmark
  return (
    <div className={cn("soukk-logo-wordmark", className)}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 300 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          {/* Icon part */}
          <path
            d="M10 80 L10 30 Q10 0 40 0 Q70 0 70 30 L70 80 Z"
            fill="var(--soukk-majorelle-blue)"
            opacity="0.2"
          />
          <path
            d="M40 15 L46 30 L61 36 L46 42 L40 57 L34 42 L19 36 L34 30 Z"
            fill="var(--soukk-gold)"
          />
          
          {/* English text */}
          <text x="90" y="35" className="font-semibold" fontSize="28" fill="var(--soukk-charcoal)">
            Souk.art
          </text>
          
          {/* Arabic text */}
          {bilingual && (
            <text x="90" y="60" className="font-medium" fontSize="20" fill="var(--soukk-text-secondary)" dir="rtl">
              سوق الفن
            </text>
          )}
          
          {/* Decorative dot pattern */}
          <circle cx="250" cy="20" r="2" fill="var(--soukk-terracotta)" />
          <circle cx="260" cy="20" r="2" fill="var(--soukk-gold)" />
          <circle cx="270" cy="20" r="2" fill="var(--soukk-majorelle-blue)" />
        </g>
      </svg>
      {showTagline && (
        <div className="mt-2">
          <p className="caption text-soukk-text-secondary">Authentic Art, Modern Souk</p>
          {bilingual && (
            <p className="caption text-soukk-text-secondary" dir="rtl">
              فن أصيل، سوق عصري
            </p>
          )}
        </div>
      )}
    </div>
  );
}