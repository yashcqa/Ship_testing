import "./globals.css";
import { StoreProvider } from "@/components/StoreProvider";
import Header from "@/components/Header";

export const metadata = {
  title: { default: "Page & Pine", template: "%s | Page & Pine" },
  description: "A small independent online bookstore."
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <a href="#main" className="skip-link">Skip to content</a>
          <Header />
          <main id="main" className="page" data-testid="main-content">{children}</main>
          <footer className="site-footer" data-testid="site-footer">
            <p>Page &amp; Pine is a demo store. No real orders are placed and no cards are charged.</p>
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
