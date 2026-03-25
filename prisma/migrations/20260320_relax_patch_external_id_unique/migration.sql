-- Allow VNDB/DLsite IDs to repeat across different games.
-- Keep only unique_id as the strict unique identifier.
DROP INDEX IF EXISTS "patch_vndb_id_key";
DROP INDEX IF EXISTS "patch_dlsite_id_key";

CREATE INDEX IF NOT EXISTS "patch_vndb_id_idx" ON "patch"("vndb_id");
CREATE INDEX IF NOT EXISTS "patch_dlsite_id_idx" ON "patch"("dlsite_id");
