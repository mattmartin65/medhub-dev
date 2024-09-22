// pages/_app.js
import { useEffect } from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import supabase from '../lib/supabaseClient'; // Adjust the path as necessary
import '../styles/globals.css';
import '../styles/custom.css'; // Import custom CSS file

function MyApp({ Component, pageProps }) {
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
    <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp;