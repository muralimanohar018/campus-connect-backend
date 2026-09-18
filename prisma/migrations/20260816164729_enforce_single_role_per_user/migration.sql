-- CampusConnect: enforce exactly one role assignment per user.
--
-- Older versions allowed multiple roles per user.
-- For existing duplicate assignments, retain the highest-priority role:
--
-- SUPER_ADMIN > ADMIN > CORE_TEAM > MEMBER > STUDENT
--
-- If the same user has the same role more than once, retain the
-- earliest assignment.

WITH ranked_roles AS (
  SELECT
    ur."id",
    ur."userId",
    ur."roleId",
    ur."assignedAt",
    ROW_NUMBER() OVER (
      PARTITION BY ur."userId"
      ORDER BY
        CASE r."name"
          WHEN 'SUPER_ADMIN' THEN 1
          WHEN 'ADMIN' THEN 2
          WHEN 'CORE_TEAM' THEN 3
          WHEN 'MEMBER' THEN 4
          WHEN 'STUDENT' THEN 5
          ELSE 999
        END,
        ur."assignedAt" ASC,
        ur."id" ASC
    ) AS role_rank
  FROM "user_roles" ur
  INNER JOIN "roles" r
    ON r."id" = ur."roleId"
)
DELETE FROM "user_roles" ur
USING ranked_roles rr
WHERE ur."id" = rr."id"
  AND rr.role_rank > 1;

ALTER TABLE "user_roles"
  ADD CONSTRAINT "user_roles_userId_key"
  UNIQUE ("userId");