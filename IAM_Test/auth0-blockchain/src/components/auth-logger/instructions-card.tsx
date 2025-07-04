"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTree, Network } from 'lucide-react';

export function InstructionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTree className="text-primary" />
          Setup Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-foreground flex items-center gap-2"><Network className="w-4 h-4 text-accent" />1. Start Ganache</h4>
          <p className="text-muted-foreground text-sm">
            Run a local Ganache instance on port 7545.
          </p>
          <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-x-auto">
            ganache-cli --deterministic --accounts 10 --host 0.0.0.0 --port 7545
          </pre>
        </div>
        <div>
          <h4 className="font-semibold text-foreground flex items-center gap-2"><Network className="w-4 h-4 text-accent" />2. Connect this App</h4>
          <p className="text-muted-foreground text-sm">
            Use the "Authentication" and "Blockchain Connection" panels below to interact.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
