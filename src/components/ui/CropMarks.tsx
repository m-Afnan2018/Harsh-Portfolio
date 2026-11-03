/** Printer's crop marks + registration target — a quiet graphic-design signature. */
export default function CropMarks({ inset = 16, target = true, className = "" }: { inset?: number; target?: boolean; className?: string }) {
  const corner = (pos: string, rot: number) => (
    <svg key={pos} width="22" height="22" viewBox="0 0 22 22" className={`absolute ${pos}`} style={{ transform: `rotate(${rot}deg)` }}>
      <path d="M0 8H14M8 0V14" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
  return (
    <div aria-hidden className={`pointer-events-none absolute text-paper/25 ${className}`} style={{ inset }}>
      {corner("-left-[8px] -top-[8px]", 0)}
      {corner("-right-[8px] -top-[8px]", 90)}
      {corner("-right-[8px] -bottom-[8px]", 180)}
      {corner("-left-[8px] -bottom-[8px]", 270)}
      {target && (
        <svg width="26" height="26" viewBox="0 0 26 26" className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <circle cx="13" cy="13" r="6" stroke="currentColor" fill="none" />
          <path d="M13 0V26M0 13H26" stroke="currentColor" />
        </svg>
      )}
    </div>
  );
}
