export interface IStatData {
  websiteViews: number;
  countUser: number;
  countUserTested: number;
  countUserInterviewed: number;
  countUserPassed: number;
  users: IUserData[];
  usersTested: IUserTested[];
  usersInterviewed: IUserInterviewed[];
  usersPassed: IUserPassed[];
  questions: IStatQuestion[];
  lineChartData?: ILineChartData;
}

export interface IUserData {
  _id: string;
  username: string;
  fullName: string;
  studentCode: string;
  studentClass: string;
  phoneNumber: string;
  email: string;
  accountStatus: string;
  createdAt: string;
}

export interface IUserTested {
  testScore: number;
  testPercentage: number;
}

export interface IUserInterviewed {
  testScore: number;
  testPercentage: number;
  interviewKnowledgeScore: number;
  interviewAttitudeScore: number;
}

export interface IUserPassed {
  //
  [key: string]: any;
}

export interface IStatQuestion {
  _id: string;
  content: string;
  level: number;
  questionType: number;
  correctAnswer: number;
  createdAt: string;
}

export interface ILineChartData {
  labels: string[];
  datasets: IChartDataset[];
}

export interface IChartDataset {
  label: string;
  data: number[];
  fill?: boolean;
  borderColor?: string;
  tension?: number;
}

export interface IStatResponse {
  status: number;
  message: string;
  payload: IStatData;
  serverTime: number;
}
