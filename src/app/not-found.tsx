import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg pt-36 pb-24 flex flex-col items-center justify-center text-center px-6">
      <p className="uppercase tracking-[0.35em] text-gold text-xs mb-4">
        404 · PAGE NOT FOUND
      </p>
      <h1 className="font-heading text-6xl sm:text-8xl text-white mb-6">
        Oops! Wrong Slice.
      </h1>
      <p className="text-ink-secondary max-w-md mb-10 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Let&apos;s get you back to fresh hot pizzas!
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="px-8 py-4 rounded-full bg-gradient-to-r from-[#D91F26] to-[#FF6B00] text-white font-semibold hover:scale-105 transition-transform"
        >
          Back to Home
        </Link>
        <Link
          href="/menu"
          className="px-8 py-4 rounded-full border border-white/15 text-white font-semibold hover:bg-white/5 transition-colors"
        >
          Explore Menu
        </Link>
      </div>
    </div>
  );
}
