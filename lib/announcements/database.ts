import { Pool, type QueryResultRow } from 'pg';

let pool: Pool | undefined;
/** Lazy initialization: building the site and disabled announcements need no database. */
export function announcementPool(): Pool {
    if (!pool) {
        const connectionString = process.env.DISCORD_ANNOUNCEMENTS_DATABASE_URL;
        if (!connectionString) throw new Error('Configure DISCORD_ANNOUNCEMENTS_DATABASE_URL before enabling announcements');
        pool = new Pool({ connectionString, max: 2, connectionTimeoutMillis: 4000, idleTimeoutMillis: 5000, statement_timeout: 10000 });
        // Handle idle-client errors without logging connection details or crashing the webhook process.
        pool.on('error', () => console.error('[discord-announcement] Idle database connection failed'));
    }
    return pool;
}
export function database() {
    return {
        async sql<T extends QueryResultRow = QueryResultRow>(parts: TemplateStringsArray, ...values: unknown[]): Promise<T[]> {
            const query = parts.reduce((sql, part, index) => sql + (index ? `$${index}` : '') + part, '');
            return (await announcementPool().query<T>(query, values)).rows;
        },
    };
}
