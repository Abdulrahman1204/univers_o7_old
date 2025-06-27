import { Document, Types } from "mongoose";

// Level Interface
export interface ILevel extends Document {
  language: Types.ObjectId;
  levelNumber: number;
  available: boolean;
}

// Language Interface
export interface ILanguage extends Document {
  languageName: string;
}

// Listen Question Interface
export interface ILQuestion extends Document {
  level: Types.ObjectId;
  text: string;
  type: 'listens'
}

// Empty Question Interface
export interface IEQuestion extends Document {
  level: Types.ObjectId;
  text: string;
  type: "emptes";
  word: string;
  correct: string;
  firstAnswer: string;
  secondAnswer: string;
  thirdAnswer: string;
  forthAnswer: string;
}

// Mean Question Interface
export interface IMeanQuestion extends Document {
  level: Types.ObjectId;
  text: string;
  type:"means";
  correct: string;
  firstAnswer: string;
  secondAnswer: string;
  thirdAnswer: string;
  forthAnswer: string;
}

// Read And Talk Question Interface
export interface IRTQuestion extends Document {
  level: Types.ObjectId;
  text: string;
  type: "read_talk";
}

// Ranking Question Interface
export interface RankingQuesiton extends Document {
  level: Types.ObjectId;
  text: string;
  type: "rank"
}
