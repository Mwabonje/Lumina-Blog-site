import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ContactModal from '../ui/ContactModal';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-primary transition-colors duration-300">
      {/* Dark Header */}
      <header className="sticky top-0 z-50 bg-[#020617] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Logo Section - Left */}
          <Link to="/" className="flex items-center gap-2 group">
             <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-[#020617]">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
             </div>
             <span className="text-xl font-bold tracking-tight group-hover:text-accent transition-colors">Lumina</span>
          </Link>
          
          {/* Navigation and Actions - Right */}
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex gap-6 items-center">
              {[
                { path: '/', label: 'Home' },
                { path: '/about', label: 'About' },
                { path: '/blog', label: 'Blog' },
              ].map(link => (
                <Link 
                  key={link.label}
                  to={link.path} 
                  className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive(link.path) ? 'text-accent' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
               <button
                 onClick={toggleTheme}
                 className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                 aria-label="Toggle Dark Mode"
               >
                 {theme === 'light' ? (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                 ) : (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                 )}
               </button>

               <button 
                  onClick={() => setIsContactOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 border border-white/10"
               >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  Contact Us
               </button>
            </div>
          </div>
          
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      <footer className="bg-[#020617] text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm flex flex-col items-center gap-4">
          <p>© {new Date().getFullYear()} Lumina Inc. All Rights Reserved.</p>
          <div className="flex gap-6">
             <Link to="/" className="hover:text-white transition-colors">Home</Link>
             <Link to="/about" className="hover:text-white transition-colors">About</Link>
             <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;