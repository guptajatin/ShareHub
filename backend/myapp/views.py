from django.http import JsonResponse
from django.db import connection
from myapp.models import User, UserDetail, Post, Like, Comment
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.core.files.storage import FileSystemStorage
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from datetime import datetime
import json
import os
import hashlib

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        dob = data.get('dob')

        with connection.cursor() as cursor:
            try:
                cursor.callproc('register_user', (first_name, last_name, email, username, password, dob))
                connection.commit()
                return JsonResponse({'message': 'Registration successful!'}, status=201)
            except Exception as e:
                connection.rollback()
                return JsonResponse({'message': str(e)}, status=400)

    return JsonResponse({'message': 'Invalid request method'}, status=405)


@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        with connection.cursor() as cursor:
            try:
                cursor.execute("SELECT login_user(%s, %s);", [email, password])
                result = cursor.fetchone()

                if result and result[0]:
                    user_data = json.loads(result[0])
                    return JsonResponse(user_data, status=200)
                else:
                    return JsonResponse({'message': 'Invalid email or password'}, status=401)
            except Exception as e:
                return JsonResponse({'message': str(e)}, status=400)

    return JsonResponse({'message': 'Invalid request method'}, status=405)


def get_user_details(request, user_id):
    try:
        # Fetch user data using raw SQL query
        user_query = "SELECT user_id, username, email FROM myapp_user WHERE user_id = %s"
        with connection.cursor() as cursor:
            cursor.execute(user_query, [user_id])
            user_row = cursor.fetchone()

        if not user_row:
            return JsonResponse({'error': 'User not found'}, status=404)

        # Fetch user detail data using raw SQL query
        user_detail_query = """
            SELECT first_name, last_name, address, DOB, bio
            FROM myapp_userdetail
            WHERE user_id = %s
        """
        with connection.cursor() as cursor:
            cursor.execute(user_detail_query, [user_id])
            user_detail_row = cursor.fetchone()

        if not user_detail_row:
            return JsonResponse({'error': 'User details not found'}, status=404)

        # Prepare data to send back
        data = {
            'user_id': user_row[0],
            'username': user_row[1],
            'email': user_row[2],
            'first_name': user_detail_row[0],
            'last_name': user_detail_row[1],
            'address': user_detail_row[2],
            'DOB': user_detail_row[3],
            'bio': user_detail_row[4],
        }
        return JsonResponse(data)

    except Exception as e:
        # Log any unexpected errors for debugging purposes
        return JsonResponse({'error': str(e)}, status=500)


from myapp.models import User, UserDetail
@csrf_exempt
def update_user_details(request, user_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            input_password = data.get('password')

            # Attempt to retrieve the User object
            try:
                user = get_object_or_404(User, pk=user_id)
            except Exception as e:
                return JsonResponse({"error": "User not found"}, status=404)

            stored_password = user.password  # Assumes the password is hashed with SHA-256
            hashed_input_password = hashlib.sha256(input_password.encode()).hexdigest()
            if hashed_input_password != stored_password:
                print("here")
                return JsonResponse({"error": "Password is incorrect"}, status=403)

            try:
                user_detail = get_object_or_404(UserDetail, user_id=user_id)
            except Exception as e:
                return JsonResponse({"error": "UserDetail not found"}, status=404)

            user_detail.first_name = data.get('first_name', user_detail.first_name)
            user_detail.last_name = data.get('last_name', user_detail.last_name)
            user_detail.address = data.get('address', user_detail.address)
            user_detail.DOB = data.get('dob', user_detail.DOB)
            user_detail.bio = data.get('bio', user_detail.bio)
            user_detail.save()

            return JsonResponse({"success": "User details updated successfully"})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=403)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def upload_post(request):
    if request.method == 'POST' and request.FILES['file']:
        file = request.FILES['file']
        description = request.POST.get('description', '')
        user_id = request.POST.get('user_id')

        # Create a unique filename using user_id and current time
        current_time = datetime.now().strftime("%Y%m%d%H%M%S")
        file_extension = os.path.splitext(file.name)[1]  # Get the file extension
        unique_filename = f"{user_id}_{current_time}{file_extension}"

        print("path: ", os.path)
        frontend_media_path = os.path.join('..', 'frontend', 'public', 'posts')
        fs = FileSystemStorage(location=frontend_media_path)

        try:
            with connection.cursor() as cursor:
                # Call the stored procedure
                cursor.callproc('insert_post', [unique_filename, description, user_id])

            filename = fs.save(unique_filename, file)
            return JsonResponse({'message': 'Post created successfully!'}, status=201)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request'}, status=400)


@require_http_methods(["GET"])
def all_users(request):
    current_user_id = request.GET.get('user_id')

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                u.user_id, u.username, u.email, 
                CASE WHEN f.frd_to_id IS NOT NULL THEN 1 ELSE 0 END AS is_friend
            FROM myapp_user AS u
            LEFT JOIN myapp_friend AS f 
            ON f.frd_from_id = %s AND f.frd_to_id = u.user_id
            WHERE u.user_id != %s
        """, [current_user_id, current_user_id])

        users = [
            {
                "user_id": row[0],
                "username": row[1],
                "email": row[2],
                "is_friend": row[3] == 1
            } for row in cursor.fetchall()
        ]
    return JsonResponse(users, safe=False)


@csrf_exempt
def toggle_friendship(request, user_id):
    current_user_id = request.POST.get('user_id')
    target_user_id = request.POST.get('target_user_id')

    with connection.cursor() as cursor:
        # Check if the friend relation exists
        cursor.execute("""
            SELECT frd_id FROM myapp_friend
            WHERE frd_from_id = %s AND frd_to_id = %s
        """, [current_user_id, target_user_id])
        friendship = cursor.fetchone()

        if friendship:
            # If friendship exists, delete it (remove friend)
            cursor.execute("""
                DELETE FROM myapp_friend WHERE frd_id = %s
            """, [friendship[0]])
            status = 'removed'
        else:
            # If no friendship exists, create it (add friend)
            cursor.execute("""
                INSERT INTO myapp_friend (frd_from_id, frd_to_id) VALUES (%s, %s)
            """, [current_user_id, target_user_id])
            status = 'added'

    return JsonResponse({"status": status})


def my_friends(request):
    user_id = request.GET.get('user_id')
    
    if not user_id:
        return JsonResponse({'error': 'User ID not provided.'}, status=400)
    
    with connection.cursor() as cursor:
        # Fetch friends for the user
        cursor.execute("""
            SELECT u.user_id, u.username 
            FROM myapp_friend AS f
            JOIN myapp_user AS u ON f.frd_to_id = u.user_id
            WHERE f.frd_from_id = %s
        """, [user_id])
        
        friends = cursor.fetchall()
        
    friend_list = [{'user_id': friend[0], 'username': friend[1]} for friend in friends]
    
    return JsonResponse(friend_list, safe=False)


@csrf_exempt
def homepage_posts(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user_id = data.get('user_id')

        sql = """
            SELECT p.post_id, p.post_desc, p.post_link, u.username, 
                   CASE WHEN l.like_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_liked
            FROM myapp_post p
            JOIN myapp_user u ON p.posted_by_id = u.user_id
            LEFT JOIN myapp_like l ON p.post_id = l.liked_to_post_id AND l.liked_by_id = %s
        """
        with connection.cursor() as cursor:
            cursor.execute(sql, [user_id])
            posts = cursor.fetchall()

        response_data = [{
            'id': post[0],
            'desc': post[1],
            'link': post[2] if post[2] else None,
            'username': post[3],
            'is_liked': post[4],
            'is_video': post[2].endswith(('.mp4', '.mov', '.avi')) if post[2] else False
        } for post in posts]

        return JsonResponse({'posts': response_data})

    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def toggle_like(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user_id = data.get('user_id')
        post_id = data.get('post_id')

        with connection.cursor() as cursor:
            # Check if the like already exists
            cursor.execute(
                "SELECT 1 FROM myapp_like WHERE liked_by_id = %s AND liked_to_post_id = %s",
                [user_id, post_id]
            )
            result = cursor.fetchone()

            if result:
                # Like exists, so unlike it
                cursor.execute(
                    "DELETE FROM myapp_like WHERE liked_by_id = %s AND liked_to_post_id = %s",
                    [user_id, post_id]
                )
                return JsonResponse({'liked': False})
            else:
                # Like doesn't exist, so create it
                cursor.execute(
                    "INSERT INTO myapp_like (liked_by_id, liked_to_post_id) VALUES (%s, %s)",
                    [user_id, post_id]
                )
                return JsonResponse({'liked': True})

    return JsonResponse({'error': 'Invalid request method'}, status=400)


# Post details helper function
def get_post_details(post_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT p.post_id, p.post_link, p.post_desc, u.user_id AS posted_by_id, u.username AS posted_by
            FROM myapp_post p
            JOIN myapp_user u ON p.posted_by_id = u.user_id
            WHERE p.post_id = %s
        """, [post_id])
        post_row = cursor.fetchone()

        if post_row is None:
            return None  # No post found

        # Determine if post_link is a video
        post_data = {
            'post_id': post_row[0],
            'post_link': post_row[1],
            'post_desc': post_row[2],
            'posted_by_id': post_row[3],
            'posted_by': post_row[4],
            'is_video': post_row[1].endswith(('.mp4', '.mov', '.avi')) if post_row[1] else False
        }

    # Get comment count and details
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(*) 
            FROM myapp_comment 
            WHERE cmt_to_post_id = %s
        """, [post_id])
        comment_count = cursor.fetchone()[0]

        cursor.execute("""
            SELECT c.cmt_id, u.username, c.cmt_txt, c.cmt_by_id
            FROM myapp_comment c
            JOIN myapp_user u ON c.cmt_by_id = u.user_id
            WHERE c.cmt_to_post_id = %s
        """, [post_id])
        comments = cursor.fetchall()
        # Include comment ID in the output
        comment_users = [{"comment_id": row[0], "username": row[1], "comment": row[2], "user_id": row[3]} for row in comments]

    # Get like count and details
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT u.username
            FROM myapp_like l
            JOIN myapp_user u ON l.liked_by_id = u.user_id
            WHERE l.liked_to_post_id = %s
        """, [post_id])
        liked_users = [row[0] for row in cursor.fetchall()]

    # Update and return final post data with comments and likes
    post_data.update({
        'comment_count': comment_count,
        'like_count': len(liked_users),
        'comment_users': comment_users,
        'liked_users': liked_users,
    })
    return post_data


def post_detail_view(request, post_id):
    post_data = get_post_details(post_id)
    if post_data is None:
        return JsonResponse({'error': 'Post not found'}, status=404)
    return JsonResponse(post_data)


@csrf_exempt
def add_comment(request):
    if request.method == "POST":
        data = json.loads(request.body)
        post_id = data.get('post_id')
        comment_text = data.get('comment')
        user_id = data.get('current_user_id')



        if not all([post_id, comment_text, user_id]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        # Insert the new comment
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO myapp_comment (cmt_to_post_id, cmt_by_id, cmt_txt) VALUES (%s, %s, %s)",
                [post_id, user_id, comment_text]
            )

        # Fetch and return updated post details
        post_data = get_post_details(post_id)
        if post_data is None:
            return JsonResponse({'error': 'Post not found'}, status=404)
        return JsonResponse(post_data)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    

@csrf_exempt
def delete_comment(request):
    if request.method == "DELETE":
        # Parse the JSON body of the request
        data = json.loads(request.body)
        
        user_id = data.get('current_user_id')
        comment_id = data.get('comment_id')
        
        # Check if the comment exists and is owned by the user
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT cmt_by_id, cmt_to_post_id FROM myapp_comment WHERE cmt_id = %s",
                [comment_id]
            )
            comment_data = cursor.fetchone()

            if not comment_data:
                return JsonResponse({'error': 'Comment not found'}, status=404)
            if comment_data[0] != user_id:
                return JsonResponse({'error': 'Unauthorized'}, status=403)

            post_id = comment_data[1]

            # Delete the comment
            cursor.execute("DELETE FROM myapp_comment WHERE cmt_id = %s", [comment_id])

        # Fetch and return updated post details
        post_data = get_post_details(post_id)
        if post_data is None:
            return JsonResponse({'error': 'Post not found'}, status=404)
        return JsonResponse(post_data)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def get_my_posts(request, user_id):
    if request.method == "GET":
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT post_id, post_link, post_desc
                FROM myapp_post
                WHERE posted_by_id = %s
            """, [user_id])
            posts = cursor.fetchall()
        
        post_data = [
            {
                "id": row[0],
                "link": row[1],
                "description": row[2],
                "is_video": row[1].endswith(('.mp4', '.mov', '.avi')) if row[1] else False
            }
            for row in posts
        ]
        return JsonResponse(post_data, safe=False)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    

@csrf_exempt
def delete_my_post(request, post_id):
    if request.method == "DELETE":
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT posted_by_id FROM myapp_post WHERE post_id = %s
            """, [post_id])
            post = cursor.fetchone()

            if not post:
                return JsonResponse({'error': 'Post not found'}, status=404)

            cursor.execute("DELETE FROM myapp_post WHERE post_id = %s", [post_id])

        return JsonResponse({'message': 'Post deleted successfully'})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
