import type { ConnectionStatus } from '../../types'

const CONFIG: Record<ConnectionStatus, { couleur: string; label: string; pulse: boolean }> = {
  connected: { couleur: 'bg-[var(--color-bid)]', label: 'Temps réel connecté', pulse: false },
  connecting: { couleur: 'bg-[var(--color-warn)]', label: 'Connexion en cours…', pulse: true },
  disconnected: { couleur: 'bg-[var(--color-ink-faint)]', label: 'Déconnecté', pulse: false },
}

export function ConnectionStatusDot({ status }: { status: ConnectionStatus }) {
  const cfg = CONFIG[status]
  return (
    <div className="flex items-center gap-2" title={cfg.label}>
      <span className="relative flex h-2 w-2">
        {cfg.pulse && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${cfg.couleur} opacity-75 animate-pulse-dot`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.couleur}`} />
      </span>
      <span className="hidden sm:inline text-xs font-medium text-[var(--color-ink-muted)]">{cfg.label}</span>
    </div>
  )
}
