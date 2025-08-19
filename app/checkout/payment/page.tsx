"use client";

import { Suspense } from "react";
import PaymentPageContent from "./payment-page";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Đang tải...
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
