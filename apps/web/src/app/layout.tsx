import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { StoreProvider } from "@/store/provider";

export const metadata: Metadata = {
  title: "Gearhouse — Equipment Rental",
  description: "Find the right equipment for your next project.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
              <span>GEARHOUSE · Equipment rental, made simple.</span>
              <span>Questions? Contact your equipment administrator.</span>
            </div>
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
