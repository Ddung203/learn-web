import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

import { FIREBASE_CONFIG } from '~/config';

export const firebaseApp = initializeApp(FIREBASE_CONFIG);

export const storage = getStorage(firebaseApp);
