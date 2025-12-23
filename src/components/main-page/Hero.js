// src/app/components/Hero.js

export default function Hero() {
  return (
    <section className="relative text-center text-white px-4 py-8">
      {/* Background image placeholder */}
      <div className="absolute inset-0 opacity-20">
        {/* ADD BACKGROUND IMAGE HERE */}
      </div>

      <div className="relative max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
          Connect with Your Community
        </h1>

        <p className="mt-4 text-base sm:text-lg text-sky-100">
          Find and Stay Updated with Your Nearby Masjid
        </p>
      </div>
    </section>
  );
}
