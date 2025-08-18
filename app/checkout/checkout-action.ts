"use server";
import { redirect } from "next/navigation";
import { CartItem } from "../../store/cart-store";
import { stripe } from "@/lib/stripe";

export const checkoutAction = async (formData: FormData): Promise<void> => {
  const itemsJson = formData.get("items") as string;
  const sessionId = formData.get("sessionId") as string;
  const total = Number(formData.get("total"));

  // Kiểm tra dữ liệu đầu vào
  if (!itemsJson || !sessionId || isNaN(total)) {
    throw new Error("Dữ liệu đầu vào không hợp lệ");
  }

  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error("Thiếu biến môi trường NEXT_PUBLIC_BASE_URL");
  }

  const items: CartItem[] = JSON.parse(itemsJson);

  const line_items = items.map((item: CartItem) => ({
    price_data: {
      currency: "vnd",
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.price), // Giá bằng VND, không cần chuyển đổi cent
    },
    quantity: item.quantity,
  }));

  // Tạo phiên thanh toán Stripe
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id=${sessionId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
    shipping_address_collection: {
      allowed_countries: ["VN"],
    },
    metadata: {
      orderId: `ORD-${sessionId.slice(-6)}`,
      sessionId,
      total,
      items: JSON.stringify(items),
    },
  });

  // Chuyển hướng sau khi tạo phiên thành công
  if (session.url) {
    redirect(session.url);
  } else {
    throw new Error("Không thể tạo URL phiên thanh toán");
  }
};
