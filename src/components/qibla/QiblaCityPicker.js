"use client";

import { useEffect, useState } from "react";
import { publicAPI } from "@/lib/api/public";

export default function QiblaCityPicker({ onSelect }) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    publicAPI.getCities().then(setCities);
  }, []);

  async function handleCitySelect(city) {
    // fetch masjids of city
    const masjids = await publicAPI.getMasjids({
      city: city._id,
      limit: 5,
    });

    onSelect({
      city,
      cityMasjids: masjids || [],
    });
  }

  return (
    <div className="fixed inset-x-0 bottom-0 bg-[#0F2A44] rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto">
      <h3 className="text-white font-semibold mb-3">Select Your City</h3>

      {cities.map((city) => (
        <button
          key={city._id}
          onClick={() => handleCitySelect(city)}
          className="block w-full text-left p-3 mb-2 bg-white/5 hover:bg-white/10 rounded-lg"
        >
          {city.name}
        </button>
      ))}
    </div>
  );
}
