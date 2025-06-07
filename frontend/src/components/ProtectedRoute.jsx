import { Outlet, Navigate } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('access');
  console.log('🛡️ ProtectedRoute - Token encontrado:', token ? 'SIM' : 'NÃO');
  
  if (token) {
    console.log('✅ Token válido, permitindo acesso às rotas protegidas');
    return <Outlet />;
  } else {
    console.log('❌ Sem token, redirecionando para /login');
    return <Navigate to="/login" />;
  }
} 