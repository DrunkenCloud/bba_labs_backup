'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Actor } from '@/components/pki/actor';
import { actors } from '@/lib/pki';

const tourSteps = [
  {
    title: "Welcome to the PKI Guided Tour!",
    description: "Let's learn how Public Key Infrastructure (PKI) keeps communication secure. We'll follow two users, Alice and Bob, who want to talk securely.",
    visualization: () => (
      <div className="flex justify-around items-center w-full">
        <Actor name="Alice" />
        <Actor name="Bob" />
      </div>
    ),
  },
  {
    title: "The Problem: Insecure Channel",
    description: "Alice wants to send a secret message to Bob, but their communication channel is monitored by an eavesdropper, Craig. How can she send it so only Bob can read it?",
    visualization: () => (
      <div className="flex justify-around items-center w-full relative">
        <Actor name="Alice" />
        <div className="flex flex-col items-center">
          <p className="font-mono text-sm text-muted-foreground">&lt;--- ??? ---&gt;</p>
          <Actor name="Craig" className="absolute top-1/2 -translate-y-1/2" />
        </div>
        <Actor name="Bob" />
      </div>
    ),
  },
  {
    title: "Asymmetric Cryptography to the Rescue",
    description: "Bob generates a pair of keys: a PUBLIC key he can share with anyone, and a PRIVATE key he keeps secret. Messages encrypted with the public key can ONLY be decrypted by the private key.",
    visualization: () => (
      <div className="flex justify-around items-center w-full">
        <Actor name="Alice" />
        <Actor name="Bob" keys={['public', 'private']} />
      </div>
    ),
  },
  {
    title: "The Role of a Certificate Authority (CA)",
    description: "But how does Alice know the public key truly belongs to Bob? A trusted Certificate Authority (CA) can verify Bob's identity and 'sign' his public key, creating a digital certificate.",
    visualization: () => (
      <div className="flex justify-around items-center w-full">
        <Actor name="Bob" keys={['public']} />
        <ArrowRight className="w-12 h-12 text-primary" />
        <Actor name="CA" />
      </div>
    ),
  },
  {
    title: "Man-in-the-Middle (MITM) Attack",
    description: "Without a CA, Craig could intercept Bob's public key and substitute his own. Alice would unknowingly use Craig's key, allowing him to read her messages. This is a MITM attack.",
    visualization: () => (
       <div className="flex flex-col items-center w-full space-y-4">
        <div className="flex justify-between w-full">
            <Actor name="Alice" />
            <Actor name="Bob" />
        </div>
        <p className="text-sm font-semibold">Craig intercepts and replaces the key...</p>
        <Actor name="Craig" keys={['public']} />
       </div>
    ),
  },
  {
    title: "How PKI Prevents MITM",
    description: "Because Bob's key is signed by the CA, Alice can verify the certificate. If Craig tries to substitute his key, the signature won't match. Alice will know something is wrong and reject the key.",
    visualization: () => (
      <div className="flex justify-around items-center w-full">
        <Actor name="Alice" />
        <div className="flex flex-col items-center">
            <XCircle className="w-12 h-12 text-destructive" />
            <p className="text-destructive font-bold">Invalid Signature!</p>
        </div>
        <Actor name="Craig" keys={['public']} />
      </div>
    )
  },
   {
    title: "Secure Communication!",
    description: "Now Alice has Bob's authentic public key. She can encrypt her message, and only Bob can decrypt it with his private key. Craig is left out! You're ready for the simulation.",
    visualization: () => (
      <div className="flex justify-around items-center w-full relative">
        <Actor name="Alice" />
        <div className="flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="font-mono text-sm text-green-500">Secure Channel</p>
        </div>
        <Actor name="Bob" keys={['private']} />
      </div>
    )
  }
];

export function GuidedTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const totalSteps = tourSteps.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const currentStep = tourSteps[step];

  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
      <Card className="shadow-2xl">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="font-headline text-3xl text-primary">{currentStep.title}</CardTitle>
          <CardDescription className="text-lg">{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center"
            >
              {currentStep.visualization()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button variant="outline" onClick={onComplete}>
            <Home className="mr-2 h-4 w-4" /> Main Menu
          </Button>
          {step < totalSteps - 1 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
              Finish Tour <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
