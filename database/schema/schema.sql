-- =========================================
-- DATABASE SETUP
-- =========================================

CREATE DATABASE rental
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE USER 'rental'@'localhost'
IDENTIFIED BY 'rental1234';

GRANT ALL PRIVILEGES ON rental.* TO 'rental'@'localhost';

FLUSH PRIVILEGES;

USE rental;

-- =========================================
-- USERS TABLE
-- =========================================

CREATE TABLE users (

    user_id INT AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),

    name VARCHAR(100) NOT NULL,

    role ENUM('tenant','landlord','admin') NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_users_email (email)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- PROPERTIES TABLE
-- =========================================

CREATE TABLE properties (

    property_id INT AUTO_INCREMENT PRIMARY KEY,

    landlord_id INT NOT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    price DECIMAL(12,2) NOT NULL,

    city VARCHAR(150) NOT NULL,
    district VARCHAR(150) NOT NULL,

    property_type ENUM(
        'apartment',
        'studio',
        'house',
        'villa',
        'commercial'
    ) NOT NULL,

    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,

    size INT,
    floor_number INT,

    -- Property geolocation
    latitude DECIMAL(10,8) NULL,
    longitude DECIMAL(11,8) NULL,

    -- Featured property support
    featured BOOLEAN DEFAULT FALSE,

    -- Listing moderation status
    status ENUM(
        'active',
        'flagged',
        'removed'
    ) DEFAULT 'active',

    -- Availability status
    availability_status ENUM(
        'available',
        'rented',
        'pending',
        'maintenance'
    ) DEFAULT 'available',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_property_landlord
        FOREIGN KEY (landlord_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    INDEX idx_property_city (city),
    INDEX idx_property_district (district),
    INDEX idx_property_price (price),
    INDEX idx_property_type (property_type),
    INDEX idx_properties_featured (featured)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- AMENITIES TABLE
-- =========================================

CREATE TABLE amenities (

    amenity_id INT AUTO_INCREMENT PRIMARY KEY,

    amenity_name VARCHAR(150) NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_amenity_name (amenity_name)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- PROPERTY AMENITIES TABLE
-- =========================================

CREATE TABLE property_amenities (

    property_amenity_id INT AUTO_INCREMENT PRIMARY KEY,

    property_id INT NOT NULL,
    amenity_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_property_amenity (
        property_id,
        amenity_id
    ),

    CONSTRAINT fk_property_amenities_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_property_amenities_amenity
        FOREIGN KEY (amenity_id)
        REFERENCES amenities(amenity_id)
        ON DELETE CASCADE,

    INDEX idx_property_amenities_property (property_id),
    INDEX idx_property_amenities_amenity (amenity_id)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- PROPERTY IMAGES TABLE
-- =========================================

CREATE TABLE property_images (

    image_id INT AUTO_INCREMENT PRIMARY KEY,

    property_id INT NOT NULL,

    image_url VARCHAR(500) NOT NULL,
    cloudinary_public_id VARCHAR(255) DEFAULT NULL,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_property_images
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    INDEX idx_property_images_property (property_id)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- BOOKINGS TABLE
-- =========================================

CREATE TABLE bookings (

    booking_id INT AUTO_INCREMENT PRIMARY KEY,

    property_id INT NOT NULL,
    tenant_id INT NOT NULL,

    status ENUM(
        'pending',
        'approved',
        'rejected',
        'cancelled'
    ) DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    INDEX idx_booking_property (property_id),
    INDEX idx_booking_tenant (tenant_id)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- REVIEWS TABLE
-- =========================================

CREATE TABLE reviews (

    review_id INT AUTO_INCREMENT PRIMARY KEY,

    property_id INT NOT NULL,
    tenant_id INT NOT NULL,

    rating INT NOT NULL,
    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_review_tenant_property
        UNIQUE (tenant_id, property_id),

    CONSTRAINT chk_review_rating
        CHECK (rating BETWEEN 1 AND 5),

    INDEX idx_review_property (property_id)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- FRAUD FLAGS TABLE
-- =========================================

CREATE TABLE fraud_flags (

    flag_id INT AUTO_INCREMENT PRIMARY KEY,

    property_id INT NOT NULL,

    fraud_score DECIMAL(5,4) NOT NULL,

    reason VARCHAR(255),

    flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_fraud_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    INDEX idx_fraud_property (property_id)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- SEED USERS
-- =========================================

INSERT INTO users
(name, email, phone_number, password_hash, role)
VALUES

('Admin User',
 'admin@smartrent.com',
 '0911000000',
 '$2b$10$hashed_admin',
 'admin'),

('Landlord One',
 'landlord1@smartrent.com',
 '0911222333',
 '$2b$10$hashed_landlord1',
 'landlord'),

('Landlord Two',
 'landlord2@smartrent.com',
 '0911333444',
 '$2b$10$hashed_landlord2',
 'landlord'),

('Tenant One',
 'tenant1@smartrent.com',
 '0911444555',
 '$2b$10$hashed_tenant1',
 'tenant'),

('Tenant Two',
 'tenant2@smartrent.com',
 '0911555666',
 '$2b$10$hashed_tenant2',
 'tenant');

-- =========================================
-- SEED PROPERTIES
-- =========================================

INSERT INTO properties
(
    landlord_id,
    title,
    description,
    price,
    city,
    district,
    property_type,
    bedrooms,
    bathrooms,
    size,
    latitude,
    longitude,
    featured
)
VALUES

(
    2,
    'Modern Apartment',
    '2 bedroom modern apartment',
    15000,
    'Addis Ababa',
    'Bole',
    'apartment',
    2,
    1,
    80,
    8.9806,
    38.7578,
    TRUE
),

(
    2,
    'Family House',
    'Spacious house for family',
    25000,
    'Addis Ababa',
    'CMC',
    'house',
    3,
    2,
    150,
    9.0300,
    38.8200,
    FALSE
),

(
    3,
    'Studio Apartment',
    'Affordable studio for students',
    8000,
    'Addis Ababa',
    'Megenagna',
    'studio',
    1,
    1,
    40,
    9.0100,
    38.7900,
    FALSE
);

-- =========================================
-- SEED AMENITIES
-- =========================================

INSERT INTO amenities (amenity_name)
VALUES

('WiFi'),
('Parking'),
('Security'),
('Water Tank'),
('Balcony');

-- =========================================
-- SEED PROPERTY AMENITIES
-- =========================================

INSERT INTO property_amenities
(property_id, amenity_id)
VALUES

(1, 1),
(1, 2),
(1, 3),

(2, 2),
(2, 3),
(2, 5),

(3, 1),
(3, 4);