// src/app/login/page.js

import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}

