USE bloodconnect_db;

DELIMITER //

DROP EVENT IF EXISTS cleanup_expired_requests;

CREATE EVENT cleanup_expired_requests
ON SCHEDULE EVERY 1 HOUR
DO BEGIN
    DECLARE cutoff_date TIMESTAMP;
    
    -- Set the cutoff date to 24 hours ago from the current time
    SET cutoff_date = NOW() - INTERVAL 24 HOUR;

    -- Delete critical requests older than 24 hours
    DELETE FROM blood_requests 
    WHERE 
        urgency_level = 'critical' AND request_date < cutoff_date;

    -- Set the cutoff date to 3 days ago
    SET cutoff_date = NOW() - INTERVAL 3 DAY;

    -- Delete urgent requests older than 3 days
    DELETE FROM blood_requests 
    WHERE 
        urgency_level = 'urgent' AND request_date < cutoff_date;

    -- Set the cutoff date to 7 days ago
    SET cutoff_date = NOW() - INTERVAL 7 DAY;

    -- Delete normal requests older than 7 days
    DELETE FROM blood_requests 
    WHERE 
        urgency_level = 'normal' AND request_date < cutoff_date;

END //

DELIMITER ;