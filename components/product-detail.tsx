"use client";
import React from "react";
import type { Stripe } from "stripe";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
interface Props {
  product: Stripe.Product;
}
const ProductDetail = ({ product }: Props) => {
  const { items, addItem, removeItem } = useCartStore();
  const price = product.default_price as Stripe.Price;
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const router = useRouter();

  const onAddItem = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: price.unit_amount as number,
      imageUrl: product.images ? product.images[0] : null,
      quantity: 1,
    });
  };
  const formatPrice = (amount: number, currency: string) => {
    const formattedInteger = amount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedInteger} ${currency.toUpperCase()}`;
  };

  const onBuyNow = () => {
    router.push("/checkout");
  };
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col md:flex-row gap-8 items-center">
      {product.images && product.images[0] && (
        <div className="relative h-125 w-full md:w-1/2 rounded-lg overflow-hidden">
          <div className="relative w-[500px] h-[500px]">
            <Image
              alt={product.name}
              src={product.images[0]}
              layout="fill"
              objectFit="cover"
              className="hover:opacity-90 object-contain transition duration-300"
            />
          </div>
        </div>
      )}
      <div className="md:w-1/2">
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        {product.description && (
          <p className="text-gray-700 mb-4">{product.description}</p>
        )}
        {price && price.unit_amount && (
          <p className="text-lg font-semibold mb-6 text-gray-900">
            {formatPrice(price.unit_amount, price.currency)}
          </p>
        )}
        <div className="flex items-center space-x-4 mb-4  ">
          <Button
            onClick={() => removeItem(product.id)}
            variant="outline"
            className="cursor-pointer"
          >
            {" "}
            -
          </Button>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value);
              if (isNaN(newQuantity) || newQuantity < 0) return;

              const current = items.find((item) => item.id === product.id);
              const diff = newQuantity - (current?.quantity || 0);

              if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: price.unit_amount as number,
                    imageUrl: product.images ? product.images[0] : null,
                    quantity: 1,
                  });
                }
              } else if (diff < 0) {
                for (let i = 0; i < Math.abs(diff); i++) {
                  removeItem(product.id);
                }
              }
            }}
            className="w-16 text-center outline-none border   border-gray-300 rounded px-2 py-1"
          />

          {/* <span className="text-lg font-semibold">{quantity}</span> */}
          <Button
            onClick={onAddItem}
            variant="outline"
            className="bg-black text-white cursor-pointer "
          >
            {" "}
            +
          </Button>
        </div>
        <div className="flex space-x-4 items-center pt-10">
          <Button
            onClick={onBuyNow}
            className="bg-gray-900 px-6 py-6 text-md text-white cursor-pointer"
          >
            Buy Now
          </Button>
          <p>or</p>
          <Link href="/products">
            <Button className="bg-gray-100 px-6 py-6 text-md text-blue-600 cursor-pointer">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
