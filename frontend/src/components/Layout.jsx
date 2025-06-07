import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useUserRole } from '../hooks/useUserRole';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, isTeacher, isStudent, loading } = useUserRole();

  // Função para formatar o nome completo
  const getFullName = (user) => {
    if (!user) return 'Usuário';
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || user.username;
  };

  // Função de logout
  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('access');
      navigate('/login');
    }
  };

  // Se estiver na página de login, não mostrar navbar
  const isLoginPage = location.pathname === '/login';
  
  // Verificar se deve mostrar navbar
  const shouldShowNavbar = !isLoginPage && !loading && userInfo;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Navbar - mostra quando usuário estiver logado e dados carregados */}
      {shouldShowNavbar && (
        <nav style={{
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '0 20px',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '60px'
          }}>
            {/* Logo/Título */}
            <Link 
              to="/courses"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none'
              }}
            >
              <span style={{ fontSize: '24px' }}>🎓</span>
              <h2 style={{
                margin: 0,
                color: '#333',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                Sistema Escolar
              </h2>
            </Link>

            {/* Menu de Navegação */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <Link
                to="/courses"
                style={{
                  color: location.pathname === '/courses' ? '#007bff' : '#666',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/courses' ? 'bold' : 'normal',
                  fontSize: '14px'
                }}
              >
                📚 Cursos
              </Link>
              
              <Link
                to="/submissions"
                style={{
                  color: location.pathname === '/submissions' ? '#007bff' : '#666',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/submissions' ? 'bold' : 'normal',
                  fontSize: '14px'
                }}
              >
                📊 Submissões
              </Link>

              {isTeacher && (
                <>
                  <Link
                    to="/users"
                    style={{
                      color: location.pathname === '/users' ? '#007bff' : '#666',
                      textDecoration: 'none',
                      fontWeight: location.pathname === '/users' ? 'bold' : 'normal',
                      fontSize: '14px'
                    }}
                  >
                    👥 Usuários
                  </Link>
                  
                  <Link
                    to="/questions"
                    style={{
                      color: location.pathname === '/questions' ? '#007bff' : '#666',
                      textDecoration: 'none',
                      fontWeight: location.pathname === '/questions' ? 'bold' : 'normal',
                      fontSize: '14px'
                    }}
                  >
                    ❓ Questões
                  </Link>
                </>
              )}
            </div>

            {/* Informações do Usuário */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              {/* Badge do Tipo de Usuário */}
              <span style={{
                backgroundColor: isTeacher ? '#dc3545' : '#28a745',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {isTeacher ? '👨‍🏫 Professor' : '👨‍🎓 Aluno'}
              </span>

              {/* Nome do Usuário */}
              <span style={{
                color: '#333',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                👤 {getFullName(userInfo)}
              </span>

              {/* Botão de Logout */}
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5a6268';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                }}
              >
                🚪 Sair
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Conteúdo Principal */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: isLoginPage ? 'center' : 'flex-start',
        justifyContent: 'center',
        padding: '20px',
        paddingTop: isLoginPage ? '20px' : '40px',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '800px'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
} 