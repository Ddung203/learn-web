/**
 * Question interfaces based on Swagger specification
 */

/**
 * Lựa chọn đáp án cho câu hỏi
 */
export interface IQuestionOption {
  /** Số thứ tự của lựa chọn (1-4) */
  numbering: 1 | 2 | 3 | 4;
  /** Nội dung đáp án */
  answer: string;
}

/**
 * Câu hỏi dành cho random quiz (không có đáp án đúng)
 */
export interface IQuestionForRandom {
  /** ID câu hỏi */
  _id: string;
  /** URL hình ảnh */
  imageURL?: string;
  /** Nội dung câu hỏi */
  content: string;
  /** Các lựa chọn đáp án (tối đa 4) */
  options: IQuestionOption[];
  /** Độ khó (1-4) */
  level: 1 | 2 | 3 | 4;
  /** Loại câu hỏi (1-5) */
  questionType: 1 | 2 | 3 | 4 | 5;
  /** Người tạo */
  createdBy?: string;
  /** Người cập nhật */
  updatedBy?: string;
  /** Thời gian tạo */
  createdAt?: string;
  /** Thời gian cập nhật */
  updatedAt?: string;
}

/**
 * Câu hỏi đầy đủ (bao gồm đáp án đúng) - dành cho admin
 */
export interface IQuestion extends IQuestionForRandom {
  /** Đáp án đúng (số thứ tự 1-4) */
  correctAnswer: 1 | 2 | 3 | 4;
}

/**
 * Payload tạo câu hỏi mới
 */
export interface ICreateQuestion {
  /** URL hình ảnh */
  imageURL?: string;
  /** Nội dung câu hỏi */
  content: string;
  /** Các lựa chọn đáp án (2-4 lựa chọn) */
  options: IQuestionOption[];
  /** Đáp án đúng (số thứ tự 1-4) */
  correctAnswer: 1 | 2 | 3 | 4;
  /** Độ khó (1-4), mặc định 1 */
  level: 1 | 2 | 3 | 4;
  /** Loại câu hỏi (1-5), mặc định 1 */
  questionType: 1 | 2 | 3 | 4 | 5;
}

/**
 * Payload cập nhật câu hỏi
 */
export interface IUpdateQuestion {
  imageURL: string;
  content: string;
  options: IQuestionOption[];
  correctAnswer: 1 | 2 | 3 | 4;
  level: 1 | 2 | 3 | 4;
  questionType: 1 | 2 | 3 | 4 | 5;
}

/**
 * Payload import câu hỏi từ Excel URL
 */
export interface IImportQuestionFromUrl {
  /** URL của file Excel để import câu hỏi */
  fileUrl: string;
}

/**
 * Bộ lọc cho câu hỏi
 */
export interface IQuestionFilters {
  /** Trang hiện tại */
  page?: number;
  /** Số lượng mỗi trang */
  limit?: number;
  /** Từ khóa tìm kiếm */
  search?: string;
  /** Độ khó (1-4) */
  level?: 1 | 2 | 3 | 4;
  /** Sắp xếp theo */
  sortBy?: string;
  /** Thứ tự sắp xếp */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filters cho random questions
 */
export interface IRandomQuestionFilters {
  /** Số lượng câu hỏi muốn lấy */
  numQuestions?: number;
  /** Danh sách độ khó muốn lấy */
  levels?: (1 | 2 | 3 | 4)[];
  /** Danh sách loại câu hỏi muốn lấy */
  questionTypes?: (1 | 2 | 3 | 4 | 5)[];
}

//
export interface IImportQuestionPayloadResponse {
  totalRows: number;
  successCount: number;
  errorCount: number;
  successfulQuestions: IQuestion[];
  errors: any[];
  processingTime: number; // in milliseconds
}

// Helper constants
export const QUESTION_LEVELS = {
  1: 'Dễ',
  2: 'Trung bình',
  3: 'Khó',
  4: 'Rất khó',
} as const;

export const QUESTION_TYPES = {
  1: 'Lý thuyết cơ bản',
  2: 'Thực hành',
  3: 'Ứng dụng',
  4: 'Phân tích',
  5: 'Tổng hợp',
} as const;
