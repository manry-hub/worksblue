import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";

export const metadata: Metadata = {
  title: "WorksBlue — Developer workspace",
  description: "Kelola project, dokumentasi, dan siklus pengembangan dalam satu workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <div className="ambient-blobs-container">
          <div className="ambient-blob-primary" />
          <div className="ambient-blob-secondary" />
          <div className="ambient-blob-tertiary" />
        </div>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
