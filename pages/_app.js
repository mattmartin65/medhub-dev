// pages/_app.js
import { useState, useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import '../styles/globals.css';
import '../styles/custom.css'; // Import custom CSS file

function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  useEffect(() => {
    console.log("Rendering MyApp");

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service worker registration failed:', error);
        });
    }
  }, []);

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp;  