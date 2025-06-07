import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useUserRole } from '../hooks/useUserRole';
import Layout from '../components/Layout';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  const { isTeacher, loading: roleLoading } = useUserRole();

  useEffect(() => {
    console.log('🚀 Componente Courses montado, buscando cursos...');
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('📡 Fazendo requisição para courses/');
      const response = await api.get('courses/');
      console.log('✅ Cursos recebidos:', response.data);
      setCourses(response.data);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar cursos:', err);
      console.error('❌ Status:', err.response?.status);
      console.error('❌ Data:', err.response?.data);
      setError(err.response?.data?.detail || 'Erro ao carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita e removerá todos os materiais e quizzes associados.')) {
      return;
    }

    try {
      await api.delete(`courses/${courseId}/`);
      alert('Curso excluído com sucesso!');
      fetchCourses(); // Recarregar lista
    } catch (err) {
      console.error('❌ Erro ao excluir curso:', err);
      alert('Erro ao excluir curso: ' + (err.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course.id);
    setEditForm({
      name: course.name,
      description: course.description
    });
  };

  const handleSaveEdit = async (courseId) => {
    try {
      await api.patch(`courses/${courseId}/`, editForm);
      alert('Curso atualizado com sucesso!');
      setEditingCourse(null);
      setEditForm({});
      fetchCourses(); // Recarregar lista
    } catch (err) {
      console.error('❌ Erro ao atualizar curso:', err);
      alert('Erro ao atualizar curso: ' + (err.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setEditForm({});
  };

  // Função para formatar o nome completo do professor
  const getTeacherName = (teacher) => {
    if (!teacher) return 'Professor não definido';
    
    const firstName = teacher.first_name || '';
    const lastName = teacher.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    console.log(`👨‍🏫 Professor ${teacher.username}: "${fullName}" (first: "${firstName}", last: "${lastName}")`);
    return fullName || teacher.username;
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
        <p>Carregando cursos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>❌ Erro</h1>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f5f5f5', 
        minHeight: '100vh' 
      }}>
        <h1 style={{ color: '#333' }}>📚 Cursos</h1>
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '40px', 
          textAlign: 'center',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#666', fontSize: '18px' }}>
            Nenhum curso encontrado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div style={{ width: '100%' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ color: '#333', margin: 0 }}>
            📚 Cursos Disponíveis ({courses.length})
          </h1>
          
          {isTeacher && (
            <div style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              👨‍🏫 Modo Professor - Você pode editar e excluir cursos
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'grid', 
          gap: '25px', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' 
        }}>
          {courses.map(course => (
            <div 
              key={course.id} 
              style={{ 
                backgroundColor: '#fff',
                padding: '25px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {editingCourse === course.id ? (
                // Formulário de edição
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Nome do Curso:
                    </label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Descrição:
                    </label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleSaveEdit(course.id)}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✅ Salvar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Visualização normal
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <h3 style={{ 
                      color: '#333', 
                      marginTop: 0, 
                      marginBottom: '10px',
                      fontSize: '1.4em'
                    }}>
                      📖 {course.name}
                    </h3>
                    <p style={{ 
                      color: '#666', 
                      margin: '0 0 15px 0',
                      lineHeight: '1.5'
                    }}>
                      {course.description}
                    </p>
                  </div>

                  {/* Informações do Professor */}
                  <div style={{ 
                    backgroundColor: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '15px',
                    border: '1px solid #e9ecef'
                  }}>
                    <p style={{ 
                      margin: '0',
                      color: '#555',
                      fontSize: '14px'
                    }}>
                      <strong>👨‍🏫 Professor:</strong> {getTeacherName(course.teacher)}
                    </p>
                  </div>

                  {/* Estatísticas */}
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ 
                      backgroundColor: '#e3f2fd',
                      padding: '10px',
                      borderRadius: '6px',
                      textAlign: 'center',
                      border: '1px solid #bbdefb'
                    }}>
                      <div style={{ 
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#1976d2'
                      }}>
                        {course.materials?.length || 0}
                      </div>
                      <div style={{ 
                        fontSize: '12px',
                        color: '#1976d2'
                      }}>
                        📄 Materiais
                      </div>
                    </div>
                    <div style={{ 
                      backgroundColor: '#f3e5f5',
                      padding: '10px',
                      borderRadius: '6px',
                      textAlign: 'center',
                      border: '1px solid #ce93d8'
                    }}>
                      <div style={{ 
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#7b1fa2'
                      }}>
                        {course.quizzes?.length || 0}
                      </div>
                      <div style={{ 
                        fontSize: '12px',
                        color: '#7b1fa2'
                      }}>
                        📝 Quizzes
                      </div>
                    </div>
                  </div>

                  {/* Data de criação */}
                  <div style={{ 
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '20px'
                  }}>
                    📅 Criado em: {formatDate(course.created_at)}
                  </div>

                  {/* Botões de ação */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <Link 
                      to={`/courses/${course.id}`}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '10px 16px',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s ease',
                        flex: '1',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#0056b3';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#007bff';
                      }}
                    >
                      🔍 Ver Detalhes
                    </Link>
                    
                    {isTeacher && (
                      <>
                        <button
                          onClick={() => handleEditCourse(course)}
                          style={{
                            backgroundColor: '#ffc107',
                            color: '#212529',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#e0a800';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ffc107';
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
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
                          🗑️ Excluir
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 