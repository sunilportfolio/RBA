import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import roleRoutes from './routes/roles.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize default roles and admin user
    initializeDefaultData();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Initialize default roles and admin user
async function initializeDefaultData() {
  try {
    const { Role } = await import('./models/Role.js');
    const { User } = await import('./models/User.js');
    const { default: bcrypt } = await import('bcryptjs');

    // Create default roles if they don't exist
    const defaultRoles = [
      { name: 'Admin', description: 'Full system access', permissions: ['create', 'read', 'update', 'delete', 'manage_users', 'manage_roles'] },
      { name: 'Developer', description: 'Development team member', permissions: ['create', 'read', 'update'] },
      { name: 'Designer', description: 'Design team member', permissions: ['create', 'read', 'update'] },
      { name: 'Tester', description: 'Quality assurance team member', permissions: ['read', 'update'] }
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Created role: ${roleData.name}`);
      }
    }

    // Create default admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const adminRole = await Role.findOne({ name: 'Admin' });
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await User.create({
        name: 'System Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        role: adminRole._id,
        isActive: true
      });
      console.log('Created default admin user: admin@example.com / admin123');
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});