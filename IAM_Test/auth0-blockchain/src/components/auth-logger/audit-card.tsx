"use client";

import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Search, CheckSquare } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AuditCardProps {
  isReady: boolean;
  isVisible: boolean;
  userEmail?: string;
  onToggleVisibility: () => void;
}

export const AuditCard: FC<AuditCardProps> = ({ isReady, isVisible, userEmail, onToggleVisibility }) => {
  return (
    <Card>
      <Collapsible open={isVisible} onOpenChange={onToggleVisibility}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="text-primary" />
              Audit Trail
            </CardTitle>
            <CardDescription>
              Query the blockchain for a tamper-proof access history.
            </CardDescription>
          </div>
          <CollapsibleTrigger asChild>
            <Button disabled={!isReady}>
              <Search className="mr-2" />
              {isVisible ? 'Hide Audit Trail' : 'Query Audit Trail'}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="border bg-muted/50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Audit Trail for User: <span className="text-accent">{userEmail || 'N/A'}</span>
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="font-medium text-foreground">Blockchain Verification</h5>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 mt-0.5 text-green-500 shrink-0" /><span>User identity verified via Auth0.</span></li>
                    <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 mt-0.5 text-green-500 shrink-0" /><span>Access events immutably stored on-chain.</span></li>
                    <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 mt-0.5 text-green-500 shrink-0" /><span>Cryptographic proof of access history.</span></li>
                    <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 mt-0.5 text-green-500 shrink-0" /><span>Provides a tamper-proof audit trail.</span></li>
                  </ul>
                </div>
                <div className="space-y-3">
                   <h5 className="font-medium text-foreground">Security Benefits</h5>
                   <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 mt-0.5 text-green-500 shrink-0" /><span>Decentralized identity verification.</span></li>
                    <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 mt-0.5 text-green-500 shrink-0" /><span>Immutable and non-repudiable access logs.</span></li>
                    <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 mt-0.5 text-green-500 shrink-0" /><span>Enhanced cryptographic integrity.</span></li>
                    <li className="flex items-start gap-2"><CheckSquare className="w-4 h-4 mt-0.5 text-green-500 shrink-0" /><span>Transparent and verifiable audit process.</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
