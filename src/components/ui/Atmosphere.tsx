/** Film grain + drifting blue light leaks (pure CSS, GPU-cheap). */
export default function Atmosphere() {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="leak leak-a" />
        <div className="leak leak-b" />
        <div className="leak leak-c" />
      </div>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
        <div className="grain" />
      </div>
    </>
  );
}
