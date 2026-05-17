import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import '../styles/theme.css';
import './Login.css';

interface DecodedToken {
  role: string;
  [key: string]: any;
}

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // POST the idToken to the backend
      const response = await api.post('/auth/google', {
        idToken: credentialResponse.credential,
      });

      // Extract the session token from response
      const { token } = response.data;
      localStorage.setItem('sessionToken', token);

      // Decode the JWT to extract the user role
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Navigate based on role
      if (decoded.role === 'SUPER_ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || t('login.errors.auth_failed') || 'Authentication failed';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleError = () => {
    enqueueSnackbar(t('login.errors.google_failed') || 'Google Login failed', { 
      variant: 'error' 
    });
  };

  return (
    <div className="login-container">
      <div className="glass-card login-box">
        <h1 className="logo">Transer OS<span>Bridge</span></h1>
        <p>{t('login.subtitle')}</p>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={import.meta.env.PROD}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
