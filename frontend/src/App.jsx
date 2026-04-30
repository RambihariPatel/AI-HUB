import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatAssistant from './components/ChatAssistant';
import Home from './pages/Home';
import ToolsDirectory from './pages/ToolsDirectory';
import ToolDetails from './pages/ToolDetails';
import Categories from './pages/Categories';
import Compare from './pages/Compare';
import Profile from './pages/Profile';
import SubmitTool from './pages/SubmitTool';
import AdminDashboard from './pages/AdminDashboard';
import { RedirectToSignIn, SignedOut, SignedIn } from '@clerk/clerk-react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  
  if (user && (user.role === 'admin' || user.email === 'rambiharipatel175@gmail.com')) {
    return children;
  }

  return <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<ToolsDirectory />} />
            <Route path="/tools/:id" element={<ToolDetails />} />
            <Route path="/compare" element={<Compare />} />
            
            {/* Protected Pages */}
            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/submit-tool" element={<ProtectedRoute><SubmitTool /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
            
            {/* Redirect any legacy auth routes back to home */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ChatAssistant />
      </div>
    </Router>
  );
}

export default App;
