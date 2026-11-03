import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { StoreProvider } from "@/store/provider";

export const metadata: Metadata = {
  title: "Equipment Rental System",
  description: "Browse equipment and manage rental requests",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
