'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { KeyRound, ShieldHalf } from 'lucide-react';
import { actors, type ActorName } from '@/lib/pki';
import { cn } from '@/lib/utils';

interface ActorProps {
  name: ActorName;
  keys?: ('public' | 'private')[];
  className?: string;
}

export function Actor({ name, keys = [], className }: ActorProps) {
  const actorInfo = actors[name];
  if (!actorInfo) return null;

  const { icon: Icon, description } = actorInfo;

  const KeyIcon = ({ type }: { type: 'public' | 'private' }) => {
    const isPrivate = type === 'private';
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className={`flex items-center gap-1 p-1 rounded-md ${isPrivate ? 'bg-destructive/20' : 'bg-primary/20'}`}>
              {isPrivate ? <ShieldHalf className="w-4 h-4 text-destructive" /> : <KeyRound className="w-4 h-4 text-primary" />}
              <span className="text-xs font-mono">{type}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPrivate ? 'Private Key: Keep this secret!' : 'Public Key: Share this freely.'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-4 rounded-full bg-secondary border-2 border-primary/50 shadow-md">
              <Icon className="w-10 h-10 text-primary" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <p className="font-headline text-lg">{name}</p>
      {keys.length > 0 && (
        <div className="flex gap-2">
          {keys.map((keyType) => <KeyIcon key={keyType} type={keyType} />)}
        </div>
      )}
    </div>
  );
}
