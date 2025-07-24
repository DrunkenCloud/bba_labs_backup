import { DHKeyExchangeLab } from '@/components/dh-key-exchange-lab';
import { KeyRound } from 'lucide-react';

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-full mb-4">
          <KeyRound className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          DH Key Exchange Lab
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          A hands-on lab for students to visualize the Diffie-Hellman key exchange, understand its mechanics, and see how a Man-in-the-Middle attack works.
        </p>
      </header>
      <DHKeyExchangeLab />
    </main>
  );
}
