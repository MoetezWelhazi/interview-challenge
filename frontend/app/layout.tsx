import "./globals.css";
import { Sidebar } from "../components/Sidebar";
import React from "react";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />
          <main className="flex-1 p-4 bg-sky-100">{children}</main>
        </div>
      </body>
    </html>
  );
}
