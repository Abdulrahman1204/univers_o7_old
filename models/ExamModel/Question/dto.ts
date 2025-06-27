import { Document, Types } from 'mongoose';


interface IAnswer extends Document {
  answerText: string;
  isCorrect: boolean;
}

interface IRequest extends Document {
  requestText: string;
  answers: IAnswer[];
}

interface IExplanation {
  type: "text" | "video" | "image";
  content: string;
}

interface IQuestion extends Document {
  photo: {
    url: string;
    publicId: string | null;
  };
  unit: Types.ObjectId;
  teacher: Types.ObjectId;
  questionText: string;
  difficulty: "hard" | "normal" | "easy";
  questionType: "single" | "multiple";
  explanation: IExplanation;
  requests: IRequest[];
}

export { IAnswer, IRequest, IQuestion, IExplanation };
