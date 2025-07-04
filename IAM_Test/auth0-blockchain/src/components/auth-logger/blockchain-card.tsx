"use client";

import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Link, Loader, Blocks } from 'lucide-react';

interface BlockchainCardProps {
  isConnected: boolean;
  isConnecting: boolean;
  connectBlockchain: () => void;
  accounts: string[];
}

export const BlockchainCard: FC<BlockchainCardProps> = ({ isConnected, isConnecting, connectBlockchain, accounts }) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Blocks className="text-primary" />
          Blockchain Connection
        </CardTitle>
        <CardDescription>Connect to your local Ganache instance.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center items-center gap-4">
        {isConnected ? (
          <div className="text-center space-y-4 w-full">
            <div className="mx-auto bg-muted rounded-full p-4 w-fit">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                Connected to Ganache
            </Badge>
            <div className="text-left text-sm bg-muted p-3 rounded-md w-full">
              <p><strong>Network:</strong> Ganache (Local)</p>
              <p><strong>Accounts:</strong> {accounts.length}</p>
              <p className="truncate"><strong>Your Address:</strong> {accounts[0]}</p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
             <div className="mx-auto bg-muted rounded-full p-4 w-fit">
               <XCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Not connected to blockchain.</p>
          </div>
        )}
      </CardContent>
      <div className="p-6 pt-0 mt-auto">
        <Button onClick={connectBlockchain} disabled={isConnecting || isConnected} className="w-full">
          {isConnecting ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Link className="mr-2" />
          )}
          {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Connect to Ganache'}
        </Button>
      </div>
    </Card>
  );
}
