import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { plannedModelKeys } from '@/config/relay-models';
import {
	readVotes,
	writeVotes,
	applyWeightedPoints,
	extractPlannedVotes,
	isValidRankings,
} from '@/lib/relay-votes';

const COOKIE_NAME = 'relay-model-vote';
const COOKIE_MAX_AGE = 31_536_000; // 1 year

export async function GET() {
	try {
		const votes = await readVotes();
		// extractPlannedVotes filters to only planned model keys before returning to client
		return NextResponse.json({
			votes: extractPlannedVotes(votes),
			totalVoters: votes.totalVoters,
		});
	} catch {
		return NextResponse.json({ error: 'Failed to read votes' }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const { rankings, previousRankings } = body as { rankings: unknown; previousRankings?: unknown };

	if (!isValidRankings(rankings, plannedModelKeys)) {
		return NextResponse.json({ error: 'Invalid rankings' }, { status: 400 });
	}

	// Validate previousRankings before checking cookie, so a malformed previousRankings
	// never reaches the write path (which would incorrectly increment totalVoters).
	if (previousRankings !== undefined && !isValidRankings(previousRankings, plannedModelKeys)) {
		return NextResponse.json({ error: 'Invalid previousRankings' }, { status: 400 });
	}

	const cookieStore = await cookies();
	const existingCookie = cookieStore.get(COOKIE_NAME)?.value;

	if (!previousRankings && existingCookie) {
		return NextResponse.json(
			{ error: 'Cookie present but no previousRankings supplied' },
			{ status: 409 }
		);
	}

	try {
		let votes = await readVotes();

		if (isValidRankings(previousRankings, plannedModelKeys)) {
			// Vote change: subtract old points, do not increment totalVoters
			votes = applyWeightedPoints(votes, previousRankings, -1);
		} else {
			// New vote
			votes.totalVoters = (votes.totalVoters ?? 0) + 1;
		}

		votes = applyWeightedPoints(votes, rankings, 1);
		await writeVotes(votes);

		const isProduction = process.env.NODE_ENV === 'production';
		const cookieValue = JSON.stringify(rankings);

		const response = NextResponse.json({
			votes: extractPlannedVotes(votes),
			totalVoters: votes.totalVoters,
		});

		response.cookies.set(COOKIE_NAME, cookieValue, {
			maxAge: COOKIE_MAX_AGE,
			sameSite: 'lax',
			secure: isProduction,
			httpOnly: false,
			path: '/',
		});

		return response;
	} catch {
		return NextResponse.json({ error: 'Failed to write votes' }, { status: 500 });
	}
}
