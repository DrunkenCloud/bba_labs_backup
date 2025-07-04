"use client";

import React, { useState, useCallback } from 'react';
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

const CONTRACT_ADDRESS = '0xaa0B6b938e27d41F7cfc3fDc6A81566EB6417Bb1';

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

  const logAccess = useCallback(async () => {
    if (!contract || !user?.sub || accounts.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Not ready to log. Check authentication and blockchain connection.' });
      return;
    }
    setIsLogging(true);
    try {
      const userId = user.sub;
      const action = 'page_access';
      const timestamp = Math.floor(Date.now() / 1000);

      await contract.methods.logAccess(userId, action, timestamp).send({
        from: accounts[0],
        gas: 200000
      });
      toast({ title: 'Success', description: 'Access event logged to the blockchain.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Logging Failed', description: error.message });
    } finally {
      setIsLogging(false);
    }
  }, [contract, user, accounts, toast]);

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
