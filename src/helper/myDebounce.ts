export function debounceSync<T extends (...args: any[]) => void>(
  func: T,
  waitMs: number
) {
  let timeout: ReturnType<typeof setTimeout>;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), waitMs);
  };
}

export function debounceAsync<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
) {
  let timeout: ReturnType<typeof setTimeout>;

  return function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): Promise<ReturnType<T>> {
    const context = this;

    return new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const result = await func.apply(context, args);
        resolve(result);
      }, waitMs);
    });
  };
}
