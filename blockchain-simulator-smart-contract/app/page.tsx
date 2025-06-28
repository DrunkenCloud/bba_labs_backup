"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Clock, Play, Plus } from "lucide-react"

interface SmartContract {
  id: string
  name: string
  address: string // Add this field
  type: string
  functions: string[]
  state: Record<string, any>
  createdAt: number
}

interface ContractRequest {
  id: string
  type: "create" | "call"
  contractName?: string
  contractAddress?: string // Add this field
  contractType?: string
  functionName?: string
  parameters?: any[]
  expectedResponse?: any
  description: string
  difficulty: "easy" | "medium" | "hard"
  points: number
  timestamp: number
}

const CONTRACT_TEMPLATES = {
  HelloWorld: {
    functions: ["sayHello", "setMessage", "getMessage"],
    initialState: { message: "Hello, World!" },
  },
  Counter: {
    functions: ["increment", "decrement", "getCount", "reset"],
    initialState: { count: 0 },
  },
  UserRegistry: {
    functions: ["register", "login", "getUser", "updateProfile"],
    initialState: { users: {} },
  },
  SimpleStorage: {
    functions: ["store", "retrieve", "clear"],
    initialState: { value: 0 },
  },
  Voting: {
    functions: ["vote", "getVotes", "addCandidate", "getWinner"],
    initialState: { candidates: {}, votes: {} },
  },
}

const SAMPLE_REQUESTS: ContractRequest[] = [
  {
    id: "1",
    type: "create",
    contractName: "HelloWorld",
    contractAddress: "0x1234567890123456789012345678901234567890",
    contractType: "HelloWorld",
    description: "Create a HelloWorld contract at the specified address",
    difficulty: "easy",
    points: 10,
    timestamp: Date.now(),
  },
  {
    id: "2",
    type: "call",
    contractAddress: "0x1234567890123456789012345678901234567890",
    functionName: "sayHello",
    parameters: [],
    expectedResponse: "Hello, World!",
    description: "Call sayHello() function on contract at 0x1234...7890",
    difficulty: "easy",
    points: 5,
    timestamp: Date.now() + 1000,
  },
  {
    id: "3",
    type: "create",
    contractName: "Counter",
    contractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    contractType: "Counter",
    description: "Create a Counter contract at the specified address",
    difficulty: "medium",
    points: 15,
    timestamp: Date.now() + 2000,
  },
  {
    id: "4",
    type: "call",
    contractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    functionName: "increment",
    parameters: [],
    expectedResponse: 1,
    description: "Call increment() function on contract at 0xabcd...abcd",
    difficulty: "medium",
    points: 8,
    timestamp: Date.now() + 3000,
  },
]

const generateRandomAddress = () => {
  const chars = "0123456789abcdef"
  let address = "0x"
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)]
  }
  return address
}

export default function BlockchainSimulator() {
  const [contracts, setContracts] = useState<SmartContract[]>([])
  const [requests, setRequests] = useState<ContractRequest[]>([])
  const [currentRequest, setCurrentRequest] = useState<ContractRequest | null>(null)
  const [score, setScore] = useState(0)
  const [totalRequests, setTotalRequests] = useState(0)
  const [correctResponses, setCorrectResponses] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Form states
  const [selectedContractType, setSelectedContractType] = useState("")
  const [contractName, setContractName] = useState("")
  const [contractAddress, setContractAddress] = useState("")
  const [selectedContract, setSelectedContract] = useState("")
  const [functionResponse, setFunctionResponse] = useState("")
  const [availableFunctions, setAvailableFunctions] = useState<string[]>([])
  const [selectedFunction, setSelectedFunction] = useState("")

  useEffect(() => {
    if (gameStarted) {
      // Start with initial requests
      if (requests.length === 0) {
        setRequests(SAMPLE_REQUESTS)
      }

      // Set up continuous request generation
      const interval = setInterval(() => {
        generateRandomRequest()
      }, 8000) // Generate new request every 8 seconds

      return () => clearInterval(interval)
    }
  }, [gameStarted, contracts])

  useEffect(() => {
    if (requests.length > 0 && !currentRequest) {
      setCurrentRequest(requests[0])
    }
  }, [requests, currentRequest])

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setTotalRequests(0)
    setCorrectResponses(0)
    setContracts([])
    setRequests([])
    setCurrentRequest(null)
    setFeedback(null)
  }

  const generateRandomRequest = () => {
    const types = ["create", "call"] as const
    const contractTypes = Object.keys(CONTRACT_TEMPLATES)
    const difficulties = ["easy", "medium", "hard"] as const

    const shouldCreate = contracts.length === 0 || Math.random() < 0.4
    const type = shouldCreate ? "create" : "call"

    const contractType = contractTypes[Math.floor(Math.random() * contractTypes.length)]
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]

    let newRequest: ContractRequest

    if (type === "create") {
      const address = generateRandomAddress()
      newRequest = {
        id: Date.now().toString() + Math.random(),
        type: "create",
        contractName: contractType + "_" + Math.floor(Math.random() * 1000),
        contractAddress: address,
        contractType,
        description: `Create a ${contractType} contract at ${address.slice(0, 6)}...${address.slice(-4)}`,
        difficulty,
        points: difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20,
        timestamp: Date.now(),
      }
    } else {
      if (contracts.length === 0) return

      const contract = contracts[Math.floor(Math.random() * contracts.length)]
      const functions = CONTRACT_TEMPLATES[contract.type as keyof typeof CONTRACT_TEMPLATES].functions
      const functionName = functions[Math.floor(Math.random() * functions.length)]

      newRequest = {
        id: Date.now().toString() + Math.random(),
        type: "call",
        contractAddress: contract.address,
        functionName,
        parameters: [],
        description: `Call ${functionName}() on contract at ${contract.address.slice(0, 6)}...${contract.address.slice(-4)}`,
        difficulty,
        points: difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 12,
        timestamp: Date.now(),
      }
    }

    setRequests((prev) => [...prev, newRequest])
  }

  const handleCreateContract = () => {
    if (!currentRequest || currentRequest.type !== "create") return

    if (!selectedContractType || !contractName || !contractAddress) {
      setFeedback({ type: "error", message: "Please fill in all fields" })
      return
    }

    const isCorrectType = selectedContractType === currentRequest.contractType
    const isCorrectAddress = contractAddress.toLowerCase() === currentRequest.contractAddress?.toLowerCase()

    if (isCorrectType && isCorrectAddress) {
      const template = CONTRACT_TEMPLATES[selectedContractType as keyof typeof CONTRACT_TEMPLATES]
      const newContract: SmartContract = {
        id: Date.now().toString(),
        name: contractName,
        address: contractAddress,
        type: selectedContractType,
        functions: template.functions,
        state: { ...template.initialState },
        createdAt: Date.now(),
      }

      setContracts((prev) => [...prev, newContract])
      setScore((prev) => prev + currentRequest.points)
      setCorrectResponses((prev) => prev + 1)
      setFeedback({ type: "success", message: `Contract deployed successfully! +${currentRequest.points} points` })
    } else if (!isCorrectType) {
      setFeedback({ type: "error", message: `Incorrect contract type. Expected: ${currentRequest.contractType}` })
    } else {
      setFeedback({ type: "error", message: `Incorrect address. Expected: ${currentRequest.contractAddress}` })
    }

    processNextRequest()
  }

  const handleContractSelection = (contractAddress: string) => {
    setSelectedContract(contractAddress)
    const contract = contracts.find((c) => c.address === contractAddress)
    if (contract) {
      const template = CONTRACT_TEMPLATES[contract.type as keyof typeof CONTRACT_TEMPLATES]
      setAvailableFunctions(template.functions)
    } else {
      setAvailableFunctions([])
    }
    setSelectedFunction("")
  }

  const handleCallFunction = () => {
    if (!currentRequest || currentRequest.type !== "call") return

    if (!selectedContract || !selectedFunction) {
      setFeedback({ type: "error", message: "Please select both contract and function" })
      return
    }

    const contract = contracts.find((c) => c.address === selectedContract)
    if (!contract) {
      setFeedback({ type: "error", message: "Contract not found" })
      return
    }

    const isCorrectContract = contract.address.toLowerCase() === currentRequest.contractAddress?.toLowerCase()
    const isCorrectFunction = selectedFunction === currentRequest.functionName

    if (isCorrectContract && isCorrectFunction) {
      setScore((prev) => prev + currentRequest.points)
      setCorrectResponses((prev) => prev + 1)
      setFeedback({ type: "success", message: `Function called successfully! +${currentRequest.points} points` })
    } else if (!isCorrectContract) {
      setFeedback({ type: "error", message: `Wrong contract! Expected: ${currentRequest.contractAddress}` })
    } else {
      setFeedback({ type: "error", message: `Wrong function! Expected: ${currentRequest.functionName}` })
    }

    processNextRequest()
  }

  const processNextRequest = () => {
    setTotalRequests((prev) => prev + 1)
    setRequests((prev) => prev.slice(1))
    setCurrentRequest(requests[1] || null)
    setSelectedContractType("")
    setContractName("")
    setContractAddress("") // Add this line
    setSelectedContract("")
    setSelectedFunction("")
    setAvailableFunctions([])
    setFunctionResponse("")

    setTimeout(() => setFeedback(null), 3000)
  }

  const skipRequest = () => {
    setFeedback({ type: "error", message: "Request skipped - no points awarded" })
    processNextRequest()
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-900">Blockchain Simulator</CardTitle>
            <CardDescription className="text-lg">
              Act as a blockchain and process smart contract requests correctly to earn points!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <Plus className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Create Contracts</h3>
                  <p className="text-sm text-green-700">Deploy new smart contracts</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <Play className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Call Functions</h3>
                  <p className="text-sm text-blue-700">Execute contract functions</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Button onClick={startGame} size="lg" className="px-8">
                Start Simulation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Blockchain Simulator</h1>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              Score: {score}
            </Badge>
            <Badge variant="outline" className="text-lg px-3 py-1">
              Accuracy: {totalRequests > 0 ? Math.round((correctResponses / totalRequests) * 100) : 0}%
            </Badge>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <Alert className={feedback.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
            {feedback.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={feedback.type === "success" ? "text-green-800" : "text-red-800"}>
              {feedback.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Request */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Current Request</span>
                  {currentRequest && (
                    <Badge
                      variant={
                        currentRequest.difficulty === "easy"
                          ? "secondary"
                          : currentRequest.difficulty === "medium"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {currentRequest.difficulty} - {currentRequest.points} pts
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentRequest ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{currentRequest.description}</p>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          Type: <Badge variant="outline">{currentRequest.type}</Badge>
                        </p>
                        {currentRequest.contractName && (
                          <p>
                            Contract: <code className="bg-gray-200 px-1 rounded">{currentRequest.contractName}</code>
                          </p>
                        )}
                        {currentRequest.contractAddress && (
                          <p>
                            Address:{" "}
                            <code className="bg-gray-200 px-1 rounded font-mono text-xs">
                              {currentRequest.contractAddress}
                            </code>
                          </p>
                        )}
                        {currentRequest.functionName && (
                          <p>
                            Function: <code className="bg-gray-200 px-1 rounded">{currentRequest.functionName}</code>
                          </p>
                        )}
                      </div>
                    </div>

                    {currentRequest.type === "create" ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="contractType">Contract Type</Label>
                          <Select value={selectedContractType} onValueChange={setSelectedContractType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select contract type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(CONTRACT_TEMPLATES).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="contractName">Contract Name</Label>
                          <Input
                            id="contractName"
                            value={contractName}
                            onChange={(e) => setContractName(e.target.value)}
                            placeholder="Enter contract name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contractAddress">Contract Address</Label>
                          <Input
                            id="contractAddress"
                            value={contractAddress}
                            onChange={(e) => setContractAddress(e.target.value)}
                            placeholder="0x..."
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={handleCreateContract} className="flex-1">
                            Create Contract
                          </Button>
                          <Button variant="outline" onClick={skipRequest}>
                            Skip
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="contract">Select Contract</Label>
                          <Select value={selectedContract} onValueChange={handleContractSelection}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select contract to call" />
                            </SelectTrigger>
                            <SelectContent>
                              {contracts.map((contract) => (
                                <SelectItem key={contract.id} value={contract.address}>
                                  <div className="flex flex-col">
                                    <span className="font-mono text-xs">
                                      {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                                    </span>
                                    <span className="text-xs text-gray-500">{contract.type}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedContract && availableFunctions.length > 0 && (
                          <div>
                            <Label htmlFor="function">Select Function</Label>
                            <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select function to call" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableFunctions.map((func) => (
                                  <SelectItem key={func} value={func}>
                                    {func}()
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            onClick={handleCallFunction}
                            className="flex-1"
                            disabled={!selectedContract || !selectedFunction}
                          >
                            Call Function
                          </Button>
                          <Button variant="outline" onClick={skipRequest}>
                            Skip
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Generating new requests...</p>
                    <div className="mt-4 animate-pulse">
                      <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Queue */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {requests.slice(1, 6).map((request, index) => (
                    <div key={request.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{request.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {request.points}pts
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-xs mt-1">{request.description}</p>
                    </div>
                  ))}
                  {requests.length <= 1 && <p className="text-gray-500 text-sm">Queue is empty</p>}
                </div>
              </CardContent>
            </Card>

            {/* Deployed Contracts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deployed Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="p-2 bg-blue-50 rounded text-sm">
                      <div className="font-mono text-xs text-blue-800">
                        {contract.address.slice(0, 6)}...{contract.address.slice(-4)}
                      </div>
                      <div className="text-blue-600 text-xs">{contract.type}</div>
                      <div className="text-gray-500 text-xs">{contract.functions.length} functions</div>
                    </div>
                  ))}
                  {contracts.length === 0 && <p className="text-gray-500 text-sm">No contracts deployed</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
