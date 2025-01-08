from django.contrib import admin
from .models import User, UserDetail, Friend, Post, Like, Comment

admin.site.register(User)
admin.site.register(UserDetail)
admin.site.register(Friend)
admin.site.register(Post)
admin.site.register(Like)
admin.site.register(Comment)
