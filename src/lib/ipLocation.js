export async function detectCityFromIP() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = await res.json();
    return { city: data.city };
  } catch {
    return null;
  }
}
