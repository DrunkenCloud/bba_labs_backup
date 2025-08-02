"use client";

import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText, BookOpen, Loader, Pencil } from 'lucide-react';
import type { LogEntry } from './auth-logger-page';

interface LoggingCardProps {
  isReady: boolean;
  isLogging: boolean;
  isFetchingLogs: boolean;
  logAccess: () => void;
  viewLogs: () => void;
  logs: LogEntry[];
}

export const LoggingCard: FC<LoggingCardProps> = ({ isReady, isLogging, isFetchingLogs, logAccess, viewLogs, logs }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="text-primary" />
          Access Logging
        </CardTitle>
        <CardDescription>
          Log access events to the blockchain and view the immutable history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={viewLogs} disabled={!isReady || isFetchingLogs} variant="secondary" className="flex-1">
            {isFetchingLogs ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2" />}
            {isFetchingLogs ? 'Fetching Logs...' : 'View Access Logs'}
          </Button>
        </div>
        {logs.length > 0 && (
          <>
            <Separator />
            <h4 className="text-md font-medium text-foreground">Recent Access Logs:</h4>
            <ScrollArea className="h-48 w-full rounded-md border p-4">
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-semibold text-foreground truncate">User: {log.userId}</p>
                    <p className="text-muted-foreground">Action: {log.action}</p>
                    <p className="text-muted-foreground">Time: {log.timestamp}</p>
                    {index < logs.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
};
