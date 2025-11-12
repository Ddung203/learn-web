<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';

  import { useToast } from 'primevue/usetoast';
  import Header from '~/components/Header.vue';
  import { notifyError, notifySuccess } from '~/helper';
  import { StudentService, ExamService, UserService } from '~/services';
  import type {
    ISubmitInterviewPayload,
    IUser,
    IUserAwaitingInterviewItem,
    IExamSession,
  } from '~/interfaces';
  import { STATUS_CODE } from '~/constants';
  import { buildErrorMessage } from '~/utils';

  const toast = useToast();

  const comment = ref('');
  const knowledgeScore = ref(25);
  const attitudeScore = ref(25);

  const usersAwaitingInterview = ref<IUserAwaitingInterviewItem[]>([]);
  const selectedStudent = ref<IUserAwaitingInterviewItem | null>(null);

  const interviewee = ref<IUser | null>(null);

  const intervieweeExamSession = ref<IExamSession[]>([]);

  const interviewers = ref<IUser[]>([]);
  const selectedInterviewer = ref<IUser | null>(null);

  async function loadInterviewees() {
    try {
      const { payload } = await StudentService.getUsersAwaitingInterview();
      usersAwaitingInterview.value = payload;
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Lấy danh sách sinh viên chờ phỏng vấn'
      );
      notifyError(toast, errorMessage);
    }
  }

  async function loadInterviewers() {
    try {
      const { payload } = await UserService.getUsers({
        role: 'I',
        fields: 'fullName',
        limit: 1000,
      });

      interviewers.value = payload.data;
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Lấy danh sách người thực hiện phỏng vấn'
      );
      notifyError(toast, errorMessage);
    }
  }

  const endInterviewHandle = async () => {
    const data: ISubmitInterviewPayload = {
      interviewerId: selectedInterviewer.value?._id as string,
      knowledgeScore: knowledgeScore.value,
      attitudeScore: attitudeScore.value.toString(),
      interviewNotes: comment.value,
      otherNotes: comment.value,
      interviewEndTime: new Date().toISOString(),
      examSessionId: intervieweeExamSession.value[0]._id,
    };

    try {
      const response = await ExamService.submitInterview(data);
      if (response.status === STATUS_CODE.SUCCESS) {
        notifySuccess(toast, 'Lưu thông tin phỏng vấn thành công!');

        await loadInterviewees();
        selectedStudent.value = null;
        intervieweeExamSession.value = [];
        interviewee.value = null;
        selectedInterviewer.value = null;
        comment.value = '';
        knowledgeScore.value = 25;
        attitudeScore.value = 25;
      }
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Gửi dữ liệu phỏng vấn thất bại!'
      );
      notifyError(toast, errorMessage);
    }
  };

  watch(selectedStudent, async () => {
    try {
      if (selectedStudent.value) {
        const response = await UserService.getUserById(
          selectedStudent.value.id as string
        );

        interviewee.value = response?.payload;

        const examSessionResponse = await ExamService.getExamSessionByUserId(
          selectedStudent.value.id as string
        );

        intervieweeExamSession.value = examSessionResponse?.payload || [];
      }
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Lấy dữ liệu sinh viên thất bại!'
      );
      notifyError(toast, errorMessage);
    }
  });

  onMounted(() => {
    loadInterviewees();
    loadInterviewers();
  });
</script>

<template>
  <div>
    <Header></Header>
  </div>
  <div class="min-h-screen pt-8 px-[30px] bg-[#f6f7fb]">
    <div class="grid grid-cols-1 grid-rows-1 gap-5 lg:grid-cols-3">
      <!--! Part 1 -->
      <div>
        <h2 class="mb-2 text-lg font-semibold text-center uppercase">
          Thông tin sinh viên
        </h2>
        <div class="w-full h-[1px] mb-1 bg-[#ff9700]"></div>
        <!-- Chọn SV -->
        <div class="flex justify-center card py-7">
          <FloatLabel class="w-full md:w-14rem">
            <Dropdown
              v-model="selectedStudent"
              inputId="dd-city"
              :options="usersAwaitingInterview"
              optionLabel="fullName"
              class="w-full"
              filter
            />
            <label for="dd-city">Sinh viên</label>
          </FloatLabel>
        </div>

        <!-- Thông tin -->
        <div class="w-full h-[1px] mb-1 bg-[#ff9700]"></div>
        <div class="px-6 py-5">
          <!-- Ma sinh vien -->
          <div class="flex items-center pb-3 gap-7">
            <div class="left">
              <Button
                icon="pi pi-code"
                rounded
                outlined
              />
            </div>
            <div class="flex flex-col right">
              <span class="text-lg">{{
                interviewee ? interviewee.studentCode : 'None'
              }}</span>
              <span class="text-sm">Mã sinh viên</span>
            </div>
          </div>

          <!-- Ho ten -->
          <div class="flex items-center pb-3 gap-7">
            <div class="left">
              <Button
                icon="pi pi-user"
                rounded
                outlined
              />
            </div>
            <div class="flex flex-col right">
              <span class="text-lg">{{
                interviewee ? interviewee.fullName : 'None'
              }}</span>
              <span class="text-sm">Họ tên</span>
            </div>
          </div>

          <!-- Lớp -->
          <div class="flex items-center pb-3 gap-7">
            <div class="left">
              <Button
                icon="pi pi-briefcase"
                rounded
                outlined
              />
            </div>
            <div class="flex flex-col right">
              <span class="text-lg">{{
                interviewee ? interviewee.studentClass : 'None'
              }}</span>
              <span class="text-sm">Lớp</span>
            </div>
          </div>

          <!-- Địa chỉ -->
          <div class="flex items-center pb-3 gap-7">
            <div class="left">
              <Button
                icon="pi pi-map-marker"
                rounded
                outlined
              />
            </div>
            <div class="flex flex-col right">
              <span class="text-lg">{{
                interviewee ? interviewee.hometown : 'None'
              }}</span>
              <span class="text-sm">Địa chỉ</span>
            </div>
          </div>

          <!-- Diem bai thi -->
          <div class="flex items-center pb-3 gap-7">
            <div class="left">
              <Button
                icon="pi pi-pencil"
                rounded
                outlined
              />
            </div>
            <div class="flex flex-col right">
              <span class="text-lg">{{
                interviewee ? interviewee.testScore : 'None'
              }}</span>
              <span class="text-sm">Điểm bài test</span>
            </div>
          </div>
        </div>
        <div class="w-full h-[1px] mb-1 bg-[#ff9700]"></div>
      </div>
      <!--! Part 2 -->
      <div>
        <h2 class="mb-2 text-lg font-semibold text-center uppercase">
          Câu hỏi phỏng vấn
        </h2>
        <div class="hidden md:block w-full h-[1px] mb-1 bg-[#ff9700]"></div>
        <!--! Chọn người thực hiện phỏng vấn -->
        <div class="flex justify-center card py-7">
          <FloatLabel class="w-full md:w-14rem">
            <Dropdown
              v-model="selectedInterviewer"
              inputId="dd-city"
              :options="interviewers"
              optionLabel="fullName"
              class="w-full"
              filter
            />
            <label for="dd-city">Người thực hiện phỏng vấn</label>
          </FloatLabel>
        </div>

        <!-- Câu hỏi -->
        <div class="w-full h-[1px] mb-1 bg-[#ff9700]"></div>
        <div class="mb-16 mt-[20px] flex flex-col gap-4">
          <div>
            <span class="text-[#ff9700] font-semibold uppercase"
              >A. Giới thiệu bản thân
            </span>
            <p class="text-justify">
              1. Bạn có thể giới thiệu đôi chút về bản thân không?<br />
              2. Lý do bạn muốn gia nhập câu lạc bộ là gì?<br />
              3. Bạn có sở thích hoặc đam mê gì ngoài việc học và công việc
              không?<br />
              4. Bạn biết đến câu lạc bộ qua đâu?<br />
              5. Bạn đã từng tham gia câu lạc bộ hoặc muốn tham gia câu lạc bộ
              nào chưa? Nếu có, hãy chia sẻ kinh nghiệm của bạn.<br />
              6. Bạn có thể mô tả một ngày bình thường của bạn không?<br />
              7. Bạn nghĩ gì về việc làm việc nhóm và bạn đã từng làm việc nhóm
              trước đây chưa?<br />
              8. Bạn mong muốn đóng góp gì cho câu lạc bộ nếu được chấp nhận?<br />
            </p>
          </div>

          <div>
            <span class="text-[#ff9700] font-semibold uppercase">
              B. Kỹ năng và kinh nghiệm
            </span>
            <p class="text-justify">
              1. Bạn đánh giá kỹ năng hiện tại của bản thân như thế nào?<br />
              2. Bạn đã từng tham gia các hoạt động của câu lạc bộ chúng tôi
              chưa?<br />
              3. Bạn có kinh nghiệm tổ chức sự kiện hoặc tham gia vào việc quản
              lý sự kiện không?<br />
              4. Bạn có kỹ năng nào liên quan đến công nghệ, thiết kế, hoặc
              truyền thông không?<br />
              5. Bạn có thể kể về một lần bạn giải quyết một vấn đề khó khăn
              trong công việc hoặc học tập không?<br />
              6. Bạn có kỹ năng giao tiếp như thế nào?<br />
              7. Bạn có thể kể về một tình huống bạn đã thuyết phục thành công
              ai đó không?<br />
            </p>
          </div>

          <div>
            <span class="text-[#ff9700] font-semibold uppercase"
              >C. Thái độ và mong đợi</span
            >
            <p class="text-justify">
              1. Bạn mong đợi gì từ việc tham gia câu lạc bộ ?<br />
              2. Bạn nghĩ bạn có thể dành bao nhiêu thời gian mỗi tuần cho các
              hoạt động của câu lạc bộ?<br />
              3. Bạn có thể kể về một lần bạn phải đối mặt với mâu thuẫn trong
              nhóm và cách bạn giải quyết nó?<br />
              4. Bạn có sẵn sàng học hỏi và tham gia vào các hoạt động mới mà
              bạn chưa có kinh nghiệm không?<br />
              5. Bạn có khả năng thích ứng với sự thay đổi và tình huống mới như
              thế nào?<br />
              6. Bạn nghĩ gì về việc cân bằng giữa cuộc sống cá nhân và các hoạt
              động của câu lạc bộ?<br />
              7. Bạn mong muốn nhận được hỗ trợ và đào tạo như thế nào từ các
              thành viên kỳ cựu của câu lạc bộ?<br />
              8. Bạn có mục tiêu dài hạn nào liên quan đến việc tham gia câu lạc
              bộ không?<br />
            </p>
          </div>
        </div>
      </div>

      <!--! Part 3 -->
      <div>
        <h2 class="mb-2 text-lg font-semibold text-center uppercase">
          Nhận xét
        </h2>
        <div class="w-full h-[1px] mb-1 bg-[#ff9700]"></div>

        <div class="mt-4 md:mt-0 md:px-6 md:py-5">
          <!-- !Thái độ -->
          <div class="mb-5">
            <div class="mb-2">
              <span>Thái độ</span>
            </div>
            <!-- Slider -->
            <div class="flex justify-center w-full">
              <div class="w-full">
                <InputText
                  :modelValue="`${knowledgeScore}`"
                  class="w-full mb-4"
                  disabled
                />
                <Slider
                  v-model="knowledgeScore"
                  :step="5"
                  class="w-full h-5"
                  :min="0"
                  :max="100"
                />
              </div>
            </div>
          </div>

          <!-- !Kiến thức -->
          <div class="mb-5">
            <div class="mb-2">
              <span>Kiến thức</span>
            </div>
            <div class="flex justify-center w-full">
              <div class="w-full">
                <InputText
                  :modelValue="`${attitudeScore}`"
                  class="w-full mb-4"
                  disabled
                />
                <Slider
                  v-model="attitudeScore"
                  :step="5"
                  class="w-full h-5"
                  :min="0"
                  :max="100"
                />
              </div>
            </div>
          </div>
        </div>

        <!--! NOTE -->
        <div class="flex justify-center mb-8">
          <Textarea
            v-model="comment"
            rows="10"
            cols="42"
            placeholder="Nhận xét:
1. Thái độ:
2. Kiến thức:
3. Câu hỏi tình huống:
4. Lý do trượt/pass:
5. Khác: "
          />
        </div>

        <!-- <div class="w-full h-[1px] mb-1 bg-[#ff9700]"></div> -->
        <div class="flex justify-center mt-4 mb-8 mr-5 md:justify-end">
          <Button
            @click="endInterviewHandle"
            label="Kết thúc phỏng vấn"
            :disabled="
              !selectedStudent ||
              comment.length === 0 ||
              intervieweeExamSession.length === 0 ||
              !intervieweeExamSession[0]._id ||
              !selectedInterviewer
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .rounder-c {
    border-radius: 50px;
  }
</style>
