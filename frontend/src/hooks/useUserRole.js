import { useState, useEffect } from 'react';
import api from '../api';

export function useUserRole() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('access');
        
        if (!token) {
          setLoading(false);
          return;
        }

        try {
          const response = await api.get('users/me/');
          const userData = response.data;
          setUserInfo(userData);
          
          // Verificar se é professor
          const hasTeacherGroup = userData?.groups?.some(group => group.name === 'professor');
          const isStaff = userData?.is_staff;
          const isSuperuser = userData?.is_superuser;
          
          const teacherStatus = hasTeacherGroup || isStaff || isSuperuser;
          setIsTeacher(teacherStatus);
          
          // Verificar se é aluno
          const hasStudentGroup = userData?.groups?.some(group => group.name === 'aluno');
          setIsStudent(hasStudentGroup && !teacherStatus); // Aluno apenas se não for professor
          
        } catch (apiError) {
          console.error('❌ Erro ao buscar dados do usuário:', apiError);
        }
      } catch (err) {
        console.error('❌ Erro geral no useUserRole:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return {
    userInfo,
    loading,
    isTeacher,
    isStudent
  };
} 