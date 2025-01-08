import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MY_POST, DELETE_MY_POST } from "../urls";

const MyPosts = () => {
    const [posts, setPosts] = useState([]);
    const currentUserId = JSON.parse(localStorage.getItem('user')).user_id;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyPosts = async () => {
            try {
                const response = await fetch(`${MY_POST}${currentUserId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchMyPosts();
    }, [currentUserId]);

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                const response = await fetch(`${DELETE_MY_POST}${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
                } else {
                    console.error('Failed to delete post');
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handlePostClick = (postId) => {
        navigate(`/post-detail/${postId}`);
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Posts</h1>
            {posts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="border p-4 rounded-md shadow-md flex flex-col cursor-pointer"
                            onClick={() => handlePostClick(post.id)}
                        >
                            <h2 className="text-lg font-semibold">{post.description || "No Description"}</h2>
                            {post.is_video ? (
                                <video controls className="w-full h-60 object-cover mt-2">
                                    <source src={`/posts/${post.link}`} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img
                                    src={`/posts/${post.link}`}
                                    alt={post.description}
                                    className="w-full h-60 object-cover mt-2 rounded-md"
                                />
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering the post click
                                    handleDeletePost(post.id);
                                }}
                                className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No posts found.</p>
            )}
            <Link
                to="/posts"
                className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
                Add New Post
            </Link>
        </div>
    );
};

export default MyPosts;
