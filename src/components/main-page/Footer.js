// src/app/components/Footer.js

export default function Footer() {
  return (
    <footer className="bg-sky-900 text-sky-100 text-sm py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-6">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
        </div>

        <p>© 2025 CitySalah. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
