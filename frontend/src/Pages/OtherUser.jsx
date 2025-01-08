import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { GET_USER_DETAILS, MY_POST, MY_FRIENDS } from "../urls";

const OtherUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${GET_USER_DETAILS}${userId}/`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, [userId]);

  const fetchFriends = useCallback(async () => {
    try {
      const response = await axios.get(`${MY_FRIENDS}?user_id=${userId}`, { credentials: 'include' });
      setFriends(response.data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }, [userId]);

  const fetchUserPosts = useCallback(async () => {
    try {
      const response = await axios.get(`${MY_POST}${userId}`);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchFriends();
      fetchUserPosts();
    }
  }, [userId, fetchUserDetails, fetchFriends, fetchUserPosts]);

  const handleFriendClick = (friendId) => {
    navigate(`/other-user/${friendId}`);
  };

  const handlePostClick = (postId) => {
    navigate(`/post-detail/${postId}`);
  };

  if (!user) return <div>Loading user details...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* User Details */}
      <div className="flex items-center mb-8">
        <img
          src={user.profile_picture || "https://via.placeholder.com/100"}
          alt="Profile"
          className="w-20 h-20 rounded-full mr-6 shadow-md"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
          <p className="text-gray-500 italic">{user.bio || "No bio available"}</p>
        </div>
      </div>

      {/* Friend List */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-red-500 mb-4">Friends</h3>
        {friends.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4">
            {friends.map((friend) => (
              <li
                key={friend.user_id}
                className="hover:underline cursor-pointer p-2 rounded-lg bg-blue-100 hover:bg-blue-200"
                onClick={() => handleFriendClick(friend.user_id)}
              >
                {friend.username}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No friends</p>
        )}
      </div>

      {/* Posts by User */}
      <div>
        <h3 className="text-xl font-semibold text-red-500 mb-4">Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 cursor-pointer"
              onClick={() => handlePostClick(post.id)}
            >
              {/* Media (Image or Video) */}
              {post.is_video ? (
                <video
                  src={`/posts/${post.link}`}
                  controls
                  className="w-full h-52 object-cover rounded-md"
                />
              ) : (
                <img
                  src={`/posts/${post.link}`}
                  alt={post.description}
                  className="w-full h-52 object-cover rounded-md"
                />
              )}
              {/* Post Description */}
              <p className="mt-3 text-center text-gray-700">{post.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OtherUser;
