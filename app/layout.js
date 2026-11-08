import "./globals.css";

export const metadata = {
  title: "URL Shortener | Week 07",
  description: "URL Shortener 1~7주차 누적 실습",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
