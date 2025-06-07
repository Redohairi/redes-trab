import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Layout from '../components/Layout';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Tentando fazer login com:', username);
      const response = await api.post('token/', { username, password });
      console.log('✅ Login bem-sucedido:', response.data);
      
      localStorage.setItem('access', response.data.access);
      console.log('💾 Token salvo no localStorage');
      
      navigate('/courses');
    } catch (err) {
      console.error('❌ Erro no login:', err);
      setError(err.response?.data?.detail || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
  };

  return (
    <Layout>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>
            🎓
          </div>
          <h1 style={{
            color: '#333',
            fontSize: '2.5em',
            margin: '0 0 10px 0',
            fontWeight: 'bold'
          }}>
            Sistema Escolar
          </h1>
          <p style={{
            color: '#666',
            fontSize: '1.1em',
            margin: 0
          }}>
            Faça login para acessar seus cursos e quizzes
          </p>
        </div>

        {/* Card de Login */}
        <div style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <form onSubmit={handleSubmit}>
            <h2 style={{
              color: '#333',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: '30px',
              fontSize: '1.5em'
            }}>
              🔐 Entrar na Conta
            </h2>

            {/* Campo Username */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                👤 Nome de Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007bff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e9ecef';
                }}
                placeholder="Digite seu nome de usuário"
              />
            </div>

            {/* Campo Password */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                🔒 Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007bff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e9ecef';
                }}
                placeholder="Digite sua senha"
              />
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid #f5c6cb',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                ❌ {error}
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: loading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                marginBottom: '20px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#0056b3';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#007bff';
                }
              }}
            >
              {loading ? '🔄 Entrando...' : '🚀 Entrar'}
            </button>
          </form>

          {/* Divisor */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '25px 0',
            color: '#666'
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#e9ecef'
            }}></div>
            <span style={{
              padding: '0 15px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              OU
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#e9ecef'
            }}></div>
          </div>

          {/* Contas Demo */}
          <div>
            <h3 style={{
              color: '#333',
              textAlign: 'center',
              marginBottom: '15px',
              fontSize: '1.1em'
            }}>
              🎯 Contas de Demonstração
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '10px'
            }}>
              {/* Botão Demo Aluno */}
              <button
                type="button"
                onClick={() => handleDemoLogin('aluno_teste', 'senha123')}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#218838';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#28a745';
                }}
              >
                👨‍🎓 Entrar como Aluno (João Silva)
              </button>

              {/* Botão Demo Professor */}
              <button
                type="button"
                onClick={() => handleDemoLogin('prof_teste', 'senha123')}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#dc3545';
                }}
              >
                👨‍🏫 Entrar como Professor (Maria Santos)
              </button>
            </div>

            {/* Informações das Contas Demo */}
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '15px',
              borderRadius: '6px',
              border: '1px solid #bbdefb',
              marginTop: '15px'
            }}>
              <h4 style={{
                color: '#1976d2',
                margin: '0 0 10px 0',
                fontSize: '14px'
              }}>
                ℹ️ Informações das Contas Demo:
              </h4>
              <div style={{
                fontSize: '13px',
                color: '#1976d2',
                lineHeight: '1.4'
              }}>
                <p style={{ margin: '0 0 5px 0' }}>
                  <strong>👨‍🎓 Aluno:</strong> aluno_teste / senha123
                </p>
                <p style={{ margin: '0' }}>
                  <strong>👨‍🏫 Professor:</strong> prof_teste / senha123
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          color: '#666',
          fontSize: '14px'
        }}>
          <p style={{ margin: 0 }}>
            🔒 Sistema seguro com autenticação JWT
          </p>
        </div>
      </div>
    </Layout>
  );
} 