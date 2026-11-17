CREATE TABLE discord_announcement_items (
    product_id text PRIMARY KEY,
    state jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE discord_announcement_inventory (
    inventory_item_id text PRIMARY KEY,
    product_id text NOT NULL
);
ALTER TABLE discord_announcement_items ADD COLUMN lock_owner text, ADD COLUMN lock_until timestamptz;
