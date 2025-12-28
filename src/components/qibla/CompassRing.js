// src/components/qibla/CompassRing.js

export default function CompassRing() {
  return (
    <svg viewBox="0 0 200 200" className="absolute inset-0">
      <circle
        cx="100"
        cy="100"
        r="95"
        stroke="#1e3a8a"
        strokeWidth="4"
        fill="none"
      />

      {/* tick marks */}
      {[...Array(36)].map((_, i) => (
        <line
          key={i}
          x1="100"
          y1="4"
          x2="100"
          y2={i % 3 === 0 ? "16" : "10"}
          stroke="#64748b"
          strokeWidth={i % 3 === 0 ? "2" : "1"}
          transform={`rotate(${i * 10} 100 100)`}
        />
      ))}
    </svg>
  );
}
