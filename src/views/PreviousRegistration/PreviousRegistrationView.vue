<script setup lang="ts">
  import { AxiosError } from 'axios';
  import { useToast } from 'primevue/usetoast';
  import { onMounted, reactive, ref } from 'vue';
  import { z } from 'zod';

  import HeaderThird from '~/components/HeaderThird.vue';
  import Loading from '~/components/Loading.vue';
  import { notifyError, notifySuccess, uploadFileToFirebase } from '~/helper';
  import appRouter from '~/routes';
  import { AuthService, ProvinceService } from '~/services';
  import { splitUsernameFromEmail } from '~/utils';
  import { studentFormSchema } from './previousRegistrationView.schema';

  import type { IProvince } from '~/interfaces';

  const toast = useToast();

  // UI State
  const isLoading = ref(false);
  const fileupload = ref<any>(null);

  const hometownList = ref<IProvince[]>([]);

  // Form Data
  const formData = reactive({
    fullName: '',
    studentCode: '',
    studentClass: '',
    phoneNumber: '',
    email: '',
    facebookLink: '',
    avatarImage: '',
    hometown: '',
  });

  const onUpload = async () => {
    isLoading.value = true;

    setTimeout(() => {
      isLoading.value = false;
    }, 30000);

    try {
      const file = fileupload.value?.files[0] || null;

      if (!file) {
        notifyError(toast, 'Vui lòng chọn ảnh');
        return;
      }
      const fileName = `${Date.now()}-${file.name}`;
      const folderName = 'ctv-gen12';

      const imgUrl = await uploadFileToFirebase(file, fileName, folderName);

      formData.avatarImage = imgUrl;

      notifySuccess(toast, 'Tải lên ảnh thành công');
    } catch (error) {
      notifyError(toast, 'Tải lên ảnh bị gián đoạn! Vui lòng thử lại');
    } finally {
      isLoading.value = false;
    }
  };

  const onSubmit = async () => {
    const trimmedFormData = {
      studentCode: formData.studentCode.trim(),
      fullName: formData.fullName.trim(),
      studentClass: formData.studentClass.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      email: formData.email.trim(),
      facebookLink: formData.facebookLink.trim(),
      avatarImage: formData.avatarImage.trim(),
      hometown: formData.hometown,
    };

    // Validate using Zod
    try {
      const validatedData = studentFormSchema.parse(trimmedFormData);

      // Prepare data for API
      const apiData = {
        username: splitUsernameFromEmail(validatedData.email),
        studentCode: validatedData.studentCode,
        fullName: validatedData.fullName,
        studentClass: validatedData.studentClass,
        phoneNumber: validatedData.phoneNumber,
        hometown: validatedData.hometown,
        email: validatedData.email,
        facebookLink: validatedData.facebookLink,
        avatarImage: validatedData.avatarImage,
      };

      // Submit to API
      const { payload } = await AuthService.register(apiData);
      formData.avatarImage = '';
      fileupload.value.clear();

      if (payload.success) {
        notifySuccess(
          toast,
          payload.message ||
            'Gửi đăng ký thành công! Đang chuyển đến trang xác thực OTP...'
        );

        setTimeout(() => {
          appRouter.push(`/verify-otp?email=${formData.email}`);
        }, 100);
      } else {
        notifyError(toast, payload.message);
      }
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        notifyError(toast, firstError.message);
        return;
      }

      // Handle API errors
      if (error instanceof AxiosError) {
        notifyError(toast, error.response?.data?.message);
        return;
      }
    }
  };

  const getProvinces = async () => {
    const { payload = [] } = await ProvinceService.getProvinces({});

    hometownList.value = payload;
  };

  onMounted(getProvinces);
</script>

<template>
  <HeaderThird></HeaderThird>
  <Loading v-if="isLoading"></Loading>

  <div>
    <!-- Main content -->
    <div
      class="grid grid-cols-1 lg:grid-cols-2 min-h-[100vh] grid-rows-1 gap-2 overflow-hidden"
    >
      <div class="p-10 lg:p-20 layout-left">
        <p class="text-3xl font-semibold leading-normal uppercase">
          Đăng ký tham gia
        </p>
        <p class="text-3xl font-semibold leading-normal">
          CLB Hỗ trợ kỹ thuật IT Supporter
        </p>

        <div
          class="flex items-center justify-center m-5 overflow-hidden demo-img"
        >
          <img
            class="block rounded-xl"
            width="250"
            src="https://firebasestorage.googleapis.com/v0/b/upload-images-42481.appspot.com/o/cdn%2FH%C3%A0-new.jpg?alt=media&token=b16e5f1c-6f34-4123-8a11-a1f75cd53e58"
            alt="Demo Image"
          />
        </div>

        <p class="text-lg font-medium note">
          Lưu ý 1: Chọn một bức ảnh của bản thân mà bạn cảm thấy tự tin, ưng ý
          nhất. Nhưng lưu ý phải đủ rõ ràng và có duy nhất một khuôn mặt trong
          khung hình nhé!
        </p>

        <p class="mt-10 text-lg font-medium note">
          Lưu ý 2: Sau khi đăng ký thành công, hệ thống sẽ tự động chuyển bạn
          đến trang xác thực OTP. Nếu không tự động chuyển, vui lòng nhấn vào
          đường link sau:
          <a
            href="/verify-otp"
            class="text-blue-500"
          >
            https://ctv.itshaui.io.vn/verify-otp
          </a>
        </p>
      </div>

      <div
        class="relative layout-right min-h-[100vh] bg-[#fefefe] py-[40px] px-[30px] lg:px-[80px]"
      >
        <div class="absolute hidden lg:block top-0 left-[-150px] cloud">
          <img
            class="block object-contain h-full"
            src="https://firebasestorage.googleapis.com/v0/b/upload-imgs-52a0d.appspot.com/o/others%2Fcloud.png?alt=media&token=b95433a8-a432-462f-b44e-64dd65afa482"
            alt="cloud image"
          />
        </div>

        <!-- ! FORM -->
        <transition
          enter-active-class="animate__animated animate__fadeInRight"
          leave-active-class="animate__animated animate__fadeOut"
        >
          <div v-if="hometownList.length > 0">
            <form
              autocomplete="off"
              @submit.prevent="onSubmit"
            >
              <div class="form-group">
                <div class="flex items-start gap-1 mb-2">
                  <span class="font-medium">Mã sinh viên</span>
                  <i
                    class="text-red-600 pi pi-asterisk"
                    style="font-size: 0.56rem"
                  ></i>
                </div>

                <!--  -->
                <div class="mb-5">
                  <InputText
                    class="w-full"
                    type="text"
                    maxlength="10"
                    placeholder="2025000001"
                    v-model="formData.studentCode"
                  />
                </div>
              </div>

              <div class="form-group">
                <div class="flex items-start gap-1 mb-2">
                  <span class="font-medium">Họ và tên</span>
                  <i
                    class="text-red-600 pi pi-asterisk"
                    style="font-size: 0.56rem"
                  ></i>
                </div>

                <!--  -->
                <div class="mb-5">
                  <InputText
                    class="w-full"
                    type="text"
                    placeholder="Dương Văn A"
                    v-model="formData.fullName"
                    maxlength="100"
                  />
                </div>
              </div>

              <div class="form-group">
                <div class="flex items-start gap-1 mb-2">
                  <span class="font-medium">Lớp - Khóa</span>
                  <i
                    class="text-red-600 pi pi-asterisk"
                    style="font-size: 0.56rem"
                  ></i>
                </div>

                <!--  -->
                <div class="mb-5">
                  <InputText
                    class="w-full"
                    type="text"
                    placeholder="KTPM02 - K20"
                    v-model="formData.studentClass"
                  />
                </div>
              </div>

              <div class="form-group">
                <div class="flex items-start gap-1 mb-2">
                  <span class="font-medium">Email</span>
                  <i
                    class="text-red-600 pi pi-asterisk"
                    style="font-size: 0.56rem"
                  ></i>
                </div>

                <!--  -->
                <div class="mb-5">
                  <InputText
                    class="w-full"
                    type="text"
                    placeholder="your-email@gmail.com"
                    v-model="formData.email"
                    maxlength="100"
                  />
                </div>
              </div>

              <div class="form-group">
                <div class="flex items-start gap-1 mb-2">
                  <span class="font-medium">Số điện thoại</span>
                  <i
                    class="text-red-600 pi pi-asterisk"
                    style="font-size: 0.56rem"
                  ></i>
                </div>

                <!--  -->
                <div class="mb-5">
                  <InputText
                    class="w-full"
                    type="text"
                    placeholder="0123456789"
                    maxlength="10"
                    v-model="formData.phoneNumber"
                  />
                </div>
              </div>

              <div class="form-group">
                <div class="flex items-start gap-1 mb-2">
                  <span class="font-medium">Quê quán (sau sáp nhập)</span>
                  <i
                    class="text-red-600 pi pi-asterisk"
                    style="font-size: 0.56rem"
                  ></i>
                </div>

                <!--  -->
                <div class="mb-5">
                  <!-- ! -->
                  <div class="flex justify-center card">
                    <FloatLabel class="w-full md:w-14rem">
                      <Dropdown
                        v-model="formData.hometown"
                        inputId="dd-city"
                        :options="hometownList"
                        optionLabel="name"
                        optionValue="name"
                        class="w-full"
                        filter
                      />
                    </FloatLabel>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <div class="flex items-start gap-1 mb-2">
                  <span class="font-medium">Link Facebook</span>
                  <i
                    class="text-red-600 pi pi-asterisk"
                    style="font-size: 0.56rem"
                  ></i>
                </div>

                <!--  -->
                <div class="mb-5">
                  <InputText
                    class="w-full"
                    type="text"
                    placeholder="https://www.facebook.com/itsupporter.haui"
                    v-model="formData.facebookLink"
                    maxlength="500"
                  />
                </div>
              </div>

              <div class="mb-10 form-group">
                <div class="flex items-start gap-1 mb-2">
                  <span class="font-medium">Checkin bằng ảnh</span>
                  <i
                    class="text-red-600 pi pi-asterisk"
                    style="font-size: 0.56rem"
                  ></i>
                </div>

                <!-- studentImage -->
                <div
                  class="flex flex-col items-center justify-start gap-4 mb-5 lg:flex-row lg:relative"
                >
                  <FileUpload
                    ref="fileupload"
                    mode="basic"
                    name="demo[]"
                    accept="image/png, image/jpeg"
                    :maxFileSize="12582912"
                    :customUpload="true"
                    chooseLabel="Chọn ảnh"
                    invalidFileSizeMessage="File quá lớn. Vui lòng chọn file nhỏ hơn 12MB."
                    @change="onUpload"
                  />
                  <div
                    class="flex items-center justify-center lg:absolute lg:top-0 lg:right-0"
                  >
                    <a
                      :href="formData.avatarImage"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        v-if="formData.avatarImage"
                        class="max-h-[150px]"
                        :src="formData.avatarImage"
                        alt="Preview Image"
                      />
                    </a>
                  </div>
                </div>
              </div>

              <!-- ! -->
              <div
                class="flex items-center justify-center w-full lg:mt-28 form-group"
              >
                <Button
                  type="submit"
                  class="flex items-center justify-center w-full"
                >
                  Đăng ký
                </Button>
              </div>
            </form>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .layout-left {
    background-image: linear-gradient(to right, #fdd359, #f5945d);

    color: #fff;
  }
</style>
