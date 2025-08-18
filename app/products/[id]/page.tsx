import { stripe } from "@/lib/stripe";
import React from "react";
import ProductDetail from "@/components/product-detail";

const ProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const product = await stripe.products.retrieve(id, {
    expand: ["default_price"],
  });

  const plainProduct = JSON.parse(JSON.stringify(product));
  return <ProductDetail product={plainProduct} />;
};

export default ProductPage;
