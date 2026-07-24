import { RegisterForm } from '../components/auth/RegisterForm'

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="h-7 w-7 rounded-[4px] bg-[var(--color-brand)] flex items-center justify-center">
            <span className="text-white text-[12px] font-bold font-[var(--font-mono)]">VT</span>
          </div>
          <span className="font-[var(--font-display)] font-semibold text-[16px]">VirTrade</span>
        </div>
        <div className="rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h1 className="text-[16px] font-semibold font-[var(--font-display)] mb-1">Créer un compte</h1>
          <p className="text-[13px] text-[var(--color-ink-muted)] mb-6">Rejoignez le marché avec un capital virtuel.</p>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
