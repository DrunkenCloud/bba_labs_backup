"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type Web3 from 'web3';
import type { Contract } from 'web3-eth-contract';
import { useAuth0 } from '@auth0/auth0-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from './header';
import { InstructionsCard } from './instructions-card';
import { AuthCard } from './auth-card';
import { BlockchainCard } from './blockchain-card';
import { LoggingCard } from './logging-card';
import { AuditCard } from './audit-card';
import AccessLoggerContract from '@/contracts/AccessLogger.json';

declare global {
  interface Window {
    ethereum: any;
  }
}

const CONTRACT_ADDRESS = '0x8BF8821A533DdDd65339594BCBC5C5DA65Af4d6c';

export interface LogEntry {
  userId: string;
  action: string;
  timestamp: string;
}

export default function AuthLoggerPage() {
  const { user, isAuthenticated } = useAuth0();
  const { toast } = useToast();

  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [contract, setContract] = useState<Contract<any> | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);
  const [lastLoginTime, setLastLoginTime] = useState<number>(0);

  const [isAuditVisible, setIsAuditVisible] = useState(false);

  const connectBlockchain = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please connect to Ganache via http://localhost:7545.');
      }

      const Web3 = (await import('web3')).default;
      const web3Instance = new Web3('http://localhost:7545');
      
      const accs = await web3Instance.eth.getAccounts();
      if (accs.length === 0) {
        throw new Error('No accounts found in Ganache. Is it running?');
      }

      const contractInstance = new web3Instance.eth.Contract(AccessLoggerContract.abi, CONTRACT_ADDRESS);

      setWeb3(web3Instance);
      setAccounts(accs);
      setContract(contractInstance);

      toast({
        title: 'Success',
        description: 'Connected to Ganache blockchain.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Blockchain Connection Failed',
        description: error.message || 'Could not connect to Ganache.',
      });
      setWeb3(null);
      setAccounts([]);
      setContract(null);
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const logAccess = useCallback(async (customAction?: string) => {
    if (!contract || !user?.sub || accounts.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Not ready to log. Check authentication and blockchain connection.' });
      return;
    }
    setIsLogging(true);
    try {
      const userId = user.sub;
      const action = customAction || 'page_access';
      const timestamp = Math.floor(Date.now() / 1000);

      await contract.methods.logAccess(userId, action, timestamp).send({
        from: accounts[0],
        gas: 200000,
        type: '0x0' // Force legacy transaction type for Ganache (no EIP-1559)
      });
      toast({ title: 'Success', description: 'Access event logged to the blockchain.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Logging Failed', description: error.message });
    } finally {
      setIsLogging(false);
    }
  }, [contract, user, accounts, toast]);

  // Log authentication events automatically
  useEffect(() => {
    if (isAuthenticated && user?.sub && contract && !isLogging) {
      const currentTime = Math.floor(Date.now() / 1000);
      // Only log if this is a new login (prevent duplicate logs on page refresh)
      if (currentTime - lastLoginTime > 300) { // 5 minutes threshold
        setLastLoginTime(currentTime);
        logAccess('user_login');
      }
    }
  }, [isAuthenticated, user, contract, logAccess, lastLoginTime, isLogging]);

  // Connect to blockchain when the page loads
  useEffect(() => {
    connectBlockchain();
  }, [connectBlockchain]);

  const viewLogs = useCallback(async () => {
    if (!contract) {
      toast({ variant: 'destructive', title: 'Error', description: 'Not connected to the blockchain.' });
      return;
    }
    setIsFetchingLogs(true);
    setLogs([]);
    try {
      const logCount = await contract.methods.getLogCount().call();
      const count = Number(logCount);
      
      const fetchedLogs: LogEntry[] = [];
      for (let i = count - 1; i >= 0 && i > count - 10; i--) { // Fetch last 10 for performance
        const log = await contract.methods.getLog(i).call() as [string, string, bigint];
        fetchedLogs.push({
          userId: log[0],
          action: log[1],
          timestamp: new Date(Number(log[2]) * 1000).toLocaleString(),
        });
      }
      setLogs(fetchedLogs);
      if (fetchedLogs.length === 0 && count > 0) {
        toast({ title: 'Info', description: `Fetched 0 logs, but there are ${count} on chain.` });
      } else if (fetchedLogs.length === 0) {
        toast({ title: 'Info', description: 'No access logs found.' });
      }

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to fetch logs', description: error.message });
    } finally {
      setIsFetchingLogs(false);
    }
  }, [contract, toast]);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Header />
        <InstructionsCard />
        <div className="grid md:grid-cols-2 gap-6">
          <AuthCard />
          <BlockchainCard
            isConnected={!!web3}
            isConnecting={isConnecting}
            connectBlockchain={connectBlockchain}
            accounts={accounts}
          />
        </div>
        <LoggingCard
          isReady={isAuthenticated && !!web3}
          isLogging={isLogging}
          isFetchingLogs={isFetchingLogs}
          logAccess={logAccess}
          viewLogs={viewLogs}
          logs={logs}
        />
        <AuditCard
          isReady={isAuthenticated && !!web3}
          isVisible={isAuditVisible}
          userEmail={user?.email}
          onToggleVisibility={() => setIsAuditVisible(!isAuditVisible)}
        />
      </div>
    </main>
  );
}
