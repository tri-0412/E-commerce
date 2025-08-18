/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil", // Hoặc "2024-06-20" nếu đã cập nhật thư viện
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received request body:", JSON.stringify(body, null, 2));

    const { sessionId, amount, shippingAddress, items } = body;

    // Kiểm tra dữ liệu đầu vào
    if (!sessionId || !amount || !shippingAddress || !items) {
      console.error("Missing required fields:", {
        sessionId,
        amount,
        shippingAddress,
        items,
      });
      return NextResponse.json(
        {
          error:
            "Missing required fields: sessionId, amount, shippingAddress, or items",
        },
        { status: 400 }
      );
    }

    // Kiểm tra amount
    if (typeof amount !== "number" || amount <= 0) {
      console.error("Invalid amount:", amount);
      return NextResponse.json(
        { error: "Invalid amount: must be a positive number" },
        { status: 400 }
      );
    }

    // Tính amountInCents và kiểm tra giới hạn
    const amountInCents = Math.round(amount);
    console.log("Calculated amountInCents:", amountInCents);

    if (amountInCents < 1000) {
      console.error("Amount too low:", amountInCents);
      return NextResponse.json(
        { error: "Amount must be at least 1000 VNĐ" },
        { status: 400 }
      );
    }
    if (amountInCents > 99999999) {
      console.error("Amount too large:", amountInCents);
      return NextResponse.json(
        { error: "Amount must be no more than 99,999,999 VNĐ" },
        { status: 400 }
      );
    }

    // Kiểm tra shippingAddress
    if (
      !shippingAddress.name ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      console.error("Invalid shipping address:", shippingAddress);
      return NextResponse.json(
        { error: "Invalid shipping address: missing required fields" },
        { status: 400 }
      );
    }

    // Kiểm tra country code
    if (shippingAddress.country !== "VN") {
      console.error("Invalid country code:", shippingAddress.country);
      return NextResponse.json(
        { error: "Invalid country code: must be 'VN' for Vietnam" },
        { status: 400 }
      );
    }

    // Kiểm tra items
    if (!Array.isArray(items) || items.length === 0) {
      console.error("Invalid items:", items);
      return NextResponse.json(
        { error: "Items must be a non-empty array" },
        { status: 400 }
      );
    }

    // Tạo PaymentIntent
    console.log("Creating PaymentIntent with params:", {
      amount: amountInCents,
      currency: "vnd",
      payment_method_types: ["card"],
      metadata: {
        sessionId,
        orderId: `ORD-${sessionId.slice(-6)}`,
        items: JSON.stringify(items),
      },
      shipping: {
        name: shippingAddress.name,
        address: {
          line1: shippingAddress.address,
          city: shippingAddress.city,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "vnd",
      payment_method_types: ["card"],
      metadata: {
        sessionId,
        orderId: `ORD-${sessionId.slice(-6)}`,
        items: JSON.stringify(items),
      },
      shipping: {
        name: shippingAddress.name,
        address: {
          line1: shippingAddress.address,
          city: shippingAddress.city,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
      },
    });

    console.log("PaymentIntent created:", paymentIntent.id);
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error creating PaymentIntent:", {
      message: err.message,
    });
    return NextResponse.json(
      {
        error: `Failed to create PaymentIntent: ${
          err.message || "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
