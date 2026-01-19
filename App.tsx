import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from './pages/public/Home';
import PostView from './pages/public/PostView';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/admin/Login';
import PostEditor from './pages/admin/PostEditor';
import { isAuthenticated } from './services/authService';

const PrivateRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/admin/login" />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Home />} /> {/* Reusing Home as Blog List for simplicity */}
        <Route path="/blog/:slug" element={<PostView />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/posts" element={<Dashboard />} />
          <Route path="/admin/posts/new" element={<PostEditor />} />
          <Route path="/admin/posts/:id" element={<PostEditor />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;