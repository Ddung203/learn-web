import dayjs from 'dayjs';

import type { Ref } from 'vue';

// export function countdownFunction(
//   counting: Ref<string>,
//   timeOut: string | Date | number,
//   remaining: Ref<string>
// ) {
//   const targetTime = new Date(timeOut);

//   const countdownInterval = setInterval(() => {
//     const now = new Date();
//     const timeRemaining = targetTime.getTime() - now.getTime();

//     const minutes = Math.floor(timeRemaining / 1000 / 60)
//       .toString()
//       .padStart(2, '0');
//     const seconds = Math.floor((timeRemaining / 1000) % 60)
//       .toString()
//       .padStart(2, '0');

//     counting.value = `${minutes}:${seconds}`;

//     if (timeRemaining <= 0) {
//       clearInterval(countdownInterval);
//       counting.value = 'out';
//     }
//   }, 1000);

//   function countdownEnd() {
//     clearInterval(countdownInterval);
//     remaining.value = counting.value;
//     counting.value = 'out';
//   }

//   return countdownEnd;
// }

export function countdownFunction(
  counting: Ref<string>,
  timeOut: string | Date | number,
  remaining: Ref<string>
) {
  const targetTime = dayjs(timeOut);

  const countdownInterval = setInterval(() => {
    const now = dayjs();
    const diff = targetTime.diff(now); // milliseconds

    if (diff <= 0) {
      clearInterval(countdownInterval);
      counting.value = 'out';
      return;
    }

    const minutes = dayjs(diff).minute().toString().padStart(2, '0');
    const seconds = dayjs(diff).second().toString().padStart(2, '0');

    counting.value = `${minutes}:${seconds}`;
  }, 1000);

  function countdownEnd() {
    clearInterval(countdownInterval);
    remaining.value = counting.value;
    counting.value = 'out';
  }

  return countdownEnd;
}
