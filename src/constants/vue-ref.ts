import { ref } from 'vue';

export const questionTypes = ref([
  { name: 'Loại 1', code: 1 },
  { name: 'Loại 2', code: 2 },
  { name: 'Loại 3', code: 3 },
  { name: 'Loại 4', code: 4 },
  { name: 'Loại 5', code: 5 },
]);

export const levelOptions = ref([
  { label: 'Dễ', value: 1 },
  { label: 'Trung bình', value: 2 },
  { label: 'Khó', value: 3 },
  { label: 'Rất khó', value: 4 },
]);

export const sortByOptions = ref([
  { label: 'Ngày cập nhật', value: 'updatedAt' },
  { label: 'Ngày tạo', value: 'createdAt' },
  { label: 'Độ khó', value: 'level' },
  { label: 'Nội dung', value: 'content' },
  { label: 'Loại câu hỏi', value: 'questionType' },
]);

export const sortOrderOptions = ref([
  { label: 'Giảm dần', value: 'desc' },
  { label: 'Tăng dần', value: 'asc' },
]);

export const limitOptions = ref([
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
]);

// User-specific constants
export const accountStatusOptions = ref([
  { label: 'Tất cả', value: '' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Hoạt động', value: 'active' },
  { label: 'Không hoạt động', value: 'inactive' },
  { label: 'Hết hạn', value: 'expired' },
]);

export const userSortByOptions = ref([
  { label: 'Ngày cập nhật', value: 'updatedAt' },
  { label: 'Ngày tạo', value: 'createdAt' },
  { label: 'Tên đầy đủ', value: 'fullName' },
  { label: 'Tên đăng nhập', value: 'username' },
  { label: 'Email', value: 'email' },
  { label: 'Mã sinh viên', value: 'studentCode' },
  { label: 'Lớp', value: 'studentClass' },
  { label: 'Lần đăng nhập cuối', value: 'lastLoginAt' },
]);

export const roleOptions = ref([
  { label: 'ROOT', value: 'R' },
  { label: 'Người dùng', value: 'U' },
  { label: 'Quản trị viên', value: 'A' },
  { label: 'Người phỏng vấn', value: 'I' },
  { label: 'Khác', value: 'O' },
]);
