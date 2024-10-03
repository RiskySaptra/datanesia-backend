import * as mongoose from 'mongoose';

export const GraphSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  resultTime: { type: Date, required: true },
  enodebId: { type: String, required: true },
  cellId: { type: String, required: true },
  availDur: { type: Number, required: true },
});

// Create a compound index to ensure the combination of enodebId, cellId, and resultTime is unique
GraphSchema.index({ enodebId: 1, cellId: 1, resultTime: 1 }, { unique: true });
