
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const SymmetricCrypto = () => {
  const [encryptKey, setEncryptKey] = useState('');
  const [plainText, setPlainText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  
  const [decryptKey, setDecryptKey] = useState('');
  const [cipherText, setCipherText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  
  const { toast } = useToast();

  const vigenereEncrypt = (text: string, key: string): string => {
    if (!text || !key) return '';
    
    const cleanKey = key.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (cleanKey.length === 0) return text;
    
    let result = '';
    let keyIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char >= 'A' && char <= 'Z') {
        // Uppercase letters
        const textChar = char.charCodeAt(0) - 65;
        const keyChar = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        const encryptedChar = (textChar + keyChar) % 26;
        result += String.fromCharCode(encryptedChar + 65);
        keyIndex++;
      } else if (char >= 'a' && char <= 'z') {
        // Lowercase letters
        const textChar = char.charCodeAt(0) - 97;
        const keyChar = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        const encryptedChar = (textChar + keyChar) % 26;
        result += String.fromCharCode(encryptedChar + 97);
        keyIndex++;
      } else if (char >= '0' && char <= '9') {
        // Digits
        const textDigit = parseInt(char);
        const keyChar = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        const encryptedDigit = (textDigit + keyChar) % 10;
        result += encryptedDigit.toString();
        keyIndex++;
      } else {
        // Other characters (space, +, -, etc.) - leave unchanged
        result += char;
      }
    }
    
    return result;
  };

  const vigenereDecrypt = (text: string, key: string): string => {
    if (!text || !key) return '';
    
    const cleanKey = key.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (cleanKey.length === 0) return text;
    
    let result = '';
    let keyIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char >= 'A' && char <= 'Z') {
        // Uppercase letters
        const textChar = char.charCodeAt(0) - 65;
        const keyChar = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        const decryptedChar = (textChar - keyChar + 26) % 26;
        result += String.fromCharCode(decryptedChar + 65);
        keyIndex++;
      } else if (char >= 'a' && char <= 'z') {
        // Lowercase letters
        const textChar = char.charCodeAt(0) - 97;
        const keyChar = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        const decryptedChar = (textChar - keyChar + 26) % 26;
        result += String.fromCharCode(decryptedChar + 97);
        keyIndex++;
      } else if (char >= '0' && char <= '9') {
        // Digits
        const textDigit = parseInt(char);
        const keyChar = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        const decryptedDigit = (textDigit - keyChar + 10) % 10;
        result += decryptedDigit.toString();
        keyIndex++;
      } else {
        // Other characters (space, +, -, etc.) - leave unchanged
        result += char;
      }
    }
    
    return result;
  };

  const handleEncrypt = () => {
    if (!encryptKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a secret key",
        variant: "destructive"
      });
      return;
    }
    
    if (!plainText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to encrypt",
        variant: "destructive"
      });
      return;
    }

    const encrypted = vigenereEncrypt(plainText, encryptKey);
    setEncryptedText(encrypted);
    
    toast({
      title: "Success",
      description: "Text encrypted successfully!",
    });
  };

  const handleDecrypt = () => {
    if (!decryptKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a key",
        variant: "destructive"
      });
      return;
    }
    
    if (!cipherText.trim()) {
      toast({
        title: "Error",
        description: "Please enter cipher text to decrypt",
        variant: "destructive"
      });
      return;
    }

    const decrypted = vigenereDecrypt(cipherText, decryptKey);
    setDecryptedText(decrypted);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Encryption Section */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Encrypt Text
            </CardTitle>
            <CardDescription>
              Enter a secret key and plain text to encrypt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="encrypt-key">Secret Key</Label>
              <Input
                id="encrypt-key"
                placeholder="Enter your secret key"
                value={encryptKey}
                onChange={(e) => setEncryptKey(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="plain-text">Plain Text</Label>
              <Textarea
                id="plain-text"
                placeholder="Enter text to encrypt"
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <Button onClick={handleEncrypt} className="w-full bg-green-600 hover:bg-green-700">
              Encrypt Text
            </Button>
            
            {encryptedText && (
              <div>
                <Label>Encrypted Text (Cipher)</Label>
                <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md font-mono text-sm">
                  {encryptedText}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decryption Section */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Decrypt Text
            </CardTitle>
            <CardDescription>
              Enter cipher text and try different keys to decrypt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="decrypt-key">Decryption Key</Label>
              <Input
                id="decrypt-key"
                placeholder="Try to guess the key"
                value={decryptKey}
                onChange={(e) => setDecryptKey(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="cipher-text">Cipher Text</Label>
              <Textarea
                id="cipher-text"
                placeholder="Enter cipher text to decrypt"
                value={cipherText}
                onChange={(e) => setCipherText(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <Button onClick={handleDecrypt} className="w-full bg-blue-600 hover:bg-blue-700">
              Decrypt Text
            </Button>
            
            {decryptedText && (
              <div>
                <Label>Decrypted Text</Label>
                <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md font-mono text-sm">
                  {decryptedText}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SymmetricCrypto;
