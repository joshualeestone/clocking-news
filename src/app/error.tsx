'use client'
export default function Error({
  error,
  reset,
}: { error: Error & { digest?: string }, reset: () => void }) {
  console.error(error);
  return (
    <div style={{ padding: 16 }}>
      <h2>Something went wrong.</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
