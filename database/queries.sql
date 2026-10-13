-- ============================================================
-- CampusResQ
-- Important SQL Queries and Advanced Database Operations
-- Database: campusresq_db
-- ============================================================

USE campusresq_db;

-- ============================================================
-- 1. BASIC SELECT QUERIES
-- ============================================================

-- Display all emergency reports.
SELECT *
FROM emergencies
ORDER BY created_at DESC;

-- Display active emergencies.
SELECT emergency_id, emergency_type, priority, status, created_at
FROM emergencies
WHERE status = 'ACTIVE'
ORDER BY created_at DESC;

-- Display critical-priority emergencies.
SELECT emergency_id, emergency_type, description, status
FROM emergencies
WHERE priority = 'CRITICAL';

-- Display available resources.
SELECT resource_id, resource_name, resource_type, quantity
FROM resources
WHERE quantity > 0
ORDER BY resource_name;

-- ============================================================
-- 2. JOIN QUERIES
-- ============================================================

-- Emergency details with reporter and campus location.
SELECT
    e.emergency_id,
    e.emergency_type,
    e.priority,
    e.status,
    u.name AS reporter_name,
    l.building,
    l.floor,
    l.room,
    e.created_at
FROM emergencies e
JOIN users u
    ON e.reported_by = u.user_id
JOIN locations l
    ON e.location_id = l.location_id
ORDER BY e.created_at DESC;

-- List responders with their user information.
SELECT
    r.responder_id,
    u.name AS responder_name,
    u.email,
    r.availability_status
FROM responders r
JOIN users u
    ON r.user_id = u.user_id
ORDER BY r.responder_id;

-- Display emergency assignments and responder details.
SELECT
    a.assignment_id,
    a.emergency_id,
    e.emergency_type,
    r.responder_id,
    u.name AS responder_name,
    a.status AS assignment_status,
    a.assigned_at
FROM assignments a
JOIN emergencies e
    ON a.emergency_id = e.emergency_id
JOIN responders r
    ON a.responder_id = r.responder_id
JOIN users u
    ON r.user_id = u.user_id
ORDER BY a.assigned_at DESC;

-- Display resource requests with emergency and resource details.
SELECT
    rr.request_id,
    rr.emergency_id,
    e.emergency_type,
    res.resource_name,
    rr.quantity,
    rr.status,
    rr.requested_at
FROM resource_requests rr
JOIN emergencies e
    ON rr.emergency_id = e.emergency_id
JOIN resources res
    ON rr.resource_id = res.resource_id
ORDER BY rr.requested_at DESC;

-- ============================================================
-- 3. AGGREGATE FUNCTIONS AND GROUP BY
-- ============================================================

-- Count emergencies by status.
SELECT
    status,
    COUNT(*) AS emergency_count
FROM emergencies
GROUP BY status
ORDER BY emergency_count DESC;

-- Count emergencies by priority.
SELECT
    priority,
    COUNT(*) AS emergency_count
FROM emergencies
GROUP BY priority
ORDER BY emergency_count DESC;

-- Count emergencies reported in each campus building.
SELECT
    l.building,
    COUNT(e.emergency_id) AS emergency_count
FROM locations l
LEFT JOIN emergencies e
    ON l.location_id = e.location_id
GROUP BY l.location_id, l.building
ORDER BY emergency_count DESC;

-- Calculate total available resource quantities by type.
SELECT
    resource_type,
    SUM(quantity) AS total_quantity,
    AVG(quantity) AS average_quantity
FROM resources
GROUP BY resource_type
ORDER BY total_quantity DESC;

-- ============================================================
-- 4. HAVING CLAUSE
-- ============================================================

-- Display buildings with more than one emergency.
SELECT
    l.building,
    COUNT(e.emergency_id) AS emergency_count
FROM locations l
JOIN emergencies e
    ON l.location_id = e.location_id
GROUP BY l.location_id, l.building
HAVING COUNT(e.emergency_id) > 1
ORDER BY emergency_count DESC;

-- Display emergency statuses with at least one record.
SELECT
    status,
    COUNT(*) AS emergency_count
FROM emergencies
GROUP BY status
HAVING COUNT(*) >= 1
ORDER BY emergency_count DESC;

-- ============================================================
-- 5. SUBQUERIES
-- ============================================================

-- Display emergencies whose priority is the highest
-- according to the number of records sharing each priority.
-- This query identifies priorities tied for the maximum count.
SELECT priority, COUNT(*) AS emergency_count
FROM emergencies
GROUP BY priority
HAVING COUNT(*) = (
    SELECT MAX(priority_count)
    FROM (
        SELECT COUNT(*) AS priority_count
        FROM emergencies
        GROUP BY priority
    ) AS priority_totals
);

-- Display resources whose quantity is above the average.
SELECT resource_id, resource_name, quantity
FROM resources
WHERE quantity > (
    SELECT AVG(quantity)
    FROM resources
);

-- Display users who have reported at least one emergency.
SELECT user_id, name, email
FROM users
WHERE user_id IN (
    SELECT DISTINCT reported_by
    FROM emergencies
);

-- ============================================================
-- 6. VIEWS
-- ============================================================

-- Inspect the existing emergency_details view.
SELECT *
FROM emergency_details
ORDER BY emergency_id DESC;

-- Inspect the view definition.
SHOW CREATE VIEW emergency_details;

-- ============================================================
-- 7. STORED PROCEDURE
-- ============================================================

-- Inspect the existing stored procedure.
SHOW PROCEDURE STATUS
WHERE Db = 'campusresq_db'
  AND Name = 'get_emergencies_by_status';

-- Retrieve emergencies with ACTIVE status.
CALL get_emergencies_by_status('ACTIVE');

-- Retrieve emergencies with RESOLVED status.
CALL get_emergencies_by_status('RESOLVED');

-- ============================================================
-- 8. USER-DEFINED FUNCTION
-- ============================================================

-- Count active emergencies using the existing function.
SELECT count_active_emergencies() AS active_emergency_count;

-- Verify the result against a normal aggregate query.
SELECT COUNT(*) AS active_emergency_count
FROM emergencies
WHERE status = 'ACTIVE';

-- ============================================================
-- 9. TRIGGER
-- ============================================================

-- Inspect the existing emergency update trigger.
SHOW TRIGGERS
WHERE `Table` = 'emergencies';

-- Inspect emergency statuses and update timestamps.
-- This query does not modify any records.
SELECT emergency_id, status, created_at, updated_at
FROM emergencies
ORDER BY emergency_id DESC
LIMIT 10;

-- ============================================================
-- 10. INDEXING
-- ============================================================

-- Inspect emergency table indexes.
SHOW INDEX FROM emergencies;

-- Inspect assignment table indexes.
SHOW INDEX FROM assignments;

-- Inspect resource request table indexes.
SHOW INDEX FROM resource_requests;

-- Example status-filtered query that can benefit from
-- the existing emergency status index.
SELECT emergency_id, emergency_type, priority, created_at
FROM emergencies
WHERE status = 'ACTIVE'
ORDER BY created_at DESC;

-- ============================================================
-- 11. FOREIGN KEY VERIFICATION
-- ============================================================

SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'campusresq_db'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

-- ============================================================
-- 12. TRANSACTION EXAMPLE
-- ============================================================

-- IMPORTANT:
-- This example uses a temporary table so that the demonstration
-- does not modify your actual application records.

CREATE TEMPORARY TABLE IF NOT EXISTS transaction_demo (
    demo_id INT PRIMARY KEY,
    demo_message VARCHAR(100) NOT NULL
);

START TRANSACTION;

INSERT INTO transaction_demo (demo_id, demo_message)
VALUES (1, 'Demonstrating transaction rollback');

-- Inspect the uncommitted row.
SELECT *
FROM transaction_demo;

-- Undo the inserted row.
ROLLBACK;

-- The inserted row should no longer exist.
SELECT *
FROM transaction_demo;

-- Clean up the temporary table.
DROP TEMPORARY TABLE IF EXISTS transaction_demo;

-- ============================================================
-- END OF CAMPUSRESQ SQL QUERIES
-- ============================================================