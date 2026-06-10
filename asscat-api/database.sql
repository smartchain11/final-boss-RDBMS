-- ============================================================
-- Necry OER Platform - Complete Database Schema
-- Database: necry_open_knowledge
-- Import this into Railway MySQL via Console
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
    `user_id`               INT(11)             NOT NULL AUTO_INCREMENT,
    `name`                  VARCHAR(100)        NOT NULL,
    `email`                 VARCHAR(100)        NOT NULL,
    `password_hash`         VARCHAR(255)        NOT NULL,
    `email_verified`        TINYINT(1)          NOT NULL DEFAULT 1,
    `role`                  ENUM('admin','uploader','student') DEFAULT 'student',
    `account_type`          ENUM('regular','student') NOT NULL DEFAULT 'student',
    `education_level`       ENUM('none','secondary','tertiary') NOT NULL DEFAULT 'none',
    `promo_discount`        DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
    `proof_file_path`       VARCHAR(255)        DEFAULT NULL,
    `subscription_tier`     ENUM('free','pro','pro_plus') NOT NULL DEFAULT 'free',
    `subscription_expires_at` DATETIME          DEFAULT NULL,
    `profile_image_path`    VARCHAR(255)        DEFAULT NULL,
    `payout_pin`            VARCHAR(255)        DEFAULT NULL,
    `is_blocked`            TINYINT(1)          NOT NULL DEFAULT 0,
    `verification_status`   TINYINT(1)          NOT NULL DEFAULT 1,
    `verification_attempts` INT(11)             NOT NULL DEFAULT 0,
    `created_at`            TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `departments` (
    `dept_id`     INT(11)         NOT NULL AUTO_INCREMENT,
    `dept_name`   VARCHAR(100)    NOT NULL,
    `description` TEXT            DEFAULT NULL,
    PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tags` (
    `tag_id`   INT(11)      NOT NULL AUTO_INCREMENT,
    `tag_name` VARCHAR(50)  NOT NULL,
    PRIMARY KEY (`tag_id`),
    UNIQUE KEY `tag_name` (`tag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `user_details` (
    `user_id`        INT(11)      NOT NULL,
    `bio`            TEXT         DEFAULT NULL,
    `profile_image`  VARCHAR(255) DEFAULT NULL,
    `specialization` VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (`user_id`),
    CONSTRAINT `fk_user_details_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `courses` (
    `course_id`   INT(11)         NOT NULL AUTO_INCREMENT,
    `title`       VARCHAR(200)    NOT NULL,
    `description` TEXT            DEFAULT NULL,
    `dept_id`     INT(11)         DEFAULT NULL,
    `uploader_id` INT(11)         DEFAULT NULL,
    `created_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`course_id`),
    KEY `fk_course_dept` (`dept_id`),
    KEY `fk_course_uploader` (`uploader_id`),
    CONSTRAINT `fk_course_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments`(`dept_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_course_uploader` FOREIGN KEY (`uploader_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `course_sections` (
    `section_id`   INT(11)      NOT NULL AUTO_INCREMENT,
    `course_id`    INT(11)      DEFAULT NULL,
    `section_name` VARCHAR(100) NOT NULL,
    `sort_order`   INT(11)      DEFAULT 0,
    PRIMARY KEY (`section_id`),
    KEY `fk_section_course` (`course_id`),
    CONSTRAINT `fk_section_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `resources` (
    `resource_id`         INT(11)             NOT NULL AUTO_INCREMENT,
    `section_id`          INT(11)             DEFAULT NULL,
    `dept_id`             INT(11)             DEFAULT NULL,
    `uploader_id`         INT(11)             DEFAULT NULL,
    `title`               VARCHAR(200)        NOT NULL,
    `book_author`         VARCHAR(150)        DEFAULT NULL,
    `isbn`                VARCHAR(20)         DEFAULT NULL,
    `edition`             VARCHAR(50)         DEFAULT NULL,
    `publisher`           VARCHAR(150)        DEFAULT NULL,
    `page_count`          INT(11)             DEFAULT NULL,
    `language_code`       VARCHAR(10)         DEFAULT NULL,
    `description`         TEXT                DEFAULT NULL,
    `file_path`           VARCHAR(255)        NOT NULL,
    `file_type`           VARCHAR(50)         DEFAULT NULL,
    `material_type`       ENUM('book','resource') NOT NULL DEFAULT 'book',
    `price`               DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
    `owner_share_percent` DECIMAL(5,2)        NOT NULL DEFAULT 20.00,
    `preview_percent`     TINYINT(4)          NOT NULL DEFAULT 20,
    `free_preview_pages`  INT(11)             DEFAULT NULL,
    `cover_image_path`    VARCHAR(255)        DEFAULT NULL,
    `is_approved`         TINYINT(1)          NOT NULL DEFAULT 0,
    `uploaded_at`         TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`resource_id`),
    KEY `fk_resource_section` (`section_id`),
    KEY `fk_resource_dept` (`dept_id`),
    KEY `fk_resource_uploader` (`uploader_id`),
    CONSTRAINT `fk_resource_section` FOREIGN KEY (`section_id`) REFERENCES `course_sections`(`section_id`) ON DELETE SET NULL,
    CONSTRAINT `fk_resource_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments`(`dept_id`) ON DELETE SET NULL,
    CONSTRAINT `fk_resource_uploader` FOREIGN KEY (`uploader_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `resource_tags` (
    `resource_id` INT(11) NOT NULL,
    `tag_id`      INT(11) NOT NULL,
    PRIMARY KEY (`resource_id`, `tag_id`),
    CONSTRAINT `fk_rtag_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rtag_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`tag_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `login_attempts` (
    `attempt_id`      INT(11)      NOT NULL AUTO_INCREMENT,
    `email`           VARCHAR(100) NOT NULL,
    `ip_address`      VARCHAR(45)  NOT NULL,
    `attempts`        INT(11)      NOT NULL DEFAULT 0,
    `locked_until`    DATETIME     DEFAULT NULL,
    `last_attempt_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`attempt_id`),
    UNIQUE KEY `uniq_login_attempt` (`email`, `ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `verification_codes` (
    `code_id`    INT(11)                          NOT NULL AUTO_INCREMENT,
    `email`      VARCHAR(100)                     NOT NULL,
    `code`       VARCHAR(6)                       NOT NULL,
    `type`       ENUM('email_verify','password_reset') NOT NULL,
    `used`       TINYINT(1)                       NOT NULL DEFAULT 0,
    `attempts`   TINYINT(4)                       NOT NULL DEFAULT 0,
    `expires_at` DATETIME                         NOT NULL,
    `created_at` TIMESTAMP                        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`code_id`),
    KEY `idx_vcode_email_type` (`email`, `type`, `used`),
    KEY `idx_vcode_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `user_sessions` (
    `session_id`   INT(11)      NOT NULL AUTO_INCREMENT,
    `user_id`      INT(11)      NOT NULL,
    `ip_address`   VARCHAR(45)  NOT NULL,
    `user_agent`   VARCHAR(255) NOT NULL DEFAULT '',
    `device_name`  VARCHAR(100) NOT NULL DEFAULT '',
    `location`     VARCHAR(100) NOT NULL DEFAULT 'Unknown',
    `is_trusted`   TINYINT(1)   NOT NULL DEFAULT 0,
    `last_login_at` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`session_id`),
    KEY `idx_session_user` (`user_id`),
    KEY `idx_session_device` (`user_id`, `device_name`),
    CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
    `notif_id`  INT(11)      NOT NULL AUTO_INCREMENT,
    `user_id`   INT(11)      NOT NULL,
    `title`     VARCHAR(150) NOT NULL,
    `message`   TEXT         NOT NULL,
    `is_read`   TINYINT(1)   NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`notif_id`),
    KEY `idx_notif_user_read` (`user_id`, `is_read`),
    CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `resource_access_logs` (
    `access_id`   INT(11)    NOT NULL AUTO_INCREMENT,
    `user_id`     INT(11)    NOT NULL,
    `resource_id` INT(11)    NOT NULL,
    `opened_at`   TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`access_id`),
    UNIQUE KEY `uniq_user_resource_open` (`user_id`, `resource_id`),
    KEY `idx_access_user_opened` (`user_id`, `opened_at`),
    CONSTRAINT `fk_access_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_access_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `resource_purchases` (
    `purchase_id`    INT(11)                             NOT NULL AUTO_INCREMENT,
    `user_id`        INT(11)                             NOT NULL,
    `resource_id`    INT(11)                             NOT NULL,
    `listed_price`   DECIMAL(10,2)                       NOT NULL,
    `discount_percent` DECIMAL(5,2)                      NOT NULL DEFAULT 0.00,
    `paid_amount`    DECIMAL(10,2)                       NOT NULL,
    `uploader_amount` DECIMAL(10,2)                      NOT NULL DEFAULT 0.00,
    `owner_amount`   DECIMAL(10,2)                       NOT NULL DEFAULT 0.00,
    `payment_method` ENUM('card','gcash','maya')         DEFAULT NULL,
    `status`         ENUM('completed','failed')          NOT NULL DEFAULT 'completed',
    `purchased_at`   TIMESTAMP                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`purchase_id`),
    UNIQUE KEY `uniq_user_resource_purchase` (`user_id`, `resource_id`),
    KEY `idx_purchase_user_date` (`user_id`, `purchased_at`),
    CONSTRAINT `fk_purchase_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_purchase_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `user_transactions` (
    `transaction_id`   INT(11)                                 NOT NULL AUTO_INCREMENT,
    `user_id`          INT(11)                                 NOT NULL,
    `resource_id`      INT(11)                                 DEFAULT NULL,
    `transaction_type` ENUM('material_open','purchase','promo_applied') NOT NULL,
    `payment_method`   ENUM('card','gcash','maya')             DEFAULT NULL,
    `amount`           DECIMAL(10,2)                           NOT NULL DEFAULT 0.00,
    `uploader_amount`  DECIMAL(10,2)                           NOT NULL DEFAULT 0.00,
    `owner_amount`     DECIMAL(10,2)                           NOT NULL DEFAULT 0.00,
    `note`             VARCHAR(255)                            DEFAULT NULL,
    `created_at`       TIMESTAMP                               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`transaction_id`),
    KEY `idx_transaction_user_date` (`user_id`, `created_at`),
    CONSTRAINT `fk_transaction_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_transaction_resource` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `withdrawals` (
    `withdrawal_id`  INT(11)                            NOT NULL AUTO_INCREMENT,
    `user_id`        INT(11)                            NOT NULL,
    `amount`         DECIMAL(10,2)                      NOT NULL,
    `method`         ENUM('gcash','maya','bank')        NOT NULL,
    `account_number` VARCHAR(50)                        NOT NULL,
    `account_name`   VARCHAR(100)                       NOT NULL,
    `status`         ENUM('pending','withdrawn','failed') NOT NULL DEFAULT 'pending',
    `created_at`     TIMESTAMP                          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `processed_at`   TIMESTAMP                          DEFAULT NULL,
    PRIMARY KEY (`withdrawal_id`),
    CONSTRAINT `fk_withdrawal_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `payout_accounts` (
    `account_id`     INT(11)                     NOT NULL AUTO_INCREMENT,
    `user_id`        INT(11)                     NOT NULL,
    `account_type`   ENUM('gcash','maya','bank') NOT NULL,
    `account_number` VARCHAR(100)                NOT NULL,
    `account_name`   VARCHAR(100)                NOT NULL,
    `card_number`    VARCHAR(20)                 DEFAULT NULL,
    `expiry_date`    VARCHAR(10)                 DEFAULT NULL,
    `cvv`            VARCHAR(4)                  DEFAULT NULL,
    `created_at`     TIMESTAMP                   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`account_id`),
    KEY `idx_payout_user` (`user_id`),
    CONSTRAINT `fk_payout_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
