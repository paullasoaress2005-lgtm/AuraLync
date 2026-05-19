import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuraLync CRM",
  description: "Central inteligente de atendimento e conversas WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    try {
      if (localStorage.getItem("auralync-theme") === "dark") {
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
