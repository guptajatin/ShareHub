import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Route, createRoutesFromElements } from 'react-router';

import Login from './Pages/Login';
import Register from './Pages/Register';
import AllUsers from './Pages/AllUsers';
import Homepage from './Pages/Homepage';
import UserDetails from './Users/UserDetails';
import Post from './Users/Post';
import Friends from './Users/Friends';
import ManagePost from './Admin/ManagePost';
import ManageUsers from './Admin/ManageUsers';
import MyPosts from './Users/MyPosts';
import PostDetails from './Pages/PostDetails';
import OtherUser from './Pages/OtherUser';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
            <Route path='/all-users' element={<AllUsers/>} />
            <Route path='/homepage' element={<Homepage/>} />
            <Route path='/profile' element={<UserDetails/>} />
            <Route path='/posts' element={<Post/>} />
            <Route path='/my-posts' element={<MyPosts/>} />
            <Route path='/post-detail/:postId' element={<PostDetails/>} />
            <Route path='/my-friends' element={<Friends/>} />
            <Route path='/other-user/:userId' element={<OtherUser/>} />
            <Route path='/admin/manage-users' element={<ManageUsers/>} />
            <Route path='/admin/manage-posts' element={<ManagePost/>} />
        </Route>
    )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
