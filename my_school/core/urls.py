from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from .views import (
    UserViewSet, GroupViewSet, CourseViewSet, MaterialViewSet,
    QuizViewSet, QuestionViewSet, SubmissionViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'materials', MaterialViewSet, basename='material')
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'submissions', SubmissionViewSet, basename='submission')

quiz_router = NestedDefaultRouter(router, r'quizzes', lookup='quiz')
quiz_router.register(r'questions', QuestionViewSet, basename='quiz-questions')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/', include(quiz_router.urls)),
] 