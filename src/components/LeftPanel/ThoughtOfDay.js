// src/components/LeftPanel/ThoughtOfDay.js
"use client";
import React, { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api/public";

export default function ThoughtOfDay() {
  const [thought, setThought] = useState([]);

  useEffect(() => {
    publicAPI
      .getThoughtOfDay()
      .then(setThought)
      .catch((err) => console.error("Failed to fetch thought of the day", err));
  }, []);

  if (!thought.length) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Thought of the Day</h2>
        <p>No thought for today</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Thought of the Day</h2>
      <p>{thought[0].text}</p>
    </div>
  );
}
