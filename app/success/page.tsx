"use client";

import { Suspense } from "react";
import SuccessPage from "./success-page";

export default function Success() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPage />
    </Suspense>
  );
}
