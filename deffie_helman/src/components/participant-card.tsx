
"use client";

import * as React from "react";
import { Lock, Unlock } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ParticipantCardProps = {
  name: string;
  icon: React.ReactNode;
  privateKey: number;
  publicKey?: number;
  receivedKey?: number;
  sharedSecret?: number;
  math?: string;
  sharedSecretMath?: string;
  isCompromised?: boolean;
};

export const ParticipantCard = ({
  name,
  icon,
  privateKey,
  publicKey,
  receivedKey,
  sharedSecret,
  math,
  sharedSecretMath,
  isCompromised,
}: ParticipantCardProps) => (
  <Card>
    <CardHeader className="flex-row items-center gap-4 space-y-0">
      {icon}
      <CardTitle>{name}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Private Key
        </p>
        <p className="text-2xl font-bold font-mono">{privateKey}</p>
      </div>
      {publicKey !== undefined && (
        <div className="animate-in fade-in duration-500">
          <p className="text-sm font-medium text-muted-foreground">
            Public Key (Generated)
          </p>
          <p className="text-sm text-muted-foreground font-mono">{math}</p>
          <p className="text-2xl font-bold font-mono text-primary">
            {publicKey}
          </p>
        </div>
      )}
      {receivedKey !== undefined && (
        <div className="animate-in fade-in duration-500 delay-200">
          <p className="text-sm font-medium text-muted-foreground">
            Public Key (Received)
          </p>
          <p className="text-2xl font-bold font-mono text-primary">
            {receivedKey}
          </p>
        </div>
      )}
      {sharedSecret !== undefined && (
        <div className="animate-in fade-in duration-500 delay-300">
          <p className="text-sm font-medium text-muted-foreground">
            Shared Secret (Calculated)
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            {sharedSecretMath}
          </p>
          <div className="flex items-center gap-2">
            {isCompromised ? (
              <Unlock className="w-6 h-6 text-destructive" />
            ) : (
              <Lock className="w-6 h-6 text-green-500" />
            )}
            <p
              className={cn(
                "text-2xl font-bold font-mono",
                isCompromised ? "text-destructive" : "text-accent"
              )}
            >
              {sharedSecret}
            </p>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);
