
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function bootstrapSettings() {
  const configs = [
    {
      path: 'settings/accessConfig',
      data: {
        adminPassword: '9175938',
        allowedUsers: ['cskim1747@gmail.com', 'cskim17@gmail.com', 'jco119@gmail.com'],
        googleLoginPassword: '',
        directBypassPassword: ''
      }
    },
    {
      path: 'settings/logo',
      data: {
        logoUrl: ''
      }
    }
  ];

  try {
    for (const config of configs) {
      const docRef = doc(db, config.path);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, config.data);
        console.log(`Bootstrapped ${config.path}`);
      }
    }
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Bootstrap: Permission denied. Skipping initialization (may happen before login).");
    } else {
      console.error("Bootstrap error:", error);
    }
  }
}
