from django.contrib import admin
from .models import Profile, Course, Material, Quiz, Question, Submission

admin.site.register(Profile)
admin.site.register(Course)
admin.site.register(Material)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Submission) 