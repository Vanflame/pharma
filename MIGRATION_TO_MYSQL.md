# Migration from Firebase to MySQL with XAMPP

## Overview
This guide provides a comprehensive step-by-step process to migrate the Pharma Direct application from Firebase to MySQL using XAMPP, including database structure, backend API setup, and frontend modifications.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [XAMPP Setup](#xampp-setup)
3. [Database Structure](#database-structure)
4. [Backend API Setup](#backend-api-setup)
5. [Frontend Modifications](#frontend-modifications)
6. [Migration Steps](#migration-steps)
7. [Testing & Validation](#testing--validation)
8. [Deployment Considerations](#deployment-considerations)

---

## Prerequisites

### Software Requirements
- **XAMPP** (Latest version)
- **Node.js** (v16 or higher)
- **PHP** (v8.0 or higher)
- **MySQL** (v8.0 or higher)
- **Composer** (for PHP dependencies)
- **Postman** (for API testing)

### Knowledge Requirements
- Basic understanding of MySQL
- PHP programming
- REST API concepts
- JavaScript/HTML/CSS

---

## XAMPP Setup

### Step 1: Install XAMPP
1. Download XAMPP from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Install XAMPP in `C:\xampp\` (Windows) or `/Applications/XAMPP/` (Mac)
3. Start XAMPP Control Panel
4. Start **Apache** and **MySQL** services

### Step 2: Configure XAMPP
1. Open XAMPP Control Panel
2. Click **Config** next to Apache → **Apache (httpd.conf)**
3. Find `DocumentRoot` and set to your project directory:
   ```apache
   DocumentRoot "C:/xampp/htdocs/pharma-direct"
   ```
4. Find `<Directory "C:/xampp/htdocs">` and update:
   ```apache
   <Directory "C:/xampp/htdocs/pharma-direct">
       AllowOverride All
       Require all granted
   </Directory>
   ```
5. Save and restart Apache

### Step 3: Access phpMyAdmin
1. Open browser and go to `http://localhost/phpmyadmin`
2. Create a new database: `pharma_direct`
3. Set collation to `utf8mb4_unicode_ci`

---

## Database Structure

### Step 1: Create Database Schema

```sql
-- Create database
CREATE DATABASE pharma_direct CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pharma_direct;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'pharmacy', 'admin') DEFAULT 'user',
    disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_disabled (disabled)
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    stock INT DEFAULT 0,
    category VARCHAR(100),
    imageURL TEXT,
    featured BOOLEAN DEFAULT FALSE,
    disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_featured (featured),
    INDEX idx_disabled (disabled),
    INDEX idx_price (price)
);

-- Addresses table
CREATE TABLE addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default)
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    pharmacy_id INT,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('cod', 'online') DEFAULT 'cod',
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    notes TEXT,
    paid_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_pharmacy_id (pharmacy_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- Pharmacies table
CREATE TABLE pharmacies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    pharmacy_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    wallet_balance DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_pharmacy (user_id),
    INDEX idx_status (status)
);

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pharmacy_id INT NOT NULL,
    type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    INDEX idx_pharmacy_id (pharmacy_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- Withdrawal requests table
CREATE TABLE withdrawal_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pharmacy_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
    INDEX idx_pharmacy_id (pharmacy_id),
    INDEX idx_status (status)
);

-- Settings table
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key_name, value, description) VALUES
('app_name', 'PHARMA DIRECT', 'Application name'),
('app_version', '1.0.0', 'Application version'),
('maintenance_mode', 'false', 'Maintenance mode status'),
('min_order_amount', '100.00', 'Minimum order amount'),
('shipping_fee', '50.00', 'Default shipping fee'),
('cod_fee', '0.00', 'COD processing fee'),
('online_payment_fee', '5.00', 'Online payment processing fee');
```

### Step 2: Create Indexes for Performance

```sql
-- Additional indexes for better performance
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_created_status ON orders(created_at, status);
CREATE INDEX idx_products_category_featured ON products(category, featured);
CREATE INDEX idx_products_price_range ON products(price, disabled);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);
```

---

## Backend API Setup

### Step 1: Create Project Structure

```
pharma-direct/
├── api/
│   ├── config/
│   │   ├── database.php
│   │   └── cors.php
│   ├── controllers/
│   │   ├── AuthController.php
│   │   ├── ProductController.php
│   │   ├── OrderController.php
│   │   ├── UserController.php
│   │   └── PharmacyController.php
│   ├── models/
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── Order.php
│   │   └── Pharmacy.php
│   ├── middleware/
│   │   ├── AuthMiddleware.php
│   │   └── CorsMiddleware.php
│   ├── utils/
│   │   ├── Response.php
│   │   ├── Validator.php
│   │   └── JWT.php
│   └── index.php
├── public/
│   ├── css/
│   ├── js/
│   ├── img/
│   └── index.html
└── composer.json
```

### Step 2: Install Dependencies

```bash
# Navigate to project directory
cd C:/xampp/htdocs/pharma-direct

# Initialize Composer
composer init

# Install required packages
composer require vlucas/phpdotenv
composer require firebase/php-jwt
composer require phpmailer/phpmailer
```

### Step 3: Create composer.json

```json
{
    "name": "pharma-direct/api",
    "description": "Pharma Direct API",
    "type": "project",
    "require": {
        "php": ">=8.0",
        "vlucas/phpdotenv": "^5.0",
        "firebase/php-jwt": "^6.0",
        "phpmailer/phpmailer": "^6.8"
    },
    "autoload": {
        "psr-4": {
            "App\\": "api/"
        }
    }
}
```

### Step 4: Create Database Configuration

**api/config/database.php**
```php
<?php
class Database {
    private $host = "localhost";
    private $db_name = "pharma_direct";
    private $username = "root";
    private $password = "";
    private $conn;

    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}
?>
```

### Step 5: Create JWT Utility

**api/utils/JWT.php**
```php
<?php
require_once 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTUtil {
    private static $key = "your-secret-key-here";
    private static $algorithm = "HS256";
    
    public static function generateToken($payload) {
        $payload['iat'] = time();
        $payload['exp'] = time() + (24 * 60 * 60); // 24 hours
        return JWT::encode($payload, self::$key, self::$algorithm);
    }
    
    public static function validateToken($token) {
        try {
            $decoded = JWT::decode($token, new Key(self::$key, self::$algorithm));
            return (array) $decoded;
        } catch (Exception $e) {
            return false;
        }
    }
}
?>
```

### Step 6: Create Response Utility

**api/utils/Response.php**
```php
<?php
class Response {
    public static function success($data = null, $message = "Success", $code = 200) {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }
    
    public static function error($message = "Error", $code = 400, $data = null) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }
}
?>
```

### Step 7: Create Main API Router

**api/index.php**
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';
require_once 'utils/Response.php';
require_once 'utils/JWT.php';
require_once 'controllers/AuthController.php';
require_once 'controllers/ProductController.php';
require_once 'controllers/OrderController.php';
require_once 'controllers/UserController.php';
require_once 'controllers/PharmacyController.php';

$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove query string
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/pharma-direct/api', '', $path);

// Route requests
switch ($path) {
    case '/auth/login':
        if ($request_method === 'POST') {
            $auth = new AuthController();
            $auth->login();
        }
        break;
        
    case '/auth/register':
        if ($request_method === 'POST') {
            $auth = new AuthController();
            $auth->register();
        }
        break;
        
    case '/products':
        if ($request_method === 'GET') {
            $product = new ProductController();
            $product->getProducts();
        }
        break;
        
    case '/orders':
        if ($request_method === 'GET') {
            $order = new OrderController();
            $order->getOrders();
        } elseif ($request_method === 'POST') {
            $order = new OrderController();
            $order->createOrder();
        }
        break;
        
    default:
        Response::error("Endpoint not found", 404);
        break;
}
?>
```

---

## Frontend Modifications

### Step 1: Create API Service

**js/api.js**
```javascript
class APIService {
    constructor() {
        this.baseURL = 'http://localhost/pharma-direct/api';
        this.token = localStorage.getItem('token');
    }
    
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }
    
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // Auth methods
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }
    
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    // Product methods
    async getProducts(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        return this.request(`/products?${queryString}`);
    }
    
    async getProduct(id) {
        return this.request(`/products/${id}`);
    }
    
    // Order methods
    async getOrders() {
        return this.request('/orders');
    }
    
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }
    
    async updateOrderStatus(orderId, status) {
        return this.request(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
    
    // User methods
    async getUserProfile() {
        return this.request('/user/profile');
    }
    
    async updateUserProfile(userData) {
        return this.request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }
    
    // Address methods
    async getAddresses() {
        return this.request('/user/addresses');
    }
    
    async createAddress(addressData) {
        return this.request('/user/addresses', {
            method: 'POST',
            body: JSON.stringify(addressData)
        });
    }
    
    async updateAddress(addressId, addressData) {
        return this.request(`/user/addresses/${addressId}`, {
            method: 'PUT',
            body: JSON.stringify(addressData)
        });
    }
    
    async deleteAddress(addressId) {
        return this.request(`/user/addresses/${addressId}`, {
            method: 'DELETE'
        });
    }
}

// Create global instance
window.api = new APIService();
```

### Step 2: Update Firebase Configuration

**js/firebase.js** (Replace with MySQL API)
```javascript
// Remove Firebase imports and replace with API service
import { api } from './api.js';

// Replace Firebase functions with API calls
export async function loginUser({ email, password }) {
    try {
        const response = await api.login(email, password);
        api.setToken(response.data.token);
        return response.data.user;
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function registerUser(userData) {
    try {
        const response = await api.register(userData);
        api.setToken(response.data.token);
        return response.data.user;
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function fetchUserRole(uid) {
    try {
        const response = await api.getUserProfile();
        return response.data.role;
    } catch (error) {
        return 'user';
    }
}

// Replace Firestore calls with API calls
export async function loadProducts() {
    try {
        const response = await api.getProducts({ featured: true, limit: 8 });
        return response.data;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

export async function loadProduct(productId) {
    try {
        const response = await api.getProduct(productId);
        return response.data;
    } catch (error) {
        throw new Error('Product not found');
    }
}

// Add to cart function
export function addToCart(product, quantity) {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                imageURL: product.imageURL,
                quantity: quantity
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        return true;
    } catch (error) {
        console.error('Error adding to cart:', error);
        return false;
    }
}

// Place order function
export async function placeOrder(orderData) {
    try {
        const response = await api.createOrder(orderData);
        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
}
```

---

## Migration Steps

### Step 1: Export Firebase Data

1. **Export Users:**
```javascript
// Run in Firebase Console
const users = await db.collection('users').get();
const usersData = users.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
}));
console.log(JSON.stringify(usersData, null, 2));
```

2. **Export Products:**
```javascript
const products = await db.collection('products').get();
const productsData = products.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
}));
console.log(JSON.stringify(productsData, null, 2));
```

3. **Export Orders:**
```javascript
const orders = await db.collection('orders').get();
const ordersData = orders.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
}));
console.log(JSON.stringify(ordersData, null, 2));
```

### Step 2: Import Data to MySQL

**migration_script.php**
```php
<?php
require_once 'api/config/database.php';

$db = new Database();
$conn = $db->getConnection();

// Import users
function importUsers($conn, $usersData) {
    $stmt = $conn->prepare("
        INSERT INTO users (uid, email, name, phone, role, disabled, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($usersData as $user) {
        $stmt->execute([
            $user['uid'],
            $user['email'],
            $user['name'],
            $user['phone'] ?? null,
            $user['role'] ?? 'user',
            $user['disabled'] ?? false,
            $user['createdAt'] ? date('Y-m-d H:i:s', $user['createdAt']['seconds']) : date('Y-m-d H:i:s')
        ]);
    }
}

// Import products
function importProducts($conn, $productsData) {
    $stmt = $conn->prepare("
        INSERT INTO products (name, description, price, discount, stock, category, imageURL, featured, disabled, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($productsData as $product) {
        $stmt->execute([
            $product['name'],
            $product['description'] ?? null,
            $product['price'],
            $product['discount'] ?? 0,
            $product['stock'] ?? 0,
            $product['category'] ?? null,
            $product['imageURL'] ?? null,
            $product['featured'] ?? false,
            $product['disabled'] ?? false,
            $product['createdAt'] ? date('Y-m-d H:i:s', $product['createdAt']['seconds']) : date('Y-m-d H:i:s')
        ]);
    }
}

// Run migration
$usersData = json_decode(file_get_contents('users_export.json'), true);
$productsData = json_decode(file_get_contents('products_export.json'), true);

importUsers($conn, $usersData);
importProducts($conn, $productsData);

echo "Migration completed successfully!";
?>
```

### Step 3: Update Frontend Files

1. **Update all HTML files** to include the new API service:
```html
<script src="js/api.js"></script>
<script src="js/firebase.js"></script>
```

2. **Replace Firebase calls** with API calls in all JavaScript files
3. **Update authentication flow** to use JWT tokens
4. **Update data fetching** to use REST API endpoints

---

## Testing & Validation

### Step 1: API Testing

**test_api.php**
```php
<?php
// Test database connection
$db = new Database();
$conn = $db->getConnection();

if ($conn) {
    echo "Database connection: SUCCESS\n";
} else {
    echo "Database connection: FAILED\n";
}

// Test user creation
$stmt = $conn->prepare("INSERT INTO users (uid, email, name, role) VALUES (?, ?, ?, ?)");
$result = $stmt->execute(['test123', 'test@example.com', 'Test User', 'user']);

if ($result) {
    echo "User creation: SUCCESS\n";
} else {
    echo "User creation: FAILED\n";
}

// Test product creation
$stmt = $conn->prepare("INSERT INTO products (name, price, category) VALUES (?, ?, ?)");
$result = $stmt->execute(['Test Product', 100.00, 'Test Category']);

if ($result) {
    echo "Product creation: SUCCESS\n";
} else {
    echo "Product creation: FAILED\n";
}
?>
```

### Step 2: Frontend Testing

1. **Test user registration**
2. **Test user login**
3. **Test product loading**
4. **Test cart functionality**
5. **Test order placement**
6. **Test admin functions**

### Step 3: Performance Testing

1. **Load testing** with multiple concurrent users
2. **Database query optimization**
3. **API response time testing**
4. **Memory usage monitoring**

---

## Deployment Considerations

### Step 1: Production Database Setup

1. **Use MySQL 8.0+** for production
2. **Configure proper indexing** for performance
3. **Set up database backups**
4. **Configure connection pooling**

### Step 2: Security Measures

1. **Use environment variables** for sensitive data
2. **Implement rate limiting**
3. **Add input validation**
4. **Use HTTPS** for all API calls
5. **Implement proper CORS** policies

### Step 3: Performance Optimization

1. **Enable MySQL query cache**
2. **Use Redis** for session storage
3. **Implement API caching**
4. **Optimize database queries**
5. **Use CDN** for static assets

### Step 4: Monitoring & Logging

1. **Set up error logging**
2. **Monitor API performance**
3. **Track user activities**
4. **Set up alerts** for critical issues

---

## File Structure After Migration

```
pharma-direct/
├── api/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   └── index.php
├── public/
│   ├── css/
│   ├── js/
│   │   ├── api.js
│   │   ├── firebase.js (modified)
│   │   ├── auth.js (modified)
│   │   └── imageCache.js
│   ├── img/
│   ├── index.html
│   ├── categories/
│   ├── product/
│   ├── cart/
│   ├── track/
│   ├── pay/
│   ├── user-dashboard/
│   ├── addresses/
│   ├── admin/
│   └── pharmacy/
├── composer.json
├── .env
└── README.md
```

---

## Conclusion

This migration provides:

1. **Better Performance** - MySQL is faster for complex queries
2. **Lower Costs** - No Firebase usage fees
3. **Full Control** - Complete control over database and API
4. **Scalability** - Easy to scale with proper infrastructure
5. **Security** - Better control over data security

The migration process should be done in stages:
1. Set up MySQL database and API
2. Test API endpoints thoroughly
3. Update frontend gradually
4. Migrate data in batches
5. Monitor and optimize performance

Remember to backup your Firebase data before starting the migration process!
