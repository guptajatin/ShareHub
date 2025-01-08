import React, { useEffect, useState } from "react";
import { HOMEPAGE, TOGGLE_LIKE } from "../urls";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    const fetchPosts = async () => {
        const user = JSON.parse(localStorage.getItem('user'));

        if (!user) {
            console.error("User not found in local storage");
            return;
        }

        const requestBody = { user_id: user.user_id };

        const response = await fetch(HOMEPAGE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const data = await response.json();
            setPosts(data.posts);
        } else {
            console.error("Failed to fetch posts");
        }
    };

    const handleLike = async (postId) => {
        const user = JSON.parse(localStorage.getItem('user'));

        try {
            const response = await fetch(TOGGLE_LIKE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.user_id, post_id: postId }),
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(posts.map(post => 
                    post.id === postId ? { ...post, is_liked: data.liked } : post
                ));
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handlePostClick = (postId) => {
        navigate(`/post-detail/${postId}`);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="bg-white p-4 rounded shadow relative cursor-pointer"
                        onClick={() => handlePostClick(post.id)}
                    >
                        {/* Like icon at the top-left */}
                        <div
                            className="absolute top-2 left-2 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent navigating to post detail when heart is clicked
                                handleLike(post.id);
                            }}
                        >
                            <span>{post.is_liked ? '❤️' : '🤍'}</span>
                        </div>

                        {/* Media (Image or Video) */}
                        {post.is_video ? (
                            <video src={"/posts/" + post.link} controls className="w-full h-60 object-cover rounded" />
                        ) : (
                            <img src={"/posts/" + post.link} alt={post.desc} className="w-full h-60 object-cover rounded" />
                        )}

                        <p className="mt-2 text-center">{post.desc}</p>
                        <p className="text-center text-blue-500 font-semibold">{post.username}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Homepage;
