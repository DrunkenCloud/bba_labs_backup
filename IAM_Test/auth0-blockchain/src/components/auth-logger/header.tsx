"use client";

import { Lock, Share2 } from 'lucide-react';

export function Header() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center gap-4 mb-4">
        <Lock className="h-10 w-10 text-primary" />
        <Share2 className="h-10 w-10 text-accent" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
        Auth0 + Ganache IAM Demo
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        A modern demonstration of decentralized Identity and Access Management.
      </p>
    </div>
  );
}
