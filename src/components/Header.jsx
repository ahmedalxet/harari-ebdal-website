import React, { useState } from "react";
import { SITE_INFO, NAV_ITEMS } from "../constants";

const Header = ({ isScrolled }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (href) => {
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 w-full border-b border-gray-200 shadow-sm transition-all duration-300 ${
          isScrolled
            ? "bg-white/98 backdrop-blur-sm"
            : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        <h1 className="text-black text-xl sm:text-2xl md:text-3xl font-bold font-poppins">
          {SITE_INFO.NAME}
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4 items-center font-poppins">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.href)}
              className={`w-fit mx-auto rounded-full px-3 py-1 text-sm sm:text-base transition-all duration-300 transform hover:-translate-y-0.5 font-medium ${
                item.highlight
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-gray-200 hover:bg-amber-500 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="w-6 h-6 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg p-6 pt-20">
            <div className="flex flex-col space-y-4 font-poppins">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className={`text-left py-2 px-4 rounded-lg transition-colors font-medium ${
                    item.highlight
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "hover:bg-amber-500 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
