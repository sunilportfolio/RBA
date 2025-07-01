import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'manage_users', 'manage_roles']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Role = mongoose.model('Role', roleSchema);