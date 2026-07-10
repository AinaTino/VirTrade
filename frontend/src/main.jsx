import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';
import MarketPage from './pages/MarketPage.jsx';
import TradingPage from './pages/TradingPage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import RegisterForm from './components/auth/RegisterForm.jsx';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { TradingProvider } from './context/TradingContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

function RequireAuth({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'market', element: <MarketPage /> },
        { path: 'trading', element: <RequireAuth><TradingPage /></RequireAuth> },
        { path: 'portfolio', element: <RequireAuth><PortfolioPage /></RequireAuth> },
        { path: 'login', element: <LoginForm /> },
        { path: 'register', element: <RegisterForm /> },
        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <TradingProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </TradingProvider>
    </AuthProvider>
  </React.StrictMode>
);
