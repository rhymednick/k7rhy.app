// pages/api/github-create-issue.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface IssuePayload {
    title: string;
    body: string;
    labels: string[];
}
type FeedbackType = 'comment' | 'question' | 'report';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { title, body, feedbackType } = req.body as {
            title: string;
            body: string;
            feedbackType: FeedbackType;
        };

        // Validation
        if (!title || !body) {
            return res
                .status(400)
                .json({ message: 'Title and body are required.' });
        }

        // Determine protocol and construct the base URL
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const baseUrl = `${protocol}://${req.headers.host}`;

        // Fetch the installation access token dynamically
        const tokenResponse = await fetch(
            `${baseUrl}/api/github-installation-token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error(
                'Failed to fetch installation access token:',
                errorText
            );
            return res
                .status(500)
                .json({ message: 'Failed to fetch installation access token' });
        }

        const { token: installationAccessToken } = await tokenResponse.json();

        // Specify the repository (owner/repo format)
        const repo = process.env.GITHUB_USER_REPO;

        // Determine if we are on the dev server
        const isDevServer =
            process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production';

        // Create the issue payload with type IssuePayload
        const issuePayload: IssuePayload = {
            title: title,
            body: body,
            labels: [],
        };
        console.log('feedbackType:', feedbackType);
        // Add labels based on feedback type
        switch (feedbackType) {
            case 'comment':
                issuePayload.labels.push('documentation');
                break;
            case 'question':
                issuePayload.labels.push('question');
                break;
            case 'report':
                issuePayload.labels.push('bug');
                break;
        }

        // Add the dev server label if applicable
        if (isDevServer) {
            issuePayload.labels.push('ignore_development_test');
        }

        const response = await fetch(
            `https://api.github.com/repos/${repo}/issues`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `token ${installationAccessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(issuePayload),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to create issue:', errorText);
            throw new Error('Failed to create issue');
        }

        const data = await response.json();
        res.status(201).json(data); // Returns the created issue details
    } catch (error) {
        console.error(error);
        const errorMessage =
            error instanceof Error ? error.message : 'Internal Server Error';
        res.status(500).json({
            message: errorMessage,
        });
    }
}
