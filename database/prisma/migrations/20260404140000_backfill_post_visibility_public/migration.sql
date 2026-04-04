-- Legacy rows: missing visibility should behave as public in feeds
UPDATE "posts" SET "visibility" = 'PUBLIC' WHERE "visibility" IS NULL;
