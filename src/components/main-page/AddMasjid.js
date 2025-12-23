// src/app/components/AddMasjid.js

export default function AddMasjid() {
  return (
    <section className="px-4 py-4">
      <div className="max-w-6xl mx-auto bg-amber-50 rounded-2xl p-6 sm:p-10 flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-sky-900">
            Add a Missing Masjid
          </h2>

          <p className="mt-3 text-sky-700 max-w-md">
            Help us add new masjids. Fill out the form if you know a masjid that
            is not listed.
          </p>

          <button className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium">
            Submit a Masjid
          </button>
        </div>

        <div className="flex-1 w-full h-48 bg-emerald-200 rounded-xl">
          {/* IMAGE HERE */}
        </div>
      </div>
    </section>
  );
}
