export interface Transaction {
  from: string
  to: string
  amount: number
  timestamp: number
  signature: string
}

export interface Block {
  index: number
  timestamp: number
  transactions: Transaction[]
  previousHash: string
  nonce: number
  hash: string
}

export interface GameBlock {
  block: Block
  shouldBeValid: boolean
  corruptionType?: string
}

// Global blockchain singleton
const globalBlockchain: Block[] = []

export function getBlockchain(): Block[] {
  return [...globalBlockchain]
}

export function addBlockToChain(block: Block): void {
  globalBlockchain.push(block)
}

export function getLastBlock(): Block | null {
  return globalBlockchain.length > 0 ? globalBlockchain[globalBlockchain.length - 1] : null
}

// Generate a SHA-256 hash
export async function hashString(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Vigenère cipher functions
function charToNum(char: string): number {
  if (char >= "0" && char <= "9") {
    return Number.parseInt(char)
  } else if (char >= "a" && char <= "f") {
    return char.charCodeAt(0) - "a".charCodeAt(0) + 10
  }
  return 0
}

function numToChar(num: number): string {
  if (num >= 0 && num <= 9) {
    return num.toString()
  } else if (num >= 10 && num <= 15) {
    return String.fromCharCode("a".charCodeAt(0) + num - 10)
  }
  return "0"
}

function vigenereEncrypt(text: string, key: string): string {
  let result = ""
  let keyIndex = 0

  for (let i = 0; i < text.length; i++) {
    const textChar = text[i]
    const keyChar = key[keyIndex % key.length]

    const textNum = charToNum(textChar)
    const keyNum = charToNum(keyChar)

    const encryptedNum = (textNum + keyNum) % 16
    result += numToChar(encryptedNum)

    keyIndex++
  }

  return result
}

function vigenereDecrypt(ciphertext: string, key: string): string {
  let result = ""
  let keyIndex = 0

  for (let i = 0; i < ciphertext.length; i++) {
    const cipherChar = ciphertext[i]
    const keyChar = key[keyIndex % key.length]

    const cipherNum = charToNum(cipherChar)
    const keyNum = charToNum(keyChar)

    const decryptedNum = (cipherNum - keyNum + 16) % 16
    result += numToChar(decryptedNum)

    keyIndex++
  }

  return result
}

// Generate signature using Vigenère cipher
async function generateSignature(transactionData: string, publicAddress: string): Promise<string> {
  const hash = await hashString(transactionData)
  const key = publicAddress.replace("0x", "") // Remove 0x prefix
  return vigenereEncrypt(hash, key)
}

// Verify signature by decrypting and returning the decrypted hash
export function verifySignature(signature: string, publicKey: string): string {
  try {
    const key = publicKey.replace("0x", "") // Remove 0x prefix if present
    return vigenereDecrypt(signature, key)
  } catch {
    return "Error decrypting signature"
  }
}

// Generate a mock wallet address
function generateWalletAddress(): string {
  const chars = "0123456789abcdef"
  let result = "0x"
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate a mock transaction
async function generateMockTransaction(): Promise<Transaction> {
  const from = generateWalletAddress()
  const to = generateWalletAddress()
  const amount = Math.floor(Math.random() * 1000) + 1
  const timestamp = Date.now()

  const transactionData = `${from}${to}${amount}${timestamp}`
  const signature = await generateSignature(transactionData, from)

  return {
    from,
    to,
    amount,
    timestamp,
    signature,
  }
}

// Mine a block (find nonce that makes hash start with required zeros)
async function mineBlock(blockData: string, difficulty = 2): Promise<{ nonce: number; hash: string }> {
  let nonce = 0
  let hash = ""
  const target = "0".repeat(difficulty)

  while (!hash.startsWith(target)) {
    nonce++
    hash = await hashString(blockData + nonce)
  }

  return { nonce, hash }
}

// Generate a valid block
async function generateValidBlock(): Promise<Block> {
  const lastBlock = getLastBlock()
  const index = lastBlock ? lastBlock.index + 1 : 0
  const timestamp = Date.now()
  const numTransactions = Math.floor(Math.random() * 3) + 1 // 1-3 transactions

  const transactions: Transaction[] = []
  for (let i = 0; i < numTransactions; i++) {
    transactions.push(await generateMockTransaction())
  }

  // Get proper previous hash from blockchain
  const previousHash = lastBlock ? lastBlock.hash : "0".repeat(64)

  // Create block data for mining
  const blockData = `${index}${timestamp}${JSON.stringify(transactions)}${previousHash}`

  // Mine the block
  const { nonce, hash } = await mineBlock(blockData, 2)

  return {
    index,
    timestamp,
    transactions,
    previousHash,
    nonce,
    hash,
  }
}

// Corrupt a block to make it invalid
async function corruptBlock(validBlock: Block): Promise<{ block: Block; corruptionType: string }> {
  const corruptionTypes = ["hash", "previousHash", "signature", "nonce"]
  const corruptionType = corruptionTypes[Math.floor(Math.random() * corruptionTypes.length)]

  const corruptedBlock = { ...validBlock }

  switch (corruptionType) {
    case "hash":
      // Make hash not start with required zeros
      corruptedBlock.hash = "ff" + validBlock.hash.slice(2)
      break

    case "previousHash":
      // Wrong previous hash
      corruptedBlock.previousHash = await hashString("wrong_previous_hash")
      break

    case "signature":
      // Corrupt a random transaction signature
      if (corruptedBlock.transactions.length > 0) {
        const txIndex = Math.floor(Math.random() * corruptedBlock.transactions.length)
        // Generate a random corrupted signature
        const chars = "0123456789abcdef"
        let corruptedSig = ""
        for (let i = 0; i < 64; i++) {
          corruptedSig += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        corruptedBlock.transactions[txIndex].signature = corruptedSig
      }
      break

    case "nonce":
      // Wrong nonce that doesn't produce valid hash
      corruptedBlock.nonce = validBlock.nonce + 1000
      corruptedBlock.hash = await hashString(
        `${validBlock.index}${validBlock.timestamp}${JSON.stringify(validBlock.transactions)}${validBlock.previousHash}${corruptedBlock.nonce}`,
      )
      break
  }

  return { block: corruptedBlock, corruptionType }
}

// Generate a game block (valid or invalid based on probability)
export async function generateGameBlock(): Promise<GameBlock> {
  const validBlock = await generateValidBlock()

  // 50% chance of being invalid
  const shouldBeValid = Math.random() > 0.5

  if (shouldBeValid) {
    return {
      block: validBlock,
      shouldBeValid: true,
    }
  } else {
    const { block: corruptedBlock, corruptionType } = await corruptBlock(validBlock)
    return {
      block: corruptedBlock,
      shouldBeValid: false,
      corruptionType,
    }
  }
}
