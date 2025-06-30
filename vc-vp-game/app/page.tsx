"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Trophy, User, Shield, Key } from "lucide-react"
import { VCCreatorTool } from "@/components/vc-creator-tool"
import { CryptoVerification } from "@/components/crypto-verification"
import { DUMMY_DATA, getRandomItem } from "@/lib/dummy-data"
import { VigenereCipher } from "@/lib/vigenere-cipher"

// Trusted issuers list (global)
const TRUSTED_ISSUERS = [
  "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
  "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp",
  "did:key:z6MkjchhfUsD6mmvni8mCdXHw216Xrm9bQe2mBH1P5RDjVJG",
]

interface Challenge {
  id: string
  type: "creation" | "verification"
  data: any
  solution?: any
}

interface GameState {
  score: number
  currentChallenge: Challenge | null
  challengeHistory: Array<{ challenge: Challenge; correct: boolean; points: number }>
}

export default function VCGame() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    currentChallenge: null,
    challengeHistory: [],
  })

  const [userInput, setUserInput] = useState("")
  const [showSolution, setShowSolution] = useState(false)
  const [verificationResults, setVerificationResults] = useState<{
    cryptoCorrect: boolean
    subjectHolderMatch: boolean
    trustedIssuer: boolean
  } | null>(null)

  // Generate random DID
  const generateDID = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = "did:key:z6Mk"
    for (let i = 0; i < 40; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Generate creation challenge with simplified data (5-6 fields)
  const generateCreationChallenge = (): Challenge => {
    const holderDID = generateDID()
    const issuerDID = TRUSTED_ISSUERS[Math.floor(Math.random() * TRUSTED_ISSUERS.length)]

    // Only 5-6 key fields, each randomly selected from 20-30 options
    const challengeData = {
      holderDID,
      issuerDID,
      name: getRandomItem(DUMMY_DATA.names),
      profession: getRandomItem(DUMMY_DATA.professions),
      dateOfBirth: getRandomItem(DUMMY_DATA.dateOfBirth),
      company: getRandomItem(DUMMY_DATA.companies),
      location: getRandomItem(DUMMY_DATA.locations),
      salary: getRandomItem(DUMMY_DATA.salaries),
    }

    const solution = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "EmploymentCredential"],
      issuer: issuerDID,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: holderDID,
        name: challengeData.name,
        profession: challengeData.profession,
        dateOfBirth: challengeData.dateOfBirth,
        company: challengeData.company,
        location: challengeData.location,
        salary: challengeData.salary,
      },
    }

    return {
      id: `creation-${Date.now()}`,
      type: "creation",
      data: challengeData,
      solution,
    }
  }

  // Generate verification challenge with crypto puzzle
  const generateVerificationChallenge = (): Challenge => {
    const holderDID = generateDID()
    const issuerDID =
      Math.random() > 0.3 ? TRUSTED_ISSUERS[Math.floor(Math.random() * TRUSTED_ISSUERS.length)] : generateDID()

    // Sometimes make subject different from holder for testing
    const subjectDID = Math.random() > 0.2 ? holderDID : generateDID()

    const vcData = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: issuerDID,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: subjectDID,
        name: getRandomItem(DUMMY_DATA.names),
        profession: getRandomItem(DUMMY_DATA.professions),
        company: getRandomItem(DUMMY_DATA.companies),
        dateOfBirth: getRandomItem(DUMMY_DATA.dateOfBirth),
      },
    }

    const vpData = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      holder: holderDID,
      verifiableCredential: [vcData],
    }

    // Generate signatures and encode them
    const vcHash = VigenereCipher.generateHash(vcData)
    const vpHash = VigenereCipher.generateHash(vpData)

    // Create a signing DID for this challenge
    const signingDID = generateDID()
    const cipherKey = signingDID.replace("did:key:", "").slice(0, 10)

    // Sometimes corrupt the signatures to make them invalid
    const vcSignatureValid = Math.random() > 0.3
    const vpSignatureValid = Math.random() > 0.3

    let vcSignatureToEncode = vcHash
    let vpSignatureToEncode = vpHash

    if (!vcSignatureValid) {
      // Corrupt a few characters
      const chars = vcHash.split("")
      for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        chars[randomIndex] = Math.random() > 0.5 ? "X" : "Y"
      }
      vcSignatureToEncode = chars.join("")
    }

    if (!vpSignatureValid) {
      // Corrupt a few characters
      const chars = vpHash.split("")
      for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        chars[randomIndex] = Math.random() > 0.5 ? "Z" : "W"
      }
      vpSignatureToEncode = chars.join("")
    }

    const encodedVCSignature = VigenereCipher.encode(vcSignatureToEncode, cipherKey)
    const encodedVPSignature = VigenereCipher.encode(vpSignatureToEncode, cipherKey)

    return {
      id: `verification-${Date.now()}`,
      type: "verification",
      data: {
        vcData,
        vpData,
        vcSignature: encodedVCSignature,
        vpSignature: encodedVPSignature,
        signingDID,
      },
      solution: {
        cryptoValid: vcSignatureValid && vpSignatureValid,
        subjectHolderMatch: subjectDID === holderDID,
        trustedIssuer: TRUSTED_ISSUERS.includes(issuerDID),
        issuerDID,
        subjectDID,
        holderDID,
      },
    }
  }

  // Start new challenge
  const startNewChallenge = () => {
    const challengeType = Math.random() > 0.5 ? "creation" : "verification"
    const challenge = challengeType === "creation" ? generateCreationChallenge() : generateVerificationChallenge()

    setGameState((prev) => ({ ...prev, currentChallenge: challenge }))
    setUserInput("")
    setShowSolution(false)
    setVerificationResults(null)
  }

  // Submit creation answer
  const submitCreation = () => {
    if (!gameState.currentChallenge) return

    try {
      const userVC = JSON.parse(userInput)
      const solution = gameState.currentChallenge.solution

      // Check if the structure matches (simplified check for 6 key fields)
      const isCorrect =
        userVC.issuer === solution.issuer &&
        userVC.credentialSubject?.id === solution.credentialSubject.id &&
        userVC.credentialSubject?.name === solution.credentialSubject.name &&
        userVC.credentialSubject?.profession === solution.credentialSubject.profession &&
        userVC.credentialSubject?.dateOfBirth === solution.credentialSubject.dateOfBirth &&
        userVC.credentialSubject?.company === solution.credentialSubject.company &&
        userVC.credentialSubject?.location === solution.credentialSubject.location &&
        userVC.credentialSubject?.salary === solution.credentialSubject.salary &&
        userVC.type?.includes("VerifiableCredential")

      const points = isCorrect ? 15 : 0
      setGameState((prev) => ({
        ...prev,
        score: prev.score + points,
        challengeHistory: [
          ...prev.challengeHistory,
          { challenge: gameState.currentChallenge!, correct: isCorrect, points },
        ],
      }))

      setShowSolution(true)
    } catch (error) {
      alert("Invalid JSON format")
    }
  }

  // Handle verification completion
  const handleVerificationComplete = (results: {
    cryptoCorrect: boolean
    subjectHolderMatch: boolean
    trustedIssuer: boolean
  }) => {
    if (!gameState.currentChallenge?.solution) return

    const solution = gameState.currentChallenge.solution
    let points = 0
    let correctCount = 0

    if (results.cryptoCorrect === solution.cryptoValid) {
      points += 5
      correctCount++
    }
    if (results.subjectHolderMatch === solution.subjectHolderMatch) {
      points += 3
      correctCount++
    }
    if (results.trustedIssuer === solution.trustedIssuer) {
      points += 4
      correctCount++
    }

    const allCorrect = correctCount === 3

    setGameState((prev) => ({
      ...prev,
      score: prev.score + points,
      challengeHistory: [
        ...prev.challengeHistory,
        { challenge: gameState.currentChallenge!, correct: allCorrect, points },
      ],
    }))

    setVerificationResults(results)
    setShowSolution(true)
  }

  // Initialize with first challenge
  useEffect(() => {
    startNewChallenge()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Verifiable Credentials Game
            </CardTitle>
            <CardDescription>Learn to create and verify Verifiable Credentials and Presentations</CardDescription>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Trophy className="h-4 w-4 mr-2" />
                Score: {gameState.score}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Trusted Issuers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trusted Issuers Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {TRUSTED_ISSUERS.map((did, index) => (
                <div key={index} className="font-mono text-sm bg-green-50 p-2 rounded border">
                  {did}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* VC Creator Tool */}
        <VCCreatorTool trustedIssuers={TRUSTED_ISSUERS} />

        {/* Current Challenge */}
        {gameState.currentChallenge && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Challenge Card */}
            <div className="xl:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {gameState.currentChallenge.type === "creation" ? (
                      <>
                        <Key className="h-5 w-5" />
                        Creation Challenge
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5" />
                        Verification Challenge
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {gameState.currentChallenge.type === "creation" ? (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold">Task:</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Create a Verifiable Credential with the following information:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Holder DID:</Label>
                          <div className="font-mono text-sm bg-gray-50 p-2 rounded border">
                            {gameState.currentChallenge.data.holderDID}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Issuer DID:</Label>
                          <div className="font-mono text-sm bg-gray-50 p-2 rounded border">
                            {gameState.currentChallenge.data.issuerDID}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Name:</Label>
                          <div className="text-sm bg-gray-50 p-2 rounded border">
                            {gameState.currentChallenge.data.name}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Profession:</Label>
                          <div className="text-sm bg-gray-50 p-2 rounded border">
                            {gameState.currentChallenge.data.profession}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Date of Birth:</Label>
                          <div className="text-sm bg-gray-50 p-2 rounded border">
                            {gameState.currentChallenge.data.dateOfBirth}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Company:</Label>
                          <div className="text-sm bg-gray-50 p-2 rounded border">
                            {gameState.currentChallenge.data.company}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Location:</Label>
                          <div className="text-sm bg-gray-50 p-2 rounded border">
                            {gameState.currentChallenge.data.location}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Salary:</Label>
                          <div className="text-sm bg-gray-50 p-2 rounded border">
                            ${gameState.currentChallenge.data.salary}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="vc-input">Your Verifiable Credential (JSON):</Label>
                        <Textarea
                          id="vc-input"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Enter your VC JSON here..."
                          className="font-mono text-sm h-60"
                        />
                      </div>

                      <Button onClick={submitCreation} className="w-full">
                        Submit VC
                      </Button>

                      {showSolution && (
                        <div className="mt-4 p-4 bg-blue-50 rounded border">
                          <Label className="text-sm font-semibold">Correct Solution:</Label>
                          <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-auto max-h-60">
                            {JSON.stringify(gameState.currentChallenge.solution, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!verificationResults ? (
                        <CryptoVerification
                          vcData={gameState.currentChallenge.data.vcData}
                          vpData={gameState.currentChallenge.data.vpData}
                          vcSignature={gameState.currentChallenge.data.vcSignature}
                          vpSignature={gameState.currentChallenge.data.vpSignature}
                          onVerificationComplete={handleVerificationComplete}
                          trustedIssuers={TRUSTED_ISSUERS}
                        />
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Verification Results</h3>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Cryptographic Verification</span>
                              {verificationResults.cryptoCorrect ===
                              gameState.currentChallenge.solution?.cryptoValid ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Subject-Holder Match</span>
                              {verificationResults.subjectHolderMatch ===
                              gameState.currentChallenge.solution?.subjectHolderMatch ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded">
                              <span>Trusted Issuer</span>
                              {verificationResults.trustedIssuer ===
                              gameState.currentChallenge.solution?.trustedIssuer ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                          </div>

                          <div className="p-4 bg-blue-50 rounded border">
                            <Label className="text-sm font-semibold">Correct Answers:</Label>
                            <ul className="text-sm mt-2 space-y-1">
                              <li>• Crypto Valid: {gameState.currentChallenge.solution?.cryptoValid ? "Yes" : "No"}</li>
                              <li>
                                • Subject-Holder Match:{" "}
                                {gameState.currentChallenge.solution?.subjectHolderMatch ? "Yes" : "No"}
                              </li>
                              <li>
                                • Trusted Issuer: {gameState.currentChallenge.solution?.trustedIssuer ? "Yes" : "No"}
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Game Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Game Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{gameState.score}</div>
                  <div className="text-sm text-gray-500">Total Points</div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-semibold">Scoring:</Label>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Creation Challenge: 15 points</li>
                    <li>• Crypto Verification: 5 points</li>
                    <li>• Subject-Holder Check: 3 points</li>
                    <li>• Trusted Issuer Check: 4 points</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-semibold">Recent Challenges:</Label>
                  <div className="mt-2 space-y-1">
                    {gameState.challengeHistory.slice(-5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {item.correct ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="capitalize">{item.challenge.type}</span>
                        </div>
                        <span className="text-xs text-gray-500">+{item.points}pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={startNewChallenge} className="w-full bg-transparent" variant="outline">
                  New Challenge
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
