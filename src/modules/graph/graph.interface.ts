import { Document } from 'mongoose';

export interface Graph extends Document {
  _id: string;
  resultTime: Date;
  enodebId: string;
  cellId: string;
  availDur: number;
}

export interface GraphFilter {
  [cellId: string]: string[]; // cellId as key and array of enodebIds as value
}
