import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

// Interceptor para adicionar o token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    console.log('🔑 Token encontrado:', token ? 'SIM' : 'NÃO');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 Enviando requisição com token:', config.method.toUpperCase(), config.url);
    } else {
      console.log('⚠️ Nenhum token encontrado para:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para log de respostas
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', error.response?.status, error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

export default api; 