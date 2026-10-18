export function Coin({ size = 22, spin = false }: { size?: number; spin?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
      className={spin ? "animate-spin-coin inline-block" : "inline-block"}
    >
      <circle cx="16" cy="16" r="14" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="#eab308" strokeWidth="2" />
      <path d="M13 11h6v2h-4v2h3v2h-3v4h-2z" fill="#a16207" />
    </svg>
  );
}
