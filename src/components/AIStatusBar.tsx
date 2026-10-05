import { PALETTE } from '@aesthetic/spec';

export type AIStatus = 'offline' | 'ready' | 'analysing';

interface AIStatusBarProps {
  status: AIStatus;
}

/**
 * Unobtrusive AI status indicator.
 *
 * Colours come from the aesthetic palette via inline style rather than dynamic
 * Tailwind class names, because `bg-${PALETTE.accentCool}` is not a class the
 * Tailwind compiler can see and would be purged from the stylesheet.
 */
export const AIStatusBar = ({ status }: AIStatusBarProps) => {
  const dotColor =
    status === 'ready'
      ? PALETTE.accentCool
      : status === 'analysing'
        ? PALETTE.accentSharp
        : PALETTE.highlight;

  const label =
    status === 'ready' ? 'AI READY' : status === 'analysing' ? 'AI ANALYSING' : 'AI OFFLINE';

  return (
    <div
      className="absolute left-0 right-0 flex justify-center pointer-events-none"
      style={{ top: 'calc(env(safe-area-inset-top) + 3.5rem)' }}
    >
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full"
        style={{ backgroundColor: 'rgba(28, 30, 31, 0.72)' }}
      >
        <span
          aria-hidden="true"
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            backgroundColor: dotColor,
            ...(status === 'analysing' ? { animation: 'pulse 1.6s ease-in-out infinite' } : {}),
          }}
        />
        <span
          className="text-[10px] uppercase"
          style={{ letterSpacing: '0.1em', color: PALETTE.highlight }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
