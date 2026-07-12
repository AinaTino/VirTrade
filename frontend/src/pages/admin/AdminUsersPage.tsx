import { useEffect, useState } from 'react'
import { getUsers, updateUserRole } from '../../api/admin'
import type { Utilisateur, Role } from '../../types'
import { Shield, User, ShieldAlert, Trash2 } from 'lucide-react'
import { deleteUser } from '../../api/admin'

export function AdminUsersPage() {
  const [users, setUsers] = useState<Utilisateur[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggleRole = async (user: Utilisateur) => {
    const newRole: Role = user.role === 'ADMIN' ? 'TRADER' : 'ADMIN'
    // Prevent removing the last admin? Simplification for now: just allow it.
    try {
      await updateUserRole(user.id, newRole)
      fetchUsers()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (userId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;
    try {
      await deleteUser(userId)
      fetchUsers()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading && !users.length) return <div className="text-[var(--color-ink-muted)]">Chargement...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Gestion des Utilisateurs</h1>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--color-canvas)] border-b border-[var(--color-border)] text-[var(--color-ink-muted)] uppercase text-xs tracking-wider">
              <th className="px-6 py-4 font-medium">Nom</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Date d'inscription</th>
              <th className="px-6 py-4 font-medium">Rôle</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-[var(--color-canvas)]/30 transition-colors">
                <td className="px-6 py-4 font-medium text-[var(--color-ink)] flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {user.role === 'ADMIN' ? <Shield size={16} /> : <User size={16} />}
                  </div>
                  <span>{user.nom}</span>
                </td>
                <td className="px-6 py-4 text-[var(--color-ink-muted)]">{user.email}</td>
                <td className="px-6 py-4 text-[var(--color-ink-muted)]">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => toggleRole(user)} 
                    className="p-2 text-[var(--color-ink-muted)] hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                    title={user.role === 'ADMIN' ? 'Rétrograder en Trader' : 'Promouvoir Admin'}
                  >
                    <ShieldAlert size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)} 
                    className="p-2 text-[var(--color-ink-muted)] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title="Supprimer l'utilisateur"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
