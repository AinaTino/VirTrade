import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function RegisterForm() {
  const { register, erreur } = useAuth()
  const navigate = useNavigate()
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [envoi, setEnvoi] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEnvoi(true)
    try {
      await register(nom, email, motDePasse)
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
        <label className="block text-[13px] font-medium text-[var(--color-ink-muted)] mb-1.5" htmlFor="nom">
          Nom complet
        </label>
        <input
          id="nom"
          type="text"
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full rounded-[6px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] transition-shadow"
          placeholder="Rakoto Andrianina"
        />
      </div>
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

      <p className="text-[12px] text-[var(--color-ink-faint)]">
        Un capital virtuel de départ vous sera automatiquement attribué.
      </p>

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
        {envoi ? 'Création…' : 'Créer mon compte'}
      </button>

      <p className="text-center text-[13px] text-[var(--color-ink-muted)]">
        Déjà inscrit ?{' '}
        <Link to="/connexion" className="font-medium text-[var(--color-brand)] hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  )
}
