/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface OrderDetails {
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[];
  total: number;
  shippingAddress: ShippingAddress;
  sessionId: string;
}

const PaymentForm = ({
  order,
  clientSecret,
}: {
  order: OrderDetails;
  clientSecret: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(
    order.shippingAddress
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setError("Stripe chưa tải xong. Vui lòng thử lại.");
      return;
    }
    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found!");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: cardElement },
        }
      );

      if (error) {
        setError(error.message || "Thanh toán thất bại");
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // Lưu dữ liệu đơn hàng vào localStorage sau khi thanh toán thành công
        localStorage.setItem(
          `order_${order.sessionId}_items`,
          JSON.stringify(order.items)
        );
        localStorage.setItem(
          `order_${order.sessionId}_address`,
          JSON.stringify(shippingAddress)
        );
        localStorage.setItem(
          `order_${order.sessionId}_total`,
          order.total.toString()
        );
        localStorage.setItem(
          `order_${order.sessionId}`,
          JSON.stringify({
            orderId: `ORD-${order.sessionId.slice(-6)}`,
            items: order.items,
            total: order.total,
            shippingAddress,
            shippingStatus: "Processing",
            trackingNumber: `TRACK-${order.sessionId.slice(-6)}`,
            estimatedDelivery: "2025-08-20",
            createdAt: new Date().toISOString(),
            isValidAddress: true,
          })
        );
        const orderList = JSON.parse(
          localStorage.getItem("order_list") || "[]"
        );
        if (!orderList.includes(order.sessionId)) {
          orderList.push(order.sessionId);
          localStorage.setItem("order_list", JSON.stringify(orderList));
        }

        console.log(`Order ${order.sessionId} saved to localStorage`);
        router.push(`/success?session_id=${order.sessionId}`);
      }
    } catch (err: any) {
      console.error("Payment error:", err.message);
      setError(
        "Lỗi trong quá trình thanh toán. Vui lòng kiểm tra kết nối mạng hoặc thử lại."
      );
      setProcessing(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Họ tên</Label>
        <Input
          id="name"
          name="name"
          value={shippingAddress.name}
          onChange={handleAddressChange}
          placeholder="Nhập họ và tên"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ</Label>
        <Input
          id="address"
          name="address"
          value={shippingAddress.address}
          onChange={handleAddressChange}
          placeholder="Nhập địa chỉ"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">Thành phố</Label>
        <Input
          id="city"
          name="city"
          value={shippingAddress.city}
          onChange={handleAddressChange}
          placeholder="Nhập thành phố"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="postalCode">Mã bưu điện</Label>
        <Input
          id="postalCode"
          name="postalCode"
          value={shippingAddress.postalCode}
          onChange={handleAddressChange}
          placeholder="Nhập mã bưu điện"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Quốc gia</Label>
        <Input
          id="country"
          name="country"
          value={shippingAddress.country}
          onChange={handleAddressChange}
          placeholder="Nhập quốc gia"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Thông tin thẻ</Label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#32325d",
                "::placeholder": { color: "#aab7c4" },
              },
              invalid: { color: "#fa755a" },
            },
          }}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button
        type="submit"
        className="bg-black text-white w-full h-11 cursor-pointer hover:bg-gray-800"
        disabled={processing || !stripe || !elements}
      >
        {processing ? "Đang xử lý..." : "Thanh Toán"}
      </Button>
    </form>
  );
};

const PaymentPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clientSecret = searchParams.get("client_secret");
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (!sessionId || !clientSecret) {
      router.push("/checkout");
      return;
    }

    const items = JSON.parse(
      localStorage.getItem(`order_${sessionId}_items`) || "[]"
    );
    const total = Number(localStorage.getItem(`order_${sessionId}_total`) || 0);
    const shippingAddress = JSON.parse(
      localStorage.getItem(`order_${sessionId}_address`) || "{}"
    );

    if (!items.length || !total || !shippingAddress.name) {
      router.push("/checkout");
      return;
    }

    setOrder({
      sessionId,
      items,
      total,
      shippingAddress,
    });
  }, [sessionId, clientSecret, router]);

  if (!order || !clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <h1 className="text-xl font-bold">Đang tải...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Thanh Toán</h1>
      <Card className="max-w-md mx-auto mb-8">
        <CardHeader>
          <CardTitle className="font-bold text-xl flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/checkout")}
              className="p-0 hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Button>
            Thông Tin Thanh Toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Tóm Tắt Đơn Hàng</h3>
            <ul className="space-y-4">
              {order.items.map((item, key) => (
                <li
                  key={key}
                  className="flex items-center gap-4 border-b border-gray-300 pb-4"
                >
                  {item.imageUrl && (
                    <div className="w-12 h-12 rounded-md overflow-hidden">
                      <Image
                        alt={item.name}
                        src={item.imageUrl}
                        width={48}
                        height={48}
                        sizes="48px"
                        priority={key === 0}
                        className="hover:opacity-90 transition duration-300"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-semibold">
                        {formatPrice(item.price * item.quantity, "VND")}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-2 text-lg font-semibold flex justify-between">
              <p>Tổng Tiền:</p>
              <p>{formatPrice(order.total, "VND")}</p>
            </div>
          </div>
          <Elements stripe={stripePromise}>
            <PaymentForm order={order} clientSecret={clientSecret} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPage;
