import type { SVGProps } from 'react';

export type IconName =
  | 'phone'
  | 'mail'
  | 'pin'
  | 'calendar'
  | 'check'
  | 'arrow-right'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'play'
  | 'pause'
  | 'mute'
  | 'sound'
  | 'globe'
  | 'menu'
  | 'close'
  | 'clock'
  | 'shield'
  | 'car'
  | 'stethoscope'
  | 'gavel'
  | 'sparkles';

interface Props extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, strokeWidth = 2, ...rest }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...rest,
  };

  switch (name) {
    case 'phone':
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...common}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 5 5L20 7" strokeWidth={2.5} />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...common}>
          <path d="M5 12h14m0 0-5-5m5 5-5 5" />
        </svg>
      );
    case 'chevron-left':
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case 'play':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      );
    case 'pause':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
        </svg>
      );
    case 'mute':
      return (
        <svg {...common}>
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="m22 9-6 6m0-6 6 6" />
        </svg>
      );
    case 'sound':
      return (
        <svg {...common}>
          <path d="M11 5 6 9H2v6h4l5 4V5z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M19 5a10 10 0 0 1 0 14" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...common}>
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'car':
      return (
        <svg {...common}>
          <path d="M5 17h14l-1.5-7H6.5L5 17z" />
          <path d="M5 17v2m14-2v2M7 13h.01M17 13h.01" />
          <circle cx="7.5" cy="17.5" r="1.5" />
          <circle cx="16.5" cy="17.5" r="1.5" />
        </svg>
      );
    case 'stethoscope':
      return (
        <svg {...common}>
          <path d="M4 3v6a4 4 0 0 0 8 0V3" />
          <path d="M8 13v3a5 5 0 0 0 10 0v-3" />
          <circle cx="18" cy="10" r="2" />
        </svg>
      );
    case 'gavel':
      return (
        <svg {...common}>
          <path d="m14 14-8 8m4-12 6 6m-3-9 6 6m-1-7 4 4M3 22h7" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...common}>
          <path d="M12 3v4m0 10v4M5 12H1m22 0h-4M5.6 5.6 8.5 8.5m7 7 2.9 2.9M18.4 5.6 15.5 8.5m-7 7-2.9 2.9" />
        </svg>
      );
  }
}
