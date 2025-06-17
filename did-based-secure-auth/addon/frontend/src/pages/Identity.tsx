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
} from '@mui/material';
import api, { UserIdentity, CredentialRequest } from '../services/api';
import Wallet from '../components/Wallet';

const Identity: React.FC = () => {
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [credential, setCredential] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formData, setFormData] = useState<CredentialRequest>({
    subject_did: '',
    name: '',
    job_title: '',
  });

  useEffect(() => {
    // Load identity from localStorage on component mount
    const storedIdentity = localStorage.getItem('identity');
    if (storedIdentity) {
      setIdentity(JSON.parse(storedIdentity));
    }
  }, []);

  const handleGenerateIdentity = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.generateIdentity();
      setIdentity(result);
      setFormData(prev => ({ ...prev, subject_did: result.did }));
      
      // Store identity in localStorage
      localStorage.setItem('identity', JSON.stringify(result));
      
      // Clear stored credentials
      localStorage.removeItem('credentials');
      setCredential(null);
      
      // Trigger wallet refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError('Failed to generate identity');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const result = await api.createCredential(formData);
      setCredential(result.credential);
      
      // Store credential in localStorage
      const storedCredentials = localStorage.getItem('credentials');
      const credentials = storedCredentials ? JSON.parse(storedCredentials) : [];
      credentials.push({
        credential: result.credential,
        timestamp: Date.now(),
      });
      localStorage.setItem('credentials', JSON.stringify(credentials));
      
      // Trigger wallet refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      setError('Failed to create credential');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
              Identity Management
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Button
                variant="contained"
                onClick={handleGenerateIdentity}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                Generate Identity
              </Button>
            </Box>

            <form onSubmit={handleCreateCredential}>
              <Typography variant="h5" gutterBottom>
                Create Credential
              </Typography>

              <TextField
                fullWidth
                label="Subject DID"
                name="subject_did"
                value={formData.subject_did}
                onChange={handleInputChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Job Title"
                name="job_title"
                value={formData.job_title}
                onChange={handleInputChange}
                margin="normal"
                required
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !identity}
                sx={{ mt: 2 }}
              >
                Create Credential
              </Button>
            </form>

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
          </Paper>
        </Box>
        <Box sx={{ 
          flex: { xs: '1 1 100%', md: '1 1 0%' },
          minWidth: 0, // Prevents flex item from overflowing
          maxWidth: { md: '400px' }
        }}>
          <Wallet refreshTrigger={refreshTrigger} />
        </Box>
      </Box>
    </Container>
  );
};

export default Identity; 