"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MasjidCarousel with Stylish Dual Ring Countdown
 *
 * - Keeps your original carousel logic
 * - Uses MasjidCard child to compute countdown + rings per-card
 * - Client-side only
 */

/* -------------------------
   Helper: parse time strings
   Accepts formats like:
     - "05:45"
     - "5:45"
     - "5:45 AM"
     - "12:30 PM"
   Returns Date object on same day as `base` (or adjusted day when needed)
   ------------------------- */
function parseTimeToDate(timeStr, base = new Date()) {
  if (!timeStr) return null;

  // normalize
  const s = String(timeStr).trim();

  // direct HH:MM (24h) or H:MM with optional AM/PM
  const regex = /^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/;
  const m = s.match(regex);
  if (!m) {
    // fallback: try Date parse
    const tryDate = new Date(`${base.toDateString()} ${s}`);
    if (!isNaN(tryDate)) return tryDate;
    return null;
  }

  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ampm = m[3];

  if (ampm) {
    const up = ampm.toUpperCase();
    if (up === "AM") {
      if (hh === 12) hh = 0;
    } else if (up === "PM") {
      if (hh !== 12) hh = hh + 12;
    }
  }

  const d = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hh,
    mm,
    0,
    0
  );
  return d;
}

/* -------------------------
   Get next & previous iqaamat times for a day's prayerTimings
   prayerTimings is an object like:
   { fajr: { iqaamat: "05:45", azan: "05:30" }, Zohar: {...}, ... }
   Order used: fajr, Zohar, asr, maghrib, isha
   Returns { next: {name,time,timeStr}, prev: {name,time,timeStr} }
   If none next today -> next is tomorrow's fajr (if exists)
   If none prev today -> prev is yesterday's last iqaamat (isha or fajr fallback)
   ------------------------- */
function getPrevAndNextIqaamats(prayerTimings = {}) {
  const order = ["fajr", "Zohar", "asr", "maghrib", "isha"];
  const now = new Date();

  // collect today's times
  const todayTimes = [];
  for (const p of order) {
    const iqa = prayerTimings[p]?.iqaamat || null;
    if (iqa) {
      const dt = parseTimeToDate(iqa, now);
      if (dt) {
        todayTimes.push({ name: p, time: dt, timeStr: iqa });
      }
    }
  }

  // sort by time
  todayTimes.sort((a, b) => a.time - b.time);

  // find next > now
  let next = todayTimes.find((t) => t.time > now) || null;
  // find prev <= now (take last that <= now)
  let prev = null;
  for (let i = todayTimes.length - 1; i >= 0; i--) {
    if (todayTimes[i].time <= now) {
      prev = todayTimes[i];
      break;
    }
  }

  // if no next today -> tomorrow's fajr (if exists)
  if (!next) {
    const fajr = prayerTimings["fajr"]?.iqaamat || null;
    if (fajr) {
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      const dt = parseTimeToDate(fajr, tomorrow);
      if (dt) next = { name: "fajr", time: dt, timeStr: fajr };
    }
  }

  // if no prev today -> take most recent from yesterday (prefer isha, else last available)
  if (!prev) {
    // try yesterday isha
    const yesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1
    );
    // try isha first
    const maybeIsha = prayerTimings["isha"]?.iqaamat;
    if (maybeIsha) {
      const dt = parseTimeToDate(maybeIsha, yesterday);
      if (dt) prev = { name: "isha", time: dt, timeStr: maybeIsha };
    } else {
      // fallback: last available in order
      for (let i = order.length - 1; i >= 0; i--) {
        const p = order[i];
        const iq = prayerTimings[p]?.iqaamat;
        if (iq) {
          const dt = parseTimeToDate(iq, yesterday);
          if (dt) {
            prev = { name: p, time: dt, timeStr: iq };
            break;
          }
        }
      }
    }
  }

  return { next, prev };
}

/* -------------------------
   Hook: useCountdownWithProgress
   Inputs:
     - nextTime (Date|null)
     - prevTime (Date|null)
   Outputs:
     - remainingStr "HH:MM:SS"
     - remainingMs (number)
     - totalWindowMs (next - prev)
     - progress (0..1) -> elapsed / totalWindow
   Updates every 1s.
   ------------------------- */
function useCountdownWithProgress(nextTime, prevTime) {
  const [state, setState] = useState({
    remainingStr: "--:--:--",
    remainingMs: null,
    totalWindowMs: null,
    progress: 0,
  });

  useEffect(() => {
    if (!nextTime) {
      setState({
        remainingStr: "--:--:--",
        remainingMs: null,
        totalWindowMs: null,
        progress: 0,
      });
      return;
    }

    let mounted = true;

    function compute() {
      const now = new Date();
      const next = new Date(nextTime);
      const prev = prevTime ? new Date(prevTime) : null;

      let remainingMs = Math.max(0, next.getTime() - now.getTime());

      // total window: next - prev. If prev is null or >= next, fallback to remaining (avoid div0)
      let totalWindowMs = null;
      if (prev && prev < next) totalWindowMs = next.getTime() - prev.getTime();
      else totalWindowMs = remainingMs || 1;

      // progress elapsed (how much time passed since prev)
      let elapsed = totalWindowMs - remainingMs;
      if (elapsed < 0) elapsed = 0;
      let progress =
        totalWindowMs > 0 ? Math.min(1, elapsed / totalWindowMs) : 0;

      // format remaining
      const hrs = String(Math.floor(remainingMs / (1000 * 60 * 60))).padStart(
        2,
        "0"
      );
      const mins = String(
        Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
      ).padStart(2, "0");
      const secs = String(
        Math.floor((remainingMs % (1000 * 60)) / 1000)
      ).padStart(2, "0");
      const remainingStr = `${hrs}:${mins}:${secs}`;

      if (mounted) {
        setState({ remainingStr, remainingMs, totalWindowMs, progress });
      }
    }

    compute();
    const id = setInterval(compute, 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [nextTime?.toString(), prevTime?.toString()]); // stringify Dates so effect triggers

  return state;
}

/* -------------------------
   Component: ProgressRing (SVG)
   Props:
     - size (px)
     - stroke (px)
     - progress (0..1)
     - trackColor, strokeColor (optional)
   Renders circular progress where 0 => empty, 1 => full
   ------------------------- */
function ProgressRing({
  size = 64,
  stroke = 6,
  progress = 0,
  children = null,
}) {
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.max(0, Math.min(1, progress)) * circumference;
  const dashOffset = circumference - dash;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-block",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="rgba(15,23,42,0.06)"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Outer progress */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#7c3aed" // indigo/violet
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>

      {/* Center content */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------
   MasjidCard - per-card UI and countdown
   Receives masjid object and isActive/isExpanded handlers
   ------------------------- */
function MasjidCard({
  m,
  i,
  isActive,
  expanded,
  onCenter,
  onToggleExpand,
  onExpand,
}) {
  // pick timings from fullDetails if present else fallback
  const timings = m.fullDetails?.prayerTimings || m.prayerTimings || {};

  // compute prev & next
  const { next, prev } = getPrevAndNextIqaamats(timings);

  // countdown & progress hook
  const { remainingStr, remainingMs, totalWindowMs, progress } =
    useCountdownWithProgress(next?.time || null, prev?.time || null);

  // when next becomes present and card expanded, call onExpand to fetch full details (if required)
  useEffect(() => {
    if (expanded && onExpand) {
      onExpand(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  return (
    <div
      key={m._id}
      ref={(el) => {}}
      onClick={() => onCenter(i)}
      role="button"
      tabIndex={0}
      className="flex-shrink-0 rounded-2xl bg-white shadow-md border border-slate-100 overflow-hidden"
      style={{
        width: "86%", // keep carousel peek
        scrollSnapAlign: "center",
        transform: isActive ? "scale(1)" : "scale(0.98)",
        transition: "transform 250ms ease",
        boxShadow: isActive ? "0 18px 36px rgba(2,6,23,0.12)" : undefined,
        overflowY: "auto",
        maxHeight: "80vh",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* CARD FRONT */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            width: "100%",
            aspectRatio: "16/9",
            position: "relative",
            background: "#f8fafc",
            overflow: "hidden",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {m.imageUrl ? (
            <img
              src={m.imageUrl}
              alt={m.name}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{ height: 180, background: "#f3f4f6", width: "100%" }}
            />
          )}

          {/* Stylish Dual Ring overlay - right-bottom */}
          {next && (
            <div
              style={{
                position: "absolute",
                right: 12,
                bottom: 12,
                // visual card
                background: "rgba(255,255,255,0.94)",
                padding: 8,
                borderRadius: 14,
                border: "1px solid rgba(15,23,42,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {/* Outer ring with progress */}
              <ProgressRing size={64} stroke={6} progress={progress}>
                {/* Inner small ring / content */}
                <div style={{ textAlign: "center", pointerEvents: "none" }}>
                  <div
                    style={{ fontSize: 10, color: "#475569", fontWeight: 700 }}
                  >
                    {next.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {remainingStr}
                  </div>
                </div>
              </ProgressRing>

              {/* Right side small column: next iqaamat time & small action */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 80,
                }}
              >
                <div
                  style={{ fontSize: 12, color: "#374151", fontWeight: 700 }}
                >
                  Iqaamat
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {next.timeStr}
                </div>

                <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // center card if not active, else toggle expand
                      if (!isActive) {
                        onCenter(i);
                        return;
                      }
                      onToggleExpand();
                    }}
                    className="px-2 py-1 rounded-md text-xs bg-indigo-600 text-white"
                  >
                    {isActive ? (expanded ? "Hide" : "Timings") : "Center"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {m.name}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "#475569" }}>
            {m.area?.name || ""} • {m.city?.name || ""}
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isActive) {
                  onCenter(i);
                  return;
                }
                onToggleExpand();
              }}
              className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm"
            >
              {isActive
                ? expanded
                  ? "Hide Timings"
                  : "View Timings"
                : "Center"}
            </button>

            <div style={{ flex: 1 }} />
          </div>
        </div>

        {/* SLIDE DOWN DETAILS */}
        <AnimatePresence initial={false}>
          {isActive && expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28 }}
              style={{
                overflow: "hidden",
                borderTop: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {/* FULL DETAILS SCROLL HERE */}
              <div
                style={{
                  maxHeight: "60vh",
                  overflowY: "auto",
                  padding: 14,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {/* -------- Masjid Info -------- */}
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: 6,
                    }}
                  >
                    {m.name}
                  </div>

                  {m.fullDetails?.address && (
                    <div style={{ color: "#475569", marginBottom: 10 }}>
                      {m.fullDetails.address}
                    </div>
                  )}
                </div>

                {/* -------- Prayer Timings -------- */}
                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#3730a3",
                      marginBottom: 12,
                    }}
                  >
                    Prayer Timings
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      fontWeight: 600,
                      color: "#0f172a",
                      paddingBottom: 8,
                      borderBottom: "1px solid #e5e7eb",
                      marginBottom: 8,
                    }}
                  >
                    <div>Name</div>
                    <div style={{ textAlign: "center" }}>Azaan</div>
                    <div style={{ textAlign: "right" }}>Iqaamat</div>
                  </div>

                  {m.fullDetails?.prayerTimings ? (
                    ["fajr", "Zohar", "asr", "maghrib", "isha", "juma"].map(
                      (p) => {
                        const row = m.fullDetails.prayerTimings[p] || {};
                        return (
                          <div
                            key={p}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr 1fr",
                              padding: "6px 0",
                              borderBottom: "1px solid #f1f5f9",
                              fontSize: 15,
                            }}
                          >
                            <div style={{ fontWeight: 500 }}>
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </div>

                            <div
                              style={{ textAlign: "center", color: "#334155" }}
                            >
                              {row.azan || "-"}
                            </div>

                            <div
                              style={{ textAlign: "right", color: "#334155" }}
                            >
                              {row.iqaamat || "-"}
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <div style={{ color: "#64748b" }}>No timings available</div>
                  )}
                </div>

                {/* -------- Contacts -------- */}
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: 8,
                    }}
                  >
                    Contacts
                  </div>

                  {(m.fullDetails?.contacts || []).map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: 12,
                        paddingBottom: 8,
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {c.role}: {c.name}
                      </div>
                      {c.phone && <div>📞 {c.phone}</div>}
                      {c.email && <div>✉️ {c.email}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* -------------------------
   Main exported MasjidCarousel (refactored to use MasjidCard)
   ------------------------- */
export default function MasjidCarousel({
  masjids = [],
  selectedMasjidId = null,
  onSelect = () => {},
  onExpand = () => {},
  carouselRef = null,
}) {
  const outerRef = carouselRef || useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const scrollTimeout = useRef(null);

  if (!Array.isArray(masjids)) masjids = [];

  useEffect(() => {
    if (!selectedMasjidId) return;
    const idx = masjids.findIndex((m) => m._id === selectedMasjidId);
    if (idx !== -1) {
      setActiveIndex(idx);
      requestAnimationFrame(() => centerIndex(idx, true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMasjidId, masjids.length]);

  const centerIndex = (i, smooth = true) => {
    const outer = outerRef.current;
    const card = cardRefs.current[i];
    if (!outer || !card) return;
    const offset =
      card.offsetLeft - (outer.clientWidth / 2 - card.clientWidth / 2);
    outer.scrollTo({
      left: Math.max(0, offset),
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const computeNearest = useCallback(() => {
    const outer = outerRef.current;
    if (!outer || !cardRefs.current.length) return;
    const outerCenter = outer.scrollLeft + outer.clientWidth / 2;
    let nearest = 0;
    let nearestDist = Infinity;
    cardRefs.current.forEach((c, idx) => {
      if (!c) return;
      const center = c.offsetLeft + c.clientWidth / 2;
      const dist = Math.abs(center - outerCenter);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = idx;
      }
    });
    return nearest;
  }, [outerRef]);

  const handleScroll = () => {
    if (expandedId) setExpandedId(null);

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      const nearest = computeNearest();
      if (typeof nearest === "number" && nearest !== activeIndex) {
        setActiveIndex(nearest);
        onSelect(masjids[nearest] || null);
      } else {
        centerIndex(activeIndex, true);
      }
    }, 120);
  };

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    outer.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      outer.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, masjids.length, computeNearest]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") {
        const next = Math.max(0, activeIndex - 1);
        setActiveIndex(next);
        centerIndex(next);
        onSelect(masjids[next]);
      } else if (e.key === "ArrowRight") {
        const next = Math.min(masjids.length - 1, activeIndex + 1);
        setActiveIndex(next);
        centerIndex(next);
        onSelect(masjids[next]);
      } else if (e.key === "Escape") {
        setExpandedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, masjids, onSelect]);

  useEffect(() => {
    centerIndex(activeIndex, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const handleCardTap = (idx) => {
    if (idx === activeIndex) {
      const current = masjids[idx];
      const newExp = expandedId === current._id ? null : current._id;
      setExpandedId(newExp);
      if (newExp) {
        onExpand(current);
      }
    } else {
      setExpandedId(null);
      setActiveIndex(idx);
      centerIndex(idx);
      onSelect(masjids[idx]);
    }
  };

  const renderSwipeHint = () => (
    <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
      <div className="w-8 h-12 rounded-r-xl bg-gradient-to-r from-black/6 to-transparent" />
    </div>
  );

  return (
    <div className="w-full relative">
      <div className="px-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">
          Masjids in this Area
        </h3>
      </div>

      <div
        ref={outerRef}
        className="w-full overflow-x-auto touch-pan-x scrollbar-hide"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
          paddingLeft: "7%",
          paddingRight: "7%",
        }}
      >
        <div
          ref={trackRef}
          className="flex items-start gap-4"
          style={{ paddingBottom: 12 }}
        >
          {masjids.map((m, i) => {
            const isActive = i === activeIndex;
            const expanded = expandedId === m._id;

            return (
              <MasjidCard
                key={m._id}
                refFn={(el) => (cardRefs.current[i] = el)}
                m={m}
                i={i}
                isActive={isActive}
                expanded={expanded}
                onCenter={(idx) => {
                  setExpandedId(null);
                  setActiveIndex(idx);
                  centerIndex(idx);
                  onSelect(masjids[idx]);
                }}
                onToggleExpand={() => {
                  const newExp = expandedId === m._id ? null : m._id;
                  setExpandedId(newExp);
                  if (newExp) onExpand(m);
                }}
                onExpand={onExpand}
              />
            );
          })}
        </div>
      </div>

      {renderSwipeHint()}

      <div className="flex justify-center gap-2 mt-4 mb-2">
        {masjids.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition ${
              i === activeIndex ? "bg-indigo-600" : "bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
