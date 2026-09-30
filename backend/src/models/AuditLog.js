import mongoose from 'mongoose';
import { AUDIT_ACTIONS } from '../constants/index.js';

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
      index: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    performedByName: {
      type: String,
      default: 'SYSTEM'
    },
    role: {
      type: String,
      default: 'SYSTEM'
    },
    targetType: {
      type: String,
      enum: ['LEAD', 'USER', 'AUTH', 'SYSTEM'],
      required: true,
      index: true
    },
    targetId: {
      type: String,
      default: ''
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ip: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// Prevent accidental modification or deletion of audit logs (immutable)
AuditLogSchema.pre('save', function () {
  if (!this.isNew) {
    throw new Error('Audit logs are append-only and cannot be modified.');
  }
});

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
