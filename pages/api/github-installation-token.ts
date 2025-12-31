// pages/api/github-installation-token.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const appId = process.env.GITHUB_APP_ID;
        const privateKey = process.env.GITHUB_PRIVATE_KEY;

        if (!appId || !privateKey) {
            return res.status(500).json({
                message: 'GitHub App ID or Private Key is not defined.',
            });
        }

        const payload = {
            iss: appId,
            iat: Math.floor(Date.now() / 1000) - 60,
            exp: Math.floor(Date.now() / 1000) + 10 * 60,
        };

        const jwtToken = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

        // Fetch the installation access token
        const installationId = process.env.GITHUB_INSTALLATION_ID; // Make sure to set this in your environment variables
        const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${jwtToken}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get installation access token');
        }

        const data = await response.json();
        res.status(200).json(data); // This will return the installation access token
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
