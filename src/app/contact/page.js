export default function ContactPage() {
  return (
    <div className="min-h-[80vh] flex flex-col gap-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">
          Contact <span className="text-blue-900">CitySalah</span>
        </h1>

        <p className="text-slate-700 mt-3 text-lg max-w-2xl mx-auto">
          We’re here to help you with any questions, suggestions, or support
          related to CitySalah.
          <br />
          Kindly reach out through the options below.
        </p>
      </div>

      {/* Contact Sections */}
      <div className="grid sm:grid-cols-2 gap-8">
        {/* WhatsApp Section */}
        <div className="bg-white/70 p-6 rounded-xl shadow-md border border-slate-200">
          <h2 className="text-xl font-semibold text-green-700 mb-3">
            WhatsApp Support
          </h2>

          <p className="text-slate-800 text-lg">
            📱 <strong>+91 97387 22032</strong>
          </p>
          <p className="text-slate-800 text-lg mt-1">
            📱 <strong>+91 83107 72902</strong>
          </p>

          <p className="text-slate-600 text-sm mt-4">
            *Please contact us through WhatsApp only.
            <br />
            (Phone calls may not always be attended.)
          </p>
        </div>

        {/* Email Section */}
        <div className="bg-white/70 p-6 rounded-xl shadow-md border border-slate-200">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">
            Email Support
          </h2>

          <p className="text-slate-800 text-lg">
            📧 <strong>citysalah247@gmail.com</strong>
          </p>

          <p className="text-slate-600 text-sm mt-4">
            Feel free to email us anytime — we will respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-slate-600 text-sm mt-6">
        We truly appreciate your support, feedback, and patience.
        <br />
        It helps us improve CitySalah for the community.
      </p>
    </div>
  );
}
