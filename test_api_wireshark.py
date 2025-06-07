#!/usr/bin/env python3
"""
Script para testar APIs do Sistema Escolar
Desenvolvido para captura de tráfego no Wireshark

Execute o Wireshark antes de rodar este script:
1. Abra o Wireshark
2. Capture na interface de loopback (lo ou Loopback)
3. Use o filtro: tcp.port == 8000
4. Execute este script: python test_api_wireshark.py
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configurações
BASE_URL = "http://127.0.0.1:8000/api"
DELAY_BETWEEN_REQUESTS = 3  # segundos entre cada requisição

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.user_data = None
        
    def log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def wait(self, seconds=None):
        delay = seconds or DELAY_BETWEEN_REQUESTS
        self.log(f"⏳ Aguardando {delay} segundos para próxima requisição...")
        time.sleep(delay)
        
    def print_request_info(self, method, url, response, payload_size=0):
        self.log("="*60)
        self.log(f"🌐 {method} {url}")
        self.log(f"📤 Request Size: {payload_size} bytes")
        self.log(f"📥 Response Size: {len(response.content)} bytes")
        self.log(f"📊 Status Code: {response.status_code}")
        self.log(f"🔗 Headers: {dict(response.headers)}")
        if hasattr(response, 'request') and response.request.headers:
            self.log(f"📤 Request Headers: {dict(response.request.headers)}")
        self.log("="*60)
        
    def test_1_login_jwt(self):
        """1. Login JWT - POST /api/token/"""
        self.log("🔐 TESTE 1: Login JWT")
        
        url = f"{BASE_URL}/token/"
        payload = {
            "username": "aluno_teste",
            "password": "senha123"
        }
        
        payload_json = json.dumps(payload)
        payload_size = len(payload_json.encode('utf-8'))
        
        try:
            response = self.session.post(
                url, 
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            self.print_request_info("POST", url, response, payload_size)
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access')
                self.session.headers.update({'Authorization': f'Bearer {self.token}'})
                self.log("✅ Login realizado com sucesso!")
                self.log(f"🎫 Token obtido: {self.token[:50]}...")
            else:
                self.log(f"❌ Erro no login: {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            return False
            
        return True
        
    def test_2_user_me(self):
        """2. Dados do usuário logado - GET /api/users/me/"""
        self.log("👤 TESTE 2: Dados do usuário logado")
        
        url = f"{BASE_URL}/users/me/"
        
        try:
            response = self.session.get(url)
            self.print_request_info("GET", url, response)
            
            if response.status_code == 200:
                self.user_data = response.json()
                self.log("✅ Dados do usuário obtidos com sucesso!")
                self.log(f"👤 Usuário: {self.user_data.get('username')}")
                self.log(f"📧 Email: {self.user_data.get('email', 'N/A')}")
                self.log(f"👥 Grupos: {[g['name'] for g in self.user_data.get('groups', [])]}")
            else:
                self.log(f"❌ Erro ao obter dados do usuário: {response.text}")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def test_3_list_users(self):
        """3. Listar todos usuários - GET /api/users/"""
        self.log("👥 TESTE 3: Listar todos os usuários")
        
        url = f"{BASE_URL}/users/"
        
        try:
            response = self.session.get(url)
            self.print_request_info("GET", url, response)
            
            if response.status_code == 200:
                users = response.json()
                self.log(f"✅ Lista de usuários obtida: {len(users)} usuários")
                for user in users[:3]:  # Mostra apenas os 3 primeiros
                    self.log(f"   - {user.get('username')} ({user.get('email', 'N/A')})")
            else:
                self.log(f"⚠️ Erro ao listar usuários: {response.text}")
                self.log("   (Normal se usuário não for admin)")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def test_4_list_courses(self):
        """4. Listar cursos - GET /api/courses/"""
        self.log("📚 TESTE 4: Listar cursos")
        
        url = f"{BASE_URL}/courses/"
        
        try:
            response = self.session.get(url)
            self.print_request_info("GET", url, response)
            
            if response.status_code == 200:
                courses = response.json()
                self.log(f"✅ Lista de cursos obtida: {len(courses)} cursos")
                self.courses = courses
                for course in courses[:3]:  # Mostra apenas os 3 primeiros
                    self.log(f"   - {course.get('name')} (ID: {course.get('id')})")
            else:
                self.log(f"❌ Erro ao listar cursos: {response.text}")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def test_5_course_detail(self):
        """5. Detalhe de curso - GET /api/courses/{id}/"""
        self.log("📖 TESTE 5: Detalhe de curso")
        
        if not hasattr(self, 'courses') or not self.courses:
            self.log("⚠️ Nenhum curso disponível para testar")
            return
            
        course_id = self.courses[0]['id']
        url = f"{BASE_URL}/courses/{course_id}/"
        
        try:
            response = self.session.get(url)
            self.print_request_info("GET", url, response)
            
            if response.status_code == 200:
                course = response.json()
                self.log(f"✅ Detalhes do curso obtidos: {course.get('name')}")
                self.log(f"   📄 Materiais: {len(course.get('materials', []))}")
                self.log(f"   📝 Quizzes: {len(course.get('quizzes', []))}")
                self.course_detail = course
            else:
                self.log(f"❌ Erro ao obter detalhes do curso: {response.text}")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def test_6_download_material(self):
        """6. Download de material - GET /api/materials/{id}/download/"""
        self.log("📄 TESTE 6: Download de material")
        
        if not hasattr(self, 'course_detail') or not self.course_detail:
            self.log("⚠️ Nenhum curso carregado para testar materiais")
            return
            
        materials = self.course_detail.get('materials', [])
        if not materials:
            self.log("⚠️ Nenhum material disponível para download")
            return
            
        material_id = materials[0]['id']
        url = f"{BASE_URL}/materials/{material_id}/download/"
        
        try:
            response = self.session.get(url)
            self.print_request_info("GET", url, response)
            
            if response.status_code == 200:
                self.log(f"✅ Material baixado com sucesso!")
                self.log(f"   📦 Tamanho do arquivo: {len(response.content)} bytes")
                self.log(f"   📄 Content-Type: {response.headers.get('content-type', 'N/A')}")
            else:
                self.log(f"❌ Erro ao baixar material: {response.text}")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def test_7_load_quiz(self):
        """7. Carregar quiz - GET /api/quizzes/{id}/"""
        self.log("📝 TESTE 7: Carregar quiz")
        
        if not hasattr(self, 'course_detail') or not self.course_detail:
            self.log("⚠️ Nenhum curso carregado para testar quizzes")
            return
            
        quizzes = self.course_detail.get('quizzes', [])
        if not quizzes:
            self.log("⚠️ Nenhum quiz disponível para carregar")
            return
            
        quiz_id = quizzes[0]['id']
        url = f"{BASE_URL}/quizzes/{quiz_id}/"
        
        try:
            response = self.session.get(url)
            self.print_request_info("GET", url, response)
            
            if response.status_code == 200:
                quiz = response.json()
                self.log(f"✅ Quiz carregado: {quiz.get('title')}")
                self.log(f"   ❓ Questões: {len(quiz.get('questions', []))}")
                self.quiz = quiz
            else:
                self.log(f"❌ Erro ao carregar quiz: {response.text}")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def test_8_submit_quiz(self):
        """8. Submissão de quiz - POST /api/submissions/"""
        self.log("📤 TESTE 8: Submissão de quiz")
        
        if not hasattr(self, 'quiz') or not self.quiz:
            self.log("⚠️ Nenhum quiz carregado para submeter")
            return
            
        questions = self.quiz.get('questions', [])
        if not questions:
            self.log("⚠️ Quiz sem questões para submeter")
            return
            
        # Criar respostas fictícias (sempre opção A)
        answers = {}
        for question in questions:
            answers[str(question['id'])] = 'A'
            
        payload = {
            "quiz": self.quiz['id'],
            "answers": answers
        }
        
        url = f"{BASE_URL}/submissions/"
        payload_json = json.dumps(payload)
        payload_size = len(payload_json.encode('utf-8'))
        
        try:
            response = self.session.post(
                url,
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            
            self.print_request_info("POST", url, response, payload_size)
            
            if response.status_code in [200, 201]:
                submission = response.json()
                self.log(f"✅ Quiz submetido com sucesso!")
                self.log(f"   📊 Pontuação: {submission.get('score', 'N/A')}")
                self.log(f"   ✅ Acertos: {submission.get('correct_answers', 'N/A')}/{submission.get('total_questions', 'N/A')}")
            else:
                self.log(f"❌ Erro ao submeter quiz: {response.text}")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def run_all_tests(self):
        """Executa todos os testes em sequência"""
        self.log("🚀 INICIANDO TESTES DE API PARA WIRESHARK")
        self.log("📡 Certifique-se de que o Wireshark está capturando na interface de loopback")
        self.log("🔍 Use o filtro: tcp.port == 8000")
        self.log("")
        
        # Aguarda o usuário estar pronto
        input("Pressione ENTER quando estiver pronto para começar...")
        
        tests = [
            self.test_1_login_jwt,
            self.test_2_user_me,
            self.test_3_list_users,
            self.test_4_list_courses,
            self.test_5_course_detail,
            self.test_6_download_material,
            self.test_7_load_quiz,
            self.test_8_submit_quiz
        ]
        
        for i, test in enumerate(tests, 1):
            try:
                test()
                if i < len(tests):  # Não espera após o último teste
                    self.wait()
            except KeyboardInterrupt:
                self.log("⚠️ Teste interrompido pelo usuário")
                break
            except Exception as e:
                self.log(f"❌ Erro inesperado no teste {i}: {e}")
                
        self.log("")
        self.log("🏁 TESTES CONCLUÍDOS!")
        self.log("📊 Verifique os dados capturados no Wireshark")
        self.log("🔍 Analise os protocolos TCP/HTTP, tamanhos de payload e headers")

def main():
    print("="*80)
    print("🌐 TESTE DE APIs - SISTEMA ESCOLAR")
    print("📡 Script para captura de tráfego no Wireshark")
    print("="*80)
    print()
    
    # Verificar se o servidor está rodando
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        print("✅ Servidor Django detectado e funcionando")
    except requests.exceptions.RequestException:
        print("❌ ERRO: Servidor Django não está rodando!")
        print("   Execute: cd my_school && python manage.py runserver")
        sys.exit(1)
    
    print()
    print("📋 INSTRUÇÕES PARA WIRESHARK:")
    print("1. Abra o Wireshark")
    print("2. Selecione a interface 'Loopback: lo' ou 'Adapter for loopback traffic capture'")
    print("3. Clique em 'Start capturing packets'")
    print("4. Use o filtro: tcp.port == 8000")
    print("5. Execute este script")
    print()
    
    tester = APITester()
    tester.run_all_tests()

if __name__ == "__main__":
    main() 