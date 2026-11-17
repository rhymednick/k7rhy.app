/** Explicit migration only. Never runs as part of a site build or webhook. */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { announcementPool } from '../../lib/announcements/database';

const name = '20261117040000_discord_announcements';
const sql = await readFile(new URL(`../../db/discord-announcements/migrations/${name}.sql`, import.meta.url), 'utf8');
if (!process.argv.includes('--apply')) {
    console.log(`Dry run: ${name}\n${sql}\nUse --apply only with the intended database connection configured.`);
} else {
    const checksum = createHash('sha256').update(sql).digest('hex');
    const pool = announcementPool();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query("SELECT pg_advisory_xact_lock(hashtext('discord_announcement_migrations'))");
        await client.query('CREATE TABLE IF NOT EXISTS discord_announcement_migrations (name text PRIMARY KEY, checksum text NOT NULL)');
        const existing = await client.query<{ checksum: string }>('SELECT checksum FROM discord_announcement_migrations WHERE name = $1', [name]);
        if (existing.rows.length) {
            if (existing.rows[0].checksum !== checksum) throw new Error('Applied announcement migration has changed; add a corrective migration');
        } else {
            await client.query(sql);
            await client.query('INSERT INTO discord_announcement_migrations(name, checksum) VALUES ($1, $2)', [name, checksum]);
        }
        await client.query('COMMIT');
        console.log(`${name}: applied or already current`);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}
