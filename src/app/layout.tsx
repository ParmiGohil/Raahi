import type { Metadata } from "next";
import "./globals.css";
import './product.css';
import './profile.css';
import { ProductShell } from '../components/product-shell';
export const metadata: Metadata = {
  title: "Raahi · A way forward",
  description:
    "A connected travel recovery workspace. Explore a fictional Mumbai–Goa trip, understand disruptions and compare feasible repairs.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><ProductShell>{children}</ProductShell></body>
    </html>
  );
}
