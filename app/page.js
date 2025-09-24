export default function Page() {
  return (
    <main style={{padding: 24, fontFamily:'system-ui, sans-serif'}}>
      <h1>Ting OTP API</h1>
      <p>API endpoints:</p>
      <ul>
        <li>POST <code>/api/send-otp</code></li>
        <li>POST <code>/api/verify-otp</code></li>
      </ul>
    </main>
  );
}
