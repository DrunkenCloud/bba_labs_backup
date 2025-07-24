
"use client";

import * as React from "react";
import { useState, useReducer, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  User,
  Bug,
  ArrowRight,
  ArrowLeft,
  Lock,
  Unlock,
  BookMarked,
  ClipboardList,
  Palette,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ParticipantCard } from "@/components/participant-card";
import { ColorMixingVisualizer } from "@/components/color-mixing-visualizer";

const formSchema = z.object({
  p: z.coerce.number().min(2, "Must be a prime number >= 2"),
  g: z.coerce.number().min(1, "Must be >= 1"),
  a: z.coerce.number().min(1, "Must be >= 1"),
  b: z.coerce.number().min(1, "Must be >= 1"),
  malloryA: z.coerce.number().min(1, "Must be >= 1"),
  malloryB: z.coerce.number().min(1, "Must be >= 1"),
  isMalloryActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type LogEntry = {
  timestamp: string;
  message: string;
  state: Partial<SimulationState>;
};

type SavedState = {
  timestamp: string;
  state: SimulationState;
};

type SimulationState = {
  step: number;
  A?: number;
  B?: number;
  sharedSecretAlice?: number;
  sharedSecretBob?: number;
  AMallory?: number;
  BMallory?: number;
  sharedSecretAliceMallory?: number;
  sharedSecretBobMallory?: number;
  mallorySecretWithAlice?: number;
  mallorySecretWithBob?: number;
  isMalloryActive: boolean;
  formValues: FormValues;
};

const initialState: SimulationState = {
  step: 0,
  isMalloryActive: false,
  formValues: {
    p: 23,
    g: 5,
    a: 4,
    b: 3,
    malloryA: 6,
    malloryB: 7,
    isMalloryActive: false,
  },
};

const colorScenarios = [
    // Normal scenarios
    { p: 23, g: 5, a: 4, b: 3, isMalloryActive: false, malloryA: 6, malloryB: 7, commonColor: "#fef3c7", aliceSecret: "#fca5a5", bobSecret: "#93c5fd" },
    { p: 17, g: 3, a: 5, b: 7, isMalloryActive: false, malloryA: 4, malloryB: 6, commonColor: "#d1fae5", aliceSecret: "#fecaca", bobSecret: "#c7d2fe" },
    { p: 31, g: 3, a: 8, b: 6, isMalloryActive: false, malloryA: 9, malloryB: 10, commonColor: "#e0e7ff", aliceSecret: "#fee2e2", bobSecret: "#dbeafe" },
    // MITM scenarios
    { p: 23, g: 5, a: 4, b: 3, isMalloryActive: true, malloryA: 6, malloryB: 7, commonColor: "#fef3c7", aliceSecret: "#fca5a5", bobSecret: "#93c5fd", mallorySecret: "#a7f3d0" },
    { p: 17, g: 3, a: 5, b: 7, isMalloryActive: true, malloryA: 4, malloryB: 6, commonColor: "#d1fae5", aliceSecret: "#fecaca", bobSecret: "#c7d2fe", mallorySecret: "#fde68a" },
    { p: 31, g: 3, a: 8, b: 6, isMalloryActive: true, malloryA: 9, malloryB: 10, commonColor: "#e0e7ff", aliceSecret: "#fee2e2", bobSecret: "#dbeafe", mallorySecret: "#fce7f3" },
];

function simulationReducer(state: SimulationState, action: any): SimulationState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, 3), ...action.payload };
    case 'SET_MALLORY':
      return { ...state, isMalloryActive: action.payload };
    case 'UPDATE_FORM':
      return { ...state, formValues: action.payload };
    case 'RESET':
      const newState = {
        ...initialState,
        formValues: action.payload || { ...state.formValues, isMalloryActive: state.isMalloryActive },
        isMalloryActive: action.payload ? action.payload.isMalloryActive : state.isMalloryActive,
      };
       return newState;
    default:
      return state;
  }
}

export function DHKeyExchangeLab() {
  const { toast } = useToast();
  const [simulation, dispatch] = useReducer(simulationReducer, initialState);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [savedStates, setSavedStates] = useState<SavedState[]>([]);
  const [colorConfigIndex, setColorConfigIndex] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialState.formValues,
  });


   useEffect(() => {
    const scenario = colorScenarios[colorConfigIndex];
    form.reset(scenario);
    dispatch({ type: 'RESET', payload: scenario });
    setLogs([]);
  }, [colorConfigIndex]);

  useEffect(() => {
      const subscription = form.watch((value) => {
          handleFormChange(value as FormValues)
      });
      return () => subscription.unsubscribe();
  }, [form.watch]);


  const addLog = (message: string, state: Partial<SimulationState>) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, message, state }, ...prev]);
  };
  
  const handleNextStep = () => {
    const { p, g, a, b, malloryA, malloryB } = simulation.formValues;
    const { step, isMalloryActive } = simulation;

    if (step === 0) {
      const A = (g ** a) % p;
      const B = (g ** b) % p;
      let payload: any = { A, B };
      addLog(`Alice generated public key A=${A}. Bob generated public key B=${B}.`, { A, B });

      if (isMalloryActive) {
        const AMallory = (g ** malloryA) % p;
        const BMallory = (g ** malloryB) % p;
        payload = { ...payload, AMallory, BMallory };
        addLog(`Mallory generated fake keys A'=${AMallory} and B'=${BMallory}.`, { AMallory, BMallory });
      }
      dispatch({ type: 'NEXT_STEP', payload });
    } else if (step === 1) {
      if (isMalloryActive) {
        addLog(`Mallory intercepts A from Alice and B from Bob. Sends B' to Alice and A' to Bob.`, {});
      } else {
        addLog(`Alice and Bob exchange public keys. Alice receives B=${simulation.B}, Bob receives A=${simulation.A}.`, {});
      }
      dispatch({ type: 'NEXT_STEP', payload: {} });
    } else if (step === 2) {
      if (isMalloryActive) {
        const sharedSecretAliceMallory = ((simulation.BMallory ?? 0) ** a) % p;
        const sharedSecretBobMallory = ((simulation.AMallory ?? 0) ** b) % p;
        const mallorySecretWithAlice = ((simulation.A ?? 0) ** malloryB) % p;
        const mallorySecretWithBob = ((simulation.B ?? 0) ** malloryA) % p;
        const payload = { sharedSecretAliceMallory, sharedSecretBobMallory, mallorySecretWithAlice, mallorySecretWithBob };
        addLog(`Secrets calculated. Alice has ${sharedSecretAliceMallory}, Bob has ${sharedSecretBobMallory}. Both are compromised.`, payload);
        addLog(`Mallory calculated secret with Alice: ${mallorySecretWithAlice}.`, {});
        addLog(`Mallory calculated secret with Bob: ${mallorySecretWithBob}.`, {});
        dispatch({ type: 'NEXT_STEP', payload });
      } else {
        const sharedSecretAlice = ((simulation.B ?? 0) ** a) % p;
        const sharedSecretBob = ((simulation.A ?? 0) ** b) % p;
        const payload = { sharedSecretAlice, sharedSecretBob };
        addLog(`Shared secrets calculated. Alice and Bob both have secret ${sharedSecretAlice}.`, payload);
        dispatch({ type: 'NEXT_STEP', payload });
      }
    }
  };

  const handleReset = () => {
    const scenario = colorScenarios[colorConfigIndex];
    form.reset(scenario);
    dispatch({ type: 'RESET', payload: scenario });
    setLogs([]);
  };

  const handleCycleScenario = () => {
      setColorConfigIndex(prev => (prev + 1) % colorScenarios.length);
  }

  const handleSaveState = () => {
    const timestamp = new Date().toLocaleString();
    const saved: SavedState = { timestamp, state: {...simulation} };
    setSavedStates(prev => [saved, ...prev]);
    toast({
      title: "State Saved",
      description: `The current simulation state at ${timestamp} has been saved.`,
    });
  };
  
  const handleFormChange = (values: FormValues) => {
    dispatch({ type: 'UPDATE_FORM', payload: values });
  }

  const handleMallorySwitch = (checked: boolean) => {
    const newIsMalloryActive = checked;
    let newColorIndex = -1;

    // Find a matching scenario
    for(let i=0; i < colorScenarios.length; i++) {
        const scenario = colorScenarios[i];
        if (scenario.isMalloryActive === newIsMalloryActive) {
            newColorIndex = i;
            break;
        }
    }

    if (newColorIndex !== -1) {
        setColorConfigIndex(newColorIndex);
    } else {
        // Fallback if no matching scenario is found (should not happen with current data)
        form.setValue('isMalloryActive', checked);
        dispatch({ type: 'SET_MALLORY', payload: checked });
        handleReset();
    }
  };


  const { step, isMalloryActive } = simulation;
  const isFinished = step === 3;
  
  const receivedKeyAlice = isMalloryActive ? simulation.BMallory : simulation.B;
  const receivedKeyBob = isMalloryActive ? simulation.AMallory : simulation.A;
  
  const sharedSecretAlice = isMalloryActive ? simulation.sharedSecretAliceMallory : simulation.sharedSecretAlice;
  const sharedSecretBob = isMalloryActive ? simulation.sharedSecretBobMallory : simulation.sharedSecretBob;
  
  const currentColorConfig = colorScenarios[colorConfigIndex];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Simulation Setup</CardTitle>
          <CardDescription>
            Define public parameters and private keys. Then, walk through the exchange step-by-step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <fieldset disabled={step > 0}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField control={form.control} name="p" render={({ field }) => <FormItem><FormLabel>Prime (p)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="g" render={({ field }) => <FormItem><FormLabel>Generator (g)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="a" render={({ field }) => <FormItem><FormLabel>Alice's Private Key (a)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                  <FormField control={form.control} name="b" render={({ field }) => <FormItem><FormLabel>Bob's Private Key (b)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                </div>
                <Separator className="my-6" />
                <FormField control={form.control} name="isMalloryActive" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Man-in-the-Middle Attack</FormLabel>
                      <FormDescription>Simulate an attacker intercepting the key exchange.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={handleMallorySwitch} /></FormControl>
                  </FormItem>
                )} />
                {form.getValues('isMalloryActive') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg mt-4 animate-in fade-in duration-300">
                    <FormField control={form.control} name="malloryA" render={({ field }) => <FormItem><FormLabel>Mallory's Key for Bob (mₐ)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                    <FormField control={form.control} name="malloryB" render={({ field }) => <FormItem><FormLabel>Mallory's Key for Alice (mₑ)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                  </div>
                )}
              </fieldset>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
            <div className="space-x-2">
                 <Button onClick={handleNextStep} disabled={isFinished}>
                    {step === 0 && "Step 1: Generate Public Keys"}
                    {step === 1 && "Step 2: Exchange Keys"}
                    {step === 2 && "Step 3: Calculate Shared Secrets"}
                    {step === 3 && "Finished"}
                 </Button>
                 <Button variant="secondary" onClick={handleReset}>Reset</Button>
            </div>
            <div className="space-x-2">
                <Button variant="outline" onClick={handleCycleScenario}><RefreshCw className="mr-2 h-4 w-4" />Cycle Scenario</Button>
                <Button variant="outline" onClick={handleSaveState}><BookMarked className="mr-2 h-4 w-4" />Save State</Button>
            </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Exchange Visualization</CardTitle>
           <CardDescription>
            {step === 0 && "Start by generating the public keys."}
            {step === 1 && "The public keys are ready to be exchanged."}
            {step === 2 && "Keys have been exchanged. Time to calculate the shared secret."}
            {step === 3 && "The key exchange is complete. Check the result below."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4">
            <ParticipantCard
              name="Alice"
              icon={<User className="w-8 h-8 text-primary" />}
              privateKey={simulation.formValues.a}
              publicKey={step > 0 ? simulation.A : undefined}
              math={step > 0 ? `A = gᵃ mod p = ${simulation.formValues.g} ^ ${simulation.formValues.a} mod ${simulation.formValues.p}` : undefined}
              receivedKey={step > 1 ? receivedKeyAlice : undefined}
              sharedSecret={step > 2 ? sharedSecretAlice : undefined}
              sharedSecretMath={step > 2 ? `s = B'ᵃ mod p = ${receivedKeyAlice} ^ ${simulation.formValues.a} mod ${simulation.formValues.p}` : undefined}
              isCompromised={isMalloryActive && step > 2}
            />

            <div className="flex flex-col items-center justify-around h-full space-y-4 pt-8 text-muted-foreground">
               {step > 0 && <p className="font-bold text-center">Public Key Exchange</p>}
               {step >= 1 && (
                  <div className="relative w-full text-center animate-in fade-in">
                     <p className="text-sm">Alice sends A: {simulation.A}</p>
                     <ArrowRight className={cn("h-16 w-full transition-colors", isMalloryActive && step > 0 && "text-destructive")} />
                  </div>
               )}
              
              {isMalloryActive && step > 0 && (
                <div className="w-full animate-in fade-in duration-300">
                  <Card className="border-destructive bg-destructive/10">
                    <CardHeader className="flex-row items-center gap-4 space-y-0 p-4">
                      <Bug className="w-8 h-8 text-destructive" />
                      <CardTitle>Mallory</CardTitle>
                    </CardHeader>
                    {step > 0 && (
                        <CardContent className="p-4 space-y-2 text-xs">
                           <p>Intercepts A=<span className="font-bold">{simulation.A}</span>. Sends A'=<span className="font-bold">{simulation.AMallory}</span> to Bob.</p>
                           <p className="font-mono">{`A' = gᵐᵅ mod p = ${simulation.formValues.g}^${simulation.formValues.malloryA} mod ${simulation.formValues.p}`}</p>
                           <Separator className="my-2 bg-destructive/50" />
                           <p>Intercepts B=<span className="font-bold">{simulation.B}</span>. Sends B'=<span className="font-bold">{simulation.BMallory}</span> to Alice.</p>
                           <p className="font-mono">{`B' = gᵐᵦ mod p = ${simulation.formValues.g}^${simulation.formValues.malloryB} mod ${simulation.formValues.p}`}</p>
                           {step > 2 && (
                             <>
                              <Separator className="my-2 bg-destructive/50" />
                              <p>Secret w/ Alice: <span className="font-bold">{simulation.mallorySecretWithAlice}</span> <span className="font-mono text-muted-foreground">{`s₁ = Aᵐᵦ mod p`}</span></p>
                              <p>Secret w/ Bob: <span className="font-bold">{simulation.mallorySecretWithBob}</span> <span className="font-mono text-muted-foreground">{`s₂ = Bᵐᵅ mod p`}</span></p>
                             </>
                           )}
                        </CardContent>
                    )}
                  </Card>
                </div>
              )}
              
               {step >= 1 && (
                  <div className="relative w-full text-center animate-in fade-in">
                    <p className="text-sm">Bob sends B: {simulation.B}</p>
                    <ArrowLeft className={cn("h-16 w-full transition-colors", isMalloryActive && step > 0 && "text-destructive")} />
                  </div>
                )}
            </div>

            <ParticipantCard
              name="Bob"
              icon={<User className="w-8 h-8 text-primary" />}
              privateKey={simulation.formValues.b}
              publicKey={step > 0 ? simulation.B : undefined}
              math={step > 0 ? `B = gᵇ mod p = ${simulation.formValues.g} ^ ${simulation.formValues.b} mod ${simulation.formValues.p}` : undefined}
              receivedKey={step > 1 ? receivedKeyBob : undefined}
              sharedSecret={step > 2 ? sharedSecretBob : undefined}
              sharedSecretMath={step > 2 ? `s = A'ᵇ mod p = ${receivedKeyBob} ^ ${simulation.formValues.b} mod ${simulation.formValues.p}` : undefined}
              isCompromised={isMalloryActive && step > 2}
            />
          </div>
          {step === 3 && !isMalloryActive && sharedSecretAlice !== undefined && sharedSecretAlice === sharedSecretBob && (
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-in fade-in">
                <h3 className="font-bold text-green-400 flex items-center justify-center gap-2"><Lock /> Secure Connection Established</h3>
                <p>Alice and Bob have successfully established a shared secret: <span className="font-bold text-accent font-mono">{sharedSecretAlice}</span></p>
            </div>
          )}
          {step === 3 && isMalloryActive && (
             <div className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in">
                <h3 className="font-bold text-destructive flex items-center justify-center gap-2"><Unlock /> Man-in-the-Middle Attack Successful!</h3>
                <p>Mallory has intercepted the communication. Alice and Bob have different secrets, both known to Mallory.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette /> Color Mixing Analogy</CardTitle>
          <CardDescription>
            This is a visual analogy for the key exchange. Alice and Bob start with a common paint color (public), mix in their secret color (private), exchange the results, and then mix their secret color again to arrive at a shared secret color.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <ColorMixingVisualizer
                step={step}
                isMalloryActive={isMalloryActive}
                colors={currentColorConfig}
            />
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
           <Tabs defaultValue="logs" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="logs"><ClipboardList className="mr-2 h-4 w-4" />Event Log</TabsTrigger>
              <TabsTrigger value="saved"><BookMarked className="mr-2 h-4 w-4" />Saved States</TabsTrigger>
            </TabsList>
            <TabsContent value="logs">
                <Card>
                    <CardHeader><CardTitle>Event Log</CardTitle><CardDescription>A real-time log of the key exchange events.</CardDescription></CardHeader>
                    <CardContent className="h-64 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Time</TableHead>
                            <TableHead>Event</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {logs.map((log, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{log.timestamp}</TableCell>
                              <TableCell>{log.message}</TableCell>
                            </TableRow>
                          ))}
                           {logs.length === 0 && <TableRow><TableCell colSpan={2} className="text-center">No events yet.</TableCell></TableRow>}
                        </TableBody>
                      </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="saved">
                 <Card>
                    <CardHeader><CardTitle>Saved States</CardTitle><CardDescription>Review previously saved simulation states.</CardDescription></CardHeader>
                    <CardContent className="h-64 overflow-y-auto">
                        <Table>
                          <TableHeader>
                             <TableRow>
                              <TableHead className="w-[180px]">Timestamp</TableHead>
                              <TableHead>Mode</TableHead>
                              <TableHead>p, g</TableHead>
                              <TableHead>Alice</TableHead>
                              <TableHead>Bob</TableHead>
                              <TableHead>Secret</TableHead>
                            </TableRow>
                          </TableHeader>
                           <TableBody>
                              {savedStates.map((saved, i) => {
                                const { state } = saved;
                                const { formValues } = state;
                                const aliceSecret = state.isMalloryActive ? state.sharedSecretAliceMallory : state.sharedSecretAlice;
                                const bobSecret = state.isMalloryActive ? state.sharedSecretBobMallory : state.sharedSecretBob;

                                return (
                                <TableRow key={i}>
                                  <TableCell className="font-medium">{saved.timestamp}</TableCell>
                                  <TableCell><Badge variant={state.isMalloryActive ? 'destructive' : 'secondary'}>{state.isMalloryActive ? 'MITM' : 'Normal'}</Badge></TableCell>
                                  <TableCell>{formValues.p}, {formValues.g}</TableCell>
                                  <TableCell>a={formValues.a}, A={state.A}</TableCell>
                                  <TableCell>b={formValues.b}, B={state.B}</TableCell>
                                  <TableCell>
                                    {aliceSecret !== undefined && (
                                       <Badge variant={aliceSecret === bobSecret ? 'default' : 'destructive'}>{aliceSecret}</Badge>
                                    )}
                                    </TableCell>
                                </TableRow>
                              )})}
                              {savedStates.length === 0 && <TableRow><TableCell colSpan={6} className="text-center">No saved states yet.</TableCell></TableRow>}
                           </TableBody>
                        </Table>
                    </CardContent>
                 </Card>
            </TabsContent>
          </Tabs>
        </CardHeader>
       </Card>
    </div>
  );
}
