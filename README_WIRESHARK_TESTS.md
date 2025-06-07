# 📡 Scripts de Teste para Captura no Wireshark

Este conjunto de scripts foi desenvolvido para testar as APIs do Sistema Escolar e capturar o tráfego de rede no Wireshark para análise de protocolos.

## 📋 Pré-requisitos

1. **Servidor Django rodando:**
   ```bash
   cd my_school
   python manage.py runserver
   ```

2. **Python com requests instalado:**
   ```bash
   pip install requests
   ```

3. **Wireshark instalado e configurado**

## 🔧 Configuração do Wireshark

### 1. Abrir o Wireshark
- Inicie o Wireshark como administrador (necessário para captura)

### 2. Selecionar Interface
- Escolha a interface **"Loopback: lo"** ou **"Adapter for loopback traffic capture"**
- Esta interface captura tráfego local (127.0.0.1)

### 3. Configurar Filtro
- Use o filtro: `tcp.port == 8000`
- Isso mostrará apenas o tráfego HTTP do Django

### 4. Iniciar Captura
- Clique em **"Start capturing packets"**
- O Wireshark começará a capturar todo o tráfego na porta 8000

## 📁 Scripts Disponíveis

### 1. `test_api_wireshark.py` - Teste como Aluno
**Funcionalidades testadas:**
- ✅ Login JWT (POST /api/token/)
- ✅ Dados do usuário (GET /api/users/me/)
- ✅ Listar usuários (GET /api/users/) - pode falhar se não for admin
- ✅ Listar cursos (GET /api/courses/)
- ✅ Detalhe de curso (GET /api/courses/{id}/)
- ✅ Download de material (GET /api/materials/{id}/download/)
- ✅ Carregar quiz (GET /api/quizzes/{id}/)
- ✅ Submissão de quiz (POST /api/submissions/)

**Como executar:**
```bash
python test_api_wireshark.py
```

### 2. `test_api_professor_wireshark.py` - Teste como Professor
**Funcionalidades testadas:**
- ✅ Login como professor (POST /api/token/)
- ✅ Listar todos usuários (GET /api/users/)
- ✅ Listar grupos (GET /api/groups/)
- ✅ Atribuir role (POST /api/users/{id}/assign_role/)
- ✅ Listar submissões (GET /api/submissions/)
- ✅ Listar questões (GET /api/questions/)
- ✅ Teste de DELETE (DELETE /api/submissions/{id}/)

**Como executar:**
```bash
python test_api_professor_wireshark.py
```

## 🎯 Dados Capturados

### Informações de Rede
- **IP Origem:** 127.0.0.1
- **IP Destino:** 127.0.0.1
- **Porta Origem:** Aleatória (ex: 45678)
- **Porta Destino:** 8000
- **Protocolo:** TCP/HTTP

### Métricas Coletadas
- **📤 Request Size:** Tamanho do payload enviado (bytes)
- **📥 Response Size:** Tamanho da resposta recebida (bytes)
- **📊 Status Code:** Código de resposta HTTP
- **🔗 Headers:** Cabeçalhos HTTP completos
- **⏱️ Timing:** Timestamps de cada requisição

### Tipos de Requisições
- **GET:** Buscar dados (cursos, usuários, etc.)
- **POST:** Enviar dados (login, submissões, etc.)
- **DELETE:** Excluir recursos
- **Autenticação:** Bearer Token JWT

## 📊 Análise no Wireshark

### 1. Protocolos Observados
- **TCP:** Protocolo de transporte
- **HTTP:** Protocolo de aplicação
- **TLS/SSL:** Se HTTPS estiver habilitado

### 2. Campos Importantes
- **Frame Length:** Tamanho total do pacote
- **TCP Payload:** Dados HTTP
- **HTTP Request/Response:** Métodos, URLs, headers
- **Content-Length:** Tamanho do corpo da mensagem

### 3. Filtros Úteis
```
# Apenas requisições HTTP
http

# Apenas respostas com erro
http.response.code >= 400

# Apenas POST requests
http.request.method == "POST"

# Apenas responses grandes
http.content_length > 1000

# Tráfego de autenticação
http.authorization
```

## 🔍 Exemplos de Análise

### Login JWT (POST /api/token/)
- **Request:** ~50 bytes (username/password JSON)
- **Response:** ~200-500 bytes (token JWT)
- **Headers:** Content-Type: application/json

### Lista de Cursos (GET /api/courses/)
- **Request:** ~100 bytes (headers apenas)
- **Response:** Varia (50-5000 bytes dependendo do número de cursos)
- **Headers:** Authorization: Bearer token

### Submissão de Quiz (POST /api/submissions/)
- **Request:** 200-1000 bytes (respostas JSON)
- **Response:** ~300 bytes (resultado da submissão)
- **Headers:** Content-Type: application/json

### Download de Material
- **Request:** ~100 bytes
- **Response:** Varia muito (pode ser MB para arquivos grandes)
- **Headers:** Content-Type: application/pdf, text/plain, etc.

## ⚙️ Configurações dos Scripts

### Timing
- **Delay entre requisições:** 3 segundos
- **Timeout:** 5 segundos por requisição
- **Pausa interativa:** Aguarda ENTER para começar

### Credenciais de Teste
- **Aluno:** `aluno_teste` / `senha123`
- **Professor:** `prof_teste` / `senha123`

### URLs Base
- **API Base:** `http://127.0.0.1:8000/api`
- **Servidor:** Django development server

## 🚨 Observações Importantes

1. **Dados Reais:** Os scripts usam dados reais do sistema
2. **Modificações:** Alguns testes podem modificar dados (atribuir roles)
3. **Segurança:** Tokens JWT são exibidos nos logs (cuidado em produção)
4. **Performance:** Scripts incluem delays para facilitar análise
5. **Interrupção:** Use Ctrl+C para parar os testes a qualquer momento

## 📈 Resultados Esperados

### Tráfego Típico por Teste
- **Login:** ~300-800 bytes total
- **Lista simples:** ~500-2000 bytes
- **Detalhes complexos:** ~1000-5000 bytes
- **Upload/Download:** Varia drasticamente
- **Submissão:** ~500-1500 bytes

### Protocolos Visíveis
- **TCP Handshake:** SYN, SYN-ACK, ACK
- **HTTP Request:** GET/POST com headers
- **HTTP Response:** Status + dados
- **TCP Teardown:** FIN, ACK

## 🎓 Objetivos Educacionais

Este setup permite estudar:
- **Protocolos de rede** (TCP/IP, HTTP)
- **Autenticação JWT** em APIs REST
- **Tamanhos de payload** em diferentes operações
- **Headers HTTP** e sua função
- **Códigos de status** HTTP
- **Encapsulamento** de protocolos
- **Análise de tráfego** com Wireshark

---

**📝 Nota:** Certifique-se de que o servidor Django está rodando antes de executar os scripts! 