from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from core.models import Course, Material, Quiz, Question, Submission
from django.core.files.base import ContentFile
import random
import json

class Command(BaseCommand):
    help = 'Popula DB com dados fictícios'

    def handle(self, *args, **kwargs):
        # 1. Grupos
        aluno_group, _ = Group.objects.get_or_create(name='aluno')
        prof_group, _ = Group.objects.get_or_create(name='professor')

        # 2. Professores
        prof_users = []
        for i in range(3):
            username = f'prof{i+1}'
            if not User.objects.filter(username=username).exists():
                u = User.objects.create_user(username=username, email=f'{username}@ex.com', password='123456')
                u.groups.add(prof_group)
                prof_users.append(u)
            else:
                prof_users.append(User.objects.get(username=username))

        # 3. Alunos
        aluno_users = []
        for i in range(10):
            username = f'aluno{i+1}'
            if not User.objects.filter(username=username).exists():
                u = User.objects.create_user(username=username, email=f'{username}@ex.com', password='123456')
                u.groups.add(aluno_group)
                aluno_users.append(u)
            else:
                aluno_users.append(User.objects.get(username=username))

        # 4. Cursos
        cursos = []
        for idx, prof in enumerate(prof_users):
            c, _ = Course.objects.get_or_create(
                name=f'Curso {idx+1}',
                description=f'Descrição do Curso {idx+1}',
                teacher=prof
            )
            cursos.append(c)

        # 5. Materials
        for curso in cursos:
            for j in range(2):
                m, _ = Material.objects.get_or_create(
                    title=f'Material {j+1} - {curso.name}',
                    description=f'Descrição do material {j+1}',
                    course=curso,
                    owner=curso.teacher
                )
                # Criar um arquivo dummy
                content = ContentFile(f'Este é o conteúdo do material {j+1} do {curso.name}.'.encode('utf-8'))
                m.file.save(f'{curso.name}_material{j+1}.txt', content, save=True)

        # 6. Quizzes e Questões
        for curso in cursos:
            for qz_idx in range(2):
                quiz, _ = Quiz.objects.get_or_create(
                    title=f'Quiz {qz_idx+1} - {curso.name}',
                    description=f'Quiz de exemplo {qz_idx+1}',
                    course=curso,
                    owner=curso.teacher
                )
                # Criar perguntas
                for p_idx in range(5):
                    Question.objects.get_or_create(
                        quiz=quiz,
                        text=f'Pergunta {p_idx+1} do {quiz.title}?',
                        option_a='Opção A',
                        option_b='Opção B',
                        option_c='Opção C',
                        option_d='Opção D',
                        correct_option=random.choice(['A','B','C','D'])
                    )

        self.stdout.write(self.style.SUCCESS('Dados de teste populados com sucesso.')) 