import "../assets/css/globals.css";
import "../assets/css/theme.css";
import { Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import Providers from "@/provider/providers";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import AuthProvider from "@/provider/auth.provider";
import "flatpickr/dist/themes/light.css";
import DirectionProvider from "@/provider/direction.provider";
import { use } from "react";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return (
    <html lang={lang}>
      <AuthProvider>
        <TanstackProvider>
          <Providers>
            <DirectionProvider lang={lang}>{children}</DirectionProvider>
          </Providers>
        </TanstackProvider>
      </AuthProvider>
    </html>
  );
}
