"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ClockIcon,
  PackageCheckIcon,
  TruckIcon,
} from "lucide-react";
import Image from "next/image";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface OrderDetails {
  orderId: string;
  items: CartItem[];
  total: number;
  shippingAddress: ShippingAddress;
  shippingStatus: "Processing" | "Shipped" | "InTransit" | "Delivered";
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt?: string;
  isValidAddress?: boolean;
}

export default function SuccessPage() {
  const { clearCart } = useCartStore();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [orderData, setOrderData] = useState<OrderDetails>({
    orderId: sessionId ? `ORD-${sessionId.slice(-6)}` : "ORD-000001",
    items: [],
    total: 0,
    shippingAddress: {
      name: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
    },
    shippingStatus: "Shipped",
    trackingNumber: sessionId ? `TRACK-${sessionId.slice(-6)}` : "TRACK-000001",
    estimatedDelivery: "2025-08-20",
    createdAt: new Date().toISOString(),
    isValidAddress: false,
  });
  function getShippingStatus(
    createdAt: string
  ): OrderDetails["shippingStatus"] {
    const createdDate = new Date(createdAt).getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Processing"; // Ngày đầu
    if (diffDays < 4) return "Shipped"; // Ngày 1–3
    if (diffDays < 5) return "InTransit"; // Ngày 4
    return "Delivered"; // Từ ngày 5 trở đi
  }
  function getEstimatedDelivery(createdAt: string): string {
    const createdDate = new Date(createdAt);
    const additionalDays = 5; // Luôn đặt ngày giao hàng dự kiến là ngày InTransit
    createdDate.setDate(createdDate.getDate() + additionalDays);
    return createdDate.toISOString();
  }
  useEffect(() => {
    if (sessionId && typeof window !== "undefined") {
      const items = JSON.parse(
        localStorage.getItem(`order_${sessionId}_items`) ||
          localStorage.getItem(`order_${sessionId}_item`) ||
          "[]"
      ) as CartItem[];
      const total = Number(
        localStorage.getItem(`order_${sessionId}_total`) || 0
      );
      const shippingAddress = JSON.parse(
        localStorage.getItem(`order_${sessionId}_address`) || "{}"
      ) as ShippingAddress;
      const createdAt =
        localStorage.getItem(`order_${sessionId}_createdAt`) ||
        new Date().toISOString();

      const isValidAddress =
        !!shippingAddress.name &&
        shippingAddress.address &&
        shippingAddress.city &&
        shippingAddress.postalCode &&
        shippingAddress.country;
      const newStatus = getShippingStatus(createdAt);
      const estimatedDelivery = getEstimatedDelivery(createdAt);

      const newOrderData: OrderDetails = {
        orderId: `ORD-${sessionId.slice(-6)}`,
        items,
        total,
        shippingAddress,
        shippingStatus: newStatus,
        trackingNumber: `TRACK-${sessionId.slice(-6)}`,
        estimatedDelivery,
        createdAt,
        isValidAddress: true,
      };

      if (items.length > 0 && total > 0) {
        localStorage.setItem(
          `order_${sessionId}`,
          JSON.stringify(newOrderData)
        );
        localStorage.setItem(`order_${sessionId}_createdAt`, createdAt);
        const orderList = JSON.parse(
          localStorage.getItem("order_list") || "[]"
        ) as string[];
        if (!orderList.includes(sessionId)) {
          orderList.push(sessionId);
          localStorage.setItem("order_list", JSON.stringify(orderList));
        }
      }
      setOrderData(newOrderData);
      clearCart();
    }
  }, [sessionId, clearCart]);

  const { items, total, shippingAddress, isValidAddress, shippingStatus } =
    orderData;
  const orderId = orderData.orderId;

  // Timeline trạng thái giống Shopee
  const renderTimeline = () => {
    const steps = [
      {
        status: "Processing",
        label: "Đang Xử Lý",
        icon: <ClockIcon className="h-5 w-5" />,
      },
      {
        status: "Shipped",
        label: "Đã Gửi",
        icon: <PackageCheckIcon className="h-5 w-5" />,
      },
      {
        status: "InTransit",
        label: "Đang Giao",
        icon: <TruckIcon className="h-5 w-5" />,
      },
      {
        status: "Delivered",
        label: "Đã Giao",
        icon: <CheckCircle2 className="h-5 w-5" />,
      },
    ];
    const currentIndex = steps.findIndex(
      (step) => step.status === shippingStatus
    );
    return (
      <div className="flex items-center justify-between mt-4">
        {steps.map((step, index) => (
          <div
            key={step.status}
            className="flex flex-col items-center text-center flex-1"
          >
            <div
              className={`p-2 rounded-full ${
                index <= currentIndex
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step.icon}
            </div>
            <p
              className={`text-xs mt-1 ${
                index <= currentIndex
                  ? "text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              {step.label}
            </p>
            {index < steps.length && (
              <div className="w-full h-1 mt-2">
                <div
                  className={`h-full ${
                    index <= currentIndex ? "bg-blue-500" : "bg-blue-200"
                  }`}
                  style={{ width: "100%" }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gray-50">
      <Card className="max-w-3xl mx-auto shadow-xl border-0 rounded-2xl">
        <CardHeader className="text-center bg-blue-500 text-white py-6 rounded-t-2xl">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Thanh Toán Thành Công!
          </CardTitle>
          <p className="text-base mt-2 opacity-90">
            Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Timeline full width */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Trạng Thái Đơn Hàng
            </h3>
            {renderTimeline()}
          </div>
          {/* Thông tin đơn hàng và giao hàng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Thông Tin Đơn Hàng
              </h3>
              <div className="space-y-2 text-neutral-700">
                <p>
                  <strong>Mã Đơn Hàng:</strong> {orderId}
                </p>
                <p>
                  <strong>Ngày Đặt Hàng:</strong>{" "}
                  {new Date(orderData.createdAt || "").toLocaleDateString(
                    "vi-VN",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
                <p>
                  <strong>Dự Kiến Giao Hàng:</strong>{" "}
                  {new Date(orderData.estimatedDelivery).toLocaleDateString(
                    "vi-VN",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Thông Tin Giao Hàng
              </h3>
              {isValidAddress ? (
                <div className="text-neutral-700 space-y-2">
                  <p>
                    <strong>Người Nhận:</strong> {shippingAddress.name}
                  </p>
                  <p>
                    <strong>Địa Chỉ:</strong> {shippingAddress.address},{" "}
                    {shippingAddress.city}, {shippingAddress.postalCode},{" "}
                    {shippingAddress.country}
                  </p>
                </div>
              ) : (
                <p className="text-red-500 font-medium">
                  Lưu ý: Địa chỉ giao hàng chưa được cung cấp. Vui lòng cập nhật
                  để đảm bảo giao hàng.
                </p>
              )}
            </div>
          </div>
          {/* Sản phẩm đã mua */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Sản Phẩm Đã Mua
              </h3>
              <ul className="space-y-4">
                {items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-4 border-b border-gray-200 pb-4"
                  >
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      <Image
                        src={item.imageUrl || "/placeholder-image.jpg"}
                        alt={item.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="hover:opacity-90 transition duration-300"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-neutral-500">
                        Số lượng: {item.quantity}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Đơn giá:{" "}
                        {item.price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {(item.price * item.quantity).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-end">
                <p className="text-lg font-semibold text-gray-800">
                  Tổng cộng:{" "}
                  {total.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </p>
              </div>
            </div>
          )}
          {/* Liên hệ và CTA */}
          <div className="text-center text-neutral-600 text-sm">
            <p>
              Có thắc mắc? Liên hệ chúng tôi qua email:{" "}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:underline"
              >
                support@example.com
              </a>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button
                asChild
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-100 text-lg py-6"
              >
                <Link href="/products">Tiếp Tục Mua Sắm</Link>
              </Button>
              <Button
                asChild
                variant="default"
                className="bg-blue-600 text-white hover:bg-blue-700 text-lg py-6"
              >
                <Link href={`/shipping?session_id=${sessionId}`}>
                  Theo Dõi Đơn Hàng
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
