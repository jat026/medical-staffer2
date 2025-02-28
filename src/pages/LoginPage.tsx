import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store';

const LoginPage: React.FC = () => {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <LoginForm />;
};

export default LoginPage;