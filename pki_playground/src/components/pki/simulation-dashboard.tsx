
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Request, ActionType } from '@/lib/pki';
import { Actor } from '@/components/pki/actor';
import { Mail, ShieldCheck, ArrowRight, Home, KeyRound, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { actors } from '@/lib/pki';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from '@/components/ui/label';

interface SimulationDashboardProps {
  score: number;
  request: Request;
  requestCount: number;
  onAction: (action: ActionType, publicKey?: string) => void;
  onExit: () => void;
}

export function SimulationDashboard({
  score,
  request,
  requestCount,
  onAction,
  onExit,
}: SimulationDashboardProps) {
  const [selectedKey, setSelectedKey] = React.useState<string | undefined>(undefined);
  const [actionType, setActionType] = React.useState<ActionType>('legitimate');

  // Reset selected key when request or actionType changes
  React.useEffect(() => {
    setSelectedKey(undefined);
  }, [request, actionType]);

  const allPublicKeys = React.useMemo(() => {
    return Object.values(actors).map(actor => actor.publicKey).sort();
  }, []);
  
  const handleProceed = () => {
    onAction(actionType, selectedKey);
    setSelectedKey(undefined); // Reset for next round
  };

  const getRequestDescription = () => {
    if (request.type === 'sign_request') {
      return (
        <div className="text-lg leading-relaxed">
          A certificate signing request has arrived, claiming to be from <Badge variant="secondary" className="text-lg">{request.from}</Badge>. 
          The request was signed with the key <Badge variant="outline" className="text-lg font-mono">{request.signingKey}</Badge>.
        </div>
      );
    }
    if (request.type === 'get_key') {
      return (
        <div className="text-lg leading-relaxed">
          <Badge variant="secondary" className="text-lg">{request.from}</Badge> is requesting the public key for <Badge variant="secondary" className="text-lg">{request.target}</Badge>.
          The request was signed with key <Badge variant="outline" className="text-lg font-mono">{request.signingKey}</Badge>.
        </div>
      );
    }
    return null;
  };

  const getInstructions = () => {
    if (actionType === 'mitm') {
      return "You've flagged this as a potential Man-in-the-Middle attack. No key selection is needed. Proceed to confirm."
    }
    if (request.type === 'sign_request') {
      return "Verify the signing key is legitimate by selecting the sender's public key from the list to approve the request.";
    }
    if (request.type === 'get_key') {
      return "This is a two-step process. First, ensure the request is legitimate. Then, select the public key for the *target* user to fulfill the request.";
    }
    return "";
  }

  const getSelectPlaceholder = () => {
    if (actionType === 'mitm') return "No key selection needed";
    if (request.type === 'sign_request') return "Select sender's public key...";
    if (request.type === 'get_key') return "Select target's public key...";
    return "Select a Public Key...";
  }

  const isProceedDisabled = actionType === 'legitimate' && !selectedKey;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="w-full max-w-5xl"
    >
      <header className="flex justify-between items-center mb-4 text-foreground">
        <h1 className="font-headline text-4xl text-primary">Simulation Mode</h1>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="font-semibold text-lg">Score</p>
                <Badge className="text-xl px-3 py-1">{score}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onExit} aria-label="Exit Simulation">
                <Home />
            </Button>
        </div>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
           <CardDescription className="text-right mt-1 font-mono">Request #{requestCount + 1}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center space-y-6">
                <h2 className="text-2xl font-headline text-center">System Visualizer</h2>
                <div className="relative w-full p-4 rounded-lg bg-background/50 border min-h-[150px] flex justify-between items-center">
                    <Actor name={request.from} />
                    <div className="flex flex-col items-center text-center">
                        <ArrowRight className="w-10 h-10 text-muted-foreground" />
                        <p className="text-sm font-mono mt-1">{request.type === 'get_key' ? `requesting ${request.target}'s key` : 'signing request'}</p>
                    </div>
                     <div className="flex flex-col items-center space-y-2 text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-4 rounded-full bg-secondary border-2 border-primary/50 shadow-md">
                                <ShieldCheck className="w-10 h-10 text-primary" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>You are acting as the Certificate Authority.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <p className="font-headline text-lg">You (CA)</p>
                      </div>
                </div>
            </div>

            <Card className="bg-background/50">
                <CardHeader>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-6 h-6" />
                        <CardTitle className="font-headline text-2xl">Incoming Request</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                       {getRequestDescription()}
                       
                       <RadioGroup value={actionType} onValueChange={(v: ActionType) => setActionType(v)} className="flex items-center space-x-4 pt-4">
                         <div className="flex items-center space-x-2">
                           <RadioGroupItem value="legitimate" id="r-legit" />
                           <Label htmlFor="r-legit" className="flex items-center gap-2 cursor-pointer"><ShieldQuestion/>Legitimate Request</Label>
                         </div>
                         <div className="flex items-center space-x-2">
                           <RadioGroupItem value="mitm" id="r-mitm" />
                           <Label htmlFor="r-mitm" className="flex items-center gap-2 cursor-pointer"><ShieldAlert className="text-destructive"/>MITM Attack</Label>
                         </div>
                       </RadioGroup>

                       <p className="text-muted-foreground text-sm min-h-[40px]">
                          {getInstructions()}
                       </p>

                       <div className="flex items-center gap-4 pt-4">
                            <KeyRound className="w-6 h-6 text-primary" />
                            <Select onValueChange={setSelectedKey} value={selectedKey} disabled={actionType === 'mitm'}>
                                <SelectTrigger>
                                    <SelectValue placeholder={getSelectPlaceholder()} />
                                </SelectTrigger>
                                <SelectContent>
                                    {allPublicKeys.map(key => (
                                        <SelectItem key={key} value={key} className="font-mono">{key}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                       </div>

                       <div className="flex justify-end gap-4 pt-4">
                        <Button className="bg-green-600 hover:bg-green-700" size="lg" onClick={handleProceed} disabled={isProceedDisabled}>
                            Proceed
                        </Button>
                       </div>
                    </div>
                </CardContent>
            </Card>

        </CardContent>
      </Card>
    </motion.div>
  );
}
