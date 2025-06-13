import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
});

// Context providers for sidebar
import { SidebarProvider } from "@/context/SidebarContext";

export const metadata: Metadata = {
  title: "ZenTurno - Appointment Booking System",
  description: "Book and manage appointments with professionals easily",
  keywords: ["appointments", "booking", "scheduling", "professionals", "services"],
  authors: [{ name: "ZenTurno Team" }],
  creator: "ZenTurno",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className}`}>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
