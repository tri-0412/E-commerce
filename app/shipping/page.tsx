"use client";

import { Suspense } from "react";
import ShippingPageContent from "./shipping-page";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShippingPageContent />
    </Suspense>
  );
}
