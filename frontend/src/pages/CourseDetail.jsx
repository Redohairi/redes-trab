import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useUserRole } from '../hooks/useUserRole';
import Layout from '../components/Layout';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isTeacher, loading: roleLoading } = useUserRole();

  useEffect(() => {
    console.log('🚀 CourseDetail montado, buscando curso ID:', id);
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      console.log('📡 Fazendo requisição para courses/' + id + '/');
      const response = await api.get(`courses/${id}/`);
      console.log('✅ Curso recebido:', response.data);
      setCourse(response.data);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar curso:', err);
      setError(err.response?.data?.detail || 'Erro ao carregar curso');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Tem certeza que deseja excluir este quiz? Esta ação não pode ser desfeita e removerá todas as questões associadas.')) {
      return;
    }

    try {
      await api.delete(`quizzes/${quizId}/`);
      alert('Quiz excluído com sucesso!');
      fetchCourse(); // Recarregar dados do curso
    } catch (err) {
      console.error('❌ Erro ao excluir quiz:', err);
      alert('Erro ao excluir quiz: ' + (err.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await api.delete(`materials/${materialId}/`);
      alert('Material excluído com sucesso!');
      fetchCourse(); // Recarregar dados do curso
    } catch (err) {
      console.error('❌ Erro ao excluir material:', err);
      alert('Erro ao excluir material: ' + (err.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  // Função para formatar o nome completo
  const getFullName = (user) => {
    if (!user) return 'Usuário não definido';
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || user.username;
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  if (loading || roleLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Carregando curso...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>❌ Erro</h1>
        <p>{error}</p>
        <Link to="/courses" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Voltar para cursos
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>❌ Curso não encontrado</h1>
        <Link to="/courses" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Voltar para cursos
        </Link>
      </div>
    );
  }

  return (
    <Layout>
      <div style={{ width: '100%' }}>
        <Link 
          to="/courses" 
          style={{ 
            color: '#007bff', 
            textDecoration: 'none',
            marginBottom: '20px',
            display: 'inline-block'
          }}
        >
          ← Voltar para cursos
        </Link>
        
        {/* Header do Curso */}
        <div style={{ 
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          marginBottom: '30px'
        }}>
          <h1 style={{ 
            color: '#333', 
            marginTop: 0, 
            marginBottom: '20px',
            fontSize: '2.2em'
          }}>
            📚 {course.name}
          </h1>
          
          {/* Informações do Curso */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <p style={{ 
                margin: '0',
                color: '#555',
                fontSize: '14px'
              }}>
                <strong>👨‍🏫 Professor:</strong> {getFullName(course.teacher)}
              </p>
            </div>
            
            <div style={{ 
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <p style={{ 
                margin: '0',
                color: '#555',
                fontSize: '14px'
              }}>
                <strong>📅 Criado em:</strong> {formatDate(course.created_at)}
              </p>
            </div>
            
            <div style={{ 
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <p style={{ 
                margin: '0',
                color: '#555',
                fontSize: '14px'
              }}>
                <strong>📊 Conteúdo:</strong> {course.materials?.length || 0} materiais, {course.quizzes?.length || 0} quizzes
              </p>
            </div>
          </div>

          {/* Descrição */}
          {course.description && (
            <div style={{ 
              backgroundColor: '#e3f2fd',
              padding: '20px',
              borderRadius: '6px',
              border: '1px solid #bbdefb'
            }}>
              <p style={{ 
                margin: '0',
                color: '#1976d2',
                fontSize: '16px',
                lineHeight: '1.6'
              }}>
                <strong>📝 Descrição:</strong> {course.description}
              </p>
            </div>
          )}
        </div>

        {/* Seção de Materiais */}
        <div style={{ 
          backgroundColor: '#fff',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          marginBottom: '30px'
        }}>
          <h2 style={{ 
            color: '#333', 
            marginTop: 0, 
            marginBottom: '20px',
            fontSize: '1.5em'
          }}>
            📄 Materiais de Estudo ({course.materials?.length || 0})
          </h2>
          
          {course.materials && course.materials.length > 0 ? (
            <div style={{ 
              display: 'grid',
              gap: '15px'
            }}>
              {course.materials.map(material => (
                <div 
                  key={material.id}
                  style={{ 
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        color: '#333',
                        margin: '0 0 10px 0',
                        fontSize: '1.1em'
                      }}>
                        📄 {material.title}
                      </h4>
                      <p style={{ 
                        color: '#666',
                        margin: '0 0 10px 0',
                        lineHeight: '1.5'
                      }}>
                        {material.content}
                      </p>
                      <div style={{ 
                        fontSize: '12px',
                        color: '#999'
                      }}>
                        📅 Criado em: {formatDate(material.created_at)}
                      </div>
                    </div>
                    
                    {isTeacher && (
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginLeft: '15px'
                        }}
                        title="Excluir material"
                      >
                        🗑️ Excluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
              <h3 style={{ color: '#666', marginBottom: '10px' }}>
                Nenhum material disponível
              </h3>
              <p style={{ color: '#999', margin: 0 }}>
                Este curso ainda não possui materiais de estudo.
              </p>
            </div>
          )}
        </div>

        {/* Seção de Quizzes */}
        <div style={{ 
          backgroundColor: '#fff',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          marginBottom: '30px'
        }}>
          <h2 style={{ 
            color: '#333', 
            marginTop: 0, 
            marginBottom: '20px',
            fontSize: '1.5em'
          }}>
            📝 Quizzes Disponíveis ({course.quizzes?.length || 0})
          </h2>
          
          {course.quizzes && course.quizzes.length > 0 ? (
            <div style={{ 
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
            }}>
              {course.quizzes.map(quiz => (
                <div 
                  key={quiz.id}
                  style={{ 
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '15px'
                  }}>
                    <h4 style={{ 
                      color: '#333',
                      margin: 0,
                      fontSize: '1.1em',
                      flex: 1
                    }}>
                      📝 {quiz.title}
                    </h4>
                    
                    {isTeacher && (
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginLeft: '10px'
                        }}
                        title="Excluir quiz"
                      >
                        🗑️ Excluir
                      </button>
                    )}
                  </div>
                  
                  {quiz.description && (
                    <p style={{ 
                      color: '#666',
                      margin: '0 0 15px 0',
                      lineHeight: '1.5',
                      fontSize: '14px'
                    }}>
                      {quiz.description}
                    </p>
                  )}
                  
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ 
                      backgroundColor: '#e3f2fd',
                      padding: '8px',
                      borderRadius: '4px',
                      textAlign: 'center',
                      border: '1px solid #bbdefb'
                    }}>
                      <div style={{ 
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#1976d2'
                      }}>
                        {quiz.questions?.length || 0}
                      </div>
                      <div style={{ 
                        fontSize: '11px',
                        color: '#1976d2'
                      }}>
                        QUESTÕES
                      </div>
                    </div>
                    <div style={{ 
                      backgroundColor: '#f3e5f5',
                      padding: '8px',
                      borderRadius: '4px',
                      textAlign: 'center',
                      border: '1px solid #ce93d8'
                    }}>
                      <div style={{ 
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#7b1fa2'
                      }}>
                        {getFullName(quiz.owner)}
                      </div>
                      <div style={{ 
                        fontSize: '11px',
                        color: '#7b1fa2'
                      }}>
                        CRIADOR
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '15px'
                  }}>
                    📅 Criado em: {formatDate(quiz.created_at)}
                  </div>
                  
                  <Link 
                    to={`/quiz/${quiz.id}`}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#0056b3';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#007bff';
                    }}
                  >
                    🚀 Fazer Quiz
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
              <h3 style={{ color: '#666', marginBottom: '10px' }}>
                Nenhum quiz disponível
              </h3>
              <p style={{ color: '#999', margin: 0 }}>
                Este curso ainda não possui quizzes para praticar.
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div style={{ 
          backgroundColor: '#e8f5e8',
          padding: '25px',
          borderRadius: '8px',
          border: '1px solid #c8e6c9',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            color: '#2e7d32',
            marginTop: 0,
            marginBottom: '15px'
          }}>
            🎯 Continue Explorando
          </h3>
          <p style={{ 
            color: '#388e3c',
            marginBottom: '20px',
            lineHeight: '1.5'
          }}>
            Explore outros cursos disponíveis ou confira suas submissões de quizzes.
          </p>
          <div style={{ 
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link 
              to="/courses"
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#218838';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#28a745';
              }}
            >
              📚 Ver Todos os Cursos
            </Link>
            <Link 
              to="/submissions"
              style={{
                padding: '12px 24px',
                backgroundColor: '#17a2b8',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#138496';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#17a2b8';
              }}
            >
              📊 Minhas Submissões
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
} 