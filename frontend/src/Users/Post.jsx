import { useState } from 'react';
import { POST_PATH } from '../urls';
import { useNavigate } from 'react-router-dom';

const Post = () => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const navigate = useNavigate()

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Retrieve user_id from local storage
    const storedUser = localStorage.getItem('user');
    let user_id = null;

    if (storedUser) {
      const user = JSON.parse(storedUser);
      user_id = user.user_id;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('user_id', user_id);

    try {
      const response = await fetch(POST_PATH, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Post created successfully:', data);
        alert('Post created successfully:', data);
        navigate('/homepage')
      } else {
        console.error('Error creating post:', response.statusText);
        alert('Error creating post:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-semibold text-center mb-4">Create a Post</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          required
          className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:mr-4 file:border-0
                     file:text-sm file:font-semibold file:bg-gray-200 file:rounded-md 
                     hover:file:bg-gray-300 mb-4"
        />
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Description"
          className="w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 mb-4"
        ></textarea>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default Post;
