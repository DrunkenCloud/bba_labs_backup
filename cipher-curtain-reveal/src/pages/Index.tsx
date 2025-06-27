
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SymmetricCrypto from '@/components/SymmetricCrypto';
import AsymmetricCrypto from '@/components/AsymmetricCrypto';
import { Shield, Lock, Key } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Cryptography Playground</h1>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn and experiment with symmetric and asymmetric encryption algorithms
          </p>
        </div>

        <Tabs defaultValue="symmetric" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="symmetric" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Symmetric Cryptography
            </TabsTrigger>
            <TabsTrigger value="asymmetric" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Asymmetric Cryptography
            </TabsTrigger>
          </TabsList>

          <TabsContent value="symmetric">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-green-600" />
                  Symmetric Key Encryption (Vigenère Cipher)
                </CardTitle>
                <CardDescription>
                  In symmetric cryptography, the same key is used for both encryption and decryption.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SymmetricCrypto />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="asymmetric">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-600" />
                  Asymmetric Key Encryption (RSA)
                </CardTitle>
                <CardDescription>
                  In asymmetric cryptography, different keys are used for encryption and decryption.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AsymmetricCrypto />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
