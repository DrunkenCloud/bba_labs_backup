
"use client";
import * as React from "react";
import { User, Bug, ArrowRight, ArrowLeft, Lock, Unlock, Plus, Equal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ColorMixingVisualizerProps {
  step: number;
  isMalloryActive: boolean;
  colors: {
    commonColor: string;
    aliceSecret: string;
    bobSecret: string;
    mallorySecret?: string;
  };
}

const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const mixTwoColors = (color1: string, color2: string) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const r = Math.floor((rgb1.r + rgb2.r) / 2);
  const g = Math.floor((rgb1.g + rgb2.g) / 2);
  const b = Math.floor((rgb1.b + rgb2.b) / 2);
  return rgbToHex(r, g, b);
};

const mixThreeColors = (color1: string, color2: string, color3: string) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const rgb3 = hexToRgb(color3);
    const r = Math.floor((rgb1.r + rgb2.r + rgb3.r) / 3);
    const g = Math.floor((rgb1.g + rgb2.g + rgb3.g) / 3);
    const b = Math.floor((rgb1.b + rgb2.b + rgb3.b) / 3);
    return rgbToHex(r, g, b);
}


const ColorSwatch = ({ color, label, className }: { color: string, label: string, className?: string }) => (
  <div className={cn("flex flex-col items-center gap-2", className)}>
    <div className="w-16 h-16 rounded-full border-4 border-white/50 shadow-md" style={{ backgroundColor: color }} />
    <p className="text-xs font-medium text-center">{label}</p>
  </div>
);

const MixOperation = ({ color1, color2, result, label }: { color1: string, color2:string, result:string, label:string }) => (
    <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
            <ColorSwatch color={color1} label="" />
            <Plus className="w-4 h-4 text-muted-foreground" />
            <ColorSwatch color={color2} label="" />
            <Equal className="w-4 h-4 text-muted-foreground" />
            <ColorSwatch color={result} label="" />
        </div>
        <p className="text-xs font-mono text-center text-muted-foreground">{label}</p>
    </div>
);


export const ColorMixingVisualizer = ({ step, isMalloryActive, colors }: ColorMixingVisualizerProps) => {
    const { commonColor, aliceSecret, bobSecret, mallorySecret } = colors;

    // Step 1: Mix secret colors with common color
    const alicePublicMix = mixTwoColors(commonColor, aliceSecret);
    const bobPublicMix = mixTwoColors(commonColor, bobSecret);
    const malloryPublicMixAlice = mallorySecret ? mixTwoColors(commonColor, mallorySecret) : '';
    const malloryPublicMixBob = mallorySecret ? mixTwoColors(commonColor, mallorySecret) : '';


    // Step 2: Exchange (or intercept)
    const aliceReceives = isMalloryActive ? malloryPublicMixAlice : bobPublicMix;
    const bobReceives = isMalloryActive ? malloryPublicMixBob : alicePublicMix;

    // Step 3: Calculate final shared secret
    // Correctly mix the 3 base colors together for the final secret
    const finalAliceSecret = mixThreeColors(commonColor, aliceSecret, bobSecret);
    const finalBobSecret = mixThreeColors(commonColor, aliceSecret, bobSecret);


    // Mallory's calculated secrets
    const finalMalloryWithAlice = mallorySecret ? mixThreeColors(commonColor, aliceSecret, mallorySecret) : '';
    const finalMalloryWithBob = mallorySecret ? mixThreeColors(commonColor, bobSecret, mallorySecret) : '';

    const aliceFinalMixDisplay = isMalloryActive ? mixTwoColors(aliceReceives, aliceSecret) : finalAliceSecret;
    const bobFinalMixDisplay = isMalloryActive ? mixTwoColors(bobReceives, bobSecret) : finalBobSecret;

  return (
    <div className="space-y-6 rounded-lg border bg-card-foreground/5 p-4">
        <div className="flex justify-center">
            <ColorSwatch color={commonColor} label="Common Paint" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
            {/* Alice */}
            <div className="flex flex-col items-center space-y-4">
                <Card className="w-full">
                    <CardHeader className="p-4"><CardTitle className="text-base text-center">Alice</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center space-y-2 p-4 pt-0">
                       <ColorSwatch color={aliceSecret} label="Alice's Secret" />
                       {step > 0 && <MixOperation color1={commonColor} color2={aliceSecret} result={alicePublicMix} label="Alice's Public Mix" />}
                       {step > 2 && <MixOperation color1={aliceReceives} color2={aliceSecret} result={aliceFinalMixDisplay} label="Alice's Final Mix" />}
                    </CardContent>
                </Card>
                 {step > 2 && (
                    <div className="flex items-center gap-2 animate-in fade-in">
                       {finalAliceSecret !== finalBobSecret ? <Unlock className="w-5 h-5 text-destructive" /> : <Lock className="w-5 h-5 text-green-500" />}
                       <ColorSwatch color={aliceFinalMixDisplay} label="Shared Secret" />
                    </div>
                )}
            </div>

            {/* Middle Section */}
            <div className="flex flex-col items-center justify-around h-full space-y-4 pt-8 text-muted-foreground">
              {step >= 1 && (
                  <div className="relative w-full text-center animate-in fade-in">
                      <p className="text-sm">Alice sends mix</p>
                      <ArrowRight className={cn("h-8 w-full transition-colors", isMalloryActive && "text-destructive")} />
                      <ColorSwatch color={alicePublicMix} label="" className="absolute -top-2 left-1/2 -translate-x-1/2"/>
                  </div>
              )}
              {isMalloryActive && step > 0 && (
                <Card className="border-destructive bg-destructive/10 w-full animate-in fade-in">
                    <CardHeader className="p-4 flex-row items-center gap-2 space-y-0"><Bug className="w-5 h-5 text-destructive" /><CardTitle className="text-base">Mallory</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                        <ColorSwatch color={mallorySecret || '#000000'} label="Mallory's Secret"/>
                        <p className="text-xs text-center">Intercepts mixes, sends fakes.</p>
                         {step > 2 && (
                            <div className="space-y-2 text-xs">
                                <Separator className="bg-destructive/50" />
                                <p>Her Mix with Alice:</p>
                                <ColorSwatch color={finalMalloryWithAlice} label="" />
                                 <p>Her Mix with Bob:</p>
                                <ColorSwatch color={finalMalloryWithBob} label="" />
                            </div>
                        )}
                    </CardContent>
                </Card>
              )}
               {step >= 1 && (
                  <div className="relative w-full text-center animate-in fade-in">
                      <p className="text-sm">Bob sends mix</p>
                      <ArrowLeft className={cn("h-8 w-full transition-colors", isMalloryActive && "text-destructive")} />
                      <ColorSwatch color={bobPublicMix} label="" className="absolute -top-2 left-1/2 -translate-x-1/2"/>
                  </div>
                )}
            </div>


            {/* Bob */}
             <div className="flex flex-col items-center space-y-4">
                <Card className="w-full">
                    <CardHeader className="p-4"><CardTitle className="text-base text-center">Bob</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center space-y-2 p-4 pt-0">
                       <ColorSwatch color={bobSecret} label="Bob's Secret" />
                       {step > 0 && <MixOperation color1={commonColor} color2={bobSecret} result={bobPublicMix} label="Bob's Public Mix" />}
                       {step > 2 && <MixOperation color1={bobReceives} color2={bobSecret} result={bobFinalMixDisplay} label="Bob's Final Mix" />}
                    </CardContent>
                </Card>
                 {step > 2 && (
                    <div className="flex items-center gap-2 animate-in fade-in">
                        {finalAliceSecret !== finalBobSecret ? <Unlock className="w-5 h-5 text-destructive" /> : <Lock className="w-5 h-5 text-green-500" />}
                       <ColorSwatch color={bobFinalMixDisplay} label="Shared Secret" />
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
