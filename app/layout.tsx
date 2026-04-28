import { SyncUser } from "@/components/providers/sync-user"; // Import ini
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
         * Runs synchronously before any CSS or React hydration.
         * Adds `no-theme-init` so all transitions are blocked during the
         * initial paint. ThemeProvider removes it after the first rAF.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('no-theme-init');`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ConvexClientProvider>
          <ThemeProvider>
            <SyncUser /> {/* Pasang di sini */}
            {children}
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
