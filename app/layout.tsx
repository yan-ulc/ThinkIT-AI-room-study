import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { SyncUser } from "@/components/providers/sync-user"; // Import ini
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <SyncUser /> {/* Pasang di sini */}
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}