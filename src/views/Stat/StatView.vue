<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import Chart from 'primevue/chart';
  import { utils, writeFile } from 'xlsx';

  import Header from '~/components/Header.vue';
  import Loading from '../../components/Loading.vue';
  import StatCard from '../../components/StatCard.vue';
  import { STATUS_CODE } from '~/constants';
  import { notifyError, notifySuccess } from '~/helper';
  import { StatService } from '~/services';
  import { buildErrorMessage } from '~/utils';
  import type { IStatData, ILineChartData } from '~/interfaces';

  const toast = useToast();

  const show = ref(false);
  const isLoading = ref(false);

  const statObject = ref<IStatData>({
    websiteViews: 0,
    countUser: 0,
    countUserTested: 0,
    countUserInterviewed: 0,
    countUserPassed: 0,
    users: [],
    usersTested: [],
    usersInterviewed: [],
    usersPassed: [],
    questions: [],
  });

  const barChartData = ref({
    labels: ['Tổng đơn ĐK', 'Đã làm test', 'Đã phỏng vấn', 'Trở thành CTV'],
    datasets: [
      {
        label: 'Số lượng sinh viên',
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA'],
        data: [0, 0, 0, 0],
      },
    ],
  });

  const pieChartData = ref({
    labels: ['Đã làm test', 'Đã phỏng vấn', 'Trở thành CTV', 'Chưa hoàn thành'],
    datasets: [
      {
        backgroundColor: ['#66BB6A', '#FFA726', '#26C6DA', '#EC407A'],
        data: [0, 0, 0, 0],
      },
    ],
  });

  const lineChartData = ref<ILineChartData>({
    labels: [],
    datasets: [],
  });

  const barChartOptions = ref({
    plugins: {
      legend: {
        labels: {
          font: {
            size: 14,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  });

  const pieChartOptions = ref({
    plugins: {
      legend: {
        labels: {
          font: {
            size: 14,
          },
        },
      },
    },
  });

  const lineChartOptions = ref({
    plugins: {
      legend: {
        labels: {
          font: {
            size: 14,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  });

  const callAPI = async (): Promise<void> => {
    try {
      show.value = true;
      isLoading.value = true;

      const { status, payload } = await StatService.getStatInfo();

      if (status === STATUS_CODE.SUCCESS && payload) {
        statObject.value = payload;

        // Cập nhật dữ liệu biểu đồ cột từ dữ liệu API
        barChartData.value.datasets[0].data = [
          payload.countUser,
          payload.countUserTested,
          payload.countUserInterviewed,
          payload.countUserPassed,
        ];

        // Cập nhật dữ liệu biểu đồ tròn từ dữ liệu API
        const notComplete = payload.countUser - payload.countUserTested;
        pieChartData.value.datasets[0].data = [
          payload.countUserTested,
          payload.countUserInterviewed,
          payload.countUserPassed,
          notComplete > 0 ? notComplete : 0,
        ];

        // Cập nhật dữ liệu biểu đồ đường từ API
        if (payload.lineChartData) {
          lineChartData.value = {
            labels: payload.lineChartData.labels || [],
            datasets: payload.lineChartData.datasets || [],
          };
        }

        notifySuccess(toast, 'Tải dữ liệu thống kê thành công');
      } else {
        resetToDefault();
        notifyError(toast, 'Không thể tải dữ liệu thống kê');
      }
    } catch (error) {
      const errorMessage = buildErrorMessage(
        error,
        'Có lỗi xảy ra khi tải dữ liệu thống kê'
      );

      notifyError(toast, errorMessage);
      resetToDefault();
    } finally {
      isLoading.value = false;
    }
  };

  const resetToDefault = (): void => {
    statObject.value = {
      websiteViews: 0,
      countUser: 0,
      countUserTested: 0,
      countUserInterviewed: 0,
      countUserPassed: 0,
      users: [],
      usersTested: [],
      usersInterviewed: [],
      usersPassed: [],
      questions: [],
    };

    barChartData.value.datasets[0].data = [0, 0, 0, 0];
    pieChartData.value.datasets[0].data = [0, 0, 0, 0];
    lineChartData.value = {
      labels: [],
      datasets: [],
    };
  };

  // Mapping tiêu đề cột cho từng loại dữ liệu
  const createColumnMapping = (dataType: string) => {
    const baseUserMapping = {
      _id: 'Mã ID',
      username: 'Tên đăng nhập',
      fullName: 'Họ và tên',
      studentCode: 'Mã sinh viên',
      studentClass: 'Lớp',
      phoneNumber: 'Số điện thoại',
      email: 'Email',
      accountStatus: 'Trạng thái tài khoản',
      createdAt: 'Ngày tạo',
    };

    const testedUserMapping = {
      ...baseUserMapping,
      testScore: 'Điểm test',
      testPercentage: 'Phần trăm đúng (%)',
    };

    const interviewedUserMapping = {
      ...testedUserMapping,
      interviewKnowledgeScore: 'Điểm kiến thức PV',
      interviewAttitudeScore: 'Điểm thái độ PV',
      finalScore: 'Điểm tổng',
      interviewNotes: 'Nhận xét PV',
      interviewEndTime: 'Thời gian kết thúc PV',
    };

    const questionMapping = {
      _id: 'Mã câu hỏi',
      content: 'Nội dung câu hỏi',
      level: 'Mức độ',
      questionType: 'Loại câu hỏi',
      correctAnswer: 'Đáp án đúng',
      createdAt: 'Ngày tạo',
    };

    switch (dataType) {
      case 'users':
        return baseUserMapping;
      case 'usersTested':
        return testedUserMapping;
      case 'usersInterviewed':
        return interviewedUserMapping;
      case 'usersPassed':
        return interviewedUserMapping; // Giả sử cùng cấu trúc với interviewed
      case 'questions':
        return questionMapping;
      default:
        return {};
    }
  };

  const exportExcelFile = (
    workbookName: string,
    worksheetName: string,
    objectArray: any[],
    columnMapping?: { [key: string]: string }
  ) => {
    const workbook = utils.book_new();

    let processedData = objectArray;

    // Nếu có mapping, chuyển đổi headers
    if (columnMapping && objectArray.length > 0) {
      processedData = objectArray.map((item) => {
        const mappedItem: any = {};
        Object.keys(item).forEach((key) => {
          const mappedKey = columnMapping[key] || key;
          mappedItem[mappedKey] = item[key];
        });
        return mappedItem;
      });
    }

    const worksheet = utils.json_to_sheet(processedData);
    utils.book_append_sheet(workbook, worksheet, worksheetName);

    writeFile(workbook, workbookName);
  };

  const exportHandle = (fileName: string, caseType: number): void => {
    switch (caseType) {
      case 1:
        exportExcelFile(`${fileName}.xlsx`, 'Sheet1', [statObject.value]);
        break;
      case 2:
        exportExcelFile(
          `${fileName}.xlsx`,
          'Questions',
          statObject.value.questions || [],
          createColumnMapping('questions')
        );
        break;
      case 3:
        exportExcelFile(
          `${fileName}.xlsx`,
          'Tất cả user',
          statObject.value.users,
          createColumnMapping('users')
        );
        break;
      case 4:
        exportExcelFile(
          `${fileName}.xlsx`,
          'Đã làm test',
          statObject.value.usersTested,
          createColumnMapping('usersTested')
        );
        break;
      case 5:
        exportExcelFile(
          `${fileName}.xlsx`,
          'Đã phỏng vấn',
          statObject.value.usersInterviewed,
          createColumnMapping('usersInterviewed')
        );
        break;
      case 6:
        exportExcelFile(
          `${fileName}.xlsx`,
          'Cộng tác viên mới',
          statObject.value.usersPassed,
          createColumnMapping('usersPassed')
        );
        break;
    }
  };

  onMounted(callAPI);
</script>

<template>
  <Loading v-if="isLoading"></Loading>
  <Header></Header>

  <div class="p-5 lg:px-16 bg-[#fefefe]">
    <p class="mb-5 text-2xl font-bold">Thông tin tổng quan</p>
    <!-- Thẻ thống kê -->
    <transition
      enter-active-class="animate__animated animate__fadeInDown"
      leave-active-class="animate__animated animate__fadeOut"
    >
      <div
        v-if="show"
        class="grid grid-cols-1 gap-5 mb-8 md:grid-cols-2 lg:grid-cols-4"
      >
        <!-- Các StatCard -->
        <StatCard
          :title="'Số lượng đơn ĐK'"
          :count="statObject?.countUser || 0"
        ></StatCard>
        <StatCard
          :title="'Sinh viên làm bài test'"
          :count="statObject?.countUserTested || 0"
        ></StatCard>
        <StatCard
          :title="'Sinh viên tham gia PV'"
          :count="statObject?.countUserInterviewed || 0"
        ></StatCard>
        <StatCard
          :title="'Cộng tác viên mới'"
          :count="statObject?.countUserPassed || 0"
        ></StatCard>
      </div>
    </transition>

    <!-- Biểu đồ thống kê -->
    <div class="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
      <div class="p-5 bg-white rounded-lg shadow-md">
        <h3 class="mb-4 text-xl font-bold text-gray-800">
          Thống kê tuyển dụng
        </h3>
        <Chart
          type="bar"
          :data="barChartData"
          :options="barChartOptions"
          class="h-80"
        />
      </div>
      <div class="p-5 bg-white rounded-lg shadow-md">
        <h3 class="mb-4 text-xl font-bold text-gray-800">
          Tỷ lệ hoàn thành quy trình
        </h3>
        <Chart
          type="pie"
          :data="pieChartData"
          :options="pieChartOptions"
          class="h-80"
        />
      </div>
    </div>

    <div class="p-5 mb-8 bg-white rounded-lg shadow-md">
      <h3 class="mb-4 text-xl font-bold text-gray-800">
        Xu hướng đăng ký theo thời gian
      </h3>
      <Chart
        type="line"
        :data="lineChartData"
        :options="lineChartOptions"
      />
    </div>

    <!-- Xuất danh sách -->
    <div class="p-5 bg-white rounded-lg shadow-md">
      <p class="mb-4 text-xl font-bold text-gray-800">Xuất danh sách báo cáo</p>
      <transition
        enter-active-class="animate__animated animate__fadeIn"
        leave-active-class="animate__animated animate__fadeOut"
      >
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
          v-if="show"
        >
          <div class="items-center justify-start hidden gap-5">
            <span>Thống kê cơ bản</span>
            <Button
              @click="exportHandle('Thống kê cơ bản', 1)"
              class="p-button-primary"
              >Export Excel</Button
            >
          </div>

          <div class="items-center justify-start hidden gap-5">
            <span>Danh sách câu hỏi</span>
            <Button
              @click="exportHandle('Danh sách câu hỏi', 2)"
              class="p-button-primary"
              >Export Excel</Button
            >
          </div>

          <div
            class="flex items-center justify-between p-3 transition-all rounded-md bg-gray-50 hover:bg-gray-100"
          >
            <span class="font-medium">Tất cả tài khoản</span>
            <Button
              @click="exportHandle('DS tất cả tài khoản', 3)"
              class="p-button-primary p-button-sm"
              >Export Excel</Button
            >
          </div>

          <div
            class="flex items-center justify-between p-3 transition-all rounded-md bg-gray-50 hover:bg-gray-100"
          >
            <span class="font-medium">Sinh viên đã làm bài test</span>
            <Button
              @click="exportHandle('Danh sách người dùng đã làm bài test', 4)"
              class="p-button-primary p-button-sm"
              >Export Excel</Button
            >
          </div>

          <div
            class="flex items-center justify-between p-3 transition-all rounded-md bg-gray-50 hover:bg-gray-100"
          >
            <span class="font-medium">Sinh viên đã được phỏng vấn</span>
            <Button
              @click="exportHandle('Danh sách người dùng đã được phỏng vấn', 5)"
              class="p-button-primary p-button-sm"
              >Export Excel</Button
            >
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
  .p-button {
    font-weight: 500;
  }
</style>
