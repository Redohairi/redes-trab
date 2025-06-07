import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Layout from '../components/Layout';

export default function Users() {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'by-group'

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🔄 Carregando dados de usuários e grupos...');
        const [grpRes, usrRes] = await Promise.all([
          api.get('groups/'),
          api.get('users/')
        ]);
        console.log('✅ Grupos carregados:', grpRes.data);
        console.log('✅ Usuários carregados:', usrRes.data);
        setGroups(grpRes.data);
        setUsers(usrRes.data);
      } catch (err) {
        console.error('❌ Erro ao carregar dados:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Função para formatar o nome completo
  const getFullName = (user) => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    console.log(`👤 Nome do usuário ${user.username}: "${fullName}" (first: "${firstName}", last: "${lastName}")`);
    return fullName || user.username;
  };

  // Função para obter usuários por grupo
  const getUsersByGroup = (groupName) => {
    return users.filter(user => 
      user.groups?.some(group => group.name === groupName)
    );
  };

  // Função para obter usuários sem grupo
  const getUsersWithoutGroup = () => {
    return users.filter(user => !user.groups || user.groups.length === 0);
  };

  const assignRole = async (userId, role) => {
    try {
      console.log(`🔄 Atribuindo role ${role} ao usuário ${userId}`);
      await api.post(`users/${userId}/assign_role/`, { role });
      alert(`Role ${role} atribuída com sucesso!`);
      
      // Recarregar dados
      const usersResponse = await api.get('users/');
      setUsers(usersResponse.data);
    } catch (err) {
      console.error('❌ Erro ao atribuir role:', err);
      alert('Erro ao atribuir role: ' + (err.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  const removeFromGroup = async (userId, groupName) => {
    try {
      console.log(`🔄 Removendo usuário ${userId} do grupo ${groupName}`);
      await api.post(`users/${userId}/remove_from_group/`, { group_name: groupName });
      alert(`Usuário removido do grupo ${groupName} com sucesso!`);
      
      // Recarregar dados
      const usersResponse = await api.get('users/');
      setUsers(usersResponse.data);
    } catch (err) {
      console.error('❌ Erro ao remover do grupo:', err);
      alert('Erro ao remover do grupo: ' + (err.response?.data?.detail || 'Erro desconhecido'));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Carregando usuários e grupos...</p>
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
          👥 Gerenciamento de Usuários ({users.length})
        </h1>

        {/* Controles de Visualização */}
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔍 Modo de Visualização</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setViewMode('all')}
              style={{
                backgroundColor: viewMode === 'all' ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              👤 Todos os Usuários
            </button>
            <button
              onClick={() => setViewMode('by-group')}
              style={{
                backgroundColor: viewMode === 'by-group' ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📊 Por Grupos
            </button>
          </div>
        </div>
        
        {/* Seção de Grupos - Visão Geral */}
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '15px' }}>
            📊 Resumo dos Grupos ({groups.length})
          </h2>
          {groups.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {groups.map(group => {
                const groupUsers = getUsersByGroup(group.name);
                return (
                  <div 
                    key={group.id} 
                    style={{ 
                      padding: '15px', 
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                      {group.name === 'aluno' ? '👨‍🎓' : '👨‍🏫'} {group.name}
                    </h4>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>ID:</strong> {group.id}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Usuários:</strong> {groupUsers.length}
                    </p>
                    {groupUsers.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <strong style={{ color: '#333' }}>Membros:</strong>
                        <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                          {groupUsers.slice(0, 3).map(user => (
                            <li key={user.id} style={{ color: '#666', fontSize: '14px' }}>
                              {getFullName(user)}
                            </li>
                          ))}
                          {groupUsers.length > 3 && (
                            <li style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
                              ... e mais {groupUsers.length - 3} usuários
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Card para usuários sem grupo */}
              {(() => {
                const usersWithoutGroup = getUsersWithoutGroup();
                return usersWithoutGroup.length > 0 && (
                  <div style={{ 
                    padding: '15px', 
                    border: '1px solid #ffc107',
                    borderRadius: '6px',
                    backgroundColor: '#fff3cd'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>
                      ⚠️ Sem Grupo
                    </h4>
                    <p style={{ margin: '5px 0', color: '#856404' }}>
                      <strong>Usuários:</strong> {usersWithoutGroup.length}
                    </p>
                    <div style={{ marginTop: '10px' }}>
                      <strong style={{ color: '#856404' }}>Usuários:</strong>
                      <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                        {usersWithoutGroup.slice(0, 3).map(user => (
                          <li key={user.id} style={{ color: '#856404', fontSize: '14px' }}>
                            {getFullName(user)}
                          </li>
                        ))}
                        {usersWithoutGroup.length > 3 && (
                          <li style={{ color: '#856404', fontSize: '12px', fontStyle: 'italic' }}>
                            ... e mais {usersWithoutGroup.length - 3} usuários
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <p style={{ color: '#666' }}>Nenhum grupo encontrado.</p>
          )}
        </div>

        {/* Conteúdo baseado no modo de visualização */}
        {viewMode === 'all' ? (
          // Visualização: Todos os Usuários
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>
              👤 Todos os Usuários ({users.length})
            </h2>
            {users.length > 0 ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {users.map(user => (
                  <div 
                    key={user.id} 
                    style={{ 
                      padding: '15px', 
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                          👤 {getFullName(user)}
                        </h4>
                        <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                          <strong>Username:</strong> {user.username}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                          <strong>Email:</strong> {user.email || 'Não informado'}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                          <strong>ID:</strong> {user.id}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                          <strong>Staff:</strong> {user.is_staff ? '✅ Sim' : '❌ Não'}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                          <strong>Superuser:</strong> {user.is_superuser ? '✅ Sim' : '❌ Não'}
                        </p>
                        <div style={{ marginTop: '10px' }}>
                          <strong style={{ color: '#333', fontSize: '14px' }}>Grupos:</strong>
                          {user.groups && user.groups.length > 0 ? (
                            <div style={{ marginTop: '5px' }}>
                              {user.groups.map(group => (
                                <span 
                                  key={group.id}
                                  style={{
                                    display: 'inline-block',
                                    backgroundColor: group.name === 'aluno' ? '#28a745' : '#dc3545',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    marginRight: '5px',
                                    marginTop: '5px'
                                  }}
                                >
                                  {group.name === 'aluno' ? '👨‍🎓' : '👨‍🏫'} {group.name}
                                  <button
                                    onClick={() => removeFromGroup(user.id, group.name)}
                                    style={{
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      color: 'white',
                                      marginLeft: '5px',
                                      cursor: 'pointer',
                                      fontSize: '10px'
                                    }}
                                    title={`Remover do grupo ${group.name}`}
                                  >
                                    ❌
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#ffc107', fontSize: '14px', marginLeft: '5px' }}>
                              ⚠️ Nenhum grupo
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button
                          onClick={() => assignRole(user.id, 'aluno')}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          👨‍🎓 Aluno
                        </button>
                        <button
                          onClick={() => assignRole(user.id, 'professor')}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          👨‍🏫 Professor
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666' }}>Nenhum usuário encontrado.</p>
            )}
          </div>
        ) : (
          // Visualização: Por Grupos
          <div>
            {groups.map(group => {
              const groupUsers = getUsersByGroup(group.name);
              return (
                <div 
                  key={group.id}
                  style={{ 
                    backgroundColor: '#fff', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <h2 style={{ color: '#333', marginBottom: '15px' }}>
                    {group.name === 'aluno' ? '👨‍🎓' : '👨‍🏫'} Grupo: {group.name} ({groupUsers.length} usuários)
                  </h2>
                  {groupUsers.length > 0 ? (
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {groupUsers.map(user => (
                        <div 
                          key={user.id} 
                          style={{ 
                            padding: '15px', 
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            backgroundColor: '#f8f9fa'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                                👤 {getFullName(user)}
                              </h4>
                              <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                <strong>Username:</strong> {user.username}
                              </p>
                              <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                <strong>Email:</strong> {user.email || 'Não informado'}
                              </p>
                              <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                <strong>ID:</strong> {user.id}
                              </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <button
                                onClick={() => removeFromGroup(user.id, group.name)}
                                style={{
                                  backgroundColor: '#ffc107',
                                  color: '#212529',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                🚫 Remover
                              </button>
                              <button
                                onClick={() => assignRole(user.id, group.name === 'aluno' ? 'professor' : 'aluno')}
                                style={{
                                  backgroundColor: group.name === 'aluno' ? '#dc3545' : '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                {group.name === 'aluno' ? '👨‍🏫 → Prof' : '👨‍🎓 → Aluno'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#666' }}>Nenhum usuário neste grupo.</p>
                  )}
                </div>
              );
            })}
            
            {/* Seção para usuários sem grupo */}
            {(() => {
              const usersWithoutGroup = getUsersWithoutGroup();
              return usersWithoutGroup.length > 0 && (
                <div style={{ 
                  backgroundColor: '#fff3cd', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  border: '1px solid #ffc107'
                }}>
                  <h2 style={{ color: '#856404', marginBottom: '15px' }}>
                    ⚠️ Usuários sem Grupo ({usersWithoutGroup.length})
                  </h2>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {usersWithoutGroup.map(user => (
                      <div 
                        key={user.id} 
                        style={{ 
                          padding: '15px', 
                          border: '1px solid #ffc107',
                          borderRadius: '6px',
                          backgroundColor: '#fffbf0'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>
                              👤 {getFullName(user)}
                            </h4>
                            <p style={{ margin: '5px 0', color: '#856404', fontSize: '14px' }}>
                              <strong>Username:</strong> {user.username}
                            </p>
                            <p style={{ margin: '5px 0', color: '#856404', fontSize: '14px' }}>
                              <strong>Email:</strong> {user.email || 'Não informado'}
                            </p>
                            <p style={{ margin: '5px 0', color: '#856404', fontSize: '14px' }}>
                              <strong>ID:</strong> {user.id}
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <button
                              onClick={() => assignRole(user.id, 'aluno')}
                              style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              👨‍🎓 Aluno
                            </button>
                            <button
                              onClick={() => assignRole(user.id, 'professor')}
                              style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              👨‍🏫 Professor
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </Layout>
  );
} 