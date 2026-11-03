import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-x relative z-10 grid min-h-svh place-items-center text-center">
      <div>
        <p className="label">404</p>
        <h1 className="display mt-4 text-[14vw] md:text-[8vw]">Lost in the shaft.</h1>
        <Link href="/" className="mt-8 inline-block rounded-full bg-blue px-6 py-3 text-sm uppercase tracking-[0.18em]">Back home</Link>
      </div>
    </main>
  );
}
