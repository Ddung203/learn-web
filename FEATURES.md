# ChocoLearn - Flashcard Learning Platform

## 🎯 Tổng quan
Ứng dụng học tập flashcard với 4 chế độ học giống Quizlet, được xây dựng với Vue 3, TypeScript, Pinia, và PrimeVue. Toàn bộ dữ liệu được lưu trữ trong Local Storage, hoạt động hoàn toàn offline.

## 🚀 Cài đặt và Chạy

```bash
# Cài đặt dependencies
pnpm install

# Chạy development server
pnpm dev

# Build production
pnpm build

# Preview production build
pnpm preview
```

## 📋 Các Tính Năng Chính

### 1. 📚 Quản Lý Bộ Thẻ (Card Sets)
- **Xem danh sách**: Hiển thị tất cả bộ thẻ học tập
- **Tạo mới**: Tạo bộ thẻ với tiêu đề, mô tả và các thẻ
- **Import nhiều**: Nhập hàng loạt thẻ từ clipboard
- **Xóa bộ thẻ**: Xóa bộ thẻ với xác nhận
- **Tự động lưu**: Dữ liệu được lưu tự động vào Local Storage

### 2. 🎴 Chế Độ Flashcards
- Lật thẻ với hiệu ứng 3D
- Điều hướng qua lại giữa các thẻ
- Progress bar theo dõi tiến độ
- Tùy chọn bắt đầu với thuật ngữ hoặc định nghĩa
- Thông báo hoàn thành khi xem hết tất cả thẻ

**Cách sử dụng:**
1. Click vào bộ thẻ từ danh sách
2. Chọn chế độ "Flashcards"
3. Click vào thẻ hoặc nút "Lật thẻ" để xem đáp án
4. Sử dụng nút "Tiếp theo"/"Quay lại" để điều hướng

### 3. ✅ Chế Độ Test
- Câu hỏi trắc nghiệm 4 đáp án
- Shuffle ngẫu nhiên câu hỏi và đáp án
- Hiển thị đáp án đúng/sai ngay lập tức
- Kết quả chi tiết với phân tích từng câu
- Scoring system với màu sắc:
  - 🟢 ≥ 80%: Xuất sắc
  - 🟡 60-80%: Khá
  - 🔴 < 60%: Cần cải thiện

**Cách sử dụng:**
1. Chọn chế độ "Test"
2. Đọc câu hỏi và chọn đáp án
3. Click "Kiểm tra" để xem kết quả
4. Click "Câu tiếp theo" để tiếp tục
5. Xem kết quả tổng hợp cuối bài

### 4. ✍️ Chế Độ Write
- Nhập đáp án bằng bàn phím
- Case-insensitive và diacritic-insensitive checking
- Instant feedback sau mỗi câu
- Hiển thị đáp án đúng nếu sai
- Kết quả tổng hợp với chi tiết từng câu

**Cách sử dụng:**
1. Chọn chế độ "Write"
2. Đọc thuật ngữ và nhập định nghĩa
3. Nhấn Enter hoặc click "Kiểm tra"
4. Xem feedback và tiếp tục

### 5. 🎯 Chế Độ Learn (Adaptive Learning)
- Thuật toán học thích nghi thông minh
- Priority system cho thẻ chưa thuộc
- Mastery tracking (cần trả lời đúng 2 lần)
- Visual progress indicators với dots
- Hai cách trả lời:
  - Tự kiểm tra: Nhập đáp án và kiểm tra
  - Đánh giá: Xem đáp án và đánh giá "Tôi biết" / "Học lại"

**Cách sử dụng:**
1. Chọn chế độ "Learn"
2. Đọc thuật ngữ
3. Chọn:
   - Nhập đáp án và click "Kiểm tra"
   - Hoặc click "Hiện đáp án" để xem và tự đánh giá
4. Thuật toán sẽ ưu tiên các thẻ bạn trả lời sai
5. Hoàn thành khi tất cả thẻ được đánh dấu "Đã nắm vững"

## 🗂️ Cấu Trúc Dự Án

```
src/
├── stores/
│   ├── cardset.store.ts      # Pinia store với local storage
│   └── ...
├── views/
│   ├── CardSets/
│   │   ├── CardSetsView.vue         # Danh sách bộ thẻ
│   │   ├── CardSetDetailView.vue    # Chi tiết & chọn chế độ
│   │   └── modes/
│   │       ├── FlashcardsMode.vue   # Chế độ lật thẻ
│   │       ├── TestMode.vue         # Chế độ trắc nghiệm
│   │       ├── WriteMode.vue        # Chế độ viết
│   │       └── LearnMode.vue        # Chế độ học thích nghi
│   └── StudyModule/
│       └── StudyModuleView.vue      # Tạo bộ thẻ mới
├── interfaces/
│   └── cardset.interface.ts   # TypeScript interfaces
├── locales/
│   ├── vi.ts                  # Tiếng Việt
│   └── en.ts                  # English
└── config/
    └── menu.config.ts         # Cấu hình menu NavBar
```

## 💾 Local Storage

### Cấu trúc dữ liệu
```typescript
{
  // Locale (Custom managed - NOT Pinia persist)
  "chocolearn-locale": "vi" | "en",
  
  // Card Sets (Pinia persist)
  "cardset": {
    "cardSets": [
      {
        id: string
        title: string
        description: string
        cards: [
          {
            id: string
            terminology: string
            define: string
          }
        ]
        createdAt: string
        updatedAt: string
      }
    ]
  },
  
  // Auth (Pinia persist)
  "auth": {
    isLoggedIn: boolean
    user: IUser | null
    accessToken: string | null
    refreshToken: string | null
  }
}
```

### Thao tác với Local Storage
- **Tự động lưu**: Mọi thay đổi được lưu ngay lập tức
- **Khôi phục**: Dữ liệu được tự động load khi mở app
- **Xóa dữ liệu**: Sign out sẽ xóa toàn bộ dữ liệu
- **Sample data**: Tự động tạo 3 bộ thẻ mẫu lần đầu sử dụng

## 🎨 UI/UX Features

### Components
- PrimeVue components (Card, Button, InputText, Toast, Dialog)
- Responsive design với Tailwind CSS
- Smooth animations và transitions
- Color-coded feedback (green/red/yellow)
- Loading states và Empty states

### Navigation
- **NavBar**: Menu đầy đủ với tất cả routes
  - Home
  - My Card Sets
  - Create New Set
  - Profile
  - Sign In/Out
- **Routes**:
  - `/introduction` - Trang chủ
  - `/card-sets` - Danh sách bộ thẻ
  - `/card-sets/:id` - Chi tiết và học
  - `/study-module` - Tạo bộ thẻ mới
  - `/profile` - Thông tin cá nhân
  - `/login` - Đăng nhập

## 🌍 Đa Ngôn Ngữ (i18n)
- Tiếng Việt (vi)
- English (en)
- Chuyển đổi ngôn ngữ trong NavBar
- Lưu preferences trong Local Storage

## 📝 Sample Data

Ứng dụng đi kèm với 3 bộ thẻ mẫu:
1. **English Vocabulary - Level 1**: 10 từ vựng cơ bản
2. **Programming Terms**: 10 thuật ngữ lập trình
3. **Math Formulas**: 6 công thức toán học

## 🔧 Technical Stack

- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **State Management**: Pinia + pinia-plugin-persistedstate
- **UI Library**: PrimeVue
- **Styling**: Tailwind CSS
- **Routing**: Vue Router
- **i18n**: Vue I18n
- **Build Tool**: Vite

## 🎓 Best Practices

### Code Organization
- Composition API với `<script setup>`
- TypeScript strict mode
- Pinia stores cho state management
- Component composition pattern

### Performance
- Lazy loading routes
- Computed properties cho derived state
- Event delegation
- Debounced inputs

### UX
- Toast notifications cho feedback
- Confirm dialogs cho destructive actions
- Loading states
- Empty states với CTAs
- Keyboard shortcuts (Enter để submit)

## 📱 Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly interactions
- Adaptive layouts

## 🔮 Future Enhancements
- [ ] Thống kê học tập (progress tracking)
- [ ] Spaced repetition algorithm (SM-2)
- [ ] Export/Import bộ thẻ (JSON, CSV)
- [ ] Chia sẻ bộ thẻ qua link
- [ ] Dark mode
- [ ] Audio pronunciation
- [ ] Image support cho thẻ
- [ ] Categories và tags
- [ ] Search và filter
- [ ] Study streaks và achievements

## 🐛 Known Issues
- None at the moment

## 📄 License
MIT

## 👨‍💻 Author
ChocoLearn Development Team
