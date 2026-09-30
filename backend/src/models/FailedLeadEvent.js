import mongoose from 'mongoose';

const FailedLeadEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    eventType: {
      type: String,
      default: 'LEAD_CREATED'
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    error: {
      type: String,
      required: true
    },
    retryCount: {
      type: Number,
      default: 0
    },
    failedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionNote: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

FailedLeadEventSchema.index({ resolved: 1, failedAt: -1 });

export const FailedLeadEvent = mongoose.model('FailedLeadEvent', FailedLeadEventSchema);
