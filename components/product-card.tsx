"use client";
import Link from "next/dist/client/link";
import React from "react";
import type { Stripe } from "stripe";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/cart-store";
import { FaCartPlus } from "react-icons/fa6";
import toast from "react-hot-toast";

interface Props {
  product: Stripe.Product;
  price: Stripe.Price;
}

const ProductCard = ({ product, price }: Props) => {
  const { addItem } = useCartStore();

  const formatPrice = (amount: number, currency: string) => {
    const formattedInteger = amount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedInteger} ${currency.toUpperCase()}`;
  };

  const handleAddToCart = () => {
    console.log("Add to Cart clicked for product:", product.name); // Debug log
    addItem({
      id: product.id,
      name: product.name,
      price: price.unit_amount ? price.unit_amount : 0,
      imageUrl: product.images && product.images[0] ? product.images[0] : null,
      quantity: 1,
    });
    toast.success(
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="font-semibold text-base">
            Thêm vào giỏ hàng thành công!
          </span>
          <span className="text-sm text-gray-600">{product.name}</span>
        </div>
      </div>,
      {
        style: {
          background: "#f0fdf4", // xanh nhạt
          color: "#166534", // xanh đậm
          border: "1px solid #86efac",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
          maxWidth: "340px",
          marginTop: "60px", // đẩy toast xuống 60px
        },
        duration: 3500,
        position: "top-right",
      }
    );
  };

  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className="group hover:shadow-2xl transition duration-300 py-0 h-full flex flex-col border border-gray-200">
        {product.images && product.images[0] && (
          <div className="relative h-90 w-full">
            <Image
              alt={product.name}
              src={product.images[0]}
              layout="fill"
              objectFit="cover"
              className="group-hover:opacity-90 transition-opacity duration-300 rounded-t-lg"
            />
          </div>
        )}
        <CardHeader className="px-2 pb-3">
          <CardTitle className="px-4 text-xl text-gray-800 font-bold">
            {product.name}
          </CardTitle>
          <CardContent className="px-4 py-2 flex-grow flex flex-col justify-between">
            {product.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-2 min-h-[36px]">
                {product.description}
              </p>
            )}
            {price && price.unit_amount && (
              <p className="text-lg font-semibold text-gray-900">
                {formatPrice(price.unit_amount, price.currency)}
              </p>
            )}
            <div className="mt-4 flex items-center gap-2">
              <Button className="flex-1 bg-black text-white cursor-pointer rounded-md">
                View Detail
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.preventDefault(); // Ngăn chuyển hướng khi nhấn nút Add to Cart
                  e.stopPropagation();
                  handleAddToCart();
                }}
                className="h-10 w-10 cursor-pointer border-gray-300 hover:bg-gray-100 transition-transform duration-200 active:scale-95"
                title="Add to Cart"
              >
                <FaCartPlus className="h-6 w-6 text-gray-600" />
              </Button>
            </div>
          </CardContent>
        </CardHeader>
      </Card>
    </Link>
  );
};

export default ProductCard;
