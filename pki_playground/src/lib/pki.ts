import { KeyRound, ShieldCheck, User, UserX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const userNames = "ABCDEFGHIJKLMNOPQRSTUVWXY".split('');
const allActorNames = [...userNames, 'Craig'];

export type ActorName = typeof allActorNames[number];
export type UserName = typeof userNames[number];

const generatePublicKey = (owner: ActorName): string => `pk_${owner.toLowerCase()}`;

export const actors: Record<ActorName, { icon: LucideIcon; description: string; publicKey: string }> = 
    Object.fromEntries(
        allActorNames.map(name => [
            name,
            {
                icon: name === 'Craig' ? UserX : User,
                description: name === 'Craig' 
                    ? 'An attacker trying to intercept communication.' 
                    : 'A user trying to communicate securely.',
                publicKey: generatePublicKey(name),
            }
        ])
    );

export type RequestType = 'sign_request' | 'get_key';
export type ActionType = 'legitimate' | 'mitm';

export interface Request {
  id: number;
  type: RequestType;
  from: UserName;
  target?: UserName; // For get_key requests
  isMitm: boolean;
  signingKey: string; // The key used to "sign" the request. Could be legit or fake.
}

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export const generateRequest = (id: number): Request => {
    const type: RequestType = Math.random() > 0.5 ? 'sign_request' : 'get_key';
    const from = getRandomElement(userNames);
    const isMitm = Math.random() > 0.6; // 40% chance of MITM

    let signingKey: string;
    if (isMitm) {
        // Any user can be the imposter, except for the original sender
        let attacker: UserName;
        do {
            attacker = getRandomElement(userNames);
        } while (attacker === from);
        signingKey = actors[attacker].publicKey;
    } else {
        signingKey = actors[from].publicKey;
    }

    if (type === 'get_key') {
        let target: UserName;
        do {
            target = getRandomElement(userNames);
        } while (target === from);
        return { id, type, from, target, isMitm, signingKey };
    }

    // Default to sign_request
    return { id, type, from, isMitm, signingKey };
};
