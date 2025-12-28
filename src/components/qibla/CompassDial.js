// src/components/qibla/CompassDial.js

export default function CompassDial({ rotation }) {
  return (
    <div
      className="absolute inset-0 rounded-full border border-white/20 transition-transform duration-300"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {["N", "E", "S", "W"].map((d, i) => (
        <div
          key={d}
          className="absolute inset-0 flex justify-center items-start text-xs"
          style={{ transform: `rotate(${i * 90}deg)` }}
        >
          <span className="mt-3">{d}</span>
        </div>
      ))}
    </div>
  );
}
