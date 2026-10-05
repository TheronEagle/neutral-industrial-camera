import { PALETTE } from '@aesthetic/spec';

interface ShutterButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const ShutterButton = ({ onClick, disabled }: ShutterButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="shutter-button disabled:opacity-40 disabled:cursor-not-allowed"
      aria-label="Capture photo"
      style={{
        borderColor: PALETTE.accentSharp,
      }}
    >
      <div 
        className="shutter-inner"
        style={{ backgroundColor: PALETTE.accentSharp }}
      />
    </button>
  );
};
