"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Hash, Key, Clock, Link, Trophy, Target } from "lucide-react"
import {
  generateGameBlock,
  hashString,
  verifySignature,
  getBlockchain,
  addBlockToChain,
  type Block,
  type Transaction,
  type GameBlock,
} from "@/lib/blockchain"

export default function BlockchainValidator() {
  const [currentGameBlock, setCurrentGameBlock] = useState<GameBlock | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactionHash, setTransactionHash] = useState("")
  const [signatureInput, setSignatureInput] = useState("")
  const [publicKeyInput, setPublicKeyInput] = useState("")
  const [verificationResult, setVerificationResult] = useState<string | null>(null)
  const [blockValidation, setBlockValidation] = useState({
    hashValid: false,
    transactionsValid: false,
    previousHashValid: false,
  })
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [blockchain, setBlockchain] = useState<Block[]>([])

  const generateNewGameBlock = async () => {
    const newGameBlock = await generateGameBlock()
    setCurrentGameBlock(newGameBlock)
    setSelectedTransaction(null)
    setTransactionHash("")
    setSignatureInput("")
    setPublicKeyInput("")
    setVerificationResult(null)
    setBlockValidation({
      hashValid: false,
      transactionsValid: false,
      previousHashValid: false,
    })
    setFeedback(null)
    setBlockchain(getBlockchain())
  }

  useEffect(() => {
    generateNewGameBlock()
  }, [])

  const hashTransaction = async () => {
    if (!selectedTransaction) return

    const transactionData = `${selectedTransaction.from}${selectedTransaction.to}${selectedTransaction.amount}${selectedTransaction.timestamp}`
    const hash = await hashString(transactionData)
    setTransactionHash(hash)
  }

  const verifyTransactionSignature = async () => {
    if (!signatureInput || !publicKeyInput) return

    const decryptedHash = verifySignature(signatureInput, publicKeyInput)
    setVerificationResult(decryptedHash)
  }

  const validateBlock = async () => {
    if (!currentGameBlock) return

    const block = currentGameBlock.block

    // Check if block hash starts with required zeros
    const hashValid = block.hash.startsWith("00")

    // Check if all transactions are valid (simplified - in real scenario, user would verify each)
    const transactionsValid = block.transactions.every((tx) => tx.signature && tx.from)

    // Check previous hash against actual blockchain
    const blockchain = getBlockchain()
    const previousHashValid = blockchain.length === 0 || block.previousHash === blockchain[blockchain.length - 1]?.hash

    setBlockValidation({
      hashValid,
      transactionsValid,
      previousHashValid,
    })

    return hashValid && transactionsValid && previousHashValid
  }

  const handleUserDecision = async (userAccepts: boolean) => {
    if (!currentGameBlock) return

    const isCorrect = userAccepts === currentGameBlock.shouldBeValid

    // Update score
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))

    // Show feedback
    if (isCorrect) {
      setFeedback({
        message: userAccepts ? "Correct! Block was valid and accepted." : "Correct! Block was invalid and rejected.",
        type: "success",
      })

      // If user correctly accepted a valid block, add it to blockchain
      if (userAccepts && currentGameBlock.shouldBeValid) {
        addBlockToChain(currentGameBlock.block)
      }
    } else {
      setFeedback({
        message: userAccepts
          ? "Wrong! Block was invalid but you accepted it. Block rejected automatically."
          : "Wrong! Block was valid but you rejected it. Block accepted automatically.",
        type: "error",
      })

      // If user was wrong but block was actually valid, add it anyway
      if (!userAccepts && currentGameBlock.shouldBeValid) {
        addBlockToChain(currentGameBlock.block)
      }
    }

    // Generate next block after a short delay
    setTimeout(() => {
      generateNewGameBlock()
    }, 2000)
  }

  const acceptBlock = () => handleUserDecision(true)
  const rejectBlock = () => handleUserDecision(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Blockchain Validator Game</h1>
          <p className="text-slate-300">Score points by correctly validating blocks</p>

          {/* Score Display */}
          <div className="flex justify-center gap-6 mt-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <span className="text-white font-bold">
                    Score: {score.correct}/{score.total}
                  </span>
                  <span className="text-slate-300">
                    ({score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-blue-400" />
                  <span className="text-white">Blockchain Length: {blockchain.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3 rounded-lg mx-auto max-w-md ${
                feedback.type === "success" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span>{feedback.message}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Block */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Block #{currentGameBlock?.block.index} - Make Your Decision
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Is this block valid? Check transactions, signatures, and hashes carefully.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentGameBlock && (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-slate-300">Block Hash</Label>
                        <p className="font-mono text-xs bg-slate-900 p-2 rounded text-green-400 break-all">
                          {currentGameBlock.block.hash}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-300">Previous Hash</Label>
                        <p className="font-mono text-xs bg-slate-900 p-2 rounded text-blue-400 break-all">
                          {currentGameBlock.block.previousHash}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-300">Nonce</Label>
                        <p className="text-white">{currentGameBlock.block.nonce}</p>
                      </div>
                      <div>
                        <Label className="text-slate-300">Timestamp</Label>
                        <p className="text-white">{new Date(currentGameBlock.block.timestamp).toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-300">
                        Transactions ({currentGameBlock.block.transactions.length})
                      </Label>
                      <div className="space-y-2 mt-2">
                        {currentGameBlock.block.transactions.map((tx, index) => (
                          <Card
                            key={index}
                            className="bg-slate-900 border-slate-600 cursor-pointer hover:border-slate-500 transition-colors"
                            onClick={() => setSelectedTransaction(tx)}
                          >
                            <CardContent className="p-3">
                              <div className="flex justify-between items-center">
                                <div className="text-sm">
                                  <span className="text-slate-300">From:</span>
                                  <span className="text-white ml-1 font-mono text-xs">{tx.from.slice(0, 10)}...</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-slate-300">To:</span>
                                  <span className="text-white ml-1 font-mono text-xs">{tx.to.slice(0, 10)}...</span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-slate-300">Amount:</span>
                                  <span className="text-green-400 ml-1">{tx.amount}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={validateBlock} variant="outline" className="flex-1 bg-transparent">
                        <Hash className="h-4 w-4 mr-2" />
                        Validate Block
                      </Button>
                      <Button onClick={acceptBlock} className="flex-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Block
                      </Button>
                      <Button onClick={rejectBlock} variant="destructive" className="flex-1">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Block
                      </Button>
                    </div>

                    {/* Validation Status */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="flex items-center gap-2">
                        {blockValidation.hashValid ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-xs text-slate-300">Hash Valid</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {blockValidation.transactionsValid ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-xs text-slate-300">Transactions Valid</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {blockValidation.previousHashValid ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-xs text-slate-300">Previous Hash Valid</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transaction Validator */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Transaction Validator
                </CardTitle>
                <CardDescription className="text-slate-300">Verify transaction signatures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTransaction ? (
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="verify">Verify</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-3">
                      <div>
                        <Label className="text-slate-300">From Address</Label>
                        <p className="font-mono text-xs bg-slate-900 p-2 rounded text-white break-all">
                          {selectedTransaction.from}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-300">To Address</Label>
                        <p className="font-mono text-xs bg-slate-900 p-2 rounded text-white break-all">
                          {selectedTransaction.to}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-300">Amount</Label>
                        <p className="text-green-400 text-lg">{selectedTransaction.amount}</p>
                      </div>
                      <div>
                        <Label className="text-slate-300">Signature</Label>
                        <p className="font-mono text-xs bg-slate-900 p-2 rounded text-yellow-400 break-all">
                          {selectedTransaction.signature}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="verify" className="space-y-3">
                      <Button onClick={hashTransaction} className="w-full">
                        <Hash className="h-4 w-4 mr-2" />
                        Generate Transaction Hash
                      </Button>

                      {transactionHash && (
                        <div>
                          <Label className="text-slate-300">Transaction Hash</Label>
                          <p className="font-mono text-xs bg-slate-900 p-2 rounded text-green-400 break-all">
                            {transactionHash}
                          </p>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="signature" className="text-slate-300">
                          Signature (from transaction)
                        </Label>
                        <Textarea
                          id="signature"
                          placeholder="Enter transaction signature..."
                          value={signatureInput}
                          onChange={(e) => setSignatureInput(e.target.value)}
                          className="bg-slate-900 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="publicKey" className="text-slate-300">
                          Public Key (sender's address without 0x)
                        </Label>
                        <Textarea
                          id="publicKey"
                          placeholder="Enter sender's public key..."
                          value={publicKeyInput}
                          onChange={(e) => setPublicKeyInput(e.target.value)}
                          className="bg-slate-900 border-slate-600 text-white"
                        />
                      </div>
                      <Button onClick={verifyTransactionSignature} className="w-full">
                        <Key className="h-4 w-4 mr-2" />
                        Decrypt Signature
                      </Button>
                      {verificationResult !== null && (
                        <div className="space-y-2">
                          <div>
                            <Label className="text-slate-300">Decrypted Hash from Signature</Label>
                            <p className="font-mono text-xs bg-slate-900 p-2 rounded text-blue-400 break-all">
                              {verificationResult}
                            </p>
                          </div>
                          <div
                            className={`p-3 rounded flex items-center gap-2 ${
                              transactionHash && verificationResult === transactionHash
                                ? "bg-green-900 text-green-300"
                                : "bg-red-900 text-red-300"
                            }`}
                          >
                            {transactionHash && verificationResult === transactionHash ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span>
                              {transactionHash && verificationResult === transactionHash
                                ? "Hashes Match - Signature Valid"
                                : "Hashes Don't Match - Signature Invalid"}
                            </span>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400">Select a transaction to validate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Blockchain History */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Accepted Blockchain
            </CardTitle>
            <CardDescription className="text-slate-300">Blocks that have been accepted into the chain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blockchain.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No blocks in chain yet</p>
              ) : (
                blockchain.map((block, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-900 rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-white">Block #{block.index}</span>
                      <Badge variant="default">Accepted</Badge>
                    </div>
                    <div className="text-xs text-slate-400">
                      {block.transactions.length} transactions | Hash: {block.hash.slice(0, 10)}...
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
