<?php

namespace App\Libraries;

class FeatureSchema
{
    public static function ensure(): void
    {
        $db = \Config\Database::connect();

        if (! $db->fieldExists('account_type', 'users')) {
            $db->query("ALTER TABLE users ADD COLUMN account_type ENUM('regular','student') NOT NULL DEFAULT 'student' AFTER role");
        }

        if (! $db->fieldExists('education_level', 'users')) {
            $db->query("ALTER TABLE users ADD COLUMN education_level ENUM('none','secondary','tertiary') NOT NULL DEFAULT 'none' AFTER account_type");
        }

        if (! $db->fieldExists('promo_discount', 'users')) {
            $db->query("ALTER TABLE users ADD COLUMN promo_discount DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER education_level");
        }

        if (! $db->fieldExists('proof_file_path', 'users')) {
            $db->query("ALTER TABLE users ADD COLUMN proof_file_path VARCHAR(255) NULL AFTER promo_discount");
        }

        if (! $db->fieldExists('subscription_tier', 'users')) {
            $db->query("ALTER TABLE users ADD COLUMN subscription_tier ENUM('free','pro','pro_plus') NOT NULL DEFAULT 'free' AFTER proof_file_path");
        }

        if (! $db->fieldExists('subscription_expires_at', 'users')) {
            $db->query("ALTER TABLE users ADD COLUMN subscription_expires_at DATETIME NULL AFTER subscription_tier");
        }

        if (! $db->fieldExists('profile_image_path', 'users')) {
            $db->query("ALTER TABLE users ADD COLUMN profile_image_path VARCHAR(255) NULL AFTER subscription_expires_at");
        }

        if (! $db->fieldExists('is_blocked', 'users')) {
            $db->query("ALTER TABLE users ADD COLUMN is_blocked TINYINT(1) NOT NULL DEFAULT 0 AFTER profile_image_path");
        }

        if (! $db->fieldExists('price', 'resources')) {
            $db->query("ALTER TABLE resources ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER file_type");
        }

        if (! $db->fieldExists('owner_share_percent', 'resources')) {
            $db->query("ALTER TABLE resources ADD COLUMN owner_share_percent DECIMAL(5,2) NOT NULL DEFAULT 20.00 AFTER price");
        }

        if (! $db->fieldExists('preview_percent', 'resources')) {
            $db->query("ALTER TABLE resources ADD COLUMN preview_percent TINYINT NOT NULL DEFAULT 20 AFTER owner_share_percent");
        }

        if (! $db->fieldExists('free_preview_pages', 'resources')) {
            $db->query("ALTER TABLE resources ADD COLUMN free_preview_pages INT NULL AFTER preview_percent");
        }

        if (! $db->fieldExists('material_type', 'resources')) {
            $db->query("ALTER TABLE resources ADD COLUMN material_type ENUM('book','resource') NOT NULL DEFAULT 'book' AFTER file_type");
        }

        if (! $db->fieldExists('book_author', 'resources')) {
            $db->query("ALTER TABLE resources ADD COLUMN book_author VARCHAR(150) NULL AFTER title");
        }

        if (! $db->fieldExists('isbn', 'resources')) {
            $db->query("ALTER TABLE resources ADD COLUMN isbn VARCHAR(20) NULL AFTER book_author");
        }

        if (! $db->fieldExists('edition', 'resources')) {
            $db->query("ALTER TABLE resources ADD COLUMN edition VARCHAR(50) NULL AFTER isbn");
        }

        if (! $db->fieldExists('publisher', 'resources')) {
            $db->query("ALTER TABLE resources ADD COLUMN publisher VARCHAR(150) NULL AFTER edition");
        }

        if (! $db->fieldExists('page_count', 'resources')) {
            $db->query("ALTER TABLE resources ADD COLUMN page_count INT NULL AFTER publisher");
        }

        if (! $db->fieldExists('language_code', 'resources')) {
            $db->query("ALTER TABLE resources ADD COLUMN language_code VARCHAR(10) NULL AFTER page_count");
        }

        if (! $db->fieldExists('cover_image_path', 'resources')) {
            $db->query("ALTER TABLE resources ADD COLUMN cover_image_path VARCHAR(255) NULL AFTER language_code");
        }

        if (! $db->fieldExists('verification_status', 'users')) {
            $db->query("ALTER TABLE users ADD COLUMN verification_status TINYINT(1) NOT NULL DEFAULT 1 AFTER is_blocked");
            // Set existing is_verified values to verification_status if it exists
            if ($db->fieldExists('is_verified', 'users')) {
                $db->query("UPDATE users SET verification_status = is_verified");
                $db->query("ALTER TABLE users DROP COLUMN is_verified");
            }
        }

        if (! $db->fieldExists('verification_attempts', 'users')) {
            $db->query("ALTER TABLE users ADD COLUMN verification_attempts INT NOT NULL DEFAULT 0 AFTER verification_status");
        }

        $db->query("CREATE TABLE IF NOT EXISTS login_attempts (
            attempt_id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            attempts INT NOT NULL DEFAULT 0,
            locked_until DATETIME NULL,
            last_attempt_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_login_attempt (email, ip_address)
        ) ENGINE=InnoDB");

        $db->query("CREATE TABLE IF NOT EXISTS resource_access_logs (
            access_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            resource_id INT NOT NULL,
            opened_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_user_resource_open (user_id, resource_id),
            KEY idx_access_user_opened (user_id, opened_at),
            CONSTRAINT fk_access_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            CONSTRAINT fk_access_resource FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        $db->query("CREATE TABLE IF NOT EXISTS resource_purchases (
            purchase_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            resource_id INT NOT NULL,
            listed_price DECIMAL(10,2) NOT NULL,
            discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            paid_amount DECIMAL(10,2) NOT NULL,
            uploader_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            owner_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            payment_method ENUM('card','gcash','maya') NULL,
            status ENUM('completed','failed') NOT NULL DEFAULT 'completed',
            purchased_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_user_resource_purchase (user_id, resource_id),
            KEY idx_purchase_user_date (user_id, purchased_at),
            CONSTRAINT fk_purchase_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            CONSTRAINT fk_purchase_resource FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        $db->query("CREATE TABLE IF NOT EXISTS user_transactions (
            transaction_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            resource_id INT NULL,
            transaction_type ENUM('material_open','purchase','promo_applied') NOT NULL,
            amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_transaction_user_date (user_id, created_at),
            CONSTRAINT fk_transaction_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            CONSTRAINT fk_transaction_resource FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE SET NULL
        ) ENGINE=InnoDB");

        if (! $db->fieldExists('payment_method', 'user_transactions')) {
            $db->query("ALTER TABLE user_transactions ADD COLUMN payment_method ENUM('card','gcash','maya') NULL AFTER transaction_type");
        }
        if (! $db->fieldExists('uploader_amount', 'user_transactions')) {
            $db->query("ALTER TABLE user_transactions ADD COLUMN uploader_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER amount");
        }
        if (! $db->fieldExists('owner_amount', 'user_transactions')) {
            $db->query("ALTER TABLE user_transactions ADD COLUMN owner_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER uploader_amount");
        }
        if (! $db->fieldExists('note', 'user_transactions')) {
            $db->query("ALTER TABLE user_transactions ADD COLUMN note VARCHAR(255) NULL AFTER owner_amount");
        }

        if (! $db->fieldExists('payment_method', 'resource_purchases')) {
            $db->query("ALTER TABLE resource_purchases ADD COLUMN payment_method ENUM('card','gcash','maya') NULL AFTER owner_amount");
        }

        $db->query("CREATE TABLE IF NOT EXISTS withdrawals (
            withdrawal_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            method ENUM('gcash','maya','bank') NOT NULL,
            account_number VARCHAR(50) NOT NULL,
            account_name VARCHAR(100) NOT NULL,
            status ENUM('pending','withdrawn','failed') NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            processed_at TIMESTAMP NULL,
            CONSTRAINT fk_withdrawal_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        // Force alter the enum if it was previously created as 'completed'
        $db->query("ALTER TABLE withdrawals MODIFY COLUMN status ENUM('pending','withdrawn','failed') NOT NULL DEFAULT 'pending'");

        $db->query("CREATE TABLE IF NOT EXISTS notifications (
            notif_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(150) NOT NULL,
            message TEXT NOT NULL,
            is_read TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_notif_user_read (user_id, is_read),
            CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        $db->query("CREATE TABLE IF NOT EXISTS verification_codes (
            code_id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) NOT NULL,
            code VARCHAR(6) NOT NULL,
            type ENUM('email_verify','password_reset') NOT NULL,
            used TINYINT(1) NOT NULL DEFAULT 0,
            attempts TINYINT NOT NULL DEFAULT 0,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_vcode_email_type (email, type, used),
            KEY idx_vcode_expires (expires_at)
        ) ENGINE=InnoDB");

        $db->query("CREATE TABLE IF NOT EXISTS user_sessions (
            session_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            user_agent VARCHAR(255) NOT NULL DEFAULT '',
            device_name VARCHAR(100) NOT NULL DEFAULT '',
            location VARCHAR(100) NOT NULL DEFAULT 'Unknown',
            is_trusted TINYINT(1) NOT NULL DEFAULT 0,
            last_login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_session_user (user_id),
            KEY idx_session_device (user_id, device_name),
            CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        if (! $db->fieldExists('email_verified', 'users')) {
            $db->query("ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 1 AFTER password_hash");
        }

        $db->query("CREATE TABLE IF NOT EXISTS payout_accounts (
            account_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            account_type ENUM('gcash','maya','bank') NOT NULL,
            account_number VARCHAR(100) NOT NULL,
            account_name VARCHAR(100) NOT NULL,
            card_number VARCHAR(20) NULL,
            expiry_date VARCHAR(10) NULL,
            cvv VARCHAR(4) NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_payout_user (user_id),
            CONSTRAINT fk_payout_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        ) ENGINE=InnoDB");

        if (! $db->fieldExists('payout_pin', 'users')) {
            $db->query("ALTER TABLE users ADD COLUMN payout_pin VARCHAR(255) NULL AFTER profile_image_path");
        }
    }
}
