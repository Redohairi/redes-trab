from django.db import models
from django.contrib.auth.models import User, Group
from django.core.exceptions import ValidationError


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_teacher = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {'Professor' if self.is_teacher else 'Aluno'}"


class Course(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    teacher = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        limit_choices_to={'groups__name': 'professor'}
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


class Material(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='materials/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'groups__name': 'professor'}
    )

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-uploaded_at']


class Quiz(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'groups__name': 'professor'}
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Quizzes'


class Question(models.Model):
    OPTION_CHOICES = [
        ('A', 'A'),
        ('B', 'B'),
        ('C', 'C'),
        ('D', 'D'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.CharField(max_length=500)
    option_a = models.CharField(max_length=200)
    option_b = models.CharField(max_length=200)
    option_c = models.CharField(max_length=200)
    option_d = models.CharField(max_length=200)
    correct_option = models.CharField(max_length=1, choices=OPTION_CHOICES)

    def __str__(self):
        return f"{self.quiz.title} - {self.text[:50]}..."

    def clean(self):
        if self.correct_option not in ['A', 'B', 'C', 'D']:
            raise ValidationError('A opção correta deve ser A, B, C ou D')


class Submission(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'groups__name': 'aluno'}
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    answers = models.JSONField()  # Formato: {"question_id": "selected_option"}
    score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.student.username} - {self.quiz.title}"

    class Meta:
        ordering = ['-submitted_at']
        unique_together = ['quiz', 'student']  # Um aluno só pode submeter uma vez por quiz

    def calculate_score(self):
        """Calcula a pontuação baseada nas respostas corretas"""
        if not self.answers:
            return 0.0
        
        total_questions = self.quiz.questions.count()
        if total_questions == 0:
            return 0.0
        
        correct_answers = 0
        for question in self.quiz.questions.all():
            question_id = str(question.id)
            if question_id in self.answers:
                if self.answers[question_id] == question.correct_option:
                    correct_answers += 1
        
        score = (correct_answers / total_questions) * 100
        self.score = score
        self.save()
        return score 