import { Document } from 'mongoose';

export interface Graph extends Document {
  _id: string;
  resultTime: Date;
  enodebId: string;
  cellId: string;
  availDur: number;
}
