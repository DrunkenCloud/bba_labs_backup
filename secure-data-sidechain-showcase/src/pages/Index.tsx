
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Eye, Shield, Database, Lock, User } from 'lucide-react';

// Simulated blockchain storage (in-memory)
interface Transaction {
  id: string;
  timestamp: string;
  type: 'LOGIN' | 'REGISTER' | 'PROFILE_UPDATE' | 'DATA_VIEW';
  data: any;
  hash: string;
  previousHash: string;
}

interface UserData {
  username: string;
  email: string;
  password: string;
  creditCard: string;
  panCard: string;
  address: string;
}

const Index = () => {
  const [blockchain, setBlockchain] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '', email: '', password: '', creditCard: '', panCard: '', address: ''
  });

  // Generate a simple hash for demonstration
  const generateHash = (data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  // Add transaction to blockchain
  const addTransaction = (type: Transaction['type'], data: any) => {
    const timestamp = new Date().toISOString();
    const previousHash = blockchain.length > 0 ? blockchain[blockchain.length - 1].hash : '0';
    const transactionData = JSON.stringify({ type, data, timestamp });
    const hash = generateHash(transactionData + previousHash);
    
    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      timestamp,
      type,
      data,
      hash,
      previousHash
    };

    setBlockchain(prev => [...prev, transaction]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password } = loginForm;
    
    if (users[username] && users[username].password === password) {
      setCurrentUser(username);
      addTransaction('LOGIN', { username, password, success: true });
    } else {
      addTransaction('LOGIN', { username, password, success: false });
      alert('Invalid credentials - but this attempt is now recorded on the blockchain!');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = { ...registerForm };
    setUsers(prev => ({ ...prev, [userData.username]: userData }));
    addTransaction('REGISTER', userData);
    setCurrentUser(userData.username);
    setRegisterForm({ username: '', email: '', password: '', creditCard: '', panCard: '', address: '' });
  };

  const handleProfileUpdate = (field: keyof UserData, value: string) => {
    if (!currentUser) return;
    
    setUsers(prev => ({
      ...prev,
      [currentUser]: { ...prev[currentUser], [field]: value }
    }));
    
    addTransaction('PROFILE_UPDATE', {
      username: currentUser,
      field,
      oldValue: users[currentUser]?.[field],
      newValue: value
    });
  };

  const handleLogout = () => {
    if (currentUser) {
      addTransaction('LOGIN', { username: currentUser, action: 'logout' });
    }
    setCurrentUser(null);
  };

  const viewBlockchainData = () => {
    addTransaction('DATA_VIEW', { viewer: currentUser || 'anonymous', action: 'viewed_blockchain' });
  };

  useEffect(() => {
    viewBlockchainData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-gray-900 to-black text-white">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-red-400">
            🚨 Blockchain Privacy Nightmare
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            See why storing sensitive data on blockchain is a terrible idea
          </p>
          
          <Alert className="mb-6 border-red-500 bg-red-950/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-red-400">CRITICAL SECURITY WARNING</AlertTitle>
            <AlertDescription className="text-red-200">
              This demonstration shows how ALL data stored on blockchain is PUBLIC and PERMANENT. 
              Never store passwords, credit cards, or personal information on blockchain!
            </AlertDescription>
          </Alert>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                User Authentication (INSECURE!)
              </CardTitle>
              <CardDescription className="text-red-300">
                All login attempts and user data are stored on the "blockchain" - visible to everyone!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!currentUser ? (
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="username" className="text-white">Username</Label>
                        <Input
                          id="username"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                        Login (Insecurely!)
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="reg-username" className="text-white">Username</Label>
                        <Input
                          id="reg-username"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reg-password" className="text-white">Password</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="creditCard" className="text-red-400">Credit Card Number ⚠️</Label>
                        <Input
                          id="creditCard"
                          value={registerForm.creditCard}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, creditCard: e.target.value }))}
                          className="bg-gray-700 border-red-600 text-white placeholder:text-red-400"
                          placeholder="This will be PUBLIC!"
                        />
                      </div>
                      <div>
                        <Label htmlFor="panCard" className="text-red-400">PAN Card Number ⚠️</Label>
                        <Input
                          id="panCard"
                          value={registerForm.panCard}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, panCard: e.target.value }))}
                          className="bg-gray-700 border-red-600 text-white placeholder:text-red-400"
                          placeholder="This will be PUBLIC!"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address" className="text-white">Address</Label>
                        <Input
                          id="address"
                          value={registerForm.address}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, address: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                        Register (Store Everything Publicly!)
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Welcome, {currentUser}!</h3>
                    <Button onClick={handleLogout} variant="outline" size="sm">
                      Logout
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-400">Update Your Profile (All Changes Are PUBLIC!)</h4>
                    {users[currentUser] && Object.entries(users[currentUser]).map(([key, value]) => (
                      <div key={key}>
                        <Label htmlFor={key} className={key === 'password' || key === 'creditCard' || key === 'panCard' ? 'text-red-400' : 'text-white'}>
                          {key === 'panCard' ? 'PAN Card Number' : key.charAt(0).toUpperCase() + key.slice(1)}
                          {(key === 'password' || key === 'creditCard' || key === 'panCard') && ' ⚠️'}
                        </Label>
                        <Input
                          id={key}
                          type={key === 'password' ? 'password' : 'text'}
                          value={value}
                          onChange={(e) => handleProfileUpdate(key as keyof UserData, e.target.value)}
                          className={`bg-gray-700 text-white placeholder:text-gray-400 ${(key === 'password' || key === 'creditCard' || key === 'panCard') ? 'border-red-600' : 'border-gray-600'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blockchain Explorer */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5" />
                Public Blockchain Explorer
              </CardTitle>
              <CardDescription className="text-yellow-300">
                🔍 Anyone can see ALL transactions and data stored on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {blockchain.map((transaction, index) => (
                  <div key={transaction.id} className="border border-gray-600 rounded-lg p-3 bg-gray-900">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={transaction.type === 'LOGIN' ? 'destructive' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                      <span className="text-xs text-gray-400">Block #{index + 1}</span>
                    </div>
                    
                    <div className="text-xs space-y-1 text-white">
                      <div><strong>Hash:</strong> {transaction.hash}</div>
                      <div><strong>Previous Hash:</strong> {transaction.previousHash}</div>
                      <div><strong>Timestamp:</strong> {new Date(transaction.timestamp).toLocaleString()}</div>
                      <Separator className="my-2" />
                      <div><strong>Public Data:</strong></div>
                      <pre className="text-xs bg-black p-2 rounded overflow-x-auto text-red-300 whitespace-pre-wrap">
                        {JSON.stringify(transaction.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
                {blockchain.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    No transactions yet. Try logging in or registering!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Educational Content */}
        <Card className="mt-6 bg-green-950 border-green-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Shield className="h-5 w-5" />
              The Right Way: Hybrid Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Store OFF-CHAIN (Secure Server):</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Passwords (hashed)</li>
                  <li>Credit card information</li>
                  <li>PAN card numbers</li>
                  <li>Personal addresses</li>
                  <li>Private messages</li>
                  <li>Medical records</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Store ON-CHAIN (Public):</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Public usernames/handles</li>
                  <li>Transaction hashes</li>
                  <li>Public certificates</li>
                  <li>Audit trails</li>
                  <li>Smart contract interactions</li>
                  <li>Public voting records</li>
                </ul>
              </div>
            </div>
            
            <Alert className="mt-4 border-green-600 bg-green-900/50">
              <Lock className="h-4 w-4" />
              <AlertTitle className="text-green-400">Best Practice</AlertTitle>
              <AlertDescription className="text-green-200">
                Use blockchain as a verification layer and audit trail, while keeping sensitive data 
                in encrypted, access-controlled databases with proper authentication.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
