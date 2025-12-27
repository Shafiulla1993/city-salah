// src/components/qibla/DegreeRing.js

"use client";

export default function DegreeRing() {
  const marks = [];

  for (let deg = 0; deg < 360; deg += 10) {
    const isMajor = deg % 90 === 0;
    marks.push(
      <div
        key={deg}
        className="absolute inset-0 flex justify-center"
        style={{ transform: `rotate(${deg}deg)` }}
      >
        <div
          className={`${
            isMajor ? "h-4 w-[2px]" : "h-2 w-px"
          } bg-white/70 mt-2`}
        />
      </div>
    );
  }

  return <>{marks}</>;
}
