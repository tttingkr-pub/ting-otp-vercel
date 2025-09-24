// app/layout.js
export const metadata = {
  title: 'Ting OTP API',
  description: 'Vercel Edge + KV + Aligo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
