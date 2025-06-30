// Vigenère Cipher implementation for signature encoding/decoding

export class VigenereCipher {
  private static readonly ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

  static encode(text: string, key: string): string {
    const cleanText = text.toUpperCase().replace(/[^A-Z0-9]/g, "")
    const cleanKey = key.toUpperCase().replace(/[^A-Z0-9]/g, "")

    if (!cleanKey) return cleanText

    let result = ""
    for (let i = 0; i < cleanText.length; i++) {
      const textChar = cleanText[i]
      const keyChar = cleanKey[i % cleanKey.length]

      const textIndex = this.ALPHABET.indexOf(textChar)
      const keyIndex = this.ALPHABET.indexOf(keyChar)

      if (textIndex === -1) {
        result += textChar
      } else {
        const encodedIndex = (textIndex + keyIndex) % this.ALPHABET.length
        result += this.ALPHABET[encodedIndex]
      }
    }

    return result
  }

  static decode(encodedText: string, key: string): string {
    const cleanText = encodedText.toUpperCase().replace(/[^A-Z0-9]/g, "")
    const cleanKey = key.toUpperCase().replace(/[^A-Z0-9]/g, "")

    if (!cleanKey) return cleanText

    let result = ""
    for (let i = 0; i < cleanText.length; i++) {
      const textChar = cleanText[i]
      const keyChar = cleanKey[i % cleanKey.length]

      const textIndex = this.ALPHABET.indexOf(textChar)
      const keyIndex = this.ALPHABET.indexOf(keyChar)

      if (textIndex === -1) {
        result += textChar
      } else {
        const decodedIndex = (textIndex - keyIndex + this.ALPHABET.length) % this.ALPHABET.length
        result += this.ALPHABET[decodedIndex]
      }
    }

    return result
  }

  static generateHash(data: any): string {
    // Simple hash function for educational purposes
    const str = JSON.stringify(data, null, 0)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")
  }
}
