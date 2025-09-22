# PHARMA DIRECT - Complete Website Functionality Summary

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Core Features](#core-features)
5. [Page-by-Page Documentation](#page-by-page-documentation)
6. [Database Schema](#database-schema)
7. [API & Functions](#api--functions)
8. [Security & Authentication](#security--authentication)
9. [Order Management System](#order-management-system)
10. [Payment & COD System](#payment--cod-system)
11. [Real-time Features](#real-time-features)
12. [Mobile Responsiveness](#mobile-responsiveness)
13. [Deployment & Configuration](#deployment--configuration)

---

## 🏥 Overview

**PHARMA DIRECT** is a comprehensive OTC (Over-The-Counter) medicine delivery platform that connects customers with trusted pharmacies. The platform provides a seamless shopping experience with real-time order tracking, multiple payment options, and role-based access for different user types.

### Key Features:
- **Multi-role System**: Users, Pharmacies, and Admins
- **Real-time Order Tracking**: Live updates on order status with badge counts
- **Multiple Payment Methods**: COD, Card, GCash, PayMaya
- **Inventory Management**: Stock tracking and management
- **Address Management**: Multiple delivery addresses
- **Responsive Design**: Mobile-first approach with professional mobile menus
- **Client-side Filtering**: Fast tab switching without server requests
- **Image Caching System**: Global image preloading and caching for faster loading
- **Loading Indicators**: Professional loading states across all operations
- **Pretty URLs**: Clean folder-based URL structure
- **Professional UI**: Consistent design with gradient headers and modern styling
- **Mobile Menu**: Slide-out mobile menu with proper overlay masking
- **QR Code Payments**: Generate QR codes for mobile payments
- **Professional Time Formatting**: "Just now", "5m ago" instead of "0h ago"

---

## 🏗️ System Architecture

### Technology Stack:
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Real-time**: Firebase Firestore real-time listeners (`onSnapshot`)
- **Icons**: Tabler Icons
- **Fonts**: Inter (Google Fonts)

### File Structure:
```
pharma-direct-main/
├── index.html                    # Homepage with featured products
├── categories/
│   └── index.html               # Product categories with filtering
├── product/
│   └── index.html               # Individual product page with image caching
├── cart/
│   └── index.html               # Shopping cart & checkout
├── track/
│   └── index.html               # Order tracking with status tabs
├── pay/
│   └── index.html               # Payment processing with QR codes
├── user-dashboard/
│   └── index.html               # User dashboard with analytics
├── addresses/
│   └── index.html               # Address management
├── login/
│   └── index.html               # User login
├── register/
│   └── index.html               # User registration
├── admin/
│   └── index.html               # Admin panel
├── pharmacy/
│   └── index.html               # Pharmacy dashboard
├── disabled/
│   └── index.html               # Disabled account page
├── js/
│   ├── firebase.js              # Firebase configuration & utilities
│   ├── auth.js                 # Authentication functions
│   ├── imageCache.js           # Global image caching system
│   └── loading.js              # Global loading indicators
├── img/
│   └── icon.png                # App icon
├── data/
│   └── seed.json               # Sample data
├── MIGRATION_TO_MYSQL.md       # Database migration guide
└── firestore.rules             # Database security rules
```

---

## 👥 User Roles & Permissions

### 1. **User (Customer)**
- **Access**: Browse products, place orders, track orders
- **Features**: 
  - Add products to cart
  - Manage delivery addresses
  - View order history with status tabs
  - Track order status in real-time
  - COD eligibility based on order history
  - Order cancellation (within 1 minute)

### 2. **Pharmacy**
- **Access**: Manage products, process orders
- **Features**:
  - Add/edit/delete products
  - Manage inventory (stock levels)
  - View and process orders with status tabs
  - Confirm/decline orders
  - Update order status (advance stages)
  - View order analytics with badge counts
  - Real-time order updates

### 3. **Admin**
- **Access**: Full system control
- **Features**:
  - Manage all users and pharmacies
  - Approve/disable pharmacies
  - View all orders with status tabs
  - Configure COD settings
  - Manage product visibility
  - System-wide statistics
  - Real-time order monitoring

---

## 🎯 Core Features

### 1. **Product Management**
- **Product Catalog**: Organized by categories
- **Featured Products**: Highlighted on homepage
- **Stock Management**: Real-time inventory tracking
- **Product Details**: Images, descriptions, pricing
- **Search & Filter**: Category-based filtering

### 2. **Shopping Cart**
- **Add to Cart**: From product pages and category pages
- **Quantity Management**: Increase/decrease quantities
- **Cart Persistence**: LocalStorage-based cart
- **Price Calculation**: Real-time total calculation
- **Stock Validation**: Prevents out-of-stock purchases

### 3. **Order Management**
- **Order Placement**: Complete checkout process
- **Order Tracking**: Real-time status updates with badge counts
- **Status Stages**: Pending → Confirmed → To Be Received → Delivered
- **Order History**: Complete order history for users
- **Order Analytics**: Statistics for pharmacies and admins
- **Client-side Filtering**: Fast tab switching without database queries

### 4. **Payment System**
- **Multiple Methods**: COD, Card, GCash, PayMaya
- **COD Eligibility**: Based on order history and spending
- **Payment Status**: Track payment confirmation
- **COD Thresholds**: Configurable minimum requirements
- **Payment Simulation**: QR codes and phone numbers for manual payments

---

## 📄 Page-by-Page Documentation

### 🏠 **index.html** - Homepage
**Purpose**: Main landing page with featured products
**Features**:
- Hero section with call-to-action
- Featured products grid with image caching
- Navigation header with cart counter
- Mobile bottom navigation with icons
- Authentication-aware UI
- Loading indicators for better UX
- Mobile-responsive design

**Key Functions**:
- `loadProducts()`: Loads featured products with caching
- `updateCartCount()`: Updates cart badge across all elements
- Real-time authentication state management

### 🏷️ **categories/index.html** - Product Categories
**Purpose**: Browse all products by category
**Features**:
- Dynamic category tabs with filtering
- Product grid with add-to-cart functionality
- Search functionality
- Total product count display
- Loading indicators and skeleton cards
- Mobile-responsive design
- Image preloading and caching

**Key Functions**:
- `loadProducts()`: Loads all products and categories
- `filterProducts(category)`: Filters products by category
- `renderProducts(products)`: Renders product grid with caching

### 🛍️ **product/index.html** - Individual Product Page
**Purpose**: Detailed product view with purchase options
**Features**:
- Product image with global caching system
- Detailed product information
- Quantity selector with stock validation
- Add to cart functionality
- Stock status display
- Mobile-responsive design
- Loading indicators
- Image preloading from other pages

**Key Functions**:
- `loadProduct(productId)`: Loads product details
- `setupImageLoading()`: Handles image display with caching
- `addToCart()`: Adds product to cart

### 🛒 **cart/index.html** - Shopping Cart
**Purpose**: Review and checkout cart items
**Features**:
- Cart item list with quantities
- Price calculations with discounts
- Quantity adjustments
- Item removal
- Checkout process with address selection
- Payment method selection (COD, Card, GCash, PayMaya)
- Stock validation before checkout
- Loading indicators
- Mobile-responsive design

**Key Functions**:
- `loadCart()`: Loads cart items
- `calculateTotal()`: Calculates cart total
- `checkout()`: Processes order placement
- `validateCartStock()`: Validates stock availability

### 📦 **track/index.html** - Order Tracking
**Purpose**: Track order status and history
**Features**:
- Order status tabs with badges (All, Pending, Confirmed, To Be Received, Delivered, Declined)
- Real-time order updates
- Order history with client-side filtering
- Order details modal with product images
- Order cancellation (limited time - 1 minute)
- Pay Now functionality for pending orders
- QR code generation for payments
- Professional time formatting ("Just now", "5m ago", etc.)

**Key Functions**:
- `updateUserOrderCounts()`: Updates status badges
- `renderFilteredOrders()`: Filters orders by status
- `renderOrderCard()`: Creates order display cards
- `cancelOrder()`: Cancels orders within time limit
- `showPayNowModal()`: Shows payment modal with QR codes

### 💳 **pay/index.html** - Payment Processing
**Purpose**: Process payments for orders
**Features**:
- QR code generation for mobile payments
- Payment method selection
- Order details display
- Payment confirmation
- Accessible without authentication (for QR scanning)
- Mobile-responsive design

### 👤 **user-dashboard/index.html** - User Dashboard
**Purpose**: User account overview and quick actions
**Features**:
- Order statistics (total orders, total spent)
- COD status display
- Quick action buttons with icons
- Account information
- Recent orders list with product images
- Order details modal
- Mobile-responsive design
- Loading indicators

**Key Functions**:
- `loadUserData(uid)`: Loads user statistics
- `showOrderDetails(orderId)`: Shows order modal

### 🏥 **pharmacy/index.html** - Pharmacy Dashboard
**Purpose**: Pharmacy management interface
**Features**:
- Product management (add/edit/delete) with image upload
- Order management with status tabs and badges
- Stock management
- Order processing (confirm/decline) with loading indicators
- Order analytics
- Real-time order updates
- Client-side filtering for orders
- Professional UI design
- Wallet management with bank details

**Key Functions**:
- `loadProducts()`: Loads pharmacy products
- `loadAllOrders()`: Sets up real-time order listener
- `confirmOrder()`: Confirms order and deducts stock
- `updateOrderCounts()`: Updates order status badges
- `renderFilteredOrders()`: Client-side order filtering

### ⚙️ **admin/index.html** - Admin Panel
**Purpose**: System administration interface
**Features**:
- System overview with statistics and recent activities
- User management with professional design
- Pharmacy management with approval system
- Order management with status tabs and badges
- COD settings configuration
- Product visibility controls
- Real-time order monitoring
- Professional UI with gradient headers

**Key Functions**:
- `loadOverview()`: Loads system statistics
- `loadUsers()`: Manages user accounts
- `loadPharmacies()`: Manages pharmacy accounts
- `loadAllAdminOrders()`: Real-time order monitoring
- `updateAdminOrderCounts()`: Updates order status badges

### 🔐 **login/index.html** - User Login
**Purpose**: User authentication
**Features**:
- Email/password login with loading indicators
- Role-based redirection
- Professional error handling
- Persistent authentication
- Mobile-responsive design

### 📝 **register/index.html** - User Registration
**Purpose**: New user registration
**Features**:
- User registration form with validation
- Role selection (User/Pharmacy)
- Form validation with professional error messages
- Automatic role-based redirection
- Loading indicators

### 📍 **addresses/index.html** - Address Management
**Purpose**: Manage delivery addresses
**Features**:
- Add new addresses with validation
- Edit existing addresses
- Delete addresses
- Set default address
- Address validation
- Mobile-responsive design
- Professional UI design

---

## 🗄️ Database Schema

### **Collections Structure**

#### **users** Collection
```javascript
{
  uid: "user_id",
  name: "Full Name",
  email: "user@example.com",
  phone: "+1234567890",
  role: "user|pharmacy|admin",
  disabled: false,
  successfulOrders: 0,
  totalSpent: 0,
  codUnlocked: false,
  createdAt: timestamp
}
```

#### **products** Collection
```javascript
{
  name: "Product Name",
  price: 99.99,
  stock: 100,
  category: "Pain Relief",
  imageURL: "https://...",
  description: "Product description",
  featured: false,
  prescription: false,
  pharmacyId: "pharmacy_uid",
  disabled: false,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### **orders** Collection
```javascript
{
  userId: "user_uid",
  items: [
    {
      id: "product_id",
      name: "Product Name",
      price: 99.99,
      quantity: 2
    }
  ],
  total: 199.98,
  paymentMethod: "COD|Card|GCash|PayMaya",
  paymentStatus: "Pending|Confirmed",
  stage: "Pending|Confirmed|To Be Received|Delivered|Declined|Cancelled",
  deliveryAddress: "Full address",
  customerInfo: {
    name: "Customer Name",
    phone: "+1234567890",
    email: "customer@example.com"
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### **pharmacies** Collection
```javascript
{
  name: "Pharmacy Name",
  email: "pharmacy@example.com",
  phone: "+1234567890",
  approved: false,
  disabled: false,
  totalOrders: 0,
  createdAt: timestamp
}
```

#### **addresses** Collection
```javascript
{
  userId: "user_uid",
  name: "Home|Work|Other",
  address: "Full address",
  isDefault: false,
  createdAt: timestamp
}
```

#### **settings** Collection
```javascript
{
  codMinOrders: 3,
  codMinSpend: 1000,
  codMaxLimit: 5000
}
```

---

## 🔧 API & Functions

### **Authentication Functions** (`js/auth.js`)
```javascript
// User registration
registerUser({ name, email, password, phone, role })

// User login
loginUser({ email, password })

// Fetch user role
fetchUserRole(uid)

// Fetch user document
fetchUserDoc(uid)

// Role-based redirection
redirectByRole(role)

// Logout
logout()
```

### **Firebase Configuration** (`js/firebase.js`)
```javascript
// Firebase config
firebaseConfig

// Collection names
COLLECTIONS = {
  users: "users",
  products: "products", 
  orders: "orders",
  pharmacies: "pharmacies",
  settings: "settings",
  addresses: "addresses"
}

// Order stages
ORDER_STAGES = ["Pending", "Confirmed", "To Be Received", "Delivered", "Declined", "Cancelled"]

// Payment methods
PAYMENT_METHODS = ["COD", "Card", "GCash", "PayMaya"]

// Currency formatting
formatCurrency(value)
```

### **Cart Functions** (`js/cart.js`)
```javascript
// Update cart count
updateCartCount()

// Add to cart
addToCart(product)

// Remove from cart
removeFromCart(productId)

// Update quantity
updateQuantity(productId, quantity)

// Calculate total
calculateTotal()

// Checkout
checkout(orderData)
```

---

## 🔒 Security & Authentication

### **Firebase Security Rules** (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products are readable by all, writable by pharmacy owners
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (resource.data.pharmacyId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Orders are readable by users, pharmacies, and admins
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'pharmacy']);
      allow write: if request.auth != null;
    }
  }
}
```

### **Authentication Flow**
1. **Registration**: Creates Firebase Auth user + Firestore user document
2. **Login**: Authenticates with Firebase Auth
3. **Role-based Access**: Redirects based on user role
4. **Session Persistence**: Uses localStorage for faster loading
5. **Real-time Updates**: Firebase Auth state changes trigger UI updates

---

## 📦 Order Management System

### **Order Lifecycle**
1. **Pending**: Order placed, awaiting pharmacy confirmation
2. **Confirmed**: Pharmacy confirmed, stock deducted
3. **To Be Received**: Order ready for pickup/delivery
4. **Delivered**: Order completed
5. **Declined**: Order rejected by pharmacy
6. **Cancelled**: Order cancelled by user (within 1 minute)

### **Order Processing**
- **Real-time Updates**: Uses Firebase `onSnapshot` for live updates
- **Status Badges**: Visual indicators with counts
- **Client-side Filtering**: Fast tab switching without server requests
- **Stock Management**: Automatic stock deduction on confirmation
- **Order Analytics**: Statistics for pharmacies and admins

### **Order Status Tabs**
- **All Orders**: Shows all orders with red badge
- **Pending**: Shows pending orders with yellow badge
- **Confirmed**: Shows confirmed orders with blue badge
- **To Be Received**: Shows ready orders with purple badge
- **Delivered**: Shows completed orders with green badge
- **Declined**: Shows declined orders with gray badge

---

## 💳 Payment & COD System

### **Payment Methods**
- **COD (Cash on Delivery)**: Available for eligible users
- **Card**: Credit/debit card payments (simulated)
- **GCash**: Mobile wallet payment (simulated)
- **PayMaya**: Mobile wallet payment (simulated)

### **COD Eligibility System**
- **Minimum Orders**: Configurable minimum successful orders
- **Minimum Spend**: Configurable minimum total spending
- **Maximum Limit**: Configurable maximum COD amount
- **Admin Control**: Admins can manually enable/disable COD for users

### **COD Configuration** (Admin Panel)
```javascript
{
  codMinOrders: 3,      // Minimum successful orders
  codMinSpend: 1000,    // Minimum total spending (PHP)
  codMaxLimit: 5000     // Maximum COD amount (PHP)
}
```

### **Payment Simulation**
- **QR Codes**: Displayed for GCash/PayMaya payments
- **Phone Numbers**: Provided for manual payment reference
- **Manual Confirmation**: Pharmacy/Admin manually confirms payments
- **No Real Card Storage**: Simulated payment processing

---

## ⚡ Real-time Features

### **Real-time Order Updates**
- **Firebase Listeners**: `onSnapshot` for live data
- **Automatic UI Updates**: No page refresh needed
- **Status Badge Updates**: Real-time count updates
- **Order List Updates**: New orders appear instantly

### **Real-time Authentication**
- **Auth State Changes**: Automatic UI updates
- **Role-based Redirects**: Instant role-based navigation
- **Session Management**: Persistent login state

### **Real-time Cart Updates**
- **LocalStorage Sync**: Cart persists across sessions
- **Badge Updates**: Cart count updates in real-time
- **Stock Validation**: Real-time stock checking

---

## 📱 Mobile Responsiveness

### **Responsive Design**
- **Mobile-first**: Designed for mobile devices first
- **Tailwind CSS**: Utility-first CSS framework
- **Flexible Grid**: Responsive product grids
- **Touch-friendly**: Large touch targets
- **Mobile Navigation**: Bottom navigation bar

### **Status Bar Design**
- **Horizontal Tabs**: Clean tab layout with proper spacing
- **Badge Positioning**: Fixed positioning to prevent overlap
- **Color-coded Badges**: Each status has distinct colors
- **Active State Styling**: Emerald green for active tabs
- **Hover Effects**: Subtle hover animations

---

## 🚀 Deployment & Configuration

### **Setup Instructions**
1. Create Firebase project and enable Email/Password Auth
2. Create Firestore in test mode
3. Update `js/firebase.js` with your Firebase credentials
4. Deploy Firestore rules
5. Serve locally or deploy to Firebase Hosting

### **Local Development**
```bash
npx serve -l 5173
```

### **GitHub Pages Deployment**
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. The `404.html` file will handle routing automatically
4. Access via: `https://yourusername.github.io/repository-name/`

**Note**: GitHub Pages doesn't support server-side routing, so the `404.html` file redirects folder-based URLs to the correct `index.html` files.

### **Admin Account Setup**
1. Register a normal account via Register page
2. In Firebase Console, set `role` field to `admin` in users collection
3. Sign in to access admin panel

### **Production Considerations**
- Set Firestore rules to production-safe
- Enable HTTPS
- Configure proper CORS settings
- Set up monitoring and logging

---

## 🔧 Technical Implementation Details

### **Client-side Filtering Architecture**
- **Data Loading**: All orders loaded once via `onSnapshot`
- **Local Storage**: Orders stored in memory arrays
- **Filtering Logic**: JavaScript-based filtering for instant results
- **Badge Updates**: Real-time count calculation from local data
- **Performance**: No database queries on tab switches

### **Status Tab Implementation**
- **CSS Classes**: `.pharmacy-tab-button`, `.admin-tab-button`, `.tab-button`
- **Badge Classes**: `.pharmacy-order-count-badge`, `.admin-order-count-badge`, `.user-order-count-badge`
- **Z-index Management**: Proper layering to prevent badge overlap
- **Responsive Design**: Flexible tab layout for different screen sizes

### **Real-time Data Flow**
1. **Initial Load**: `onSnapshot` listener established
2. **Data Updates**: Firebase pushes changes automatically
3. **Local Processing**: Orders filtered and counted locally
4. **UI Updates**: DOM updated with new data and badge counts
5. **Tab Switching**: Instant filtering without server requests

---

## 🆕 Recent Improvements & Features

### **Mobile Experience Enhancements**
- **Professional Mobile Menu**: Slide-out menu with proper overlay masking
- **Mobile Bottom Navigation**: Icon-based navigation with cart counter
- **Responsive Design**: Consistent mobile experience across all pages
- **Touch-friendly Interface**: Large touch targets and smooth interactions

### **Performance Optimizations**
- **Global Image Caching**: `js/imageCache.js` for faster image loading
- **Image Preloading**: Preload images from other pages for instant display
- **Loading Indicators**: `js/loading.js` for professional loading states
- **Skeleton Loading**: Visual feedback during data loading

### **URL Structure Improvements**
- **Pretty URLs**: Folder-based structure (`/categories/` instead of `categories.html`)
- **Clean Navigation**: Consistent internal linking
- **SEO-friendly**: Better URL structure for search engines

### **UI/UX Enhancements**
- **Professional Design**: Consistent gradient headers and modern styling
- **Loading States**: Button loading indicators and page transitions
- **Error Handling**: Professional error messages instead of raw alerts
- **Time Formatting**: "Just now", "5m ago" instead of "0h ago"
- **Visual Hierarchy**: Better organization of information

### **Payment System Improvements**
- **QR Code Generation**: Generate QR codes for mobile payments
- **Payment Modals**: Professional payment confirmation modals
- **Pay Now Functionality**: Direct payment from order tracking
- **Payment Accessibility**: Access payment page without authentication

### **Order Management Enhancements**
- **Product Images in Orders**: Display actual product images in order details
- **Professional Order Cards**: Consistent and visually appealing order display
- **Real-time Updates**: Live order status updates with proper badges
- **Order Analytics**: Enhanced statistics and reporting

### **Admin & Pharmacy Improvements**
- **Professional Dashboards**: Modern UI with gradient headers
- **Enhanced Order Management**: Better order processing interface
- **User Management**: Improved user and pharmacy management
- **Wallet Management**: Pharmacy wallet with bank details

---

## 📊 Current Implementation Status

### ✅ **Fully Implemented**
- User authentication and role management
- Product management (CRUD operations) with image upload
- Shopping cart with LocalStorage persistence
- Order placement and management with real-time updates
- Real-time order tracking with status tabs and badges
- Payment simulation (COD, Card, GCash, PayMaya) with QR codes
- Admin panel with full functionality and professional UI
- Pharmacy dashboard with order processing and wallet management
- Address management with validation
- COD eligibility system
- Client-side filtering for orders
- Status badge system with real-time updates
- Mobile-responsive design with professional mobile menus
- Global image caching and preloading system
- Loading indicators and professional UI states
- Pretty URLs with folder-based structure
- Professional time formatting
- QR code payment generation
- Order details with product images
- Professional error handling
- Mobile bottom navigation with icons
- Slide-out mobile menu with overlay masking

### 🔄 **Partially Implemented**
- Advanced product search and filtering
- Email notifications system
- Inventory alerts and notifications

### 🚧 **Areas for Improvement**
- Advanced order analytics and reporting
- Payment gateway integration (real payments)
- Mobile app development
- Push notifications
- Advanced inventory management
- Multi-language support
- Advanced user preferences

---

This documentation provides a comprehensive overview of all implemented features and functionality in the PHARMA DIRECT platform, serving as a foundation for future development and improvements.
