import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useUserRole } from '../hooks/useUserRole';
import Layout from '../components/Layout';

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSubmissions, setExpandedSubmissions] = useState([]);
  
  const { isTeacher, loading: roleLoading } = useUserRole();

  useEffect(() => {
    console.log('🚀 Submissions montado, buscando submissões...');
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      console.log('📡 Fazendo requisição para submissions/');
      const response = await api.get('submissions/');
      console.log('✅ Submissões recebidas:', response.data);
      setSubmissions(response.data);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar submissões:', err);
      setError(err.response?.data?.detail || 'Erro ao carregar submissões');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta submissão? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await api.delete(`submissions/${submissionId}/`);
      alert('Submissão excluída com sucesso!');
      fetchSubmissions(); // Recarregar lista
    } catch (err) {
      console.error('❌ Erro ao excluir submissão:', err);
      alert('Erro ao excluir submissão: ' + (err.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  // Função para formatar o nome completo do estudante
  const getStudentName = (student) => {
    if (!student) return 'Estudante não definido';
    
    const firstName = student.first_name || '';
    const lastName = student.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    console.log(`👨‍🎓 Estudante ${student.username}: "${fullName}" (first: "${firstName}", last: "${lastName}")`);
    return fullName || student.username;
  };

  // Função para formatar data e hora
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Função para obter cor da pontuação
  const getScoreColor = (score) => {
    if (score === null || score === undefined) return '#6c757d';
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  // Função para obter texto da pontuação
  const getScoreText = (score) => {
    if (score === null || score === undefined) return 'Não avaliado';
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    return 'Precisa melhorar';
  };

  const toggleAnswers = (submissionId) => {
    if (expandedSubmissions.includes(submissionId)) {
      setExpandedSubmissions(expandedSubmissions.filter((id) => id !== submissionId));
    } else {
      setExpandedSubmissions([...expandedSubmissions, submissionId]);
    }
  };

  if (loading || roleLoading) {
    return (
      <Layout>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Carregando submissões...</p>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div style={{ padding: '20px' }}>
          <h1>❌ Erro</h1>
          <p>{error}</p>
          <Link to="/courses" style={{ color: '#007bff', textDecoration: 'none' }}>
            ← Voltar para cursos
          </Link>
        </div>
      </Layout>
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
          📊 {isTeacher ? 'Todas as Submissões' : 'Minhas Submissões'} ({submissions.length})
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
            <strong>👨‍🏫 Modo Professor:</strong> Você está visualizando todas as submissões de todos os alunos.
          </div>
        )}

        {submissions.length > 0 ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {submissions.map(submission => (
              <div 
                key={submission.id}
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
                {/* Header da Submissão */}
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      color: '#333',
                      margin: '0 0 10px 0',
                      fontSize: '1.3em'
                    }}>
                      📝 {submission.quiz?.title || `Quiz ID: ${submission.quiz}`}
                    </h3>
                    
                    {/* Informações do Quiz */}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '10px',
                      marginBottom: '15px'
                    }}>
                      {isTeacher && (
                        <p style={{ 
                          margin: '0',
                          color: '#555',
                          fontSize: '14px'
                        }}>
                          <strong>👤 Aluno:</strong> {getStudentName(submission.student)}
                        </p>
                      )}
                      <p style={{ 
                        margin: '0',
                        color: '#555',
                        fontSize: '14px'
                      }}>
                        <strong>📅 Enviado em:</strong> {formatDateTime(submission.submitted_at)}
                      </p>
                      <p style={{ 
                        margin: '0',
                        color: '#555',
                        fontSize: '14px'
                      }}>
                        <strong>📚 Curso:</strong> {submission.course_name}
                      </p>
                    </div>
                  </div>
                  
                  {/* Ações do Professor */}
                  {isTeacher && (
                    <button
                      onClick={() => handleDeleteSubmission(submission.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginLeft: '15px'
                      }}
                      title="Excluir submissão"
                    >
                      🗑️ Excluir
                    </button>
                  )}
                </div>

                {/* Pontuação */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div style={{ 
                    backgroundColor: getScoreColor(submission.score).bg,
                    padding: '15px',
                    borderRadius: '6px',
                    textAlign: 'center',
                    border: `1px solid ${getScoreColor(submission.score).border}`
                  }}>
                    <div style={{ 
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: getScoreColor(submission.score).text
                    }}>
                      {submission.score !== null ? `${submission.score}/100` : 'N/A'}
                    </div>
                    <div style={{ 
                      fontSize: '12px',
                      color: getScoreColor(submission.score).text,
                      fontWeight: 'bold'
                    }}>
                      PONTUAÇÃO
                    </div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#e3f2fd',
                    padding: '15px',
                    borderRadius: '6px',
                    textAlign: 'center',
                    border: '1px solid #bbdefb'
                  }}>
                    <div style={{ 
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#1976d2'
                    }}>
                      {submission.correct_answers}/{submission.total_questions}
                    </div>
                    <div style={{ 
                      fontSize: '12px',
                      color: '#1976d2',
                      fontWeight: 'bold'
                    }}>
                      ACERTOS
                    </div>
                  </div>
                </div>

                {/* Seção de Respostas */}
                <div>
                  <button
                    onClick={() => toggleAnswers(submission.id)}
                    style={{
                      backgroundColor: expandedSubmissions.includes(submission.id) ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      width: '100%',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {expandedSubmissions.includes(submission.id) ? '🔼 Ocultar Respostas' : '🔽 Ver Respostas Detalhadas'}
                  </button>

                  {expandedSubmissions.includes(submission.id) && (
                    <div style={{ 
                      marginTop: '20px',
                      padding: '20px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef'
                    }}>
                      <h4 style={{ 
                        color: '#333',
                        marginTop: 0,
                        marginBottom: '15px'
                      }}>
                        📋 Respostas Detalhadas
                      </h4>
                      
                      {submission.answers && Object.keys(submission.answers).length > 0 ? (
                        <div style={{ display: 'grid', gap: '15px' }}>
                          {Object.entries(submission.answers).map(([questionId, userAnswer], index) => {
                            const question = submission.questions?.find(q => q.id.toString() === questionId);
                            if (!question) return null;
                            
                            const isCorrect = userAnswer === question.correct_answer;
                            
                            return (
                              <div 
                                key={questionId}
                                style={{ 
                                  padding: '15px',
                                  backgroundColor: isCorrect ? '#d4edda' : '#f8d7da',
                                  borderRadius: '6px',
                                  border: `1px solid ${isCorrect ? '#c3e6cb' : '#f5c6cb'}`
                                }}
                              >
                                <h5 style={{ 
                                  margin: '0 0 10px 0',
                                  color: isCorrect ? '#155724' : '#721c24'
                                }}>
                                  {index + 1}. {question.text}
                                </h5>
                                
                                <div style={{ 
                                  display: 'grid',
                                  gap: '8px',
                                  marginBottom: '10px'
                                }}>
                                  {['A', 'B', 'C', 'D'].map(option => {
                                    const isUserAnswer = userAnswer === option;
                                    const isCorrectAnswer = question.correct_answer === option;
                                    
                                    let backgroundColor = '#fff';
                                    let borderColor = '#e9ecef';
                                    let textColor = '#333';
                                    
                                    if (isCorrectAnswer) {
                                      backgroundColor = '#d4edda';
                                      borderColor = '#c3e6cb';
                                      textColor = '#155724';
                                    } else if (isUserAnswer && !isCorrectAnswer) {
                                      backgroundColor = '#f8d7da';
                                      borderColor = '#f5c6cb';
                                      textColor = '#721c24';
                                    }
                                    
                                    return (
                                      <div 
                                        key={option}
                                        style={{
                                          padding: '8px 12px',
                                          backgroundColor,
                                          border: `1px solid ${borderColor}`,
                                          borderRadius: '4px',
                                          fontSize: '14px',
                                          color: textColor,
                                          fontWeight: (isUserAnswer || isCorrectAnswer) ? 'bold' : 'normal'
                                        }}
                                      >
                                        <span style={{ marginRight: '8px' }}>
                                          {isCorrectAnswer && '✅'}
                                          {isUserAnswer && !isCorrectAnswer && '❌'}
                                          {!isUserAnswer && !isCorrectAnswer && '⚪'}
                                        </span>
                                        <strong>{option})</strong> {question[`option_${option.toLowerCase()}`]}
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                <div style={{ 
                                  fontSize: '12px',
                                  color: isCorrect ? '#155724' : '#721c24',
                                  fontWeight: 'bold'
                                }}>
                                  {isCorrect ? 
                                    '✅ Resposta correta!' : 
                                    `❌ Resposta incorreta. Correto: ${question.correct_answer}`
                                  }
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ color: '#666', margin: 0 }}>
                          Nenhuma resposta encontrada para esta submissão.
                        </p>
                      )}
                    </div>
                  )}
                </div>
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
              {isTeacher ? 'Nenhuma submissão encontrada' : 'Você ainda não fez nenhum quiz'}
            </h3>
            <p style={{ color: '#999', marginBottom: '20px' }}>
              {isTeacher ? 
                'Ainda não há submissões de quizzes no sistema.' :
                'Que tal começar fazendo alguns quizzes dos cursos disponíveis?'
              }
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