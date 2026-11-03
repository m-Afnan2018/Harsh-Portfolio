/** Letters roll upward to reveal a duplicate line. Parent needs class "roll-host". */
export default function RollText({ text, className = "" }: { text: string; className?: string }) {
  const chars = (k: string) =>
    Array.from(text).map((c, i) => (
      <span key={k + i} className="ch" style={{ ["--i" as string]: i }}>
        {c}
      </span>
    ));
  return (
    <span className={`roll ${className}`}>
      <span className="sr-only">{text}</span>
      <span className="roll-a" aria-hidden>{chars("a")}</span>
      <span className="roll-b" aria-hidden>{chars("b")}</span>
    </span>
  );
}
