import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from './pages/public/Home';
import About from './pages/public/About';
import PostView from './pages/public/PostView';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/admin/Login';
<<<<<<< HEAD
import Verify from './pages/admin/Verify';
import PostEditor from './pages/admin/PostEditor';
import { AuthProvider, useAuth } from './context/AuthContext';
import ScrollToTop from './components/ui/ScrollToTop';

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="animate-spin h-8 w-8 text-white"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/admin/login" />;
=======
import PostEditor from './pages/admin/PostEditor';
import { isAuthenticated } from './services/authService';
import ScrollToTop from './components/ui/ScrollToTop';

const PrivateRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/admin/login" />;
>>>>>>> 1d1aced88b08533ee2c64b6cf5e3bc0bf974cd2d
};

const App: React.FC = () => {
  return (
<<<<<<< HEAD
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Home />} /> {/* Reusing Home as Blog List for simplicity */}
          <Route path="/blog/:slug" element={<PostView />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/verify" element={<Verify />} />

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
    </AuthProvider>
=======
    <HashRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
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
>>>>>>> 1d1aced88b08533ee2c64b6cf5e3bc0bf974cd2d
  );
};

export default App;