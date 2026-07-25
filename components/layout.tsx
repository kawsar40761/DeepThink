"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button, ThemeToggle } from "@/components/ui";
import { useScrollPosition } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  SITE_NAME,
  siteLogo,
  mainNavLinks,
  ctaButton,
} from "@/lib/config";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollY = useScrollPosition();
  const scrolled = scrollY > 10;

  return (
    <header
      role="banner"
      className={cn(
        "sticky top-0 z-50 w-full transition-shadow duration-300",
        "bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl",
        scrolled
          ? "border-b border-neutral-200/80 dark:border-neutral-800/80 shadow-subtle"
          : "border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          aria-label={`${SITE_NAME} – Home`}
        >
          <Image
            src={siteLogo.src}
            alt={siteLogo.alt}
            width={siteLogo.width}
            height={siteLogo.height}
            className="h-8 w-auto transition-opacity group-hover:opacity-80"
            priority
          />
          <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {mainNavLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href={ctaButton.href} className="hidden sm:block">
            <Button size="sm">{ctaButton.label}</Button>
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        role="region"
        aria-label="Mobile navigation"
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col space-y-1 px-4 py-3 border-t border-neutral-200/70 dark:border-neutral-800/70">
          {mainNavLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href={ctaButton.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full"
            >
              <Button variant="primary" size="md" className="w-full">
                {ctaButton.label}
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
        <div className="flex gap-4">
          <Link href="/faq" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href="/contact" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Contact
          </Link>
          <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Terms
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
