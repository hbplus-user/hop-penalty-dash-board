import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { ROLES } from '../lib/roles.js';

const ALLOWED_DOMAIN = 'hbplus.fit';

function toUser(session, role) {
  if (!session?.user) return null;
  const meta = session.user.user_metadata || {};
  return {
    id: session.user.id,
    name: meta.full_name || meta.name || session.user.email,
    email: session.user.email,
    picture: meta.avatar_url || meta.picture || null,
    role
  };
}

function isAllowedEmail(email) {
  return typeof email === 'string' && email.toLowerCase().endsWith('@' + ALLOWED_DOMAIN);
}

async function fetchRole(userId) {
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (error || !data) return ROLES.SHOWRUNNER;
  return data.role;
}

export function useSupabaseAuth() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function applySession(newSession) {
      if (!newSession?.user) {
        // Don't clear `error` here: a rejected sign-in triggers its own signOut(),
        // which fires this same listener with a null session right after we set the error.
        if (!cancelled) {
          setSession(null);
          setRole(null);
        }
        return;
      }
      if (!isAllowedEmail(newSession.user.email)) {
        if (!cancelled) {
          setError(`Only @${ALLOWED_DOMAIN} Google accounts can sign in to this console.`);
          setSession(null);
          setRole(null);
        }
        supabase.auth.signOut();
        return;
      }
      const fetchedRole = await fetchRole(newSession.user.id);
      if (!cancelled) {
        setError(null);
        setSession(newSession);
        setRole(fetchedRole);
      }
    }

    supabase.auth.getSession().then(async ({ data }) => {
      await applySession(data.session);
      if (!cancelled) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      applySession(newSession);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  function signInWithGoogle() {
    setError(null);
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { hd: ALLOWED_DOMAIN }
      }
    });
  }

  function signOut() {
    supabase.auth.signOut();
  }

  return { user: toUser(session, role), loading, error, signInWithGoogle, signOut };
}
