"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { WalletIcon, Key, Shield, ArrowRight, Hash, Clock, User } from "lucide-react"

interface Block {
  id: number
  hash: string
  previousHash: string
  timestamp: string
  transactions: Transaction[]
  nonce: number
}

interface Transaction {
  from: string
  to: string
  amount: number
  fee: number
}

interface Wallet {
  id: string
  address: string
  balance: number
  name: string
}

interface SignatureDemo {
  message: string
  privateKey: string
  signature: string
  publicKey: string
}

export default function CryptoWalletEducation() {
  const [blockchain, setBlockchain] = useState<Block[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [activeWalletId, setActiveWalletId] = useState<string>("")
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [signatureDemo, setSignatureDemo] = useState<SignatureDemo | null>(null)
  const [showSignatureProcess, setShowSignatureProcess] = useState(false)
  const [notification, setNotification] = useState<string>("")
  const [lastTransaction, setLastTransaction] = useState<string>("")

  // Generate a random hash
  const generateHash = () => {
    return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
  }

  // Generate a random wallet address
  const generateWalletAddress = () => {
    return "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
  }

  const createNewWallet = () => {
    const newWallet: Wallet = {
      id: `wallet-${wallets.length + 1}`,
      address: generateWalletAddress(),
      balance: Math.floor(Math.random() * 2000) + 500, // Random balance between 500-2500
      name: `Wallet ${wallets.length + 1}`,
    }
    setWallets((prev) => [...prev, newWallet])
    setActiveWalletId(newWallet.id)
  }

  const getActiveWallet = () => {
    return wallets.find((wallet) => wallet.id === activeWalletId)
  }

  const updateWalletBalance = (walletId: string, newBalance: number) => {
    setWallets((prev) => prev.map((wallet) => (wallet.id === walletId ? { ...wallet, balance: newBalance } : wallet)))
  }

  // Initialize blockchain and first wallet
  useEffect(() => {
    const genesisBlock: Block = {
      id: 0,
      hash: generateHash(),
      previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
      timestamp: new Date().toISOString(),
      transactions: [],
      nonce: 0,
    }
    setBlockchain([genesisBlock])

    // Create first wallet
    const firstWallet: Wallet = {
      id: "wallet-1",
      address: generateWalletAddress(),
      balance: 1000,
      name: "Wallet 1",
    }
    setWallets([firstWallet])
    setActiveWalletId(firstWallet.id)
  }, [])

  // Add new block every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockchain((prev) => {
        const lastBlock = prev[prev.length - 1]
        const newTransactions: Transaction[] = [
          {
            from: generateWalletAddress(),
            to: generateWalletAddress(),
            amount: Math.floor(Math.random() * 100) + 1,
            fee: 0.001,
          },
        ]

        const newBlock: Block = {
          id: lastBlock.id + 1,
          hash: generateHash(),
          previousHash: lastBlock.hash,
          timestamp: new Date().toISOString(),
          transactions: newTransactions,
          nonce: Math.floor(Math.random() * 1000000),
        }

        return [...prev.slice(-4), newBlock] // Keep only last 5 blocks
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const sendTransaction = () => {
    const activeWallet = getActiveWallet()
    if (
      !activeWallet ||
      !recipient ||
      !amount ||
      Number.parseFloat(amount) <= 0 ||
      Number.parseFloat(amount) > activeWallet.balance
    ) {
      return
    }

    // Generate signature demo
    const transactionMessage = `Send ${amount} ETH from ${activeWallet.address} to ${recipient}`
    const demoSignature: SignatureDemo = {
      message: transactionMessage,
      privateKey: generateHash().substring(0, 32) + "...", // Simulated private key
      signature: generateHash().substring(0, 32) + "...", // Simulated signature
      publicKey: activeWallet.address,
    }

    setSignatureDemo(demoSignature)
    setShowSignatureProcess(true)

    const transaction: Transaction = {
      from: activeWallet.address,
      to: recipient,
      amount: Number.parseFloat(amount),
      fee: 0.001,
    }

    // Update sender wallet balance
    updateWalletBalance(activeWallet.id, activeWallet.balance - Number.parseFloat(amount) - 0.001)

    // Check if recipient is one of our wallets and update balance
    const recipientWallet = wallets.find((wallet) => wallet.address === recipient)
    if (recipientWallet) {
      updateWalletBalance(recipientWallet.id, recipientWallet.balance + Number.parseFloat(amount))
      setNotification(`✓ Transfer complete! Sent ${amount} ETH from ${activeWallet.name} to ${recipientWallet.name}`)
      setTimeout(() => setNotification(""), 5000)
    } else {
      setNotification(`✓ Transaction sent to external address`)
      setTimeout(() => setNotification(""), 5000)
    }

    setAmount("")
    setRecipient("")

    // Hide signature demo after 5 seconds
    setTimeout(() => {
      setShowSignatureProcess(false)
    }, 5000)

    // Add transaction to next block (simulated)
    setTimeout(() => {
      setBlockchain((prev) => {
        const lastBlock = prev[prev.length - 1]
        const newBlock: Block = {
          id: lastBlock.id + 1,
          hash: generateHash(),
          previousHash: lastBlock.hash,
          timestamp: new Date().toISOString(),
          transactions: [transaction],
          nonce: Math.floor(Math.random() * 1000000),
        }
        return [...prev.slice(-4), newBlock]
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 pb-20">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Crypto Wallet</h1>
          <p className="text-lg text-gray-600">
            Learn how cryptocurrency wallets work and see the blockchain in action
          </p>
        </header>

        {notification && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800 text-center">
            {notification}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* What is a Crypto Wallet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WalletIcon className="h-5 w-5" />
                  What is a Crypto Wallet?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  A cryptocurrency wallet is a digital tool that allows you to store, send, and receive
                  cryptocurrencies. It doesn't actually store your coins - instead, it stores your private keys that
                  give you access to your cryptocurrency on the blockchain.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <Key className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-800">Private Key</h4>
                      <p className="text-sm text-green-700">Secret key that proves ownership and allows spending</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-800">Public Address</h4>
                      <p className="text-sm text-blue-700">Address others use to send you cryptocurrency</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Wallet Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WalletIcon className="h-5 w-5" />
                    Your Wallets
                  </div>
                  <Button onClick={createNewWallet} size="sm">
                    + New Wallet
                  </Button>
                </CardTitle>
                <CardDescription>Manage multiple demo wallets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Wallet Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => setActiveWalletId(wallet.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        activeWalletId === wallet.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{wallet.name}</span>
                        {activeWalletId === wallet.id && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">{wallet.address.substring(0, 10)}...</div>
                      <div className="text-sm font-bold text-green-600 mt-1">{wallet.balance.toFixed(3)} ETH</div>
                    </button>
                  ))}
                </div>

                {/* Active Wallet Details */}
                {getActiveWallet() && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Active Wallet Address:</span>
                      <Badge variant="secondary">{getActiveWallet()?.name}</Badge>
                    </div>
                    <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                      {getActiveWallet()?.address}
                    </p>
                    <div className="mt-2">
                      <span className="text-sm font-medium">Balance: </span>
                      <span className="text-lg font-bold text-green-600">
                        {getActiveWallet()?.balance.toFixed(3)} ETH
                      </span>
                    </div>
                  </div>
                )}

                {/* Transaction Form */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Recipient Address</label>
                    <div className="flex gap-2">
                      <Input placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const otherWallets = wallets.filter((w) => w.id !== activeWalletId)
                          if (otherWallets.length > 0) {
                            const randomWallet = otherWallets[Math.floor(Math.random() * otherWallets.length)]
                            setRecipient(randomWallet.address)
                          }
                        }}
                        disabled={wallets.length <= 1}
                      >
                        Random
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount (ETH)</label>
                    <Input type="number" placeholder="0.1" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <Button
                    onClick={sendTransaction}
                    className="w-full"
                    disabled={
                      !getActiveWallet() ||
                      !recipient ||
                      !amount ||
                      Number.parseFloat(amount) <= 0 ||
                      Number.parseFloat(amount) > (getActiveWallet()?.balance || 0)
                    }
                  >
                    Send from {getActiveWallet()?.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Digital Signature Process */}
            <Card className="border-2 border-blue-500 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Key className="h-5 w-5" />
                  Digital Signature Process
                </CardTitle>
                <CardDescription>See how your transaction is cryptographically signed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {signatureDemo ? (
                  <div className="grid gap-4">
                    <div className="p-3 bg-white rounded-lg border">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          1
                        </div>
                        Transaction Message
                      </h4>
                      <p className="text-xs font-mono bg-gray-50 p-2 rounded">{signatureDemo.message}</p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          2
                        </div>
                        Private Key (Hidden)
                      </h4>
                      <p className="text-xs font-mono bg-red-50 p-2 rounded text-red-700">
                        🔒 {signatureDemo.privateKey} (Never shared!)
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          3
                        </div>
                        Generated Signature
                      </h4>
                      <p className="text-xs font-mono bg-green-50 p-2 rounded text-green-700">
                        ✓ {signatureDemo.signature}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          4
                        </div>
                        Public Address (Verification)
                      </h4>
                      <p className="text-xs font-mono bg-blue-50 p-2 rounded text-blue-700">
                        📢 {signatureDemo.publicKey}
                      </p>
                    </div>

                    <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                      <p className="text-sm text-green-800">
                        <strong>✓ Transaction Verified!</strong> The network can verify this transaction came from you
                        without ever seeing your private key.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No transaction in progress. Send a transaction to see the signature process.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Cryptography
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Digital Signatures</h4>
                    <p className="text-sm text-gray-600">
                      Every transaction is signed with your private key to prove ownership
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Public Key Cryptography</h4>
                    <p className="text-sm text-gray-600">Others can verify your signature using your public address</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Encryption</h4>
                    <p className="text-sm text-gray-600">Your private keys are encrypted and stored securely</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Backup & Recovery</h4>
                    <p className="text-sm text-gray-600">Seed phrases allow you to recover your wallet</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Multi-signature</h4>
                    <p className="text-sm text-gray-600">Require multiple signatures for transactions</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Hardware Wallets</h4>
                    <p className="text-sm text-gray-600">Store keys offline for maximum security</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Blockchain Visualization */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Live Blockchain
                </CardTitle>
                <CardDescription>Watch blocks being added in real-time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {blockchain
                  .slice()
                  .reverse()
                  .map((block, index) => (
                    <div
                      key={block.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                        index === 0 ? "border-green-500 bg-green-50 animate-pulse" : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={index === 0 ? "default" : "secondary"}>Block #{block.id}</Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(block.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium">Hash:</span>
                          <p className="font-mono text-gray-600 break-all">{block.hash.substring(0, 16)}...</p>
                        </div>

                        <div>
                          <span className="font-medium">Previous:</span>
                          <p className="font-mono text-gray-600 break-all">{block.previousHash.substring(0, 16)}...</p>
                        </div>

                        {block.transactions.length > 0 && (
                          <div>
                            <span className="font-medium">Transactions:</span>
                            <div className="mt-1 space-y-1">
                              {block.transactions.map((tx, txIndex) => (
                                <div key={txIndex} className="p-2 bg-gray-50 rounded text-xs">
                                  <div className="flex justify-between">
                                    <span>Amount:</span>
                                    <span className="font-medium">{tx.amount} ETH</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Fee:</span>
                                    <span>{tx.fee} ETH</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="font-medium">Nonce:</span>
                          <span>{block.nonce}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    1
                  </div>
                  <p>You create a transaction using your wallet</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    2
                  </div>
                  <p>Transaction is signed with your private key</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    3
                  </div>
                  <p>Transaction is broadcast to the network</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    4
                  </div>
                  <p>Miners include it in a new block</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    5
                  </div>
                  <p>Block is added to the blockchain</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Permanent bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-mono">Blockchain Status:</span>
          </div>
          <div className="text-sm font-mono">
            {lastTransaction || "Waiting for transactions..."}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-mono">Latest Block: #{blockchain[blockchain.length - 1]?.id || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
