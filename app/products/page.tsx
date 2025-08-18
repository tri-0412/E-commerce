import { stripe } from "@/lib/stripe";
import React from "react";
import ProductList from "@/components/product-list";

const ProductsPage = async () => {
  const products = await stripe.products.list({
    expand: ["data.default_price"],
    limit: 100,
  });
  return (
    <div className="pb-8">
      <h1 className="text-3xl leading-none tracking-tight text-foreground text-center font-bold mb-8">
        All Products
      </h1>
      <ProductList products={products.data} price={0} />
    </div>
  );
};

export default ProductsPage;
