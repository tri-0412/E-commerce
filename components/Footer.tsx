"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MyCommerceLogo from "@/logo/MyCommerceLogo";
import { FacebookIcon, TwitterIcon, InstagramIcon } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý đăng ký bản tin (có thể gọi API)
    alert(`Đã đăng ký với email: ${email}`);
    setEmail("");
  };

  return (
    <footer className="bg-white text-neutral-900 pt-8 pb-6  shadow shadow-gray-800">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start">
            <Link
              href="/"
              className="flex items-center space-x-2 text-blue-500 text-xl font-bold mb-4"
            >
              <MyCommerceLogo />
              <span>My Commerce</span>
            </Link>
            <p className="text-neutral-400 text-sm text-center md:text-left">
              Your trusted destination for premium products at unbeatable
              prices.
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon className="h-6 w-6 hover:text-blue-400 transition-colors" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon className="h-6 w-6 hover:text-blue-400 transition-colors" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon className="h-6 w-6 hover:text-blue-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-neutral-600 mb-4">
              Shop
            </h3>
            <ul className="space-y-2 text-neutral-400 text-sm">
              <li>
                <Link
                  href="/products?category=electronics"
                  className="hover:text-blue-400 transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=fashion"
                  className="hover:text-blue-400 transition-colors"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=home"
                  className="hover:text-blue-400 transition-colors"
                >
                  Home & Living
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-blue-400 transition-colors"
                >
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Policy Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-neutral-600 mb-4">
              Policies
            </h3>
            <ul className="space-y-2 text-neutral-400 text-sm">
              <li>
                <Link
                  href="/policies/returns"
                  className="hover:text-blue-400 transition-colors"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/privacy"
                  className="hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/terms"
                  className="hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-neutral-600 mb-4">
              Stay Connected
            </h3>
            <ul className="space-y-2 text-neutral-400 text-sm mb-4">
              <li>
                Email:{" "}
                <a
                  href="mailto:support@mycommerce.com"
                  className="hover:text-blue-400"
                >
                  tringuyen8826@gmail.com
                </a>
              </li>
              <li>
                Phone:{" "}
                <a href="tel:+84379879508" className="hover:text-blue-400">
                  0379879508
                </a>
              </li>
              <li>Address: 123 Nguyễn Huệ, Hồ Chí Minh City, Việt Nam</li>
            </ul>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col items-center md:items-start"
            >
              <label
                htmlFor="newsletter"
                className="text-sm text-neutral-400 mb-2"
              >
                Subscribe to our newsletter
              </label>
              <div className="flex w-full max-w-xs h-9">
                <input
                  type="email"
                  id="newsletter"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 placeholder-neutral-500 text-sm rounded-md bg-neutral-200 text-neutral-600 border border-neutral-700 focus:outline-none "
                  required
                />
                <Button
                  type="submit"
                  className="bg-blue-500 text-white rounded-md ml-3 hover:bg-blue-600"
                >
                  Subscribe
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-neutral-700 text-center text-sm text-neutral-400">
          <p>
            &copy; {new Date().getFullYear()} My Commerce. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
