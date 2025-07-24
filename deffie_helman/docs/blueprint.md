# **App Name**: DH Key Exchange Lab

## Core Features:

- Role Assignment: Simulate Alice, Bob, and Mallory (attacker) roles in a Diffie-Hellman key exchange.
- Parameter Input: Input fields for the Diffie-Hellman parameters (p, g) and private keys (a, b). Keep p and g values short to aid manual student calculation, so its easy for a student to follow along by hand.
- Calculation Visualization: Display the math operations performed by Alice and Bob to calculate and exchange their public keys. E.g., Show students what: 'A = g^a mod p' and 'B = g^b mod p' means by actually listing out the calculations in numeric forms, such as '2^15 mod 17'. Ensure you use small number values so students can calculate the keys by hand to show comprehension. 
- Exchange Visualization: Visualize the Diffie-Hellman key exchange process step-by-step: key generation, public key exchange, shared secret calculation, logging each step.
- Shared Secret Output: Display and log the shared secret key established by Alice and Bob.
- MITM Attack Simulation: Visualize a Man-in-the-Middle (MITM) attack by Mallory, showing how intercepted public keys lead to compromised shared secrets. Provide inputs for Mallory's private keys to show how Mallory creates a compromised secret
- Contextual Explanation: Provide a textual explanation of each step in the DH exchange, highlighting the math, as well as the potential vulnerabilities. The system should use a tool to decide how best to describe each step of the exchange based on user interactions with the key-exchange parameters.

## Style Guidelines:

- Primary color: A deep blue (#3F51B5) to represent security and trust.
- Background color: Light gray (#EEEEEE) to ensure readability and a clean interface.
- Accent color: A bright orange (#FF9800) to highlight important elements such as the shared secret.
- Body and headline font: 'Inter', a sans-serif font, to make all on-screen equations, variables and information clearly legible.
- Use simple, clear icons to represent Alice, Bob, Mallory, keys, and messages.
- Divide the screen into clear sections for parameter input, key exchange visualization, and output logs.
- Use animations to show the exchange of keys and the calculation of the shared secret, enhancing understanding of the process.