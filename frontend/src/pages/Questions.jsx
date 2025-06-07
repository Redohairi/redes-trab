import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useUserRole } from '../hooks/useUserRole';
import Layout from '../components/Layout';

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  const { isTeacher, loading: roleLoading } = useUserRole();

  useEffect(() => {
    console.log('🚀 Questions montado, buscando todas as questões...');
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      console.log('📡 Fazendo requisição para questions/ (todas as questões)');
      const response = await api.get('questions/');
      console.log('✅ Questões recebidas:', response.data);
      setQuestions(response.data);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar questões:', err);
      setError(err.response?.data?.detail || 'Erro ao carregar questões');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta questão? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await api.delete(`questions/${questionId}/`);
      alert('Questão excluída com sucesso!');
      fetchQuestions(); // Recarregar lista
    } catch (err) {
      console.error('❌ Erro ao excluir questão:', err);
      alert('Erro ao excluir questão: ' + (err.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question.id);
    setEditForm({
      text: question.text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_option: question.correct_option
    });
  };

  const handleSaveEdit = async (questionId) => {
    try {
      await api.patch(`questions/${questionId}/`, editForm);
      alert('Questão atualizada com sucesso!');
      setEditingQuestion(null);
      setEditForm({});
      fetchQuestions(); // Recarregar lista
    } catch (err) {
      console.error('❌ Erro ao atualizar questão:', err);
      alert('Erro ao atualizar questão: ' + (err.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setEditForm({});
  };

  if (loading || roleLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Carregando questões...</p>
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
        
        <h1 style={{ color: '#333', marginBottom: '30px' }}>
          ❓ Todas as Questões ({questions.length})
        </h1>

        {isTeacher && (
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #ffeaa7',
            marginBottom: '20px'
          }}>
            <strong>👨‍🏫 Modo Professor:</strong> Você pode editar e excluir questões.
          </div>
        )}

        {questions.length > 0 ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {questions.map((question, index) => (
              <div 
                key={question.id}
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
                {editingQuestion === question.id ? (
                  // Formulário de edição
                  <div>
                    <h3 style={{ 
                      color: '#333',
                      marginTop: 0,
                      marginBottom: '20px'
                    }}>
                      ✏️ Editando Questão {index + 1}
                    </h3>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Texto da Questão:
                      </label>
                      <textarea
                        value={editForm.text || ''}
                        onChange={(e) => setEditForm({...editForm, text: e.target.value})}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    
                    {['A', 'B', 'C', 'D'].map(option => (
                      <div key={option} style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Opção {option}:
                        </label>
                        <input
                          type="text"
                          value={editForm[`option_${option.toLowerCase()}`] || ''}
                          onChange={(e) => setEditForm({
                            ...editForm, 
                            [`option_${option.toLowerCase()}`]: e.target.value
                          })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                    ))}
                    
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Resposta Correta:
                      </label>
                      <select
                        value={editForm.correct_answer || ''}
                        onChange={(e) => setEditForm({...editForm, correct_answer: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="">Selecione a resposta correta</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleSaveEdit(question.id)}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
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
                          padding: '10px 20px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Visualização normal
                  <>
                    {/* Header da Questão */}
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '20px'
                    }}>
                      <h3 style={{ 
                        color: '#333',
                        margin: 0,
                        fontSize: '1.2em',
                        flex: 1
                      }}>
                        ❓ Questão {index + 1}
                      </h3>
                      
                      {isTeacher && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEditQuestion(question)}
                            style={{
                              backgroundColor: '#ffc107',
                              color: '#212529',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Texto da Questão */}
                    <div style={{ 
                      backgroundColor: '#f8f9fa',
                      padding: '20px',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef',
                      marginBottom: '20px'
                    }}>
                      <p style={{ 
                        margin: 0,
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: '#333'
                      }}>
                        {question.text}
                      </p>
                    </div>

                    {/* Opções de Resposta */}
                    <div style={{ 
                      display: 'grid',
                      gap: '10px',
                      marginBottom: '20px'
                    }}>
                      {['A', 'B', 'C', 'D'].map(option => {
                        const isCorrect = question.correct_answer === option;
                        return (
                          <div 
                            key={option}
                            style={{
                              padding: '12px 16px',
                              backgroundColor: isCorrect ? '#d4edda' : '#f8f9fa',
                              border: `1px solid ${isCorrect ? '#c3e6cb' : '#e9ecef'}`,
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <span style={{ 
                              marginRight: '12px',
                              fontSize: '16px'
                            }}>
                              {isCorrect ? '✅' : '⚪'}
                            </span>
                            <span style={{ 
                              fontWeight: isCorrect ? 'bold' : 'normal',
                              color: isCorrect ? '#155724' : '#333',
                              fontSize: '14px'
                            }}>
                              <strong>{option})</strong> {question[`option_${option.toLowerCase()}`]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Informações Adicionais */}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '15px',
                      marginBottom: '15px'
                    }}>
                      <div style={{ 
                        backgroundColor: '#e3f2fd',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #bbdefb'
                      }}>
                        <p style={{ 
                          margin: '0',
                          color: '#1976d2',
                          fontSize: '14px'
                        }}>
                          <strong>✅ Resposta Correta:</strong> {question.correct_answer}
                        </p>
                      </div>
                      
                      <div style={{ 
                        backgroundColor: '#f3e5f5',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #ce93d8'
                      }}>
                        <p style={{ 
                          margin: '0',
                          color: '#7b1fa2',
                          fontSize: '14px'
                        }}>
                          <strong>📝 Quiz:</strong> {question.quiz_title || `ID: ${question.quiz}`}
                        </p>
                      </div>
                    </div>

                    {/* ID da Questão */}
                    <div style={{ 
                      fontSize: '12px',
                      color: '#999'
                    }}>
                      🔢 ID da Questão: {question.id}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: '#fff',
            padding: '40px',
            textAlign: 'center',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
            <h3 style={{ color: '#666', marginBottom: '10px' }}>
              Nenhuma questão encontrada
            </h3>
            <p style={{ color: '#999', marginBottom: '20px' }}>
              Ainda não há questões cadastradas no sistema.
            </p>
            <Link 
              to="/courses"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold'
              }}
            >
              📚 Ver Cursos
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
} 