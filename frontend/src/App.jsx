import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

function App() {
  const { token, user, logout, initializeMocks } = useAuth();

  useEffect(() => {
    initializeMocks();
  }, [initializeMocks]);

  return (
    <div className="flex min-h-screen bg-bg-base text-text-primary">
      <aside className="hidden w-20 flex-col border-r border-border-hairline bg-bg-surface/90 p-4 lg:flex">
        <div className="mb-8 text-center text-sm font-semibold uppercase tracking-[0.2em] text-accent">VT</div>
        <nav className="flex flex-1 flex-col gap-3 text-[11px] uppercase tracking-[0.16em] text-text-secondary">
          <NavLink to="/" end className={({ isActive }) => `rounded-panel px-2 py-3 text-center transition ${isActive ? 'bg-bg-surface-alt text-text-primary' : 'hover:bg-bg-surface-alt hover:text-text-primary'}`}>Accueil</NavLink>
          <NavLink to="/market" className={({ isActive }) => `rounded-panel px-2 py-3 text-center transition ${isActive ? 'bg-bg-surface-alt text-text-primary' : 'hover:bg-bg-surface-alt hover:text-text-primary'}`}>Marché</NavLink>
          <NavLink to="/trading" className={({ isActive }) => `rounded-panel px-2 py-3 text-center transition ${isActive ? 'bg-bg-surface-alt text-text-primary' : 'hover:bg-bg-surface-alt hover:text-text-primary'}`}>Trading</NavLink>
          <NavLink to="/portfolio" className={({ isActive }) => `rounded-panel px-2 py-3 text-center transition ${isActive ? 'bg-bg-surface-alt text-text-primary' : 'hover:bg-bg-surface-alt hover:text-text-primary'}`}>Portefeuille</NavLink>
        </nav>
      </aside>

      <div className="flex-1">
        <header className="border-b border-border-hairline bg-bg-surface/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold uppercase tracking-[0.2em] text-text-primary">VirTrade</div>
              <div className="hidden h-5 w-px bg-border-hairline md:block" />
              <div className="hidden text-sm text-text-secondary md:block">Terminal de marché</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2 text-text-secondary">
                <span className="mr-2 uppercase tracking-[0.16em] text-text-disabled">Solde</span>
                <span className="ticker-font text-text-primary">$12,540.00</span>
              </div>
              <div className="pulse-live rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2 text-text-secondary">
                <span className="mr-2 uppercase tracking-[0.16em] text-text-disabled">PnL</span>
                <span className="ticker-font text-market-bid">+2.84%</span>
              </div>
              {token ? (
                <>
                  <span className="rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2 text-xs text-text-secondary">{user?.email ?? 'Utilisateur'}</span>
                  <button className="rounded-panel border border-border-hairline px-3 py-2 text-xs text-text-primary transition hover:bg-bg-surface-alt" onClick={logout}>Déconnexion</button>
                </>
              ) : (
                <NavLink to="/login" className="rounded-panel border border-border-hairline px-3 py-2 text-xs text-text-primary transition hover:bg-bg-surface-alt">Connexion</NavLink>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
