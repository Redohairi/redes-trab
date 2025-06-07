import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import AdminNavbar from './AdminNavbar';
import api from '../api';

export default function DynamicNavbar() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('access');
        console.log('🔑 Token no localStorage:', token ? 'EXISTE' : 'NÃO EXISTE');
        
        if (!token) {
          console.log('❌ Sem token, não é possível buscar info do usuário');
          setLoading(false);
          return;
        }

        // Decodificar o token JWT para pegar o user_id
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.user_id;
          console.log('🆔 User ID do token:', userId);
          
          console.log('📡 Fazendo requisição para users/' + userId + '/');
          const response = await api.get(`users/${userId}/`);
          console.log('✅ Dados do usuário recebidos:', response.data);
          setUserInfo(response.data);
        } catch (tokenError) {
          console.error('❌ Erro ao decodificar token:', tokenError);
        }
      } catch (err) {
        console.error('❌ Erro ao buscar informações do usuário:', err);
        console.error('❌ Status:', err.response?.status);
        console.error('❌ Data:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Se estiver na página de login, não mostrar navbar
  if (location.pathname === '/login') {
    console.log('🚫 Página de login detectada, não mostrando navbar');
    return null;
  }

  // Se ainda estiver carregando, não mostrar nada
  if (loading) {
    console.log('⏳ Ainda carregando informações do usuário...');
    return null;
  }

  // Se não há informações do usuário (não logado), não mostrar navbar
  if (!userInfo) {
    console.log('❌ Nenhuma informação do usuário disponível');
    return null;
  }

  // Verifica se é admin de várias formas:
  const hasTeacherGroup = userInfo?.groups?.some(group => group.name === 'professor');
  const isStaff = userInfo?.is_staff;
  const isSuperuser = userInfo?.is_superuser;
  
  const isAdmin = hasTeacherGroup || isStaff || isSuperuser;
  
  console.log('🔧 DETALHES DA VERIFICAÇÃO DE ADMIN:');
  console.log('   - Usuário:', userInfo.username);
  console.log('   - ID:', userInfo.id);
  console.log('   - is_staff:', isStaff);
  console.log('   - is_superuser:', isSuperuser);
  console.log('   - Grupos:', userInfo.groups);
  console.log('   - hasTeacherGroup:', hasTeacherGroup);
  console.log('   - RESULTADO isAdmin:', isAdmin);
  console.log('   - Navbar que será mostrada:', isAdmin ? 'ADMIN' : 'NORMAL');

  return isAdmin ? <AdminNavbar /> : <Navbar />;
} 