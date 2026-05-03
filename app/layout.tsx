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
            __html: `(function(){
  var root = document.documentElement;
  root.classList.add('no-theme-init');
  try {
    var isLanding = window.location.pathname === '/';
    var t = isLanding ? 'astro-vista' : (localStorage.getItem('thinkit-theme') || 'astro-vista');
    var m = isLanding ? 'light' : (localStorage.getItem('thinkit-mode') || 'light');
    root.setAttribute('data-theme', t);
    root.setAttribute('data-mode', m);
  } catch(e) {
    root.setAttribute('data-theme', 'astro-vista');
    root.setAttribute('data-mode', 'light');
  }
})();`,
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
