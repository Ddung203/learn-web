import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '~/libs/firebase';

export const uploadImageHandle = async (
  file: any,
  fileName: string,
  folderName = 'questions'
) => {
  try {
    const storageRef = ref(storage, `${folderName}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
      status: 'success',
      url: downloadURL,
    };
  } catch (error) {
    return {
      status: 'error',
      error: 'Upload failed',
      url: '',
    };
  }
};

export const uploadFileToFirebase = async (
  file: File,
  fileName: string,
  folderName: string
): Promise<string> => {
  const storageRef = ref(storage, `${folderName}/${fileName}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
};
