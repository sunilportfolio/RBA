import express from 'express';
import { Role } from '../models/Role.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all roles
router.get('/', authenticate, async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true }).sort({ name: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create role (Admin only)
router.post('/', authenticate, authorize(['manage_roles']), async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Check if role exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    const role = await Role.create({
      name,
      description,
      permissions: permissions || []
    });

    res.status(201).json({
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update role (Admin only)
router.put('/:id', authenticate, authorize(['manage_roles']), async (req, res) => {
  try {
    const { name, description, permissions, isActive } = req.body;
    const roleId = req.params.id;

    const role = await Role.findByIdAndUpdate(
      roleId,
      { name, description, permissions, isActive },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({
      message: 'Role updated successfully',
      role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete role (Admin only)
router.delete('/:id', authenticate, authorize(['manage_roles']), async (req, res) => {
  try {
    const roleId = req.params.id;

    // Check if role is being used
    const { User } = await import('../models/User.js');
    const usersWithRole = await User.countDocuments({ role: roleId });
    
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete role that is assigned to users' 
      });
    }

    const role = await Role.findByIdAndDelete(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;