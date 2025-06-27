import { Document } from 'mongoose'

// Class Interface
export interface IClass extends Document {
    className: string
}