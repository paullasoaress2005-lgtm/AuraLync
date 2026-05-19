import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuraLync",
  description: "Inteligência operacional para clínicas que atendem pelo WhatsApp.",
  icons: {
    icon: "/auralync-logo.jpeg",
    apple: "/auralync-logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    try {
      var publicPath = location.pathname === "/" || location.pathname.startsWith("/login") || location.pathname.startsWith("/recuperar-senha");
      if (publicPath) {
        document.documentElement.classList.remove("dark-premium");
      } else if (localStorage.getItem("auralync-theme") === "dark") {
        document.documentElement.classList.add("dark-premium");
      }
    } catch (_) {}
  `;

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
