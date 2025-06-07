#!/usr/bin/env python3
"""
Script para testar APIs do Sistema Escolar - MODO PROFESSOR
Desenvolvido para captura de tráfego no Wireshark

Este script testa endpoints específicos de professor:
- Login como professor
- Listar todos os usuários
- Gerenciar usuários
- Ver todas as submissões
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configurações
BASE_URL = "http://127.0.0.1:8000/api"
DELAY_BETWEEN_REQUESTS = 3  # segundos entre cada requisição

class ProfessorAPITester:
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
        
    def test_1_login_professor(self):
        """1. Login como Professor - POST /api/token/"""
        self.log("🔐 TESTE 1: Login como Professor")
        
        url = f"{BASE_URL}/token/"
        payload = {
            "username": "prof_teste",
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
                self.log("✅ Login como professor realizado com sucesso!")
                self.log(f"🎫 Token obtido: {self.token[:50]}...")
            else:
                self.log(f"❌ Erro no login: {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            return False
            
        return True
        
    def test_2_list_all_users(self):
        """2. Listar todos usuários (admin) - GET /api/users/"""
        self.log("👥 TESTE 2: Listar todos os usuários (como admin)")
        
        url = f"{BASE_URL}/users/"
        
        try:
            response = self.session.get(url)
            self.print_request_info("GET", url, response)
            
            if response.status_code == 200:
                users = response.json()
                self.log(f"✅ Lista completa de usuários obtida: {len(users)} usuários")
                self.users = users
                for user in users:
                    groups = [g['name'] for g in user.get('groups', [])]
                    self.log(f"   - {user.get('username')} - Grupos: {groups}")
            else:
                self.log(f"❌ Erro ao listar usuários: {response.text}")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def test_3_list_groups(self):
        """3. Listar grupos - GET /api/groups/"""
        self.log("👥 TESTE 3: Listar grupos")
        
        url = f"{BASE_URL}/groups/"
        
        try:
            response = self.session.get(url)
            self.print_request_info("GET", url, response)
            
            if response.status_code == 200:
                groups = response.json()
                self.log(f"✅ Lista de grupos obtida: {len(groups)} grupos")
                for group in groups:
                    self.log(f"   - {group.get('name')} (ID: {group.get('id')})")
            else:
                self.log(f"❌ Erro ao listar grupos: {response.text}")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def test_4_assign_role(self):
        """4. Atribuir role a usuário - POST /api/users/{id}/assign_role/"""
        self.log("🔧 TESTE 4: Atribuir role a usuário")
        
        if not hasattr(self, 'users') or not self.users:
            self.log("⚠️ Nenhum usuário disponível para testar")
            return
            
        # Encontrar um usuário que não seja o professor atual
        target_user = None
        for user in self.users:
            if user.get('username') != 'prof_teste':
                target_user = user
                break
                
        if not target_user:
            self.log("⚠️ Nenhum usuário adequado encontrado para teste")
            return
            
        user_id = target_user['id']
        url = f"{BASE_URL}/users/{user_id}/assign_role/"
        
        payload = {
            "role": "aluno"
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
                self.log(f"✅ Role atribuída com sucesso ao usuário {target_user.get('username')}")
            else:
                self.log(f"❌ Erro ao atribuir role: {response.text}")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def test_5_list_all_submissions(self):
        """5. Listar todas as submissões (professor) - GET /api/submissions/"""
        self.log("📊 TESTE 5: Listar todas as submissões (como professor)")
        
        url = f"{BASE_URL}/submissions/"
        
        try:
            response = self.session.get(url)
            self.print_request_info("GET", url, response)
            
            if response.status_code == 200:
                submissions = response.json()
                self.log(f"✅ Lista de submissões obtida: {len(submissions)} submissões")
                for submission in submissions[:5]:  # Mostra apenas as 5 primeiras
                    student = submission.get('student', {})
                    quiz_title = submission.get('quiz', {}).get('title', 'N/A')
                    score = submission.get('score', 'N/A')
                    self.log(f"   - {student.get('username', 'N/A')} - {quiz_title} - Nota: {score}")
            else:
                self.log(f"❌ Erro ao listar submissões: {response.text}")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def test_6_list_all_questions(self):
        """6. Listar todas as questões - GET /api/questions/"""
        self.log("❓ TESTE 6: Listar todas as questões")
        
        url = f"{BASE_URL}/questions/"
        
        try:
            response = self.session.get(url)
            self.print_request_info("GET", url, response)
            
            if response.status_code == 200:
                questions = response.json()
                self.log(f"✅ Lista de questões obtida: {len(questions)} questões")
                for question in questions[:3]:  # Mostra apenas as 3 primeiras
                    self.log(f"   - ID: {question.get('id')} - {question.get('text', 'N/A')[:50]}...")
            else:
                self.log(f"❌ Erro ao listar questões: {response.text}")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def test_7_delete_submission(self):
        """7. Excluir submissão (se houver) - DELETE /api/submissions/{id}/"""
        self.log("🗑️ TESTE 7: Excluir submissão (simulação)")
        
        # Este teste apenas simula a requisição sem realmente excluir
        # Para não afetar os dados do sistema
        
        url = f"{BASE_URL}/submissions/999999/"  # ID inexistente
        
        try:
            response = self.session.delete(url)
            self.print_request_info("DELETE", url, response)
            
            if response.status_code == 404:
                self.log("✅ Teste de DELETE realizado (404 esperado para ID inexistente)")
            else:
                self.log(f"📊 Status recebido: {response.status_code}")
                
        except Exception as e:
            self.log(f"❌ Erro na requisição: {e}")
            
    def run_all_tests(self):
        """Executa todos os testes em sequência"""
        self.log("🚀 INICIANDO TESTES DE API PROFESSOR PARA WIRESHARK")
        self.log("📡 Certifique-se de que o Wireshark está capturando na interface de loopback")
        self.log("🔍 Use o filtro: tcp.port == 8000")
        self.log("")
        
        # Aguarda o usuário estar pronto
        input("Pressione ENTER quando estiver pronto para começar...")
        
        tests = [
            self.test_1_login_professor,
            self.test_2_list_all_users,
            self.test_3_list_groups,
            self.test_4_assign_role,
            self.test_5_list_all_submissions,
            self.test_6_list_all_questions,
            self.test_7_delete_submission
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
        self.log("🏁 TESTES PROFESSOR CONCLUÍDOS!")
        self.log("📊 Verifique os dados capturados no Wireshark")
        self.log("🔍 Analise os protocolos TCP/HTTP, tamanhos de payload e headers")

def main():
    print("="*80)
    print("🌐 TESTE DE APIs - SISTEMA ESCOLAR (MODO PROFESSOR)")
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
    
    tester = ProfessorAPITester()
    tester.run_all_tests()

if __name__ == "__main__":
    main() 