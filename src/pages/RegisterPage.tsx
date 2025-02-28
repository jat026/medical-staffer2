import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store';

const RegisterPage: React.FC = () => {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return <RegisterForm />;
};

export default RegisterPage;