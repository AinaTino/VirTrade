import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function LoginForm() {
  const { login, erreur } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@virtrade.mg')
  const [motDePasse, setMotDePasse] = useState('demo1234')
  const [envoi, setEnvoi] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEnvoi(true)
    try {
      await login(email, motDePasse)
      navigate('/marche')
    } catch {
      // erreur déjà exposée par le contexte
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-[var(--color-ink-muted)] mb-1.5" htmlFor="email">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-[6px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] transition-shadow"
          placeholder="vous@exemple.com"
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[var(--color-ink-muted)] mb-1.5" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={4}
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="w-full rounded-[6px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] transition-shadow"
          placeholder="••••••••"
        />
      </div>

      {erreur && (
        <p className="text-[13px] text-[var(--color-ask)] bg-[var(--color-ask-soft)] rounded-[6px] px-3 py-2">
          {erreur}
        </p>
      )}

      <button
        type="submit"
        disabled={envoi}
        className="w-full rounded-[6px] bg-[var(--color-brand)] text-white text-[14px] font-semibold py-2.5 hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-60"
      >
        {envoi ? 'Connexion…' : 'Se connecter'}
      </button>

      <p className="text-center text-[13px] text-[var(--color-ink-muted)]">
        Pas encore de compte ?{' '}
        <Link to="/inscription" className="font-medium text-[var(--color-brand)] hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  )
}
