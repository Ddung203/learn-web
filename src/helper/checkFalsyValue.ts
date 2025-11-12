export const checkFalsy = (object: any) => {
  return Object.values(object).some((value) => !value);
};
