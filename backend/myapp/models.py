from django.db import models

# USERS Table
class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    is_Admin = models.BooleanField(default=False)

    def __str__(self):
        return self.username

# USER_DETAIL Table
class UserDetail(models.Model):
    user = models.OneToOneField(User, primary_key=True, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100, null=False, blank=False) 
    last_name = models.CharField(max_length=100, null=False, blank=False) 
    address = models.CharField(max_length=255, null=True, blank=True) 
    DOB = models.DateField(null=False, blank=False)                   
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# FRIENDS Table
class Friend(models.Model):
    frd_id = models.AutoField(primary_key=True)
    frd_from = models.ForeignKey(User, related_name='friends_from', on_delete=models.CASCADE)  # FK from User
    frd_to = models.ForeignKey(User, related_name='friends_to', on_delete=models.CASCADE)  # FK from User

    def __str__(self):
        return f"Friendship from {self.frd_from} to {self.frd_to}"

# POSTS Table
class Post(models.Model):
    post_id = models.AutoField(primary_key=True)
    post_link = models.URLField(max_length=500)  # Link to the post content
    post_desc = models.TextField(blank=True, null=True)  # Description of the post
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE)  # FK from User

    def __str__(self):
        return self.post_desc

# LIKES Table
class Like(models.Model):
    like_id = models.AutoField(primary_key=True)
    liked_by = models.ForeignKey(User, on_delete=models.CASCADE)  # FK from User
    liked_to_post = models.ForeignKey(Post, on_delete=models.CASCADE)  # FK from Post

    def __str__(self):
        return f"Like by {self.liked_by} on post {self.liked_to_post}"

# COMMENTS Table
class Comment(models.Model):
    cmt_id = models.AutoField(primary_key=True)
    cmt_txt = models.TextField()  # Text of the comment
    cmt_by = models.ForeignKey(User, on_delete=models.CASCADE)  # FK from User
    cmt_to_post = models.ForeignKey(Post, on_delete=models.CASCADE)  # FK from Post

    def __str__(self):
        return f"Comment by {self.cmt_by} on post {self.cmt_to_post}"

