// app/layout.tsx
import "@/styles/globals.css";
import { Poppins, Italianno } from "next/font/google";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
});

const italianno = Italianno({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italianno",
});

export const metadata = {
  title: "MTT API CMS",
  description: "MTT API CMS NEWS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${poppins.variable} ${italianno.variable} h-screen overflow-hidden`}>
      <body className="font-poppins h-screen overflow-hidden bg-gray-100">
        {children}
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            className: "left-[calc(50%+170px)] -translate-x-1/2",
          }}
        />
      </body>
    </html>
  );
}
