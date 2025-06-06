from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import Profile, Course, Material, Quiz, Question, Submission


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'groups']


class CourseSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'description', 'teacher', 'created_at']


class MaterialSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    
    class Meta:
        model = Material
        fields = ['id', 'title', 'description', 'file', 'uploaded_at', 'course', 'owner']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option']


class QuizSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'course', 'owner', 'created_at', 'questions']


class SubmissionSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    
    class Meta:
        model = Submission
        fields = ['id', 'quiz', 'student', 'submitted_at', 'answers', 'score']
        read_only_fields = ['score'] 