#!/usr/bin/env python3

import didkit
import asyncio

async def create_did():
    key = didkit.generate_ed25519_key()
    print(f"Generated key: {key}")
    
    did = didkit.key_to_did("key", key)
    print(f"Created DID: {did}")
    
    verification_method = await didkit.key_to_verification_method("key", key)
    print(f"Verification method: {verification_method}")
    
    return did, key

if __name__ == "__main__":
    print("Creating DID with DIDKit...")
    did, key = asyncio.run(create_did())
    print(f"\nSuccess! Your DID is: {did}")