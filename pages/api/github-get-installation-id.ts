// pages/api/github-get-installation-id.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
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

        const response = await fetch('https://api.github.com/app/installations', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwtToken}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to list installations');
        }

        const data = await response.json();
        res.status(200).json(data); // This will return the list of installations
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
