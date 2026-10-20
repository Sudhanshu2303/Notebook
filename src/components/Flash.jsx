import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Shows a brief toast for messages passed as navigate(path, { state: { flash } }).
export default function Flash() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const flash = location.state?.flash;
    if (!flash) return;
    setMessage({ text: flash, key: location.key });
    // Drop the state so a refresh doesn't replay the toast.
    navigate(location.pathname + location.search, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 2400);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;
  return (
    <div className="flash" role="status" key={message.key}>
      {message.text}
    </div>
  );
}
