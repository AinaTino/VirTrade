import { useEffect, useState } from 'react'
import { getAdminStocks, createStock, updateStock } from '../../api/admin'
import type { Stock } from '../../types'
import { Plus, Edit2, Check, X } from 'lucide-react'

export function AdminStocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // State for forms
  const [formData, setFormData] = useState({ symbole: '', nomComplet: '', prixActuel: 0, volatilite: 0.015 })

  useEffect(() => {
    fetchStocks()
  }, [])

  async function fetchStocks() {
    setLoading(true)
    try {
      const data = await getAdminStocks()
      setStocks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAdd = async () => {
    try {
      await createStock(formData)
      setIsAdding(false)
      fetchStocks()
    } catch (e) {
      console.error(e)
    }
  }

  const handleSaveEdit = async (id: number) => {
    try {
      await updateStock(id, formData)
      setEditingId(null)
      fetchStocks()
    } catch (e) {
      console.error(e)
    }
  }

  const startEdit = (stock: Stock) => {
    setFormData({ symbole: stock.symbole, nomComplet: stock.nomComplet, prixActuel: stock.prixActuel, volatilite: stock.volatilite })
    setEditingId(stock.id)
    setIsAdding(false)
  }

  const startAdd = () => {
    setFormData({ symbole: '', nomComplet: '', prixActuel: 100, volatilite: 0.015 })
    setIsAdding(true)
    setEditingId(null)
  }

  if (loading && !stocks.length) return <div className="text-[var(--color-ink-muted)]">Chargement...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Gestion des Actions</h1>
        <button 
          onClick={startAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90"
        >
          <Plus size={18} /> <span>Ajouter une Action</span>
        </button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-canvas)] border-b border-[var(--color-border)] text-[var(--color-ink-muted)] uppercase text-xs tracking-wider">
              <th className="px-6 py-4 font-medium">Symbole</th>
              <th className="px-6 py-4 font-medium">Nom Complet</th>
              <th className="px-6 py-4 font-medium">Prix (Base)</th>
              <th className="px-6 py-4 font-medium">Volatilité</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {isAdding && (
              <tr className="bg-[var(--color-canvas)]/50">
                <td className="px-6 py-4"><input className="w-full bg-[var(--color-canvas)] border border-[var(--color-border)] rounded px-2 py-1" value={formData.symbole} onChange={e => setFormData({...formData, symbole: e.target.value})} placeholder="AAPL" /></td>
                <td className="px-6 py-4"><input className="w-full bg-[var(--color-canvas)] border border-[var(--color-border)] rounded px-2 py-1" value={formData.nomComplet} onChange={e => setFormData({...formData, nomComplet: e.target.value})} placeholder="Apple Inc." /></td>
                <td className="px-6 py-4"><input type="number" step="0.01" className="w-full bg-[var(--color-canvas)] border border-[var(--color-border)] rounded px-2 py-1" value={formData.prixActuel} onChange={e => setFormData({...formData, prixActuel: parseFloat(e.target.value)})} /></td>
                <td className="px-6 py-4"><input type="number" step="0.001" className="w-full bg-[var(--color-canvas)] border border-[var(--color-border)] rounded px-2 py-1" value={formData.volatilite} onChange={e => setFormData({...formData, volatilite: parseFloat(e.target.value)})} /></td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={handleSaveAdd} className="p-2 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20"><Check size={18} /></button>
                  <button onClick={() => setIsAdding(false)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"><X size={18} /></button>
                </td>
              </tr>
            )}
            
            {stocks.map(stock => (
              <tr key={stock.id} className="hover:bg-[var(--color-canvas)]/30 transition-colors">
                {editingId === stock.id ? (
                  <>
                    <td className="px-6 py-4"><input className="w-full bg-[var(--color-canvas)] border border-[var(--color-border)] rounded px-2 py-1" value={formData.symbole} onChange={e => setFormData({...formData, symbole: e.target.value})} /></td>
                    <td className="px-6 py-4"><input className="w-full bg-[var(--color-canvas)] border border-[var(--color-border)] rounded px-2 py-1" value={formData.nomComplet} onChange={e => setFormData({...formData, nomComplet: e.target.value})} /></td>
                    <td className="px-6 py-4"><input type="number" step="0.01" className="w-full bg-[var(--color-canvas)] border border-[var(--color-border)] rounded px-2 py-1" value={formData.prixActuel} onChange={e => setFormData({...formData, prixActuel: parseFloat(e.target.value)})} /></td>
                    <td className="px-6 py-4"><input type="number" step="0.001" className="w-full bg-[var(--color-canvas)] border border-[var(--color-border)] rounded px-2 py-1" value={formData.volatilite} onChange={e => setFormData({...formData, volatilite: parseFloat(e.target.value)})} /></td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleSaveEdit(stock.id)} className="p-2 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20"><Check size={18} /></button>
                      <button onClick={() => setEditingId(null)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"><X size={18} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-medium text-[var(--color-ink)]">{stock.symbole}</td>
                    <td className="px-6 py-4 text-[var(--color-ink-muted)]">{stock.nomComplet}</td>
                    <td className="px-6 py-4 font-mono text-[var(--color-ink)]">{stock.prixActuel.toFixed(2)} $</td>
                    <td className="px-6 py-4 text-[var(--color-ink-muted)]">{stock.volatilite}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => startEdit(stock)} className="p-2 text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 rounded transition-colors">
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
