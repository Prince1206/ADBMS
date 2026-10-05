# 📦 Inventory Management System (ADMS Mini Project)

A complete, full-stack **Inventory Management System** built for the **Advanced Database Management Systems (ADMS)** mini project curriculum.

The project demonstrates an end-to-end 3-tier architecture:
**Vanilla HTML5 / CSS3 / JavaScript (Frontend) ➔ RESTful API (Node.js & Express.js) ➔ MongoDB Database (Mongoose)**.

---

## 🌟 Key Features

1. **Dashboard Overview**:
   - Total products, total inventory stock units, total registered suppliers, and low-stock critical alerts.
   - Real-time low-stock product warning table.

2. **Complete Product Management (CRUD)**:
   - **Add Product**: Product name, unique product code, category, supplier, quantity, price, reorder level threshold, and description.
   - **View Products**: Clean tabular view with stock status badges (`IN STOCK` vs `LOW STOCK`).
   - **Update Product**: Edit existing product details with automatic form population and duplicate-code validation.
   - **Delete Product**: Safe deletion with user confirmation prompt.

3. **Supplier Management (CRUD)**:
   - **Add Supplier**: Contact person name, company name, email, phone number, and physical office address.
   - **View Suppliers**: Vendor directory with clickable contact emails and phone numbers.
   - **Update Supplier**: Edit supplier details seamlessly.
   - **Delete Supplier**: Remove supplier with confirmation.

4. **Search and Multi-Filter Engine**:
   - Instant search across product names, codes, categories, and suppliers.
   - Category filtering dropdown.
   - Quick stock status filter (`All`, `Low Stock Only (<= Reorder Level)`, `Normal Stock`).

5. **Validation & Error Handling**:
   - Schema validation via Mongoose.
   - Duplicate product code detection (`400 Bad Request`).
   - Non-negative price and quantity validation.
   - Email format checking.
   - User-friendly toast notifications.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, Vanilla CSS3, JavaScript (ES6+), Fetch API |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB / MongoDB Atlas, Mongoose ODM |
| **Utilities** | `dotenv` (Environment variables), `cors` (Cross-origin requests), `nodemon` (Hot reload) |

---

## 📁 Project Structure

```text
adbms project/
│
├── backend/
│   ├── models/
│   │   ├── Product.js          # Product Mongoose schema & validation
│   │   └── Supplier.js         # Supplier Mongoose schema & validation
│   │
│   ├── controllers/
│   │   ├── productController.js   # Product CRUD & stats business logic
│   │   └── supplierController.js  # Supplier CRUD business logic
│   │
│   ├── routes/
│   │   ├── productRoutes.js    # Express REST API routes for products
│   │   └── supplierRoutes.js   # Express REST API routes for suppliers
│   │
│   ├── .env                    # Environment config (Port & MongoDB URI)
│   ├── package.json            # Node.js dependencies & scripts
│   ├── seed.js                 # Sample database seeder script
│   └── server.js               # Express application entry point
│
├── frontend/
│   ├── index.html              # Dashboard interface with statistics
│   ├── products.html           # Product CRUD & search/filter interface
│   ├── suppliers.html          # Supplier CRUD & directory interface
│   ├── css/
│   │   └── style.css           # Modern, responsive UI stylesheet
│   └── js/
│       ├── app.js              # Shared toast alerts & API request helper
│       ├── products.js         # Products page interactivity
│       └── suppliers.js        # Suppliers page interactivity
│
└── README.md                   # Complete documentation & viva reference
```

---

## 🗄️ Database Design

### 1. `products` Collection
```json
{
  "_id": "ObjectId('65b9...')",
  "productName": "Wireless Mouse",
  "productCode": "WM001",
  "category": "Electronics",
  "supplier": "ABC Corp",
  "quantity": 45,
  "price": 599,
  "reorderLevel": 10,
  "description": "2.4GHz optical wireless mouse",
  "createdAt": "2026-10-05T14:10:00.000Z"
}
```

### 2. `suppliers` Collection
```json
{
  "_id": "ObjectId('65b8...')",
  "supplierName": "John Doe",
  "companyName": "ABC Corp",
  "email": "contact@abccorp.com",
  "phone": "+91 98765 43210",
  "address": "Plot 45, Okhla Industrial Area, New Delhi",
  "createdAt": "2026-10-05T14:00:00.000Z"
}
```

---

## 🚀 Setup & Installation Steps

### Step 1: Navigate to the backend folder
Open your terminal / command prompt:
```bash
cd "backend"
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure MongoDB in `.env`
Open `backend/.env` and ensure your MongoDB connection string is set:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventory_db
```
*(If using **MongoDB Atlas**, replace `MONGO_URI` with your connection string, e.g.: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/inventory_db`)*

### Step 4 (Optional): Populate Sample Data
To populate the database with realistic inventory items and suppliers:
```bash
npm run seed
```

### Step 5: Start the Backend Server
```bash
npm run dev
# Or: npm start
```
You will see:
```text
==================================================
 MongoDB Connected Successfully!
 Database: inventory_db
==================================================
 Server running on http://localhost:5000
 Frontend accessible at http://localhost:5000
 API base: http://localhost:5000/api/products
==================================================
```

### Step 6: Access the Application
Open your web browser and navigate to:
👉 **`http://localhost:5000`** (or open `frontend/index.html` directly in any web browser).

---

## 📡 REST API Reference

### Product Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve all products (supports `?search=`, `?category=`, `?lowStock=true`) |
| `GET` | `/api/products/low-stock` | Retrieve products where `quantity <= reorderLevel` |
| `GET` | `/api/products/stats` | Dashboard statistics (totals, low stock counts) |
| `GET` | `/api/products/:id` | Retrieve single product by ID |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/:id` | Update an existing product |
| `DELETE` | `/api/products/:id` | Delete a product |

### Supplier Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/suppliers` | Retrieve all registered suppliers |
| `GET` | `/api/suppliers/:id` | Retrieve single supplier by ID |
| `POST` | `/api/suppliers` | Create a new supplier |
| `PUT` | `/api/suppliers/:id` | Update supplier details |
| `DELETE` | `/api/suppliers/:id` | Delete a supplier |

---

## 📮 API Testing Guide (Postman / cURL)

### 1. Create a Product
**`POST /api/products`**
```json
{
  "productName": "Mechanical Keyboard",
  "productCode": "KB002",
  "category": "Electronics",
  "supplier": "Tech World Solutions Pvt Ltd",
  "quantity": 12,
  "price": 2499,
  "reorderLevel": 15,
  "description": "RGB Backlit mechanical keyboard"
}
```

### 2. Update a Product
**`PUT /api/products/<PRODUCT_ID>`**
```json
{
  "quantity": 30
}
```

### 3. Fetch Low Stock Items
**`GET /api/products/low-stock`**

---

## ❓ Common Issues & Troubleshooting

1. **`MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`**
   - **Reason**: Local MongoDB service is not running.
   - **Solution**: Start MongoDB service (`net start MongoDB` on Windows) or use a free cloud cluster connection from MongoDB Atlas in `.env`.

2. **CORS Error in Browser**
   - Handled automatically via `cors()` middleware in `server.js`.
   - Ensure the backend is running on `http://localhost:5000`.

3. **Duplicate Key Error (`E11000 duplicate key error collection: ... productCode_1 dup key`)**
   - Product codes must be unique (e.g. `WM001`). The backend returns an informative `400 Bad Request` with an exact explanation.

---

## 🎓 College Viva / Project Defense Tips

- **What is the advantage of using MongoDB over traditional RDBMS for inventory?**
  MongoDB's document model allows flexible schemas, easy nested documents, and rapid horizontal scaling without complex table migrations.
- **How does the low stock alert work?**
  The endpoint `/api/products/low-stock` executes a MongoDB `$expr: { $lte: ['$quantity', '$reorderLevel'] }` comparison, directly leveraging the database engine for filtering.
- **Why Vanilla JS instead of a heavy framework?**
  It directly demonstrates core DOM manipulation, asynchronous programming with `async/await` and `fetch()`, and keeps the application lightweight and accessible without a build step.
