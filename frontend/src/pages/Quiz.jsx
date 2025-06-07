import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Layout from '../components/Layout';

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🚀 Quiz montado, buscando quiz ID:', id);
    
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        console.log('📡 Fazendo requisição para quizzes/' + id + '/');
        const response = await api.get(`quizzes/${id}/`);
        console.log('✅ Quiz recebido:', response.data);
        setQuiz(response.data);
        setError(null);
      } catch (err) {
        console.error('❌ Erro ao buscar quiz:', err);
        setError(err.response?.data?.detail || 'Erro ao carregar quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

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

  // Função para calcular progresso
  const getProgress = () => {
    if (!quiz?.questions) return 0;
    const answered = Object.keys(answers).length;
    const total = quiz.questions.length;
    return Math.round((answered / total) * 100);
  };

  function handleChange(qid, option) {
    console.log(`📝 Resposta alterada - Questão ${qid}: ${option}`);
    setAnswers(prev => ({ ...prev, [qid]: option }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    console.log('📤 Enviando respostas:', answers);
    
    // Verificar se todas as questões foram respondidas
    const totalQuestions = quiz.questions?.length || 0;
    const answeredQuestions = Object.keys(answers).length;
    
    if (answeredQuestions < totalQuestions) {
      alert(`Por favor, responda todas as ${totalQuestions} questões antes de enviar. Você respondeu ${answeredQuestions} de ${totalQuestions}.`);
      return;
    }
    
    try {
      setSubmitting(true);
      await api.post('submissions/', { quiz: id, answers });
      console.log('✅ Quiz enviado com sucesso!');
      alert('Quiz enviado com sucesso! Redirecionando para a página de submissões...');
      navigate('/submissions');
    } catch (error) {
      console.error('❌ Erro ao enviar quiz:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);
      alert('Erro ao enviar: ' + (error.response?.data?.detail || 'Erro desconhecido'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Carregando quiz...</p>
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

  if (!quiz) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>❌ Quiz não encontrado</h1>
        <Link to="/courses" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Voltar para cursos
        </Link>
      </div>
    );
  }

  const progress = getProgress();
  const totalQuestions = quiz.questions?.length || 0;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <Layout>
      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
        <Link 
          to={`/courses/${quiz.course}`}
          style={{ 
            color: '#007bff', 
            textDecoration: 'none',
            marginBottom: '20px',
            display: 'inline-block'
          }}
        >
          ← Voltar para o curso
        </Link>
        
        {/* Header do Quiz */}
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
            fontSize: '2em'
          }}>
            📝 {quiz.title}
          </h1>
          
          {/* Informações do Quiz */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                <strong>👨‍🏫 Criado por:</strong> {getFullName(quiz.owner)}
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
                <strong>📅 Criado em:</strong> {formatDate(quiz.created_at)}
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
                <strong>❓ Total de questões:</strong> {totalQuestions}
              </p>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: '#333'
              }}>
                📊 Progresso: {answeredQuestions}/{totalQuestions} questões
              </span>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: progress === 100 ? '#28a745' : '#007bff'
              }}>
                {progress}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: progress === 100 ? '#28a745' : '#007bff',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          {/* Descrição do Quiz */}
          {quiz.description && (
            <div style={{ 
              backgroundColor: '#e3f2fd',
              padding: '15px',
              borderRadius: '6px',
              border: '1px solid #bbdefb'
            }}>
              <p style={{ 
                margin: '0',
                color: '#1976d2',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                <strong>📋 Descrição:</strong> {quiz.description}
              </p>
            </div>
          )}
        </div>

        {/* Formulário do Quiz */}
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid',
            gap: '25px'
          }}>
            {quiz.questions?.map((question, index) => (
              <div 
                key={question.id}
                style={{ 
                  backgroundColor: '#fff',
                  padding: '25px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: answers[question.id] ? '2px solid #28a745' : '1px solid #e0e0e0',
                  transition: 'border-color 0.2s ease'
                }}
              >
                {/* Cabeçalho da Questão */}
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <h3 style={{ 
                    color: '#333',
                    margin: 0,
                    fontSize: '1.1em',
                    flex: 1
                  }}>
                    {index + 1}. {question.text}
                  </h3>
                  {answers[question.id] && (
                    <span style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginLeft: '10px'
                    }}>
                      ✅ Respondida
                    </span>
                  )}
                </div>

                {/* Opções de Resposta */}
                <div style={{ 
                  display: 'grid',
                  gap: '10px'
                }}>
                  {['A', 'B', 'C', 'D'].map(option => (
                    <label 
                      key={option}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: answers[question.id] === option ? '#e8f5e8' : '#f8f9fa',
                        border: answers[question.id] === option ? '2px solid #28a745' : '1px solid #e9ecef',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (answers[question.id] !== option) {
                          e.currentTarget.style.backgroundColor = '#e3f2fd';
                          e.currentTarget.style.borderColor = '#bbdefb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (answers[question.id] !== option) {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.borderColor = '#e9ecef';
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleChange(question.id, option)}
                        style={{ 
                          marginRight: '12px',
                          transform: 'scale(1.2)'
                        }}
                      />
                      <span style={{ 
                        fontWeight: answers[question.id] === option ? 'bold' : 'normal',
                        color: answers[question.id] === option ? '#28a745' : '#333',
                        fontSize: '14px'
                      }}>
                        <strong>{option})</strong> {question[`option_${option.toLowerCase()}`]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Envio */}
          <div style={{ 
            marginTop: '40px',
            padding: '25px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            textAlign: 'center'
          }}>
            {progress < 100 && (
              <div style={{ 
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ffeaa7',
                marginBottom: '20px'
              }}>
                ⚠️ Você ainda tem {totalQuestions - answeredQuestions} questão(ões) para responder.
              </div>
            )}
            
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: submitting ? '#6c757d' : (progress === 100 ? '#28a745' : '#ffc107'),
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                minWidth: '200px'
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  if (progress === 100) {
                    e.target.style.backgroundColor = '#218838';
                  } else {
                    e.target.style.backgroundColor = '#e0a800';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  if (progress === 100) {
                    e.target.style.backgroundColor = '#28a745';
                  } else {
                    e.target.style.backgroundColor = '#ffc107';
                  }
                }
              }}
            >
              {submitting ? '📤 Enviando...' : (progress === 100 ? '🚀 Enviar Quiz' : '⚠️ Responder Todas as Questões')}
            </button>
            
            <div style={{ 
              marginTop: '15px',
              fontSize: '14px',
              color: '#666'
            }}>
              {progress === 100 ? (
                '✅ Todas as questões foram respondidas! Você pode enviar o quiz.'
              ) : (
                `📝 Complete todas as ${totalQuestions} questões antes de enviar.`
              )}
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
} 