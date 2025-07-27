# **App Name**: PKI Playground

## Core Features:

- Guided Key Distribution: Interactive walkthrough demonstrating secure key distribution with a Certificate Authority (CA).
- MITM Attack Prevention: Step-by-step demonstration of a Man-in-the-Middle (MITM) attack and how PKI prevents it.
- Client-Side PKI Simulation: Simulate key generation, certificate signing, and verification processes entirely in the browser.
- Ambiguous Request Generation: Create ambiguous requests for key registration or retrieval, some of which are MITM attempts, requiring the user to identify the correct action.
- Interactive Simulation Dashboard: Provide a dashboard interface showing incoming requests, available keys, and action buttons (send key, send MITM alert).
- Real-time scoring: Score the user's actions based on whether they correctly identify and respond to legitimate key requests and MITM attempts.

## Style Guidelines:

- Primary color: Slate Blue (#6A5ACD) to evoke trust and security.
- Background color: Very light grayish-blue (#F0F8FF) for a clean, digital workspace feel.
- Accent color: Electric Violet (#8F00FF) to highlight key actions and alerts, contrasting with the primary color.
- Body text: 'Inter', sans-serif, known for its modern and readable design.
- Headline font: 'Space Grotesk', sans-serif, providing a techy, scientific feel that pairs well with 'Inter' for body.
- Use simple, clear icons to represent users (Alice, Bob, Craig), keys, certificates, and CA.
- A modular and responsive design will be employed to render well on both desktop and mobile screens.
- Subtle animations will illustrate the flow of keys and certificates in the learning path, and the presentation of changing parameters (e.g. score updates) in the simulation path.