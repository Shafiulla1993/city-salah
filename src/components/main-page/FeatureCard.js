// src/app/components/main-page/FeatureCard.js

export default function FeatureCard({
  title,
  description,
  comingSoon = false,
  icon,
}) {
  return (
    <div
      className={`
        relative bg-white/90 backdrop-blur rounded-xl p-6
        shadow-md transition flex flex-col min-h-[200px] h-full
        ${
          comingSoon
            ? "opacity-60 cursor-not-allowed"
            : "hover:shadow-lg hover:-translate-y-1 cursor-pointer"
        }
      `}
    >
      {/* ICON */}
      <div className="w-14 h-14 mb-4 flex items-center justify-center bg-sky-100 rounded-full">
        {icon && (
          <img src={icon} alt="" className="w-7 h-7" draggable={false} />
        )}
      </div>

      <h3 className="text-lg font-semibold text-sky-900">{title}</h3>
      <p className="mt-2 text-sm text-sky-700 flex-1">{description}</p>

      {comingSoon && (
        <span className="absolute top-4 right-4 text-xs bg-sky-600 text-white px-2 py-1 rounded">
          Coming Soon
        </span>
      )}
    </div>
  );
}
