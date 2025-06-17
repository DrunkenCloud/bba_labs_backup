import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import api, { UserCreate, UserLogin } from '../services/api';
import Wallet from '../components/Wallet';

interface StoredCredential {
  credential: any;
  timestamp: number;
}

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [registerData, setRegisterData] = useState<UserCreate>({
    email: '',
    password: '',
  });
  const [loginData, setLoginData] = useState<UserLogin>({
    email: '',
    password: '',
    signed_presentation: null,
    VP: null,
  });
  const [storedCredentials, setStoredCredentials] = useState<StoredCredential[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<string>('');

  useEffect(() => {
    // Load credentials from localStorage
    const credentials = localStorage.getItem('credentials');
    if (credentials) {
      setStoredCredentials(JSON.parse(credentials));
    }
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.register(registerData);
      setSuccess('Registration successful! Please login.');
      setActiveTab(1);
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const selectedCred = storedCredentials.find(
        cred => JSON.stringify(cred.credential) === selectedCredential
      );

      if (!selectedCred) {
        throw new Error('Please select a credential');
      }

      // First create presentation
      const presentationResponse = await api.createPresentation({
        verifiable_credential: selectedCred.credential,
        holder_jwk: JSON.parse(localStorage.getItem('identity') || '{}').jwk || '',
      });

      // Then login with the presentation
      const loginResponse = await api.login({
        ...loginData,
        signed_presentation: presentationResponse.presentation,
        VP: presentationResponse.presentation,
      });

      if (!loginResponse.valid) {
        throw new Error(loginResponse.message || 'Login failed');
      }

      setSuccess('Login successful!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (activeTab === 0) {
      setRegisterData(prev => ({ ...prev, [name]: value }));
    } else {
      setLoginData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        flexDirection: { xs: 'column', md: 'row' },
        height: '100%',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Box sx={{ 
          flex: { xs: '1 1 100%', md: '2 1 0%' },
          minWidth: 0 // Prevents flex item from overflowing
        }}>
          <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
            <Typography variant="h4" gutterBottom>
              Authentication
            </Typography>

            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Register" />
              <Tab label="Login" />
            </Tabs>

            {activeTab === 0 ? (
              <form onSubmit={handleRegister}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={registerData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  Register
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={loginData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={loginData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Credential</InputLabel>
                  <Select
                    value={selectedCredential}
                    onChange={(e) => setSelectedCredential(e.target.value)}
                    required
                  >
                    {storedCredentials.map((cred, index) => (
                      <MenuItem
                        key={index}
                        value={JSON.stringify(cred.credential)}
                      >
                        Credential {index + 1} -{' '}
                        {new Date(cred.timestamp).toLocaleString()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !selectedCredential}
                  sx={{ mt: 2 }}
                >
                  Login
                </Button>
              </form>
            )}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
          </Paper>
        </Box>
        <Box sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 0%' },
          minWidth: 0, // Prevents flex item from overflowing
          maxWidth: { md: '400px' }
        }}>
          <Wallet />
        </Box>
      </Box>
    </Container>
  );
};

export default Auth; 