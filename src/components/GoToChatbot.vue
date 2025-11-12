<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { ChatbotService } from '~/services';

  interface IChatHistory {
    text: string;
    isUser: boolean;
    timestamp: string;
  }

  const isVisible = ref(false);
  const chatbotVisible = ref(false);
  const userMessage = ref('Quy trình tuyển CTV như thế nào?');
  const chatHistory = ref<IChatHistory[]>([]);
  const isLoading = ref(false);

  const toggleVisibility = () => {
    isVisible.value = window.scrollY > 300;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const goToChatbot = () => {
    chatbotVisible.value = true;
  };

  const closeChatbot = () => {
    chatbotVisible.value = false;
  };

  const buildContextMessage = (newQuestion: string): string => {
    let context = '';

    // Lấy tối đa 3 cặp Q&A gần nhất
    const pairs: Array<{ question: string; answer: string }> = [];

    // Duyệt qua chatHistory để tìm các cặp user-bot liên tiếp
    for (let i = 0; i < chatHistory.value.length - 1; i++) {
      const userMsg = chatHistory.value[i];
      const botMsg = chatHistory.value[i + 1];

      // Kiểm tra nếu là cặp user-bot hợp lệ
      if (userMsg.isUser && !botMsg.isUser) {
        pairs.push({
          question: userMsg.text,
          answer: botMsg.text,
        });
        i++; // Skip bot message đã được xử lý
      }
    }

    // Lấy 3 cặp gần nhất
    const recentPairs = pairs.slice(-3);

    // Xây dựng context từ các cặp Q&A
    recentPairs.forEach((pair) => {
      context += `Câu hỏi: ${pair.question}\nTrả lời: ${pair.answer}\n\n`;
    });

    // Thêm câu hỏi mới
    context += `Câu hỏi mới: ${newQuestion}`;

    return context;
  };

  const sendMessage = async () => {
    if (!userMessage.value.trim()) return;

    const message = userMessage.value;

    // Hiển thị câu hỏi của user trong UI
    chatHistory.value.push({
      text: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    });

    userMessage.value = '';
    isLoading.value = true;

    try {
      // Tạo message có context để gửi lên API
      const contextualMessage = buildContextMessage(message);

      const response = await ChatbotService.chatbot(contextualMessage);

      const botAnswer = response.payload?.replace(/^"|"$/g, '') || '';

      chatHistory.value.push({
        text:
          botAnswer ||
          'Xin lỗi, tôi không thể trả lời câu hỏi này ngay bây giờ.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      console.error('Lỗi khi gọi API chatbot:', error);
      chatHistory.value.push({
        text: 'Mình đang gặp một chút vấn đề, bạn nhắc lại câu hỏi được không?',
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      isLoading.value = false;
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  onMounted(() => {
    window.addEventListener('scroll', toggleVisibility);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', toggleVisibility);
  });
</script>

<template>
  <div>
    <!-- Nút Scroll To Top -->
    <Button
      v-if="isVisible"
      @click="scrollToTop"
      class="z-50 scroll-to-top"
      icon="pi pi-angle-up"
      rounded
    />

    <!-- Nút Đi đến Chatbot -->
    <Button
      @click="goToChatbot"
      class="z-50 chatbot-button"
      icon="pi pi-comments"
      rounded
    />

    <!-- Dialog Chatbot -->
    <Dialog
      v-model:visible="chatbotVisible"
      modal
      header="Trợ lý ảo - Hỏi đáp thông tin CLB"
      :style="{ width: '450px' }"
      :closable="true"
      @hide="closeChatbot"
      class="chatbot-dialog"
    >
      <div class="chat-container">
        <!-- Phần tin nhắn -->
        <div class="chat-messages">
          <div
            v-if="chatHistory.length === 0"
            class="chat-welcome"
          >
            <p>Xin chào! Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn?</p>
            <p class="chat-tip">
              Ví dụ: "Chủ nhiệm là ai?", "Quy trình tuyển CTV như thế nào?"
            </p>
          </div>

          <div
            v-for="(message, index) in chatHistory"
            :key="index"
            :class="message.isUser ? 'user-message' : 'bot-message'"
          >
            <div class="message-content">
              <p>{{ message.text }}</p>
              <span class="message-time">{{ message.timestamp }}</span>
            </div>
          </div>

          <div
            v-if="isLoading"
            class="bot-message"
          >
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Phần nhập tin nhắn -->
        <div class="chat-input">
          <InputText
            v-model="userMessage"
            placeholder="Nhập câu hỏi của bạn..."
            class="w-full p-inputtext-sm"
            @keydown="handleKeyDown"
            :disabled="isLoading"
          />
          <Button
            @click="sendMessage"
            icon="pi pi-send"
            class="p-button-sm send-button"
            :disabled="!userMessage.trim() || isLoading"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
  .scroll-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #f59e0b;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: opacity 0.3s;
  }

  /* Nút chatbot */
  .chatbot-button {
    position: fixed;
    bottom: 20px;
    right: 80px;
    /* Dịch sang trái so với nút cuộn lên */
    background: #10b981;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: opacity 0.3s;
  }

  /* Styles cho phần chatbot */
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 400px;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #f9fafb;
    border-radius: 8px;
  }

  .chat-welcome {
    text-align: center;
    padding: 20px;
    color: #4b5563;
  }

  .chat-tip {
    font-size: 0.85rem;
    color: #6b7280;
    margin-top: 10px;
    font-style: italic;
  }

  .user-message,
  .bot-message {
    display: flex;
    margin-bottom: 8px;
  }

  .user-message {
    justify-content: flex-end;
  }

  .bot-message {
    justify-content: flex-start;
  }

  .message-content {
    max-width: 80%;
    padding: 10px 12px;
    border-radius: 16px;
    position: relative;
  }

  .user-message .message-content {
    background-color: #3b82f6;
    color: white;
    border-bottom-right-radius: 4px;
  }

  .bot-message .message-content {
    background-color: #e5e7eb;
    color: #111827;
    border-bottom-left-radius: 4px;
  }

  .message-time {
    font-size: 0.7rem;
    opacity: 0.7;
    display: block;
    text-align: right;
    margin-top: 4px;
  }

  .user-message .message-time {
    color: rgba(255, 255, 255, 0.8);
  }

  .chat-input {
    display: flex;
    gap: 8px;
    padding: 10px 0 0 0;
    align-items: center;
  }

  .send-button {
    background-color: #10b981;
    border: none;
  }

  /* Hiệu ứng đang nhập */
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .typing-indicator span {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #9ca3af;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out both;
  }

  .typing-indicator span:nth-child(1) {
    animation-delay: 0s;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%,
    80%,
    100% {
      transform: scale(0.6);
    }

    40% {
      transform: scale(1);
    }
  }

  :deep(.chatbot-dialog .p-dialog-header) {
    background-color: #10b981;
    color: white;
  }

  :deep(.chatbot-dialog .p-dialog-header-icon) {
    color: white;
  }
</style>
