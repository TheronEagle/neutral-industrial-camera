import { PALETTE } from '@aesthetic/spec';

interface ShutterButtonProps {
  onClick: () => void;
  disabled?: boolean;
  capturing?: boolean;
}

/**
 * The one deliberate accent in the entire interface, mirroring the one-accent
 * rule of the photography aesthetic itself.
 */
export const ShutterButton = ({ onClick, disabled, capturing }: ShutterButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Capture photo"
      aria-busy={capturing}
      className="relative grid h-20 w-20 place-items-center rounded-full border-2 transition-transform duration-150 ease-out active:scale-90 disabled:opacity-40 disabled:active:scale-100"
      style={{ borderColor: PALETTE.accentSharp }}
    >
      <span
        className="block h-11 w-11 rounded-full transition-transform duration-150 ease-out active:scale-95"
        style={{ backgroundColor: PALETTE.accentSharp }}
      />
    </button>
  );
};
