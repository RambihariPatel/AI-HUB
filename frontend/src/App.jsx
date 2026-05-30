import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Compare from './pages/Compare';
import Category from './pages/Category';
import ToolDetails from './pages/ToolDetails';
import SubmitTool from './pages/SubmitTool';
import Dashboard from './pages/Dashboard';
import Toolkits from './pages/Toolkits';
import SharedFolder from './pages/SharedFolder';
import AIChatbot from './components/AIChatbot';
import ToolModal from './components/ToolModal';

function App() {
  const [chatSelectedTool, setChatSelectedTool] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const handleChatToolClick = (tool) => {
    setChatSelectedTool(tool);
    setIsChatModalOpen(true);
  };

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/toolkits" element={<Toolkits />} />
        <Route path="/category/:categoryName" element={<Category />} />
        <Route path="/tool/:id" element={<ToolDetails />} />
        <Route path="/submit-tool" element={<SubmitTool />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/shared-folder/:id" element={<SharedFolder />} />
      </Routes>

      {/* Global Floating AI Chatbot */}
      <AIChatbot onToolClick={handleChatToolClick} />
      <ToolModal
        tool={chatSelectedTool}
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />
    </>
  );
}

export default App;
