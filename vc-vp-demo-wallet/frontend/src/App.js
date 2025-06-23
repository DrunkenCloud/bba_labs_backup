import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Collapse,
  Stack,
} from '@mui/material';
import {
  VerifiedUser as VerifiedUserIcon,
  AccountCircle as AccountCircleIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Key as KeyIcon,
  Fingerprint as FingerprintIcon,
  Add as AddIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5004';

const AVAILABLE_ROLES = [
  "Faculty",
  "Student",
  "Researcher",
  "Administrator",
  "Staff"
];

function WalletSidebar({ identity, credentials, onClear, onDeleteCredential }) {
  const [showKeys, setShowKeys] = useState(false);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        height: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Your Wallet
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {identity && (
        <>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountCircleIcon color="primary" />
                Digital Identity
              </Typography>
              <IconButton size="small" onClick={() => setShowKeys(!showKeys)}>
                {showKeys ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={showKeys}>
              <Box sx={{ mt: 1, pl: 2 }}>
                <Typography variant="caption" color="text.secondary">DID:</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>
                  {identity.did}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>JWK:</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>
                  {identity.jwk}
                </Typography>
              </Box>
            </Collapse>
          </Box>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      
      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DescriptionIcon color="primary" />
        Verifiable Credentials
      </Typography>
      
      <List>
        {credentials.map((cred, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="View Credential">
                  <IconButton 
                    size="small" 
                    onClick={() => alert(JSON.stringify(cred, null, 2))}
                  >
                    <VerifiedUserIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Credential">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => onDeleteCredential(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          >
            <ListItemText 
              primary={cred.credentialSubject.jobTitle} 
              secondary={`Issued by: ${cred.issuer.substring(0, 10)}...`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [userIdentity, setUserIdentity] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [walletMessage, setWalletMessage] = useState(null);
  const [credentialForm, setCredentialForm] = useState({
    name: "",
    role: AVAILABLE_ROLES[0]
  });

  const steps = ['Generate Identity', 'Create Credential', 'Submit & Verify'];

  const clearWallet = () => {
    setUserIdentity(null);
    setCredentials([]);
    setVerificationResult(null);
    setWalletMessage(null);
    setActiveStep(0);
  };

  const handleStepClick = (step) => {
    // Don't allow going to later steps if identity isn't generated
    if (!userIdentity && step > 0) {
      setError("Please generate an identity first");
      return;
    }

    // Clear verification result when leaving the verify step
    if (activeStep === 2 && step !== 2) {
      setVerificationResult(null);
    }

    setActiveStep(step);
    setError(null);
  };

  const deleteCredential = (index) => {
    setCredentials(prev => prev.filter((_, i) => i !== index));
    setWalletMessage("Credential removed from wallet");
  };

  const generateIdentity = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-identity`);
      setUserIdentity(response.data);
      setCredentials([]); // Clear existing credentials when generating new identity
      setVerificationResult(null);
      setWalletMessage("Digital Identity stored in wallet");
      setActiveStep(1);
      setError(null);
    } catch (err) {
      setError('Failed to generate identity: ' + err.message);
    }
  };

  const createAndVerifyCredential = async () => {
    try {
      // Create credential
      const credentialResponse = await axios.post(`${API_BASE_URL}/create-credential`, {
        subject_did: userIdentity.did,
        name: credentialForm.name,
        job_title: credentialForm.role
      });
      
      setCredentials(prev => [...prev, credentialResponse.data.credential]);
      setWalletMessage("New credential stored in wallet");
      setActiveStep(2);
      setError(null);
    } catch (err) {
      setError('Failed to create credential: ' + err.message);
    }
  };

  const submitAndVerifyCredential = async (selectedCredential) => {
    try {
      // Create presentation with the selected credential
      const presentationResponse = await axios.post(`${API_BASE_URL}/create-presentation`, {
        verifiable_credential: selectedCredential,
        holder_jwk: userIdentity.jwk
      });

      // Verify presentation
      const verificationResponse = await axios.post(`${API_BASE_URL}/verify-presentation`, {
        signed_presentation: presentationResponse.data.presentation
      });
      
      setVerificationResult(verificationResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to verify presentation: ' + err.message);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card sx={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
                Generate Your Digital Identity
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This will create a new DID (Decentralized Identifier) and associated keys for you.
              </Typography>
              <Button 
                variant="contained" 
                onClick={generateIdentity}
                startIcon={<FingerprintIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                  boxShadow: '0 3px 5px 2px rgba(26, 35, 126, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #283593 30%, #1a237e 90%)',
                  }
                }}
              >
                Generate Identity
              </Button>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card sx={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
                Create Verifiable Credential
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Fill in your details to create a new credential.
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <TextField
                  label="Your Name"
                  value={credentialForm.name}
                  onChange={(e) => setCredentialForm(prev => ({ ...prev, name: e.target.value }))}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#1a237e',
                      },
                    },
                  }}
                />
                
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={credentialForm.role}
                    label="Role"
                    onChange={(e) => setCredentialForm(prev => ({ ...prev, role: e.target.value }))}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        '&:hover': {
                          borderColor: '#1a237e',
                        },
                      },
                    }}
                  >
                    {AVAILABLE_ROLES.map((role) => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Button 
                variant="contained" 
                onClick={createAndVerifyCredential}
                disabled={!credentialForm.name}
                startIcon={<AddIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                  boxShadow: '0 3px 5px 2px rgba(26, 35, 126, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #283593 30%, #1a237e 90%)',
                  }
                }}
              >
                Create Credential
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card sx={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
                Submit & Verify Credential
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose a credential from your wallet to present and verify.
              </Typography>

              {credentials.length === 0 ? (
                <Alert severity="info">
                  No credentials available. Please create a credential first.
                </Alert>
              ) : (
                <List>
                  {credentials.map((cred, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        mb: 1,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(26, 35, 126, 0.04)',
                        },
                      }}
                      secondaryAction={
                        <Button
                          variant="contained"
                          onClick={() => submitAndVerifyCredential(cred)}
                          startIcon={<SendIcon />}
                          sx={{
                            background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                            boxShadow: '0 3px 5px 2px rgba(26, 35, 126, .3)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #283593 30%, #1a237e 90%)',
                            }
                          }}
                        >
                          Submit & Verify
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={`${cred.credentialSubject.name} - ${cred.credentialSubject.jobTitle}`}
                        secondary={`Issued by: ${cred.issuer}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {verificationResult && (
                <Box mt={2}>
                  <Alert severity={verificationResult.valid ? "success" : "error"}>
                    {verificationResult.message}
                  </Alert>
                  <Typography variant="subtitle2" mt={2}>Verification Details:</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {JSON.stringify(verificationResult.details, null, 2)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ 
            color: '#1a237e',
            fontWeight: 'bold',
            mb: 4
          }}
        >
          Verifiable Credentials Wallet Demo
        </Typography>
        
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            mb: 4,
            justifyContent: 'center'
          }}
        >
          {steps.map((label, index) => (
            <Button
              key={label}
              variant={activeStep === index ? "contained" : "outlined"}
              onClick={() => handleStepClick(index)}
              sx={{
                minWidth: 200,
                background: activeStep === index ? 
                  'linear-gradient(45deg, #1a237e 30%, #283593 90%)' : 
                  'transparent',
                color: activeStep === index ? 'white' : '#1a237e',
                borderColor: '#1a237e',
                '&:hover': {
                  background: activeStep === index ?
                    'linear-gradient(45deg, #283593 30%, #1a237e 90%)' :
                    'rgba(26, 35, 126, 0.04)',
                  borderColor: '#1a237e',
                }
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {walletMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {walletMessage}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            {renderStepContent(activeStep)}
          </Box>
          <Box sx={{ width: 300 }}>
            <WalletSidebar 
              identity={userIdentity}
              credentials={credentials}
              onClear={clearWallet}
              onDeleteCredential={deleteCredential}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default App; 