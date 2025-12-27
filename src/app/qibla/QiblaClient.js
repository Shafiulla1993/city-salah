// src/app/qibla/QiblaClient.js

"use client";

import { calculateQiblaDirection } from "@/lib/qibla/calculateQibla";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCompass } from "@/hooks/useCompass";
import QiblaCompass from "@/components/qibla/QiblaCompass";

export default function QiblaClient() {
    const { location, error, loading } = useGeolocation();
    const heading = useCompass();

    if (loading) {
        return (
            <FullScreenMessage text="Finding your location…" />
        );
    }

    if (error === "permission-denied") {
        return (
            <FullScreenMessage
                title="Location Access Required"
                text="Please allow location access to find accurate Qibla direction."
            />
        );
    }

    if (error === "gps-off") {
        return (
            <FullScreenMessage
                title="Turn On Location"
                text="Please enable GPS for accurate Qibla direction."
            />
        );
    }

    const qiblaAngle = calculateQiblaDirection(
        location.lat,
        location.lng
    );

    const diff =
        heading !== null
            ? Math.abs(
                ((qiblaAngle - heading + 540) % 360) - 180
            )
            : null;


    const aligned = diff !== null && diff < 3;


    return (
        <main className="h-screen flex flex-col items-center justify-center bg-black text-white">
            <h1 className="text-xl font-semibold mb-6">
                Qibla Direction
            </h1>

            <QiblaCompass
                qiblaAngle={qiblaAngle}
                heading={heading}
                aligned={aligned}
            />

            <p className="mt-6 text-sm text-white/70">
                Rotate your phone until the arrow points upward
            </p>
        </main>
    );
}

function FullScreenMessage({ title, text }) {
    return (
        <div className="h-screen flex flex-col items-center justify-center text-center px-6 bg-black text-white">
            {title && (
                <h1 className="text-xl font-semibold mb-2">
                    {title}
                </h1>
            )}
            <p className="text-white/70">{text}</p>
        </div>
    );
}
