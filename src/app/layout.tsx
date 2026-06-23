import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neighborly | Multi-Tenant Estate Management SaaS",
  description:
    "Private, secure, and customizable digital portals for gated estates and modern communities in Nigeria.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Dynamic host detection for SaaS multi-tenancy
  const headerList = await headers();
  const host = headerList.get("host") || "";
  const hostClean = host.split(":")[0];
  
  const rootDomains = ['localhost', 'neighborly', 'www', 'neighborly-gamma.vercel.app', 'neighborly-zeta.vercel.app'];
  const parts = hostClean.split('.');
  const isSubdomain = parts.length > 1 && !rootDomains.includes(parts[0]);
  
  let primaryColor = "#10b981"; // Default emerald-500
  let secondaryColor = "#f59e0b"; // Default amber-500
  let estateName = "";

  if (isSubdomain) {
    const subdomain = parts[0];
    try {
      const supabase = createAdminClient();
      const { data: estateData } = await supabase
        .from('estates')
        .select('id, name, tenant_branding(primary_color, secondary_color)')
        .eq('subdomain', subdomain)
        .single();
      
      if (estateData) {
        estateName = estateData.name;
        const branding = estateData.tenant_branding as any;
        if (branding) {
          if (branding.primary_color) primaryColor = branding.primary_color;
          if (branding.secondary_color) secondaryColor = branding.secondary_color;
        }
      }
    } catch (e) {
      console.error("Failed to load tenant branding:", e);
    }
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Dynamic style overrides for Tenant Branding */}
        {isSubdomain && (
          <style dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary: ${primaryColor} !important;
                --secondary: ${secondaryColor} !important;
                --ring: ${primaryColor} !important;
              }
              [data-theme="dark"] {
                --primary: ${primaryColor} !important;
                --secondary: ${secondaryColor} !important;
                --ring: ${primaryColor} !important;
              }
            `
          }} />
        )}
        {estateName && <title>{`${estateName} | Neighborly Community Portal`}</title>}
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
