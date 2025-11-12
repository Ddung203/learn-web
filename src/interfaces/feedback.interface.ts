export interface IFeedback {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  status: string;
  createdAt: string;
}

export interface ISendFeedbackParams {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}
