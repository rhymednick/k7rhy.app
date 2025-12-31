// pages/api/github-auth.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const appId = process.env.GITHUB_APP_ID; // Your GitHub App ID
        const privateKey = process.env.GITHUB_PRIVATE_KEY; // Your GitHub App private key from the .env file

        // Ensure appId and privateKey are defined
        if (!appId || !privateKey) {
            return res.status(500).json({
                message: 'GitHub App ID or Private Key is not defined.',
            });
        }

        const payload = {
            iss: appId, // GitHub App ID
            iat: Math.floor(Date.now() / 1000) - 60, // Issued at time
            exp: Math.floor(Date.now() / 1000) + 10 * 60, // Expiration time (10 minutes max)
        };

        // Create the JWT using the private key
        const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

        // Example response. You can use this token to interact with GitHub.
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
