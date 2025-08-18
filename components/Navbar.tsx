"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { Button } from "./ui/button";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import MyCommerceLogo from "@/logo/MyCommerceLogo";
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items } = useCartStore();
  const pathname = usePathname();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center space-x-2 hover:text-blue-600 text-lg font-bold text-gray-800"
        >
          <MyCommerceLogo />
          <span>My Commerce</span>
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link
            href="/"
            className={`flex items-center space-x-1 hover:text-blue-600 font-semibold text-gray-800 ${
              isActive("/") ? "underline underline-offset-6" : ""
            }`}
          >
            {/* <HomeIcon className="h-5 w-5 " /> */}
            Home
          </Link>
          <Link
            href="/products"
            className={`flex items-center space-x-1 hover:text-blue-600 font-semibold text-gray-800 ${
              isActive("/products") ? "underline underline-offset-6" : ""
            }`}
          >
            {/* <CubeIcon className="h-5 w-5" /> */}
            Products
          </Link>
          <Link
            href="/checkout"
            className={`flex items-center space-x-1 hover:text-blue-600 font-semibold text-gray-800 ${
              isActive("/checkout") ? "underline underline-offset-6" : ""
            }`}
          >
            {/* <CreditCardIcon className="h-5 w-5" /> */}
            Checkout
          </Link>
          <Link
            href="/shipping"
            className={`flex items-center space-x-1 hover:text-blue-600 font-semibold text-gray-800 ${
              isActive("/shipping") ? "underline underline-offset-6" : ""
            }`}
          >
            {/* <TruckIcon className="h-5 w-5" /> */}
            <span>Shipping</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/checkout" className="relative hover:text-blue-600">
            <ShoppingCartIcon className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-xs font-semibold px-1">
                {cartCount}
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden bg-white shadow-md">
          <ul className="flex flex-col p-4 space-y-2">
            <li>
              <Link href="/" className="block hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="block hover:text-blue-600">
                Products
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="block hover:text-blue-600">
                Checkout
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </nav>
  );
};

export default Navbar;
