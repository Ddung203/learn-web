import CryptoJS from 'crypto-js';

export function hashObject(obj: Record<string, any>) {
  const sorted = Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {} as Record<string, any>);

  return CryptoJS.MD5(JSON.stringify(sorted)).toString();
}
