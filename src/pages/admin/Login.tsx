import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Field, TextInput } from '@/components/admin/Field';
import { Seo } from '@/components/common/Seo';
import { PageLoader } from '@/components/common/Spinner';
import { isSupabaseEnabled } from '@/supabase/client';

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoader label="Verificando sessÃ£o" />;
  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? '/admin';
    return <Navigate to={from} replace />;
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate((location.state as { from?: string } | null)?.from ?? '/admin', { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'NÃ£o foi possÃ­vel entrar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Seo
        title="Acesso ao painel"
        description="Ãrea restrita da Mykonos Parfum."
        path="/admin/login"
        noIndex
      />

      <div className="grid min-h-dvh place-items-center bg-limewash px-5 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <p className="text-aegean font-display text-2xl uppercase tracking-[0.2em]">Mykonos</p>
            <p className="mt-1.5 font-mono text-[0.55rem] uppercase tracking-[0.4em] text-ash">
              Painel
            </p>
          </div>

          <form
            onSubmit={(event) => void submit(event)}
            className="mt-10 space-y-5 rounded-2xl bg-chalk p-7 ring-1 ring-salt"
          >
            <Field label="E-mail">
              <TextInput
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@mykonosparfum.com.br"
              />
            </Field>

            <Field label="Senha">
              <TextInput
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />
            </Field>

            {error && (
              <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-xs text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-aegean text-chalk font-mono text-[0.66rem] uppercase tracking-[0.16em] transition-opacity disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Lock className="size-4" aria-hidden />
              )}
              Entrar
            </button>
          </form>

          {!isSupabaseEnabled && (
            <div className="mt-6 rounded-xl border border-aegean/40 bg-limewash p-5">
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-aegean">
                Configuração necessária
              </p>
              <p className="mt-2.5 text-xs leading-relaxed text-stone">
                O painel administrativo só aceita login quando as variáveis do Supabase estão
                configuradas no ambiente de publicação.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
