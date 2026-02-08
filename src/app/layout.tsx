import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";
import { ToastProvider } from "@/components/Toast";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "QF - מערכת זימון תורים",
  description: "מערכת זימון תורים למרפאות וקופות חולים",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">
        <StoreProvider>
          <ToastProvider>
            <AppShell>
              {children}
            </AppShell>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
