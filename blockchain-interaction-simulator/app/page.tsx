"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code, Send, Plus, Hash, CheckCircle, XCircle, Zap } from "lucide-react"

interface WalletData {
  id: string
  address: string
  balance: number
  x: number
  y: number
  color: string
}

interface SmartContract {
  name: string
  address: string
  x: number
  y: number
  color: string
}

interface Block {
  id: number
  hash: string
  transactions: string[]
  timestamp: number
  x: number
  y: number
}

interface AnimationState {
  type: "none" | "wallet_transaction" | "contract_call"
  step: number
  fromWallet?: string
  toWallet?: string
  contractAddress?: string
  message?: string
  success?: boolean
}

const generateAddress = () => `0x${Math.random().toString(16).substr(2, 40)}`
const generateHash = () => Math.random().toString(16).substr(2, 16)

export default function VisualBlockchainLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [wallets] = useState<WalletData[]>([
    { id: "wallet1", address: generateAddress(), balance: 100, x: 200, y: 100, color: "#3B82F6" },
    { id: "wallet2", address: generateAddress(), balance: 50, x: 500, y: 100, color: "#10B981" },
  ])

  const [contracts, setContracts] = useState<SmartContract[]>([])
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 0, hash: "genesis", transactions: [], timestamp: Date.now(), x: 100, y: 300 },
  ])

  const [animation, setAnimation] = useState<AnimationState>({ type: "none", step: 0 })
  const [contractName, setContractName] = useState("")
  const [contractAddress, setContractAddress] = useState("")
  const [transferAmount, setTransferAmount] = useState("10")

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background grid
    ctx.strokeStyle = "#1F2937"
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Draw wallets (positioned above blockchain)
    wallets.forEach((wallet) => {
      const isActive = animation.fromWallet === wallet.id || animation.toWallet === wallet.id

      // Wallet circle
      ctx.fillStyle = isActive ? "#F59E0B" : wallet.color
      ctx.beginPath()
      ctx.arc(wallet.x, wallet.y, 40, 0, 2 * Math.PI)
      ctx.fill()

      ctx.strokeStyle = "#1F2937"
      ctx.lineWidth = 3
      ctx.stroke()

      // Wallet icon
      ctx.fillStyle = "white"
      ctx.font = "24px Arial"
      ctx.textAlign = "center"
      ctx.fillText("💳", wallet.x, wallet.y + 8)

      // Wallet info - WHITE TEXT
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "12px monospace"
      ctx.fillText(`${wallet.address.slice(0, 8)}...`, wallet.x, wallet.y + 60)
      ctx.fillText(`${wallet.balance} ETH`, wallet.x, wallet.y + 75)

      // Animation effects for wallet transactions
      if (animation.type === "wallet_transaction" && isActive) {
        if (animation.step >= 1 && animation.step <= 3) {
          // Signing animation
          ctx.strokeStyle = "#F59E0B"
          ctx.lineWidth = 4
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.arc(wallet.x, wallet.y, 50 + animation.step * 5, 0, 2 * Math.PI)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
    })

    // Draw smart contracts (positioned below blockchain)
    contracts.forEach((contract) => {
      const isActive = animation.contractAddress === contract.address

      // Contract rectangle
      ctx.fillStyle = isActive ? "#F59E0B" : contract.color
      ctx.fillRect(contract.x - 30, contract.y - 30, 60, 60)

      ctx.strokeStyle = "#1F2937"
      ctx.lineWidth = 3
      ctx.strokeRect(contract.x - 30, contract.y - 30, 60, 60)

      // Contract icon
      ctx.fillStyle = "white"
      ctx.font = "24px Arial"
      ctx.textAlign = "center"
      ctx.fillText("📄", contract.x, contract.y + 8)

      // Contract info - WHITE TEXT
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "12px monospace"
      ctx.fillText(contract.name, contract.x, contract.y + 50)
      ctx.fillText(`${contract.address.slice(0, 8)}...`, contract.x, contract.y + 65)

      // Animation effects for contract calls
      if (animation.type === "contract_call" && isActive) {
        if (animation.step >= 2 && animation.step <= 4) {
          // Contract resolution animation
          ctx.strokeStyle = "#8B5CF6"
          ctx.lineWidth = 3
          ctx.setLineDash([3, 3])
          ctx.beginPath()
          ctx.arc(contract.x, contract.y, 40 + animation.step * 8, 0, 2 * Math.PI)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
    })

    // Draw blocks (positioned in the middle) - ENLARGED
    blocks.forEach((block, index) => {
      const isActive = animation.type !== "none" && animation.step >= 4
      const blockWidth = 140 // Increased from 100
      const blockHeight = 100 // Increased from 80

      // Block rectangle
      ctx.fillStyle = isActive && index === blocks.length - 1 ? "#F59E0B" : "#6366F1"
      ctx.fillRect(block.x, block.y, blockWidth, blockHeight)

      ctx.strokeStyle = "#1F2937"
      ctx.lineWidth = 2
      ctx.strokeRect(block.x, block.y, blockWidth, blockHeight)

      // Block info - WHITE TEXT
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "14px monospace" // Slightly larger font for bigger blocks
      ctx.textAlign = "left"
      ctx.fillText(`Block ${block.id}`, block.x + 8, block.y + 25)
      ctx.fillText(`Hash: ${block.hash.slice(0, 10)}`, block.x + 8, block.y + 45)
      ctx.fillText(`Txs: ${block.transactions.length}`, block.x + 8, block.y + 65)
      ctx.fillText(new Date(block.timestamp).toLocaleTimeString(), block.x + 8, block.y + 85)

      // Chain connection
      if (index > 0) {
        const prevBlock = blocks[index - 1]
        ctx.strokeStyle = "#6B7280"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(prevBlock.x + blockWidth, prevBlock.y + blockHeight / 2)
        ctx.lineTo(block.x, block.y + blockHeight / 2)
        ctx.stroke()

        // Arrow
        ctx.fillStyle = "#6B7280"
        ctx.beginPath()
        ctx.moveTo(block.x - 12, block.y + blockHeight / 2 - 6)
        ctx.lineTo(block.x, block.y + blockHeight / 2)
        ctx.lineTo(block.x - 12, block.y + blockHeight / 2 + 6)
        ctx.fill()
      }

      // Hashing animation
      if (animation.type !== "none" && animation.step === 5 && index === blocks.length - 1) {
        ctx.strokeStyle = "#F59E0B"
        ctx.lineWidth = 4
        ctx.setLineDash([8, 8])
        ctx.strokeRect(block.x - 5, block.y - 5, blockWidth + 10, blockHeight + 10)
        ctx.setLineDash([])
      }
    })

    // Draw transaction flow animation
    if (animation.type === "wallet_transaction" && animation.step >= 2 && animation.step <= 4) {
      const fromWallet = wallets.find((w) => w.id === animation.fromWallet)
      const toWallet = wallets.find((w) => w.id === animation.toWallet)

      if (fromWallet && toWallet) {
        const progress = (animation.step - 2) / 2
        const x = fromWallet.x + (toWallet.x - fromWallet.x) * progress
        const y = fromWallet.y + (toWallet.y - fromWallet.y) * progress

        // Transaction particle
        ctx.fillStyle = "#F59E0B"
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, 2 * Math.PI)
        ctx.fill()

        // Transaction trail
        ctx.strokeStyle = "#F59E0B"
        ctx.lineWidth = 3
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(fromWallet.x, fromWallet.y)
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // Draw contract call animation
    if (animation.type === "contract_call" && animation.step >= 1 && animation.step <= 3) {
      const fromWallet = wallets[0] // Always from first wallet for simplicity
      const contract = contracts.find((c) => c.address === animation.contractAddress)

      if (contract) {
        const progress = (animation.step - 1) / 2
        const x = fromWallet.x + (contract.x - fromWallet.x) * progress
        const y = fromWallet.y + (contract.y - fromWallet.y) * progress

        // Call particle
        ctx.fillStyle = "#8B5CF6"
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, 2 * Math.PI)
        ctx.fill()

        // Call trail
        ctx.strokeStyle = "#8B5CF6"
        ctx.lineWidth = 2
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(fromWallet.x, fromWallet.y)
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    ctx.textAlign = "left" // Reset text alignment
  }, [wallets, contracts, blocks, animation])

  const startWalletTransaction = () => {
    if (animation.type !== "none") return

    setAnimation({ type: "wallet_transaction", step: 0, fromWallet: "wallet1", toWallet: "wallet2" })

    // Animation sequence
    const steps = [
      { step: 1, delay: 1000, message: "🔐 Signing transaction with private key..." },
      { step: 2, delay: 2500, message: "📡 Broadcasting transaction to network..." },
      { step: 3, delay: 4000, message: "⏳ Transaction in mempool..." },
      { step: 4, delay: 5500, message: "⛏️ Mining new block..." },
      { step: 5, delay: 7000, message: "🔗 Calculating block hash..." },
      { step: 6, delay: 8500, message: "✅ Transaction confirmed!" },
    ]

    steps.forEach(({ step, delay, message }) => {
      setTimeout(() => {
        setAnimation((prev) => ({ ...prev, step, message }))
        if (step === 6) {
          // Add new block
          const newBlock: Block = {
            id: blocks.length,
            hash: generateHash(),
            transactions: [`${transferAmount} ETH transfer`],
            timestamp: Date.now(),
            x: 100 + blocks.length * 160, // Adjusted spacing for larger blocks
            y: 300,
          }
          setBlocks((prev) => [...prev, newBlock])

          // Reset animation after showing success
          setTimeout(() => {
            setAnimation({ type: "none", step: 0 })
          }, 2000)
        }
      }, delay)
    })
  }

  const startContractCall = () => {
    if (animation.type !== "none" || !contractAddress) return

    const contract = contracts.find((c) => c.address === contractAddress)

    if (!contract) {
      setAnimation({
        type: "contract_call",
        step: 0,
        contractAddress,
        message: "❌ Contract not found at address!",
        success: false,
      })
      setTimeout(() => setAnimation({ type: "none", step: 0 }), 4000) // Longer display time
      return
    }

    setAnimation({ type: "contract_call", step: 0, contractAddress })

    // Animation sequence for contract call - SLOWER TIMING
    const steps = [
      { step: 1, delay: 1000, message: "📡 Sending call to contract..." },
      { step: 2, delay: 2500, message: "🔍 Blockchain resolving contract address..." },
      { step: 3, delay: 4500, message: "📄 Contract found! Loading bytecode..." },
      { step: 4, delay: 6500, message: "⚡ Executing contract function..." },
      { step: 5, delay: 8000, message: "🔗 Adding execution to new block..." },
      { step: 6, delay: 10000, message: "✅ Contract executed successfully!" },
    ]

    steps.forEach(({ step, delay, message }) => {
      setTimeout(() => {
        setAnimation((prev) => ({ ...prev, step, message, success: true }))
        if (step === 6) {
          // Add new block for contract execution
          const newBlock: Block = {
            id: blocks.length,
            hash: generateHash(),
            transactions: [`Contract call: ${contract.name}`],
            timestamp: Date.now(),
            x: 100 + blocks.length * 160, // Adjusted spacing for larger blocks
            y: 300,
          }
          setBlocks((prev) => [...prev, newBlock])

          // Reset animation
          setTimeout(() => {
            setAnimation({ type: "none", step: 0 })
            setContractAddress("")
          }, 2000)
        }
      }, delay)
    })
  }

  const addSmartContract = () => {
    if (!contractName) return

    const newContract: SmartContract = {
      name: contractName,
      address: generateAddress(),
      x: 150 + contracts.length * 150,
      y: 500, // Positioned below blockchain
      color: "#8B5CF6",
    }

    setContracts([...contracts, newContract])
    setContractName("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Visual Blockchain Lab
          </h1>
          <p className="text-xl text-gray-300">Watch transactions and smart contracts in action</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Wallet Transaction
              </h3>
              <div className="space-y-2 mb-3">
                <div className="text-sm text-white">
                  <span className="text-white">From:</span>{" "}
                  <span className="text-white">{wallets[0]?.address.slice(0, 10)}...</span>
                </div>
                <div className="text-sm text-white">
                  <span className="text-white">To:</span>{" "}
                  <span className="text-white">{wallets[1]?.address.slice(0, 10)}...</span>
                </div>
                <Input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Amount"
                  className="bg-slate-700 border-slate-600 text-sm text-white placeholder:text-gray-400"
                />
              </div>
              <Button
                onClick={startWalletTransaction}
                disabled={animation.type !== "none"}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Transaction
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Smart Contract
              </h3>
              <div className="space-y-2 mb-3">
                <Input
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  placeholder="Contract name"
                  className="bg-slate-700 border-slate-600 text-sm text-white placeholder:text-gray-400"
                />
                <Button
                  onClick={addSmartContract}
                  disabled={!contractName}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contract
                </Button>
              </div>
              <Input
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="Contract address to call"
                className="bg-slate-700 border-slate-600 text-sm mb-2 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={startContractCall}
                disabled={animation.type !== "none" || !contractAddress}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Call Contract
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <h3 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Blockchain Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white">Blocks:</span>
                  <span className="font-bold text-white">{blocks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Wallets:</span>
                  <span className="font-bold text-white">{wallets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Contracts:</span>
                  <span className="font-bold text-white">{contracts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Status:</span>
                  <Badge variant={animation.type === "none" ? "secondary" : "default"} className="text-black">
                    {animation.type === "none" ? "Ready" : "Processing"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Animation Status */}
        {animation.message && (
          <Alert
            className={`mb-6 ${animation.success === false ? "border-red-500 bg-red-950" : "border-blue-500 bg-blue-950"}`}
          >
            <div className="flex items-center gap-2">
              {animation.success === false ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : animation.step === 6 ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
              )}
              <AlertDescription className="text-white">{animation.message}</AlertDescription>
            </div>
          </Alert>
        )}

        {/* Canvas Visualization */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <canvas
              ref={canvasRef}
              width={1200}
              height={600}
              className="w-full border border-slate-600 rounded-lg bg-slate-900"
              style={{ maxWidth: "100%", height: "auto" }}
            />

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-white">Wallet (Top)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-white">Smart Contract (Bottom)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                <span className="text-white">Block (Middle)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-white">Active Transaction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-white">Mining/Hashing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract List */}
        {contracts.length > 0 && (
          <Card className="mt-6 bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <h3 className="font-bold text-purple-400 mb-3">📄 Deployed Contracts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {contracts.map((contract) => (
                  <div key={contract.address} className="bg-slate-700 p-3 rounded border border-slate-600">
                    <div className="font-bold text-purple-300">{contract.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{contract.address}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs text-black bg-white border-white hover:bg-gray-200 hover:text-black"
                      onClick={() => setContractAddress(contract.address)}
                    >
                      Use Address
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
