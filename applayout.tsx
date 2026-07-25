import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { SiteLayout } from "@/components/layout";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Digital Blocks – Own a Piece of the Internet",
    template: "%s | Digital Blocks",
  },
  description:
    "Premium digital blocks platform. Purchase permanent blocks with cryptocurrency and showcase your brand to a global audience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteLayout>
            {children}
          </SiteLayout>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className:
                "!bg-white dark:!bg-neutral-800 !border !border-neutral-200 dark:!border-neutral-700 !shadow-elevated !text-sm",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
