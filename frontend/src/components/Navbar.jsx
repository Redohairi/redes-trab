import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem('access');
    navigate('/login');
  }
  return (
    <nav style={{ 
      padding: '10px', 
      borderBottom: '1px solid #ddd', 
      marginBottom: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ 
            backgroundColor: '#007bff', 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '4px',
            marginRight: '20px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            👨‍🎓 ALUNO
          </span>
          <Link to="/courses" style={{ marginRight: '20px', textDecoration: 'none', color: '#007bff' }}>
            📚 Cursos
          </Link>
          <Link to="/submissions" style={{ marginRight: '20px', textDecoration: 'none', color: '#007bff' }}>
            📋 Minhas Submissões
          </Link>
        </div>
        <button 
          onClick={logout} 
          style={{ 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🚪 Sair
        </button>
      </div>
    </nav>
  );
} 