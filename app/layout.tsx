import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Personal Advisor Agent',
  description: 'Get tailored advice across life domains',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Personal Advisor Agent</h1>
            <p className="tagline">Actionable, tailored guidance for your goals</p>
          </header>
          <main>{children}</main>
          <footer className="footer">? {new Date().getFullYear()} Advisor Agent</footer>
        </div>
      </body>
    </html>
  );
}
