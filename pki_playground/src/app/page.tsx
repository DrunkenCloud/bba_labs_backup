
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GuidedTour } from '@/components/pki/guided-tour';
import { SimulationDashboard } from '@/components/pki/simulation-dashboard';
import type { Request, ActionType } from '@/lib/pki';
import { generateRequest, actors } from '@/lib/pki';
import { Shield, BookOpen } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from 'framer-motion';

type GameState = 'welcome' | 'tour' | 'simulation';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [score, setScore] = useState(0);
  const [request, setRequest] = useState<Request>(generateRequest(0));
  const [requestCount, setRequestCount] = useState(0);
  const { toast } = useToast();

  const handleAction = (actionType: ActionType, publicKey?: string) => {
    let scoreChange = 0;
    let feedbackMessage = '';
    let toastType: 'default' | 'destructive' = 'default';

    const isRequesterKeyCorrect = actors[request.from].publicKey === request.signingKey;

    if (actionType === 'mitm') {
      if (request.isMitm) {
        scoreChange = 15;
        feedbackMessage = `Correct! You identified the MITM attack. +15 points.`;
        toastType = 'default';
      } else {
        scoreChange = -10;
        feedbackMessage = `Incorrect. That was a legitimate request from ${request.from}. -10 points.`;
        toastType = 'destructive';
      }
    } else { // actionType is 'legitimate'
      if (request.isMitm) {
        scoreChange = -20;
        feedbackMessage = `Oh no! You fell for a MITM attack. -20 points.`;
        toastType = 'destructive';
      } else {
        // Legitimate request, now check the keys.
        if (request.type === 'sign_request') {
           const isCorrectKeySelected = publicKey && actors[request.from].publicKey === publicKey;
           if (isCorrectKeySelected) {
             scoreChange = 10;
             feedbackMessage = `Correct! You verified ${request.from}'s signing key. +10 points.`;
             toastType = 'default';
           } else {
             scoreChange = -5;
             feedbackMessage = `Incorrect key. You should have selected ${request.from}'s key. -5 points.`;
             toastType = 'destructive';
           }
        } else if (request.type === 'get_key' && request.target) {
            const isTargetKeyCorrect = publicKey && actors[request.target].publicKey === publicKey;
            if(isTargetKeyCorrect) {
                scoreChange = 10;
                feedbackMessage = `Correct! You sent ${request.target}'s public key to ${request.from}. +10 points.`;
                toastType = 'default';
            } else {
                scoreChange = -5;
                feedbackMessage = `Incorrect key. You sent the wrong key for ${request.target}. -5 points.`;
                toastType = 'destructive';
            }
        }
      }
    }

    setScore(prev => prev + scoreChange);
    toast({
      title: scoreChange > 0 ? "Correct!" : "Incorrect!",
      description: feedbackMessage,
      variant: toastType,
    });

    // Generate next request
    const nextRequestCount = requestCount + 1;
    setRequest(generateRequest(nextRequestCount));
    setRequestCount(nextRequestCount);
  };
  
  const startSimulation = () => {
    setScore(0);
    setRequestCount(0);
    setRequest(generateRequest(0));
    setGameState('simulation');
  };

  const WelcomeScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary mb-4">
        PKI Playground
      </h1>
      <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
        An interactive experience to understand the fundamentals of Public Key Infrastructure.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" onClick={() => setGameState('tour')} className="font-semibold">
          <BookOpen className="mr-2 h-5 w-5" />
          Start Guided Tour
        </Button>
        <Button size="lg" variant="secondary" onClick={startSimulation} className="font-semibold">
          <Shield className="mr-2 h-5 w-5" />
          Start Simulation
        </Button>
      </div>
    </motion.div>
  );

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-background dark:bg-grid-white/[0.05] bg-grid-black/[0.05] relative">
      <AnimatePresence mode="wait">
        {gameState === 'welcome' && (
           <WelcomeScreen key="welcome" />
        )}
        {gameState === 'tour' && (
          <GuidedTour key="tour" onComplete={() => setGameState('welcome')} />
        )}
        {gameState === 'simulation' && (
          <SimulationDashboard
            key="sim"
            score={score}
            request={request}
            requestCount={requestCount}
            onAction={handleAction}
            onExit={() => setGameState('welcome')}
          />
        )}
      </AnimatePresence>
      <Toaster />
    </main>
  );
}
