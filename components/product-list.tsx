"use client";
import React, { useState, useEffect } from "react";
import type { Stripe } from "stripe";
import ProductCard from "./product-card";
import { Button } from "./ui/button";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Props {
  products: Stripe.Product[];
  price: number;
}

const PRODUCTS_PER_PAGE = 9;

const ProductList = ({ products }: Props) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const filteredProduct = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(term);
    const descriptonMatch = product.description
      ? product.description.toLowerCase().includes(term)
      : false;
    return nameMatch || descriptonMatch;
  });

  const totalPages = Math.ceil(filteredProduct.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = filteredProduct.slice(
    startIdx,
    startIdx + PRODUCTS_PER_PAGE
  );

  return (
    <div>
      {/* Search Box */}
      <div className="mb-6 flex justify-center">
        <input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          type="text"
          placeholder="Search products..."
          className="w-full max-w-md rounded-2xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Product Grid */}
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentProducts.map((product, key) => {
          if (
            product.default_price &&
            typeof product.default_price === "object"
          ) {
            return (
              <li key={key}>
                <ProductCard
                  product={product}
                  price={product.default_price as Stripe.Price}
                />
              </li>
            );
          }
          return null;
        })}
      </ul>

      {/* Pagination */}
      <div className="mt-8 flex justify-center items-center gap-2">
        {/* Previous Button */}
        <Button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1 text-sm rounded border text-gray-600 border-neutral-300 bg-gray-100 disabled:opacity-40"
        >
          <FaChevronLeft /> Back
        </Button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, index) => (
          <Button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 text-sm w-[34px] rounded-md border ${
              currentPage === index + 1
                ? "bg-black text-white"
                : "bg-white text-gray-600 border-neutral-300"
            }`}
          >
            {index + 1}
          </Button>
        ))}

        {/* Next Button */}
        <Button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1 text-sm rounded border text-gray-600 border-neutral-300 bg-gray-100 disabled:opacity-40"
        >
          Next <FaChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default ProductList;
