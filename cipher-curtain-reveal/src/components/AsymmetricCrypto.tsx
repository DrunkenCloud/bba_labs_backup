
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Lock, Unlock, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface KeyPair {
  publicKey: { n: number; e: number };
  privateKey: { n: number; d: number };
}

const AsymmetricCrypto = () => {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null);
  const [encryptText, setEncryptText] = useState('');
  const [encryptKey, setEncryptKey] = useState<'public' | 'private' | 'custom'>('public');
  const [encryptedResult, setEncryptedResult] = useState('');
  const [decryptText, setDecryptText] = useState('');
  const [decryptKey, setDecryptKey] = useState<'public' | 'private' | 'custom'>('private');
  const [decryptedResult, setDecryptedResult] = useState('');
  
  // Custom key inputs for encryption
  const [customEncryptN, setCustomEncryptN] = useState('');
  const [customEncryptE, setCustomEncryptE] = useState('');
  
  // Custom key inputs for decryption
  const [customDecryptN, setCustomDecryptN] = useState('');
  const [customDecryptD, setCustomDecryptD] = useState('');
  
  const { toast } = useToast();

  // Simple RSA implementation for demonstration (not secure for real use)
  const gcd = (a: number, b: number): number => {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };

  const modPow = (base: number, exp: number, mod: number): number => {
    let result = 1;
    base = base % mod;
    while (exp > 0) {
      if (exp % 2 === 1) {
        result = (result * base) % mod;
      }
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    return result;
  };

  const modInverse = (a: number, m: number): number => {
    for (let i = 1; i < m; i++) {
      if ((a * i) % m === 1) {
        return i;
      }
    }
    return 1;
  };

  const generateKeyPair = (): KeyPair => {
    // Using small primes for demonstration
    const p = 61;
    const q = 53;
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    
    // Choose e
    let e = 17;
    while (gcd(e, phi) !== 1) {
      e++;
    }
    
    // Calculate d
    const d = modInverse(e, phi);
    
    return {
      publicKey: { n, e },
      privateKey: { n, d }
    };
  };

  const handleGenerateKeys = () => {
    const newKeyPair = generateKeyPair();
    setKeyPair(newKeyPair);
    setEncryptedResult('');
    setDecryptedResult('');
    
    toast({
      title: "Keys Generated",
      description: "New RSA key pair has been generated successfully!",
    });
  };

  const rsaEncrypt = (message: string, key: { n: number; e: number }): string => {
    const encrypted = [];
    for (let i = 0; i < message.length; i++) {
      const charCode = message.charCodeAt(i);
      const encryptedChar = modPow(charCode, key.e, key.n);
      encrypted.push(encryptedChar);
    }
    return encrypted.join(',');
  };

  const rsaDecrypt = (cipherText: string, key: { n: number; d: number }): string => {
    try {
      const encrypted = cipherText.split(',').map(num => parseInt(num));
      let decrypted = '';
      for (const encryptedChar of encrypted) {
        const decryptedChar = modPow(encryptedChar, key.d, key.n);
        decrypted += String.fromCharCode(decryptedChar);
      }
      return decrypted;
    } catch {
      return 'Invalid cipher text format';
    }
  };

  const handleEncrypt = () => {
    if (!encryptText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to encrypt",
        variant: "destructive"
      });
      return;
    }

    try {
      let result = '';
      let keyToUse: { n: number; e: number };
      
      if (encryptKey === 'custom') {
        const n = parseInt(customEncryptN);
        const e = parseInt(customEncryptE);
        
        if (isNaN(n) || isNaN(e) || n <= 0 || e <= 0) {
          toast({
            title: "Error",
            description: "Please enter valid custom key values (n and e must be positive numbers)",
            variant: "destructive"
          });
          return;
        }
        
        keyToUse = { n, e };
        result = rsaEncrypt(encryptText, keyToUse);
        toast({
          title: "Encrypted with Custom Key",
          description: "Text encrypted successfully using your custom key values!",
        });
      } else {
        if (!keyPair) {
          toast({
            title: "Error",
            description: "Please generate keys first or use custom key option",
            variant: "destructive"
          });
          return;
        }
        
        if (encryptKey === 'public') {
          result = rsaEncrypt(encryptText, keyPair.publicKey);
          toast({
            title: "Encrypted with Public Key",
            description: "Text encrypted successfully! Only private key can decrypt this.",
          });
        } else {
          result = rsaEncrypt(encryptText, { n: keyPair.privateKey.n, e: keyPair.privateKey.d });
          toast({
            title: "Encrypted with Private Key",
            description: "Text encrypted successfully! Only public key can decrypt this (digital signature).",
          });
        }
      }
      
      setEncryptedResult(result);
    } catch (error) {
      toast({
        title: "Encryption Failed",
        description: "An error occurred during encryption",
        variant: "destructive"
      });
    }
  };

  const handleDecrypt = () => {
    if (!decryptText.trim()) {
      toast({
        title: "Error",
        description: "Please enter cipher text to decrypt",
        variant: "destructive"
      });
      return;
    }

    try {
      let result = '';
      let keyToUse: { n: number; d: number };
      
      if (decryptKey === 'custom') {
        const n = parseInt(customDecryptN);
        const d = parseInt(customDecryptD);
        
        if (isNaN(n) || isNaN(d) || n <= 0 || d <= 0) {
          toast({
            title: "Error",
            description: "Please enter valid custom key values (n and d must be positive numbers)",
            variant: "destructive"
          });
          return;
        }
        
        keyToUse = { n, d };
        result = rsaDecrypt(decryptText, keyToUse);
        toast({
          title: "Decrypted with Custom Key",
          description: "Decryption completed using your custom key values!",
        });
      } else {
        if (!keyPair) {
          toast({
            title: "Error",
            description: "Please generate keys first or use custom key option",
            variant: "destructive"
          });
          return;
        }
        
        if (decryptKey === 'private') {
          result = rsaDecrypt(decryptText, keyPair.privateKey);
        } else {
          result = rsaDecrypt(decryptText, { n: keyPair.publicKey.n, d: keyPair.publicKey.e });
        }
        
        toast({
          title: "Decryption Successful",
          description: `Decrypted using ${decryptKey} key`,
        });
      }
      
      setDecryptedResult(result);
      
      if (result === 'Invalid cipher text format') {
        toast({
          title: "Decryption Failed",
          description: "Invalid cipher text format or wrong key used",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Decryption Failed",
        description: "Wrong key used or invalid cipher text",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Generation Section */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-700 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Key Generation
          </CardTitle>
          <CardDescription>
            Generate a public-private key pair for RSA encryption
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerateKeys} className="w-full bg-purple-600 hover:bg-purple-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate New Key Pair
          </Button>
          
          {keyPair && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Public Key</Label>
                <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md font-mono text-xs">
                  <div>n: {keyPair.publicKey.n}</div>
                  <div>e: {keyPair.publicKey.e}</div>
                </div>
              </div>
              <div>
                <Label>Private Key</Label>
                <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md font-mono text-xs">
                  <div>n: {keyPair.privateKey.n}</div>
                  <div>d: {keyPair.privateKey.d}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Encryption Section */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Encrypt Text
            </CardTitle>
            <CardDescription>
              Encrypt text using public, private, or custom key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="encrypt-text">Text to Encrypt</Label>
              <Textarea
                id="encrypt-text"
                placeholder="Enter text to encrypt"
                value={encryptText}
                onChange={(e) => setEncryptText(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <Label>Encryption Key</Label>
              <Select value={encryptKey} onValueChange={(value: 'public' | 'private' | 'custom') => setEncryptKey(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public Key</SelectItem>
                  <SelectItem value="private">Private Key</SelectItem>
                  <SelectItem value="custom">Custom Key</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {encryptKey === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom-encrypt-n">n value</Label>
                  <Input
                    id="custom-encrypt-n"
                    placeholder="Enter n"
                    value={customEncryptN}
                    onChange={(e) => setCustomEncryptN(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-encrypt-e">e value</Label>
                  <Input
                    id="custom-encrypt-e"
                    placeholder="Enter e"
                    value={customEncryptE}
                    onChange={(e) => setCustomEncryptE(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            
            <Button onClick={handleEncrypt} className="w-full bg-green-600 hover:bg-green-700" disabled={!keyPair && encryptKey !== 'custom'}>
              Encrypt Text
            </Button>
            
            {encryptedResult && (
              <div>
                <Label>Encrypted Text</Label>
                <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md font-mono text-xs break-all">
                  {encryptedResult}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decryption Section */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <Unlock className="w-5 h-5" />
              Decrypt Text
            </CardTitle>
            <CardDescription>
              Decrypt cipher text using public, private, or custom key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="decrypt-text">Cipher Text</Label>
              <Textarea
                id="decrypt-text"
                placeholder="Enter cipher text to decrypt"
                value={decryptText}
                onChange={(e) => setDecryptText(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <Label>Decryption Key</Label>
              <Select value={decryptKey} onValueChange={(value: 'public' | 'private' | 'custom') => setDecryptKey(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private Key</SelectItem>
                  <SelectItem value="public">Public Key</SelectItem>
                  <SelectItem value="custom">Custom Key</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {decryptKey === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom-decrypt-n">n value</Label>
                  <Input
                    id="custom-decrypt-n"
                    placeholder="Enter n"
                    value={customDecryptN}
                    onChange={(e) => setCustomDecryptN(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-decrypt-d">d value</Label>
                  <Input
                    id="custom-decrypt-d"
                    placeholder="Enter d"
                    value={customDecryptD}
                    onChange={(e) => setCustomDecryptD(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            
            <Button onClick={handleDecrypt} className="w-full bg-blue-600 hover:bg-blue-700" disabled={!keyPair && decryptKey !== 'custom'}>
              Decrypt Text
            </Button>
            
            {decryptedResult && (
              <div>
                <Label>Decrypted Text</Label>
                <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md font-mono text-sm">
                  {decryptedResult}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AsymmetricCrypto;
