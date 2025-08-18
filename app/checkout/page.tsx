/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

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

const CheckoutPage = () => {
  const { items, removeItem, addItem } = useCartStore();
  const router = useRouter();
  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "VN",
  });
  const [error, setError] = useState<string | null>(null);

  const sessionId = `SESS-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const handleSubmit = async () => {
    if (
      !shippingAddress.name ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      setError("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.");
      return;
    }

    // Kiểm tra tổng tiền
    if (total < 1000) {
      setError("Tổng tiền phải ít nhất 1000 VNĐ.");
      return;
    }
    if (total > 99999999) {
      setError("Tổng tiền không được vượt quá 99,999,999 VNĐ.");
      return;
    }

    // Kiểm tra items
    if (!items.length) {
      setError("Giỏ hàng trống. Vui lòng thêm sản phẩm.");
      return;
    }
    setError(null);

    try {
      console.log(
        "Sending to /api/stripe-payment:",
        JSON.stringify(
          {
            amount: total,
            sessionId,
            shippingAddress,
            items,
          },
          null,
          2
        )
      );

      // Gửi yêu cầu đến /api/stripe-payment
      const response = await fetch("/api/stripe-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          sessionId,
          shippingAddress,
          items,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const { clientSecret } = await response.json();
      if (!clientSecret) {
        throw new Error("Không nhận được clientSecret từ server");
      }

      console.log("Received clientSecret:", clientSecret);

      // Lưu dữ liệu tạm thời vào localStorage để PaymentPage sử dụng
      localStorage.setItem(`order_${sessionId}_items`, JSON.stringify(items));
      localStorage.setItem(
        `order_${sessionId}_address`,
        JSON.stringify(shippingAddress)
      );
      localStorage.setItem(`order_${sessionId}_total`, total.toString());

      router.push(
        `/checkout/payment?session_id=${sessionId}&client_secret=${clientSecret}`
      );
    } catch (err: any) {
      console.error("Lỗi khi tạo phiên thanh toán:", err.message);
      setError(
        err.message || "Lỗi khi tạo phiên thanh toán. Vui lòng thử lại."
      );
    }
  };

  if (total === 0 || items.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <h1 className="text-xl font-bold">Giỏ hàng của bạn đang trống.</h1>
      </div>
    );
  }

  const formatPrice = (amount: number, currency: string) => {
    return amount.toLocaleString("vi-VN", { style: "currency", currency });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 border-gray-300">
      <h1 className="text-3xl font-bold mb-8 text-center">Thanh Toán</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {step === 1 && (
        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle className="font-bold flex justify-center text-xl">
              Tóm Tắt Đơn Hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {items.map((item, key) => (
                <li
                  className="flex items-center gap-4 border-b border-gray-300 pb-4"
                  key={key}
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
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        onClick={() => removeItem(item.id)}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 cursor-pointer"
                      >
                        -
                      </Button>
                      <span className="text-lg w-[24px] text-center font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        onClick={() => addItem({ ...item, quantity: 1 })}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 cursor-pointer"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-2 text-lg font-semibold justify-between flex">
              <p>Tổng Tiền:</p>
              <p className="inline-block text-end">
                {formatPrice(total, "VND")}
              </p>
            </div>
            <Button
              onClick={() => setStep(2)}
              className="bg-black text-white w-full h-10 mt-6 cursor-pointer hover:bg-gray-800"
              variant="default"
            >
              Tiếp tục đến Địa chỉ giao hàng
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle className="font-bold text-xl flex items-center justify-center gap-2 p-6">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="absolute left-4 top-20 cursor-pointer p-4 h-24 w-24 rounded-full flex items-center justify-center"
              >
                <ArrowLeftIcon className="h-16 w-16 text-gray-600" />
              </Button>
              Địa Chỉ Giao Hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="space-y-2" htmlFor="name">
                Họ và Tên
              </Label>
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
              <Label className="space-y-2" htmlFor="address">
                Địa chỉ
              </Label>
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
              <Label className="space-y-2" htmlFor="city">
                Thành phố
              </Label>
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
              <Label className="space-y-2" htmlFor="postalCode">
                Mã bưu điện
              </Label>
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
              <Label className="space-y-2" htmlFor="country">
                Quốc gia
              </Label>
              <Input
                id="country"
                name="country"
                value={shippingAddress.country}
                onChange={handleAddressChange}
                placeholder="Nhập quốc gia (e.g., VN)"
                required
              />
            </div>
            <Button
              onClick={handleSubmit}
              className="bg-black text-white w-full h-11 cursor-pointer hover:bg-gray-800"
              variant="default"
              disabled={!!error}
            >
              Tiến Hành Thanh Toán
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CheckoutPage;
