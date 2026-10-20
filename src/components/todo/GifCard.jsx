import { useState } from 'react';

export default function GifCard({ gif, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <figure className={`gif ${className}`}>
      <img src={gif.url} alt={gif.alt} onError={() => setFailed(true)} />
      <figcaption>via GIPHY</figcaption>
    </figure>
  );
}
