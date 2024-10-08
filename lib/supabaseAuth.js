// lib/supabaseAuth.js
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";

const supabaseClient = createPagesBrowserClient();

export default function SupabaseAuthProvider({ children, session }) {
  const [supabase] = useState(() => supabaseClient);

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={session}>
      {children}
    </SessionContextProvider>
  );
}