import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { UserIdentity } from '../services/api';

interface StoredCredential {
  credential: any;
  timestamp: number;
}

interface WalletProps {
  refreshTrigger?: number;
}

const Wallet: React.FC<WalletProps> = ({ refreshTrigger = 0 }) => {
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);

  useEffect(() => {
    // Load identity from localStorage
    const storedIdentity = localStorage.getItem('identity');
    if (storedIdentity) {
      setIdentity(JSON.parse(storedIdentity));
    } else {
      setIdentity(null);
    }

    // Load credentials from localStorage
    const storedCredentials = localStorage.getItem('credentials');
    if (storedCredentials) {
      setCredentials(JSON.parse(storedCredentials));
    } else {
      setCredentials([]);
    }
  }, [refreshTrigger]); // Re-run effect when refreshTrigger changes

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!identity && credentials.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 2, height: '100%', maxHeight: '600px' }}>
        <Typography variant="h6" color="text.secondary">
          Wallet is empty
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate an identity and create credentials to see them here
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        height: '100%', 
        maxHeight: '600px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" gutterBottom>
        Your Wallet
      </Typography>

      <Box sx={{ 
        overflow: 'auto',
        flex: 1,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      }}>
        {identity && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Identity
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>
                DID: {identity.did}
                <Tooltip title="Copy DID">
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(identity.did)}
                    sx={{ ml: 1 }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>
                JWK: {identity.jwk}
                <Tooltip title="Copy JWK">
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(identity.jwk)}
                    sx={{ ml: 1 }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
            </Box>
          </Box>
        )}

        {credentials.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Credentials ({credentials.length})
            </Typography>
            {credentials.map((cred, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2">
                    Credential {index + 1} -{' '}
                    {new Date(cred.timestamp).toLocaleString()}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ position: 'relative' }}>
                    <pre style={{ 
                      margin: 0, 
                      fontSize: '0.8rem',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(cred.credential, null, 2)}
                    </pre>
                    <Tooltip title="Copy Credential">
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(JSON.stringify(cred.credential))}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default Wallet; 