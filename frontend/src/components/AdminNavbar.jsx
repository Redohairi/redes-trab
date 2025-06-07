import { Link, useNavigate } from 'react-router-dom';

export default function AdminNavbar() {
  const navigate = useNavigate();
  
  function logout() {
    localStorage.removeItem('access');
    navigate('/login');
  }

  return (
    <nav style={{ 
      padding: '10px', 
      borderBottom: '2px solid #dc3545', 
      marginBottom: '20px',
      backgroundColor: '#f8d7da'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ 
            backgroundColor: '#dc3545', 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '4px',
            marginRight: '20px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            🔧 ADMIN
          </span>
          <Link to="/courses" style={{ marginRight: '20px' }}>📚 Cursos</Link>
          <Link to="/questions" style={{ marginRight: '20px' }}>❓ Questões</Link>
          <Link to="/submissions" style={{ marginRight: '20px' }}>📋 Submissões</Link>
          <Link to="/users" style={{ marginRight: '20px' }}>👥 Usuários</Link>
        </div>
        <button onClick={logout} style={{ 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          padding: '8px 16px', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          🚪 Sair
        </button>
      </div>
    </nav>
  );
} 