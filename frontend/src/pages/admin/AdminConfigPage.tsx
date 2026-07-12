import { useEffect, useState } from 'react'
import { getConfigs, updateConfig } from '../../api/admin'
import type { ConfigMarche } from '../../types'
import { Check, Edit2, X } from 'lucide-react'

export function AdminConfigPage() {
  const [configs, setConfigs] = useState<ConfigMarche[]>([])
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetchConfigs()
  }, [])

  async function fetchConfigs() {
    setLoading(true)
    try {
      const data = await getConfigs()
      setConfigs(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (config: ConfigMarche) => {
    setEditingKey(config.cle)
    setEditValue(config.valeur)
  }

  const saveEdit = async (cle: string) => {
    try {
      await updateConfig(cle, editValue)
      setEditingKey(null)
      fetchConfigs()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading && !configs.length) return <div className="text-[var(--color-ink-muted)]">Chargement...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Configuration du Marché</h1>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-canvas)] border-b border-[var(--color-border)] text-[var(--color-ink-muted)] uppercase text-xs tracking-wider">
              <th className="px-6 py-4 font-medium">Clé</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium">Valeur</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {configs.map(config => (
              <tr key={config.id} className="hover:bg-[var(--color-canvas)]/30 transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-[var(--color-ink)]">{config.cle}</td>
                <td className="px-6 py-4 text-[var(--color-ink-muted)]">{config.description}</td>
                <td className="px-6 py-4 font-mono text-[var(--color-ink)]">
                  {editingKey === config.cle ? (
                    <input 
                      type="text" 
                      className="w-full bg-[var(--color-canvas)] border border-[var(--color-border)] rounded px-2 py-1 font-mono"
                      value={editValue} 
                      onChange={e => setEditValue(e.target.value)} 
                    />
                  ) : (
                    config.valeur
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {editingKey === config.cle ? (
                    <>
                      <button onClick={() => saveEdit(config.cle)} className="p-2 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20"><Check size={18} /></button>
                      <button onClick={() => setEditingKey(null)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"><X size={18} /></button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(config)} className="p-2 text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 rounded transition-colors">
                      <Edit2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
