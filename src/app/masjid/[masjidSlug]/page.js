// /src/app/masjid/[masjidSlug]/page.js

import { serverFetch } from "@/lib/http/serverFetch";
import { generateSlug } from "@/lib/helpers/slugHelper";
import ClientRedirectToHome from "@/components/ClientRedirectToHome";

function extractId(slug) {
  if (!slug || typeof slug !== "string") return null;
  const parts = slug.split("-");
  return parts[parts.length - 1] || null;
}

export async function generateStaticParams() {
  let masjids = [];

  try {
    masjids = await serverFetch("/api/public/masjids");
  } catch (err) {
    console.error("Failed to load masjids for params", err);
    return [];
  }

  return masjids.map((m) => ({
    masjidSlug: `${generateSlug(m.name)}-${m._id}`,
  }));
}

export async function generateMetadata({ params }) {
  const slug = params?.masjidSlug;
  const id = extractId(slug);

  if (!id) {
    return { title: "Masjid Not Found | CitySalah" };
  }

  let masjid = null;
  try {
    masjid = await serverFetch(`/api/public/masjids/${id}`);
  } catch {
    return { title: "Masjid Not Found | CitySalah" };
  }

  if (!masjid) {
    return { title: "Masjid Not Found | CitySalah" };
  }

  const fullName = [masjid.name, masjid?.area?.name, masjid?.city?.name]
    .filter(Boolean)
    .join(", ");

  return {
    title: `${fullName} — Prayer Timings`,
    description: `Prayer timings and iqamah schedule for ${fullName}.`,
  };
}

export default async function MasjidSEO({ params }) {
  const slug = params?.masjidSlug;
  const id = extractId(slug);

  if (!id) {
    return (
      <main className="p-6">
        <h1>Masjid not found</h1>
        <ClientRedirectToHome />
      </main>
    );
  }

  let masjid = null;
  try {
    masjid = await serverFetch(`/api/public/masjids/${id}`);
  } catch {
    masjid = null;
  }

  if (!masjid) {
    return (
      <main className="p-6">
        <h1>Masjid not found</h1>
        <ClientRedirectToHome />
      </main>
    );
  }

  const fullName = [masjid.name, masjid.area?.name, masjid.city?.name]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{fullName}</h1>
      <ClientRedirectToHome />
    </main>
  );
}
