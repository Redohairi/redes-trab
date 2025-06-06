from rest_framework import permissions
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User, Group
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import UserSerializer, GroupSerializer
from .models import Course, Material, Quiz, Question, Submission
from .serializers import CourseSerializer, MaterialSerializer, QuizSerializer, QuestionSerializer, SubmissionSerializer


class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name='professor').exists()


class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name='aluno').exists()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def assign_role(self, request, pk=None):
        user = self.get_object()
        role_name = request.data.get('role')
        if not role_name or role_name not in ['aluno','professor']:
            return Response({'detail': 'role inválida'}, status=status.HTTP_400_BAD_REQUEST)
        group = Group.objects.get(name=role_name)
        user.groups.clear()
        user.groups.add(group)
        return Response({'detail': f'role {role_name} atribuída a {user.username}'})


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['teacher']

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

    def get_permissions(self):
        if self.action in ['create','update','partial_update','destroy']:
            return [IsTeacher()]
        return [permissions.IsAuthenticated()]


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['course']

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_permissions(self):
        if self.action in ['create','update','partial_update','destroy']:
            return [IsTeacher()]
        return [permissions.IsAuthenticated()]


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_permissions(self):
        if self.action in ['create','update','partial_update','destroy']:
            return [IsTeacher()]
        return [permissions.IsAuthenticated()]


class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        quiz_pk = self.kwargs.get('quiz_pk')
        if quiz_pk:
            return Question.objects.filter(quiz_id=quiz_pk)
        return Question.objects.all()

    def perform_create(self, serializer):
        quiz_pk = self.kwargs.get('quiz_pk')
        if quiz_pk:
            quiz = Quiz.objects.get(pk=quiz_pk)
            serializer.save(quiz=quiz)
        else:
            serializer.save()

    def get_permissions(self):
        if self.action in ['create','update','partial_update','destroy']:
            return [IsTeacher()]
        return [permissions.IsAuthenticated()]


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        submission = serializer.save(student=self.request.user)
        # Calcula automaticamente a pontuação após criar a submissão
        submission.calculate_score()

    def get_permissions(self):
        if self.action in ['create']:
            return [IsStudent()]
        elif self.action in ['update','partial_update','destroy']:
            return [permissions.IsAdminUser()]  # Apenas admin pode modificar submissões
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Professores e admins veem todas as submissões
        if self.request.user.groups.filter(name='professor').exists() or self.request.user.is_staff:
            return Submission.objects.all()
        # Alunos veem apenas suas próprias submissões
        return Submission.objects.filter(student=self.request.user) 