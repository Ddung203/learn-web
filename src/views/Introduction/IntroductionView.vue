<script setup lang="ts">
  import { ref } from 'vue';
  import { useToast } from 'primevue/usetoast';

  import GoToChatbot from '~/components/GoToChatbot.vue';
  import HeaderThird from '~/components/HeaderThird.vue';
  import ScrollToTop from '~/components/ScrollToTop.vue';
  import { notifyError, notifySuccess } from '~/helper';
  import { FeedbackService } from '~/services/feedback.service';
  import { STATUS_CODE } from '~/constants';
  import { AxiosError } from 'axios';

  const toast = useToast();

  const curYear = new Date().getFullYear();

  function buildUrl(path: string) {
    const origin = window.location.origin;
    return `${origin}${path}`;
  }

  const joinUsUrl = buildUrl('/previous-registration');

  const senderName = ref('');
  const senderEmail = ref('');
  const senderSubject = ref('');
  const senderMessage = ref('');
  const mainActivities = [
    {
      title: 'Tech Support',
      description:
        'Tech Support thường niên với nhiều hạng mục nhằm hỗ trợ những vấn đề về máy tính cho giảng viên sinh viên trong toàn trường.',
    },
    {
      title: 'Bảo trì, cài đặt phòng máy ở khoa CNTT',
      description:
        'Giúp cho những phòng máy cập nhật kịp thời những phần mềm mới nhất, hoạt động mượt mà nhất cho những giờ thực hành trên lớp.',
    },
    {
      title: 'Tech news',
      description:
        'Giúp tất cả mọi người đều được cập nhật những thông tin công nghệ nóng hổi, giúp bạn nắm bắt được xu thế công nghệ hiện đại.',
    },
    {
      title: 'Họp đội hàng tuần, tổ chức sự kiện hàng năm,...',
      description:
        'Các hoạt động giúp gắn kết các thành viên, cộng tác viên trong câu lạc bộ.',
    },
    {
      title: 'Tổ chức các lớp học, nhóm học tập',
      description:
        'Giúp các thành viên, cộng tác viên của CLB trau dồi kỹ năng của bản thân, trao đổi tài liệu học tập,...',
    },
    {
      title: 'Tuyển cộng tác viên khóa mới',
      description:
        'Đây là hoạt động hàng năm của CLB, tổ chức tại cả 2 cơ sở, dành cho tất cả sinh viên HaUI có đam mê',
    },
  ];

  const leaderInfo = {
    name: 'Anh Phạm Dương Việt Dũng',
    position: 'Chủ nhiệm',
    image:
      'https://firebasestorage.googleapis.com/v0/b/web-dat-ve-xe.firebasestorage.app/o/cdn%2FDung_CN.jpg?alt=media&token=bd28921e-413f-438c-b3a2-18b007b153dd',
    quote: 'Bản lĩnh tiên phong',
  };

  const teamMembers = [
    {
      name: 'Anh Vũ Việt Anh',
      position: 'Phó chủ nhiệm',
      image:
        'https://firebasestorage.googleapis.com/v0/b/web-dat-ve-xe.firebasestorage.app/o/cdn%2FViet_Anh_PCN.jpg?alt=media&token=aae3f360-9eab-4a88-95b7-4b5b571e0220',
    },
    {
      name: 'Anh Vũ Đình An',
      position: 'Phó chủ nhiệm',
      image:
        'https://firebasestorage.googleapis.com/v0/b/web-dat-ve-xe.firebasestorage.app/o/cdn%2FAn_PCN.jpg?alt=media&token=7fecec7c-34c6-47bb-bcb8-6fee8b7580aa',
    },
    {
      name: 'Chị Nguyễn Thị Ngọc Anh',
      position: 'Ủy viên BCN',
      image:
        'https://firebasestorage.googleapis.com/v0/b/web-dat-ve-xe.firebasestorage.app/o/cdn%2FNgoc_Anh_UV.jpg?alt=media&token=00988449-9a33-489c-9781-4733debeae7f',
    },
    {
      name: 'Anh Nguyễn Hữu Bình Minh',
      position: 'Ủy viên BCN',
      image:
        'https://firebasestorage.googleapis.com/v0/b/web-dat-ve-xe.firebasestorage.app/o/cdn%2FBinh_Minh_UV.jpg?alt=media&token=56780bf3-0d9c-4214-bebe-525e7f792154',
    },
  ];

  const galleryImages = [
    {
      src: 'https://firebasestorage.googleapis.com/v0/b/upload-imgs-52a0d.appspot.com/o/gallery%2Fkien_toan.jpg?alt=media&token=7f852fd6-8ad8-4d3b-843e-7981e8eb5d26',
      alt: 'gallery-1',
    },
    {
      src: 'https://firebasestorage.googleapis.com/v0/b/web-dat-ve-xe.firebasestorage.app/o/cdn%2Fg2_2025.jpg?alt=media&token=7970cef8-d810-467b-ae64-9db02caadc12',
      alt: 'gallery-2',
    },
    {
      src: 'https://firebasestorage.googleapis.com/v0/b/upload-imgs-52a0d.appspot.com/o/gallery%2Fg3.jpg?alt=media&token=4b3f879e-5eb1-4a53-a49d-c4266eec5b4f',
      alt: 'gallery-3',
    },
    {
      src: 'https://firebasestorage.googleapis.com/v0/b/upload-imgs-52a0d.appspot.com/o/gallery%2Fg4.jpg?alt=media&token=1708cf13-4b13-44ef-bfbc-b0b7b1687a47',
      alt: 'gallery-4',
    },
    {
      src: 'https://firebasestorage.googleapis.com/v0/b/upload-imgs-52a0d.appspot.com/o/gallery%2Fg6.jpg?alt=media&token=6c340a74-2e7a-4be3-8229-841cb009d92e',
      alt: 'gallery-5',
    },
    {
      src: 'https://firebasestorage.googleapis.com/v0/b/upload-imgs-52a0d.appspot.com/o/gallery%2Fg7.webp?alt=media&token=51d2336d-2721-4b64-a376-6ae8f590ebf5',
      alt: 'gallery-6',
    },
    {
      src: 'https://firebasestorage.googleapis.com/v0/b/upload-imgs-52a0d.appspot.com/o/gallery%2Fg8.jpg?alt=media&token=faefb6dc-1ac1-4cb0-b297-939e284d9f52',
      alt: 'gallery-7',
    },
    {
      src: 'https://firebasestorage.googleapis.com/v0/b/upload-imgs-52a0d.appspot.com/o/gallery%2Fg9.jpg?alt=media&token=6a95714c-0431-4387-8f4b-3d3a5ec5ad44',
      alt: 'gallery-8',
    },
  ];

  const contactInfo = [
    {
      icon: 'fa-solid fa-location-dot',
      label: 'Địa chỉ:',
      content:
        'Văn phòng Đoàn Thanh Niên, Tầng 13, nhà A1, Trường Đại Học Công nghiệp Hà Nội',
    },
    {
      icon: 'fa-solid fa-envelope',
      label: 'Email:',
      content: 'it.supporter@fit-haui.edu.vn',
    },
    {
      icon: 'fa-solid fa-phone',
      label: 'Hotline:',
      content: '0337 616 423',
    },
  ];

  const departments = [
    {
      icon: 'fa-solid fa-fingerprint',
      title: 'BAN KỸ THUẬT',
      description:
        'Ban kỹ thuật với mục đích hỗ trợ kỹ thuật nói chung và giúp đỡ các bạn sinh viên vấn đề liên quan đến máy tính nói riêng như:<br />🧰 Cài đặt phần mềm <br />💻 Tư vấn máy tính, laptop <br />🧹 Vệ sinh, nâng cấp, bảo trì máy tính <br />🔧 Hỗ trợ bảo trì, cài đặt phòng máy của khoa <br />📡 Hỗ trợ kỹ thuật trong các chương trình, sự kiện của khoa CNTT',
    },
    {
      icon: 'fa-solid fa-gift',
      title: 'BAN TRUYỀN THÔNG',
      description:
        'Ban truyền thông: Với mục đích truyền thông đến bạn các tin tức về công nghệ mới nhất, các hoạt động, sự kiện của CLB Hoạt động thường niên: <br />📡Mỗi tuần: bài news theo hình thức video ngắn <br />🔥Trong tuần: theo dõi, cập nhật tình hình trong ngày để lên hot new <br />💡Trong tháng: Chia sẻ kiến thức, kinh nghiệm về phần cứng, kiến thức về công nghệ, code <br />🥳Bài sinh nhật thành viên',
    },
    {
      icon: 'fa-solid fa-atom',
      title: 'BAN TỔ CHỨC SỰ KIỆN',
      description:
        'Ban TCSK với mục đích hậu cần, lên kế hoạch, sắp xếp các hoạt động học tập cũng như vui chơi giải trí của câu lạc bộ, tổ chức các sự kiện, các chương trình. Hoạt động thường niên: <br />🎂Tổ chức sinh nhật thường niên cho các thành viên <br />⚽️Hoạt động vui chơi giải trí (bóng rổ, bóng đá, cầu lông) <br />✏️Lên kế hoạch cho hoạt động học tập<br /> 🛠️Chuẩn bị hậu cần các sự kiện <br />🖥️Theo dõi và hướng dẫn các bạn tham dự các cuộc thi phần cứng (Expert Challenges, IT Festival)',
    },
  ];

  const navigationLinks = [
    { href: '#', text: 'Home' },
    { href: '#services', text: 'Hoạt động' },
    { href: '#slider', text: 'Ban phụ trách' },
    { href: '#gallery', text: 'Thư viện ảnh' },
    { href: '#contact', text: 'Liên hệ' },
  ];

  const mainActivitiesFooter = [
    'Tech Support',
    'Bảo trì, cài đặt phòng máy ở khoa CNTT',
    'Tech news',
    'Họp đội',
    'Tổ chức lớp học',
    'Tuyển cộng tác viên',
  ];

  const isFormValid = () => {
    if (!senderName.value.trim()) {
      notifyError(toast, 'Vui lòng nhập tên');
      return false;
    }
    if (!senderEmail.value.trim()) {
      notifyError(toast, 'Vui lòng nhập email');
      return false;
    }
    if (!senderSubject.value.trim()) {
      notifyError(toast, 'Vui lòng nhập tiêu đề');
      return false;
    }
    if (!senderMessage.value.trim()) {
      notifyError(toast, 'Vui lòng nhập tin nhắn');
      return false;
    }
    return true;
  };

  const submitFormHandler = async () => {
    if (!isFormValid()) return;

    if (localStorage.getItem('nextTime')) {
      const nextTime = Number(localStorage.getItem('nextTime'));
      const currentTime = new Date().getTime();

      if (currentTime < nextTime) {
        notifyError(
          toast,
          'Vui lòng đợi 10 phút trước khi gửi lời nhắn tiếp theo!'
        );
        return;
      } else {
        localStorage.removeItem('nextTime');
      }
    }

    try {
      let data = {
        fullName: senderName.value,
        email: senderEmail.value,
        subject: senderSubject.value || 'Feedback',
        message: senderMessage.value,
      };

      const response = await FeedbackService.sendFeedback(data);

      if (response.status === STATUS_CODE.SUCCESS) {
        notifySuccess(toast, 'Cảm ơn bạn đã gửi lời nhắn cho chúng mình!');

        senderName.value = '';
        senderEmail.value = '';
        senderSubject.value = '';
        senderMessage.value = '';

        const now = new Date();
        now.setMinutes(now.getMinutes() + 10);
        const timestamp = now.getTime();

        localStorage.setItem('nextTime', `${timestamp}`);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        notifyError(toast, error.response?.data?.message);
      }
    }
  };
</script>

<template>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
    integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  />
  <HeaderThird></HeaderThird>
  <div
    v-once
    class="w-full"
  >
    <div class="w-full min-h-screen">
      <div
        class="flex w-full bg-fixed bg-black bg-opacity-50 bg-cover bg-blend-darken"
        style="
          background-image: url('https://firebasestorage.googleapis.com/v0/b/upload-images-42481.appspot.com/o/cdn%2Fanh_nen.jpg?alt=media&token=1fb51a19-cc31-4aa0-951f-3db12c23754b');
        "
      >
        <div
          class="lg:flex lg:justify-between gap-8 lg:gap-16 lg:items-center w-full min-h-[530px] h-auto mt-10 lg:my-10 lg:mx-20 py-8 lg:py-0"
        >
          <div class="px-6 lg:px-0 lg:w-1/2">
            <p
              class="text-white font-bold text-3xl md:text-4xl leading-tight lg:leading-[50px] uppercase"
            >
              Câu lạc bộ Hỗ trợ kỹ thuật <br />
              IT Supporter - HaUI
            </p>

            <p
              class="mt-4 text-base font-medium text-justify text-white md:text-lg"
            >
              Được thành lập vào ngày <strong>29/08/2014</strong>, trải qua
              chặng đường
              <span class="">11</span>
              năm hình thành và phát triển, CLB đã không ngừng lớn mạnh và khẳng
              định vị thế của mình trong Trường CNTT và TT - Trường Đại học Công
              nghiệp Hà Nội. Với sứ mệnh hỗ trợ kỹ thuật và phát triển kỹ năng
              công nghệ cho các thành viên, cộng tác viên. CLB đã gắn kết những
              bạn trẻ đam mê kỹ thuật, đồng hành cùng nhau trong hành trình học
              tập và rèn luyện, nhằm khẳng định và tôn vinh công lao to lớn của
              các thế hệ anh chị đi trước, truyền lại niềm tin yêu, tự hào và
              lửa nhiệt huyết đến các thế hệ sau với phương châm mới - "BẢN LĨNH
              TIÊN PHONG"
            </p>
            <div>
              <router-link to="previous-registration">
                <Button
                  class="w-full mx-auto mt-5 md:mt-16 lg:mt-6 md:w-1/5"
                  label="Tham gia"
                  severity="info"
                />
              </router-link>
            </div>
          </div>

          <div
            class="hidden lg:w-1/2 lg:flex lg:justify-end lg:items-center"
          ></div>
        </div>
      </div>

      <!-- Departments Section -->
      <div class="pb-16 lg:py-16">
        <div class="flex flex-col gap-8 px-6 lg:gap-36 lg:flex-row lg:px-20">
          <div class="flex flex-col items-center justify-start lg:w-2/5">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/upload-images-42481.appspot.com/o/cdn%2Fb1.jpg?alt=media&token=4b0d3818-d308-44a1-a0ef-083cad4fbad0"
              alt=""
              class="w-full h-auto rounded-lg shadow-sm"
            />
          </div>
          <div class="flex flex-col items-start justify-start lg:w-3/5">
            <p
              class="text-[#0f394c] text-2xl md:text-3xl font-bold leading-tight mb-6 text-center lg:text-left uppercase"
            >
              Các ban hoạt động
            </p>

            <template
              v-for="(department, index) in departments"
              :key="index"
            >
              <div class="w-full mt-10 grid grid-cols-[66px_auto]">
                <div
                  class="flex items-center justify-center flex-shrink-0 w-16 h-16 overflow-hidden transition-all duration-300 border-2 border-blue-300 rounded-full hover:bg-blue-400 group"
                >
                  <i
                    :class="department.icon"
                    class="text-2xl leading-8 text-blue-400 transition-all duration-200 group-hover:text-white"
                  ></i>
                </div>
                <div class="ml-4 lg:ml-8">
                  <p class="text-xl font-bold text-gray-800">
                    {{ department.title }}
                  </p>
                  <p
                    class="text-[#0f394c] text-base leading-6"
                    v-html="department.description"
                  ></p>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!-- Achieved -->

      <!-- SERVICES -->
      <div
        id="services"
        class="bg-[#f4fbfe]"
      >
        <div
          class="flex flex-col items-center justify-center w-full px-6 py-16 pb-5 lg:px-20"
        >
          <h2
            class="text-[#0f394c] text-3xl font-bold leading-[38.4px] mb-0 text-center uppercase"
          >
            Hoạt động chính
          </h2>
          <p
            class="max-w-4xl px-0 mt-5 leading-6 text-justify text-gray-600 lg:text-center lg:px-5"
          >
            CLB Hỗ trợ kỹ thuật IT Supporter có nhiều hoạt động nhằm thúc đẩy sự
            phát triển kỹ năng của các thành viên và đem đến cho tất cả các bạn
            sinh viên một địa chỉ tin cậy để giao phó sự tin tưởng của mình
          </p>
        </div>

        <div class="w-full bg-[#f4fbfe] px-5 pb-8 lg:px-20 lg:pb-16">
          <div
            class="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <template
              v-for="(item, index) in mainActivities"
              :key="index"
            >
              <div
                class="transition-shadow duration-300 bg-white shadow-md rounded-xl hover:shadow-lg"
              >
                <div class="flex flex-col items-start justify-center gap-3 p-6">
                  <span class="text-sm font-semibold text-gray-800 uppercase">{{
                    item.title
                  }}</span>
                  <p class="text-sm leading-relaxed text-gray-600">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!-- PORTFOLIO -->

      <!-- Chu nhiem -->
      <div
        id="slider"
        class="relative flex flex-col items-center justify-center py-20 leading-6 text-gray-600 bg-fixed bg-center bg-cover"
        style="
          background-image: url('https://img.freepik.com/free-vector/white-technology-background_23-2148403783.jpg?t=st=1725045246~exp=1725048846~hmac=4beb112d67a89c5fb0dba97a35c10491c058cc142e8303b804a914f2a83aece6&w=1060');
        "
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-slate-900 bg-opacity-90"></div>

        <div
          class="relative z-10 flex flex-col items-center justify-center py-20 leading-6 text-gray-600 bg-center bg-cover"
        >
          <div class="relative flex flex-col items-center justify-center">
            <div
              class="overflow-hidden border-4 border-black rounded-full w-80 h-80 border-opacity-30"
            >
              <img
                :src="leaderInfo.image"
                alt="ChuNhiem"
                loading="lazy"
                class="object-cover w-full h-full"
              />
            </div>
            <h3 class="mt-2 mb-1 text-xl font-bold text-white">
              {{ leaderInfo.name }}
            </h3>
            <h4 class="mb-4 text-sm text-gray-300">
              {{ leaderInfo.position }}
            </h4>
          </div>

          <div class="flex max-w-4xl">
            <p class="relative text-center">
              <span class="leading-6 text-white">"{{ leaderInfo.quote }}"</span>
            </p>
          </div>
        </div>
      </div>
      <!-- TEAM -->
      <div class="bg-[#f4fbfe] pb-16">
        <div
          class="flex flex-col items-center justify-center w-full px-6 py-16 pb-5 lg:px-20"
        >
          <h2
            class="text-[#0f394c] text-3xl font-bold leading-[38.4px] mb-0 text-center uppercase"
          >
            THÀNH VIÊN BAN PHỤ TRÁCH
          </h2>
          <p class="leading-6 text-gray-600">Các "sếp" 😁</p>
        </div>

        <!-- BPT -->
        <div
          class="grid max-w-full grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:px-20 lg:grid-cols-4"
        >
          <template
            v-for="(member, index) in teamMembers"
            :key="index"
          >
            <div
              class="relative overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-sm hover:shadow-lg group"
            >
              <img
                :src="member.image"
                :alt="member.name"
                loading="lazy"
                class="block object-cover w-full aspect-square"
              />
              <div class="p-5">
                <h3 class="text-[#0f394c] font-semibold text-base">
                  {{ member.name }}
                </h3>
                <p class="pt-1 text-sm opacity-60">{{ member.position }}</p>
              </div>
              <!-- Show Link Icon -->
              <div
                class="absolute z-10 hidden w-full -translate-y-1/2 top-1/2 group-hover:flex group-hover:justify-center group-hover:items-center"
              >
                <ul class="flex">
                  <!-- Social icons would go here if needed -->
                </ul>
              </div>
            </div>
          </template>
        </div>
      </div>
      <!-- GALLERY -->
      <div
        id="gallery"
        class="px-6 mb-16 lg:px-20"
      >
        <div
          class="flex flex-col items-center justify-center w-full px-0 py-16 pb-5"
        >
          <h2
            class="text-[#0f394c] text-3xl font-bold leading-[38.4px] mb-0 text-center uppercase"
          >
            Thư viện ảnh
          </h2>
          <p class="leading-6 text-gray-600">
            Một số hình ảnh kỉ niệm của chúng mình
          </p>
        </div>

        <div
          class="grid grid-cols-1 gap-4 px-0 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2"
        >
          <template
            v-for="(image, index) in galleryImages"
            :key="index"
          >
            <div
              class="overflow-hidden transition-all duration-300 rounded-lg shadow-sm hover:shadow-md"
            >
              <a
                :href="image.src"
                target="_blank"
              >
                <img
                  :src="image.src"
                  :alt="image.alt"
                  loading="lazy"
                  class="object-cover w-full h-48 transition-transform duration-300 lg:h-64 hover:scale-110"
                />
              </a>
            </div>
          </template>
        </div>
      </div>
      <!-- contact -->
      <div id="contact">
        <div
          class="flex flex-col items-center justify-center w-full px-6 py-16 pb-5 lg:px-20"
        >
          <h2
            class="text-[#0f394c] text-3xl font-bold leading-[38.4px] mb-0 text-center uppercase"
          >
            Liên hệ
          </h2>
          <p class="leading-6 text-gray-600">Để lại lời nhắn cho chúng mình!</p>
        </div>

        <div
          class="flex flex-col items-center justify-center px-6 pt-8 pb-0 lg:px-20"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.470791359761!2d105.7324846750253!3d21.053850786916833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31345457e292d5bf%3A0x20ac91c94d74439a!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBIw6AgTuG7mWk!5e0!3m2!1svi!2s!4v1725046736642!5m2!1svi!2s"
            width="1296"
            height="270"
            style="border: 0"
            allowfullscreen="true"
            title="Iframe Map"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            class="w-full max-w-full"
          ></iframe>
          <div class="w-full grid lg:grid-cols-[1fr_2fr] mb-16 gap-8 mt-8">
            <div>
              <template
                v-for="(contact, index) in contactInfo"
                :key="index"
              >
                <div
                  class="w-full my-8 grid grid-cols-[60px_auto] items-center"
                >
                  <div
                    class="flex items-center justify-center w-12 h-12 overflow-hidden transition-all duration-300 rounded-lg bg-blue-50 hover:bg-blue-400 group"
                  >
                    <i
                      :class="contact.icon"
                      class="text-xl text-blue-400 transition-all duration-300 group-hover:text-white"
                    ></i>
                  </div>
                  <div class="ml-4">
                    <p class="mb-1 text-lg font-semibold text-gray-800">
                      {{ contact.label }}
                    </p>
                    <p class="text-sm text-blue-600">{{ contact.content }}</p>
                  </div>
                </div>
              </template>
            </div>
            <div>
              <form
                autocomplete="off"
                @submit.prevent="submitFormHandler"
                class="flex flex-col justify-center w-full mt-6 lg:mt-10"
              >
                <div class="grid lg:grid-cols-[1fr_16px_1fr] grid-cols-1 gap-0">
                  <input
                    type="text"
                    placeholder="Your Name"
                    v-model="senderName"
                    maxlength="30"
                    class="px-4 py-3 mb-4 text-sm transition-all duration-200 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <div class="hidden lg:block"></div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    v-model="senderEmail"
                    maxlength="50"
                    class="px-4 py-3 mb-4 text-sm transition-all duration-200 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  maxlength="200"
                  v-model="senderSubject"
                  class="px-4 py-3 mb-4 text-sm transition-all duration-200 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <textarea
                  name="mess"
                  rows="6"
                  placeholder="Message"
                  maxlength="1000"
                  v-model="senderMessage"
                  class="block px-4 py-3 mb-6 text-sm transition-all duration-200 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                ></textarea>
                <button
                  type="submit"
                  class="self-start w-full px-8 py-3 text-base font-medium text-white transition-all duration-200 bg-blue-500 rounded-lg lg:w-auto hover:bg-blue-600"
                >
                  <span>Gửi lời nhắn</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <section class="py-12 lg:py-16 bg-[#f0f9fd]">
        <div class="container px-6 mx-auto lg:px-20">
          <div class="max-w-3xl mx-auto text-center">
            <h2
              class="text-2xl lg:text-3xl text-[#0f394c] font-bold uppercase mb-4"
            >
              Tham gia cùng chúng mình
            </h2>
            <p class="mb-8 text-gray-600">Đăng ký trở thành cộng tác viên</p>
            <div class="flex flex-col max-w-lg gap-0 mx-auto sm:flex-row">
              <input
                class="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-l-lg outline-none sm:rounded-r-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                type="text"
                :value="joinUsUrl"
                readonly
              />
              <a
                target="_blank"
                :href="joinUsUrl"
                class="px-6 py-3 mt-4 font-medium text-center text-white transition-all duration-200 bg-blue-500 rounded-lg lg:mt-0 lg:rounded-r-lg lg:rounded-l-none hover:bg-blue-600"
              >
                Đăng ký
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
    <footer class="w-full bg-white">
      <div class="container px-6 py-16 mx-auto lg:px-20">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div class="lg:col-span-1">
            <img
              class="block h-12 mb-4"
              src="https://firebasestorage.googleapis.com/v0/b/upload-imgs-52a0d.appspot.com/o/logos%2Flogofull.png?alt=media&token=ab3380f2-7913-4f93-b996-150248385736"
              alt="Logo"
              loading="lazy"
            />
            <p class="leading-relaxed text-gray-600">
              Văn phòng Đoàn Thanh Niên, <br />Tầng 13, nhà A1, Trường Đại Học
              Công nghiệp Hà Nội <br /><br />
              <strong>Phone:</strong> 0337 616 423 (Anh Phạm Dương Việt Dũng -
              Chủ nhiệm)<br />
              <strong>Email:</strong> it.supporter@fit-haui.edu.vn<br />
            </p>
          </div>

          <div>
            <h4 class="mb-6 font-semibold text-gray-800">Liên kết</h4>
            <ul class="space-y-3">
              <template
                v-for="(link, index) in navigationLinks"
                :key="index"
              >
                <li class="flex items-center">
                  <i
                    class="mr-3 text-sm text-blue-400 fa-solid fa-angle-right"
                  ></i>
                  <a
                    :href="link.href"
                    class="text-gray-600 transition-colors hover:text-blue-500"
                    >{{ link.text }}</a
                  >
                </li>
              </template>
            </ul>
          </div>

          <div>
            <h4 class="mb-6 font-semibold text-gray-800">Hoạt động chính</h4>
            <ul class="space-y-3">
              <template
                v-for="(activity, index) in mainActivitiesFooter"
                :key="index"
              >
                <li class="flex items-center">
                  <i
                    class="mr-3 text-sm text-blue-400 fa-solid fa-angle-right"
                  ></i>
                  <span class="text-gray-600">{{ activity }}</span>
                </li>
              </template>
            </ul>
          </div>

          <div>
            <h4 class="mb-6 font-semibold text-gray-800">Mạng xã hội</h4>
            <p class="mb-6 text-gray-600">Kết nối với chúng mình qua</p>
            <div class="flex space-x-3">
              <a
                target="_blank"
                href="https://www.facebook.com/itsupporter.haui"
                class="flex items-center justify-center w-10 h-10 transition-colors bg-blue-500 rounded-full hover:bg-blue-600"
              >
                <i class="text-white fab fa-facebook-f"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-[#ebf7fc] py-4 lg:py-6 px-6 lg:px-20">
        <div
          class="flex flex-col items-center justify-between gap-4 md:flex-row"
        >
          <p class="text-sm text-gray-600">
            <span>&copy; 2022 - {{ curYear }}</span>
            <span>. Made by </span>
            <a
              class="text-[#49b5e7] hover:text-blue-600 transition-colors"
              href="https://github.com/Ddung203"
              target="_blank"
              >DDung203</a
            >
          </p>
          <div class="text-sm text-gray-500">IT Supporter - HaUI</div>
        </div>
      </div>
    </footer>
  </div>
  <ScrollToTop></ScrollToTop>
  <GoToChatbot></GoToChatbot>
</template>

<style scoped>
  iframe {
    max-width: 100%;
  }

  /* Mobile responsive overrides */
  @media only screen and (max-width: 739px) {
    /* Hero section mobile adjustments */
    [style*='background-image'] {
      background-attachment: scroll !important;
    }

    .text-4xl {
      font-size: 28px !important;
      line-height: 36px !important;
    }

    .text-lg {
      font-size: 16px !important;
      line-height: 24px !important;
    }

    /* Newsletter responsive */
    .max-w-2xl {
      padding: 0 1rem;
    }

    /* Footer responsive */
    .flex-wrap {
      flex-direction: column;
    }

    .min-w-64,
    .min-w-48 {
      min-width: 100%;
      margin-bottom: 2rem;
    }

    /* Copyright responsive */
    .h-20 {
      height: auto;
      padding: 1.25rem 0.625rem;
    }

    .justify-between {
      flex-direction: column;
      gap: 1rem;
    }
  }

  /* iPad responsive */
  @media only screen and (max-width: 1023px) and (min-width: 740px) {
    .px-20 {
      padding-left: 2.5rem;
      padding-right: 2.5rem;
    }
  }
</style>
