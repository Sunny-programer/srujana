// Backend API Example for Healthy Food
// This is a Node.js/Express server example

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// In-memory storage (replace with database in production)
const users = [];
const JWT_SECRET = 'your-secret-key'; // Use environment variable in production

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                userType: user.userType 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data (without password)
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            additionalInfo: user.additionalInfo,
            createdAt: user.createdAt
        };

        res.json({
            message: 'Login successful',
            token: token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password, userType, additionalInfo } = req.body;

        // Validate required fields
        if (!name || !email || !password || !userType || !additionalInfo) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Validate user type
        if (!['farmer', 'buyer'].includes(userType)) {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword,
            userType,
            additionalInfo,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email, 
                userType: newUser.userType 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data (without password)
        const userData = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            userType: newUser.userType,
            additionalInfo: newUser.additionalInfo,
            createdAt: newUser.createdAt
        };

        res.status(201).json({
            message: 'Account created successfully',
            token: token,
            user: userData
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Protected route example
app.get('/api/user/profile', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        additionalInfo: user.additionalInfo,
        createdAt: user.createdAt
    };

    res.json(userData);
});

// Logout endpoint (optional - mainly for token blacklisting)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    // In production, you might want to blacklist the token
    res.json({ message: 'Logged out successfully' });
});

// Farmer-specific endpoints
// Get farmer products
app.get('/api/farmer/products', authenticateToken, (req, res) => {
    const farmerId = req.user.userId;
    // In a real app, you would query the database for farmer's products
    const farmerProducts = products.filter(p => p.farmerId === farmerId);
    res.json(farmerProducts);
});

// Add/Update farmer product
app.post('/api/farmer/products', authenticateToken, (req, res) => {
    const farmerId = req.user.userId;
    const { name, description, price, category, stock, minStock, image } = req.body;
    
    const newProduct = {
        id: Date.now(),
        farmerId: farmerId,
        name,
        description,
        price,
        category,
        stock,
        minStock,
        image,
        createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Update farmer product
app.put('/api/farmer/products/:id', authenticateToken, (req, res) => {
    const farmerId = req.user.userId;
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId && p.farmerId === farmerId);
    
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }
    
    const { name, description, price, category, stock, minStock, image } = req.body;
    products[productIndex] = {
        ...products[productIndex],
        name,
        description,
        price,
        category,
        stock,
        minStock,
        image,
        updatedAt: new Date().toISOString()
    };
    
    res.json(products[productIndex]);
});

// Delete farmer product
app.delete('/api/farmer/products/:id', authenticateToken, (req, res) => {
    const farmerId = req.user.userId;
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId && p.farmerId === farmerId);
    
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }
    
    products.splice(productIndex, 1);
    res.json({ message: 'Product deleted successfully' });
});

// Get farmer orders
app.get('/api/farmer/orders', authenticateToken, (req, res) => {
    const farmerId = req.user.userId;
    // In a real app, you would query the database for farmer's orders
    const farmerOrders = orders.filter(o => o.farmerId === farmerId);
    res.json(farmerOrders);
});

// Update order status
app.put('/api/farmer/orders/:id/status', authenticateToken, (req, res) => {
    const farmerId = req.user.userId;
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    const orderIndex = orders.findIndex(o => o.id === orderId && o.farmerId === farmerId);
    
    if (orderIndex === -1) {
        return res.status(404).json({ message: 'Order not found' });
    }
    
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    res.json(orders[orderIndex]);
});

// Get farmer reviews
app.get('/api/farmer/reviews', authenticateToken, (req, res) => {
    const farmerId = req.user.userId;
    // In a real app, you would query the database for farmer's reviews
    const farmerReviews = reviews.filter(r => r.farmerId === farmerId);
    res.json(farmerReviews);
});

// Get farmer dashboard stats
app.get('/api/farmer/dashboard', authenticateToken, (req, res) => {
    const farmerId = req.user.userId;
    
    const farmerProducts = products.filter(p => p.farmerId === farmerId);
    const farmerOrders = orders.filter(o => o.farmerId === farmerId);
    const farmerReviews = reviews.filter(r => r.farmerId === farmerId);
    
    const totalRevenue = farmerOrders.reduce((sum, order) => sum + order.total, 0);
    const avgRating = farmerReviews.length > 0 ? 
        farmerReviews.reduce((sum, review) => sum + review.rating, 0) / farmerReviews.length : 0;
    
    res.json({
        totalProducts: farmerProducts.length,
        totalOrders: farmerOrders.length,
        totalRevenue: totalRevenue,
        averageRating: avgRating,
        recentOrders: farmerOrders.slice(-5),
        recentReviews: farmerReviews.slice(-5)
    });
});

// In-memory storage for demo (replace with database in production)
const products = [];
const orders = [];
const reviews = [];

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
