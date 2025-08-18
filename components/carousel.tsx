"use client";
import React, { useEffect, useState } from "react";
import type { Stripe } from "stripe";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Button } from "./ui/button";

interface Props {
  products: Stripe.Product[];
}

const Carousel = ({ products }: Props) => {
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % products.length);
    }, 5000); // auto đổi sau 4s
    return () => clearInterval(interval);
  }, [products.length]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % products.length);
  };

  const currentProduct = products[current];
  const price = currentProduct.default_price as Stripe.Price;

  const formatPrice = (amount: number, currency: string) => {
    const formattedInteger = amount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedInteger} ${currency.toUpperCase()}`;
  };

  return (
    <Card className="relative overflow-hidden rounded-lg shadow-md bg-neutral-100 border-gray-300">
      {/* Vùng ảnh với fade transition */}
      <div className="relative w-full h-[460px] flex items-center justify-center">
        {products.map((product, index) => (
          <Image
            key={product.id}
            alt={product.name}
            src={product.images[0]}
            width={500}
            height={460}
            className={`absolute transition-opacity duration-700 ease-in-out object-cover object-center
              ${index === current ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {/* Nút điều khiển */}
        <Button
          className="absolute left-4 top-1/2 -translate-y-1/2 shadow-none"
          onClick={handlePrev}
        >
          <FaChevronLeft className="text-gray-700" />
        </Button>
        <Button
          className="absolute right-4 top-1/2 -translate-y-1/2 shadow-none"
          onClick={handleNext}
        >
          <FaChevronRight className="text-gray-700" />
        </Button>
      </div>

      {/* Thông tin sản phẩm */}
      <CardContent className="flex flex-col items-center my-3 bg-black bg-opacity-50">
        <CardTitle className="text-2xl font-bold text-gray-800 mb-2 text-center">
          {currentProduct.name}
        </CardTitle>
        {price?.unit_amount && price.currency && (
          <p className="text-center text-lg text-gray-600">
            {formatPrice(price.unit_amount, price.currency)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Carousel;
