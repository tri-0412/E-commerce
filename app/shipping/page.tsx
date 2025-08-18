"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ClockIcon,
  TruckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PackageCheckIcon,
  Clock8,
  Clock2,
  Clock2Icon,
  Clock8Icon,
  Clock11Icon,
  Clock10Icon,
} from "lucide-react";
import Image from "next/image";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
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
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  shippingStatus: "Processing" | "Shipped" | "InTransit" | "Delivered";
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt?: string;
  isValidAddress?: boolean;
}

const ShippingPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let orderList = JSON.parse(
      localStorage.getItem("order_list") || "[]"
    ) as string[];
    if (orderList.length === 0) {
      orderList = Object.keys(localStorage)
        .filter(
          (key) =>
            (key.includes("_items") || key.includes("_item")) &&
            key.startsWith("order_SESS-")
        )
        .map((key) => key.replace(/order_(SESS-[^_]+).*/, "$1"))
        .filter((value, index, self) => self.indexOf(value) === index);
    }

    const fetchedOrders: OrderDetails[] = orderList
      .map((id) => {
        const orderData = JSON.parse(
          localStorage.getItem(`order_${id}`) || "{}"
        );
        const items =
          JSON.parse(localStorage.getItem(`order_${id}_items`) || "[]") ||
          JSON.parse(localStorage.getItem(`order_${id}_item`) || "[]");
        const total = Number(localStorage.getItem(`order_${id}_total`) || 0);
        const shippingAddress = JSON.parse(
          localStorage.getItem(`order_${id}_address`) || "{}"
        );

        const isValidAddress =
          !!shippingAddress.name &&
          shippingAddress.address &&
          shippingAddress.city &&
          shippingAddress.postalCode &&
          shippingAddress.country;

        // Tính thời gian kể từ createdAt
        const createdAt = orderData.createdAt || new Date().toISOString();
        const createdDate = new Date(createdAt);
        const now = new Date();
        const daysSinceCreated = Math.floor(
          (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Xác định trạng thái dựa trên thời gian
        let shippingStatus:
          | "Processing"
          | "Shipped"
          | "InTransit"
          | "Delivered";
        if (daysSinceCreated <= 1) {
          shippingStatus = "Processing";
        } else if (daysSinceCreated <= 2) {
          shippingStatus = "Shipped";
        } else if (daysSinceCreated <= 4) {
          shippingStatus = "InTransit";
        } else {
          shippingStatus = "Delivered";
        }

        // Cập nhật trạng thái vào localStorage
        if (orderData.shippingStatus !== shippingStatus) {
          localStorage.setItem(
            `order_${id}`,
            JSON.stringify({
              ...orderData,
              shippingStatus,
              createdAt,
            })
          );
        }

        return {
          orderId: orderData.orderId || `ORD-${id.slice(-6)}`,
          items: items as OrderItem[],
          total,
          shippingAddress: shippingAddress as ShippingAddress,
          shippingStatus,
          trackingNumber: orderData.trackingNumber || `TRACK-${id.slice(-6)}`,
          estimatedDelivery:
            orderData.estimatedDelivery || new Date().toISOString(),
          createdAt,
          isValidAddress,
        };
      })
      .filter(
        (order) =>
          order.items.length > 0 && order.total > 0 && order.isValidAddress
      );

    setOrders(fetchedOrders);

    if (sessionId) {
      const matchedOrder = fetchedOrders.find(
        (order) => order.orderId === `ORD-${sessionId.slice(-6)}`
      );
      if (matchedOrder) {
        setExpandedOrderId(matchedOrder.orderId);
      }
    }
  }, [sessionId]);

  // Timeline trạng thái giống SuccessPage
  const renderTimeline = (shippingStatus: string) => {
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

  // Hàm render trạng thái với biểu tượng ClockIcon
  const renderStatus = (status: string) => {
    switch (status) {
      case "Processing":
        return (
          <span className="flex items-center justify-center gap-1 text-orange-600 bg-orange-100 font-medium text-sm px-2 py-1 rounded-md w-[120px] h-[36px] text-center">
            <Clock2Icon className="h-4 w-4 stroke-[2.5] text-orange-600" />
            Đang Xử Lý
          </span>
        );
      case "Shipped":
        return (
          <span className="flex items-center justify-center gap-1 text-purple-600 bg-purple-100 font-medium text-sm px-2 py-1 rounded-md w-[120px] h-[36px] text-center">
            <ClockIcon className="h-4 w-4 stroke-[2.5] text-purple-600" />
            Đã Gửi
          </span>
        );
      case "InTransit":
        return (
          <span className="flex items-center justify-center gap-1 text-blue-600 bg-blue-100 font-medium text-sm px-2 py-1 rounded-md w-[120px] h-[36px] text-center">
            <Clock8Icon className="h-4 w-4 stroke-[2.5] text-blue-600" />
            Đang Giao
          </span>
        );
      case "Delivered":
        return (
          <span className="flex items-center justify-center gap-1 text-green-600 bg-green-100 font-medium text-sm px-2 py-1 rounded-md w-[120px] h-[36px] text-center">
            <Clock10Icon className="h-4 w-4 stroke-[2.5] text-green-600" />
            Đã Giao
          </span>
        );
      default:
        return (
          <span className="flex items-center justify-center gap-1 text-gray-600 bg-gray-100 font-medium text-sm px-2 py-1 rounded-md w-[120px] h-[36px] text-center">
            <ClockIcon className="h-4 w-4 stroke-[2.5] text-gray-600" />
            Không xác định
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-12 tracking-tight">
        Theo Dõi Đơn Hàng
      </h1>

      <Card className="mb-12 shadow-xl border border-gray-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-blue-700">
            Lịch Sử Đơn Hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 sm:px-8">
          {orders.length === 0 ? (
            <div className="text-center">
              <p className="text-neutral-600 text-lg mb-4">
                Chưa có đơn hàng nào hợp lệ.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors rounded-lg px-6 py-2"
              >
                <Link href="/products">Mua Sắm Ngay</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders
                .sort(
                  (a, b) =>
                    new Date(b.createdAt || "").getTime() -
                    new Date(a.createdAt || "").getTime()
                )
                .map((order) => {
                  const isExpanded = expandedOrderId === order.orderId;

                  return (
                    <div
                      key={order.orderId}
                      className="border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
                    >
                      {/* Header đơn hàng */}
                      <div
                        className={`p-5 sm:p-6 cursor-pointer transition-colors duration-200 ${
                          isExpanded
                            ? "bg-blue-50 border-b border-blue-200"
                            : ""
                        }`}
                        onClick={() =>
                          setExpandedOrderId(isExpanded ? null : order.orderId)
                        }
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div className="space-y-2">
                            <p className="font-semibold text-gray-800 text-lg">
                              Đơn Hàng #{order.orderId.toUpperCase()}
                            </p>
                            <p className="text-sm text-neutral-500">
                              Đặt ngày:{" "}
                              {new Date(
                                order.createdAt || ""
                              ).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-neutral-500">
                              Tổng tiền:{" "}
                              <span className="font-medium text-gray-700">
                                {order.total.toLocaleString("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                })}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {renderStatus(order.shippingStatus)}
                            </div>
                            {isExpanded ? (
                              <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Chi tiết đơn hàng */}
                      {isExpanded && (
                        <div className="p-6 sm:p-8 bg-gray-50 transition-all duration-300 ease-in-out">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            {/* Sản phẩm */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-gray-800 text-lg">
                                Sản Phẩm
                              </h3>
                              <ul className="space-y-4">
                                {order.items.map((item) => (
                                  <li
                                    key={item.id}
                                    className="flex items-center gap-4 text-neutral-600 text-sm"
                                  >
                                    <div className="relative w-12 h-12 rounded-md overflow-hidden">
                                      <Image
                                        src={
                                          item.imageUrl ||
                                          "/placeholder-image.jpg"
                                        }
                                        alt={item.name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        className="hover:opacity-90 transition duration-300"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-700">
                                        {item.name}
                                      </p>
                                      <p className="text-neutral-500">
                                        Số lượng: {item.quantity}
                                      </p>
                                    </div>
                                    <span className="font-medium text-gray-700">
                                      {(
                                        item.price * item.quantity
                                      ).toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      })}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              <div className="border-t pt-3">
                                <p className="flex justify-between font-semibold text-gray-800 text-base">
                                  <span>Tổng cộng:</span>
                                  <span>
                                    {order.total.toLocaleString("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    })}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Thông tin giao hàng */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-gray-800 text-lg">
                                Thông Tin Giao Hàng
                              </h3>
                              {order.isValidAddress ? (
                                <div className="text-neutral-600 text-sm leading-relaxed space-y-2">
                                  <div>
                                    <p className="font-medium">
                                      Người đặt hàng:
                                    </p>
                                    <p>{order.shippingAddress.name}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      Địa chỉ giao hàng:
                                    </p>
                                    <p>
                                      {order.shippingAddress.address},{" "}
                                      {order.shippingAddress.city},{" "}
                                      {order.shippingAddress.postalCode},{" "}
                                      {order.shippingAddress.country}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-red-500 text-sm font-medium">
                                  Địa chỉ giao hàng chưa được cung cấp.
                                </p>
                              )}
                            </div>

                            {/* Trạng thái giao hàng */}
                            <div className="space-y-4 lg:col-span-2">
                              <h3 className="font-semibold text-gray-800 text-lg mb-0">
                                Trạng Thái Giao Hàng
                              </h3>
                              <div className="rounded-lg p-4">
                                {renderTimeline(order.shippingStatus)}
                                <div className="grid grid-cols-1 lg:grid-cols-2 mt-4 space-y-2">
                                  <p className="text-neutral-700 text-sm sm:text-base">
                                    <strong className="font-semibold text-gray-800">
                                      Ngày Đặt Hàng :
                                    </strong>{" "}
                                    <span className="text-blue-700 font-medium px-2 py-1 rounded-md">
                                      {new Date(
                                        order.createdAt || ""
                                      ).toLocaleDateString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                      })}{" "}
                                    </span>
                                  </p>
                                  <p className="text-neutral-700 text-sm sm:text-base">
                                    <strong className="font-semibold text-gray-800">
                                      Ngày Giao Hàng Dự Kiến :
                                    </strong>{" "}
                                    <span className="text-blue-700 font-medium px-2 py-1 rounded-md">
                                      {new Date(
                                        order.estimatedDelivery
                                      ).toLocaleDateString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                <Button
                                  asChild
                                  variant="outline"
                                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors rounded-lg px-6 py-2"
                                >
                                  <Link href="/products">Tiếp Tục Mua Sắm</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingPage;
