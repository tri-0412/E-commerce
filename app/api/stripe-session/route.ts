/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

interface ShippingDetails {
  address?: {
    line1?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  name?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const sessionId = searchParams.get("session_id");
    const customSessionId = searchParams.get("custom_session_id");

    if (!sessionId) {
      console.error("Missing session_id in query parameters");
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    console.log("Retrieving Stripe session with ID:", sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer_details"],
    });

    const shippingDetails = (session as any).customer_details?.shipping as
      | ShippingDetails
      | undefined;

    console.log("Shipping details retrieved:", shippingDetails);

    return NextResponse.json({
      shippingAddress: shippingDetails?.address || {},
      name: shippingDetails?.name || "",
      customSessionId:
        session.metadata?.customSessionId || customSessionId || "",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      "Stripe API error for session_id:",
      searchParams.get("session_id"),
      errorMessage
    );
    return NextResponse.json(
      { error: `Failed to retrieve session: ${errorMessage}` },
      { status: 500 }
    );
  }
}
