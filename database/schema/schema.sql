-- Create database
CREATE DATABASE rental
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create user and grant privileges
CREATE USER 'rental'@'localhost'
IDENTIFIED BY 'rental1234';
GRANT ALL PRIVILEGES ON rental.* TO 'rental'@'localhost';
FLUSH PRIVILEGES;


USE rental;

-- Stores all platform users including tenants, landlords, and admins
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),

    name VARCHAR(100) NOT NULL,

    -- Role determines permissions inside the platform
    role ENUM('tenant','landlord','admin') NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Index for faster login lookup
    INDEX idx_users_email (email)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores rental property listings posted by landlords
CREATE TABLE properties (

    property_id INT AUTO_INCREMENT PRIMARY KEY,

    -- Owner of the property (must be role = landlord)
    landlord_id INT NOT NULL,

    -- Basic listing information
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Rental price
    price DECIMAL(12,2) NOT NULL,

    -- Location details 
    city VARCHAR(150) NOT NULL,
    district VARCHAR(150) NOT NULL,

    -- Property classification
    property_type ENUM('apartment','studio','house','villa','commercial') NOT NULL,

    -- Property characteristics
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    size INT,


    -- Listing status used for moderation and fraud detection
    status ENUM('active','flagged','removed') DEFAULT 'active',

    -- Listing availability status for tenants to filter on
    availability_status ENUM('available','rented','pending') DEFAULT 'available',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key linking property owner
    CONSTRAINT fk_property_landlord
        FOREIGN KEY (landlord_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    -- Indexes for fast search and filtering
    INDEX idx_property_city (city),
    INDEX idx_property_district (district),
    INDEX idx_property_price (price),
    INDEX idx_property_type (property_type)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores all available property amenities (WiFi, Parking, Security, etc.)
CREATE TABLE amenities (
    amenity_id INT AUTO_INCREMENT PRIMARY KEY,

    amenity_name VARCHAR(150) NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Index for fast lookup
    INDEX idx_amenity_name (amenity_name)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Maps amenities to properties (many-to-many relationship)
CREATE TABLE property_amenities (
    property_amenity_id INT AUTO_INCREMENT PRIMARY KEY,

    property_id INT NOT NULL,
    amenity_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Prevent duplicate amenities on same property
    UNIQUE KEY uq_property_amenity (property_id, amenity_id),

    -- Foreign key to properties
    CONSTRAINT fk_property_amenities_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    -- Foreign key to amenities
    CONSTRAINT fk_property_amenities_amenity
        FOREIGN KEY (amenity_id)
        REFERENCES amenities(amenity_id)
        ON DELETE CASCADE,

    -- Indexes for filtering queries
    INDEX idx_property_amenities_property (property_id),
    INDEX idx_property_amenities_amenity (amenity_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores property images with Cloudinary reference
CREATE TABLE property_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,

    property_id INT NOT NULL,

    image_url VARCHAR(500) NOT NULL,
    cloudinary_public_id VARCHAR(255) DEFAULT NULL,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key
    CONSTRAINT fk_property_images
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    INDEX idx_property_images_property (property_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores booking requests made by tenants
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,

    property_id INT NOT NULL,
    tenant_id INT NOT NULL,

    -- Booking workflow status
    status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_booking_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    -- Indexes
    INDEX idx_booking_property (property_id),
    INDEX idx_booking_tenant (tenant_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores tenant reviews and ratings for properties
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,

    property_id INT NOT NULL,
    tenant_id INT NOT NULL,

    rating INT NOT NULL,
    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_review_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,


    -- Prevent duplicate reviews
    CONSTRAINT uq_review_tenant_property
        UNIQUE (tenant_id, property_id),

    -- Rating must be between 1 and 5
    CONSTRAINT chk_review_rating
        CHECK (rating BETWEEN 1 AND 5),


    -- Index
    INDEX idx_review_property (property_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores AI fraud detection results for suspicious property listings
CREATE TABLE fraud_flags (
    flag_id INT AUTO_INCREMENT PRIMARY KEY,

    property_id INT NOT NULL,

    fraud_score DECIMAL(5,4) NOT NULL,

    -- Reason generated by AI or detection rule
    reason VARCHAR(255),

    flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key
    CONSTRAINT fk_fraud_property
        FOREIGN KEY (property_id)
        REFERENCES properties(property_id)
        ON DELETE CASCADE,

    INDEX idx_fraud_property (property_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;





Data seed

INSERT INTO users (name, email, phone_number, password_hash, role) VALUES
('Admin User', 'admin@smartrent.com', '0911000000', '$2b$10$hashed_admin', 'admin'),
('Landlord One', 'landlord1@smartrent.com', '0911222333', '$2b$10$hashed_landlord1', 'landlord'),
('Landlord Two', 'landlord2@smartrent.com', '0911333444', '$2b$10$hashed_landlord2', 'landlord'),
('Tenant One', 'tenant1@smartrent.com', '0911444555', '$2b$10$hashed_tenant1', 'tenant'),
('Tenant Two', 'tenant2@smartrent.com', '0911555666', '$2b$10$hashed_tenant2', 'tenant');

INSERT INTO properties
(landlord_id, title, description, price, city, district, property_type, bedrooms, bathrooms, size)
VALUES
(2, 'Modern Apartment', '2 bedroom modern apartment', 15000, 'Addis Ababa', 'Bole', 'apartment', 2, 1, 80),

(2, 'Family House', 'Spacious house for family', 25000, 'Addis Ababa', 'CMC', 'house', 3, 2, 150),

(3, 'Studio Apartment', 'Affordable studio for students', 8000, 'Addis Ababa', 'Megenagna', 'studio', 1, 1, 40);


INSERT INTO amenities (amenity_name) VALUES
('WiFi'),
('Parking'),
('Security'),
('Water Tank'),
('Balcony');

INSERT INTO property_amenities (property_id, amenity_id) VALUES
(1, 1), -- WiFi
(1, 2), -- Parking
(1, 3), -- Security

(2, 2),
(2, 3),
(2, 5),

(3, 1),
(3, 4);


updates

use rental;

ALTER TABLE properties 
ADD COLUMN featured BOOLEAN DEFAULT FALSE;

-- Add index for faster featured property queries
CREATE INDEX idx_properties_featured ON properties(featured);

ALTER TABLE properties 
MODIFY COLUMN availability_status ENUM('available','rented','pending','maintenance') DEFAULT 'available';


ALTER TABLE properties
ADD COLUMN latitude DECIMAL(10, 8) NULL,
ADD COLUMN longitude DECIMAL(11, 8) NULL;
