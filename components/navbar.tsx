"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Menu, X, Coins } from 'lucide-react';
import React from 'react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const MenuIcon = isOpen ? X : Menu;

  return (
    <nav className="fixed w-full bg-black z-50 border-b border-yellow-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              {mounted && <Coins className="h-8 w-8 text-yellow-600" />}
              <span className="font-bold text-xl text-white">U-WIN Network</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="#features" className="text-white hover:text-yellow-600 transition">
              Features
            </Link>
            <Link href="#education" className="text-white hover:text-yellow-600 transition">
              Education
            </Link>
            <Button variant="default" className="text-white bg-yellow-400 hover:bg-yellow-500">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-yellow-600 hover:bg-gray-700 focus:outline-none"
            >
              {mounted && <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-black">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="#features"
              className="block px-3 py-2 text-base font-medium text-white hover:text-yellow-600 hover:bg-gray-700 rounded-md"
            >
              Features
            </Link>
            <Link
              href="#education"
              className="block px-3 py-2 text-base font-medium text-white hover:text-yellow-600 hover:bg-gray-700 rounded-md"
            >
              Education
            </Link>
            <Button variant="default" className="w-full mt-2 text-white bg-yellow-400 hover:bg-yellow-500">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
