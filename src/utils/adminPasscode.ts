import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { comparePasscode } from './hash';

export async function verifyAdminPasscode(input: string): Promise<boolean> {
  // Assume passcode is stored in 'admin/passcode' doc as { hash: string }
  const ref = doc(db, 'admin', 'passcode');
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;
  const { hash } = snap.data() as { hash: string };
  return await comparePasscode(input, hash);
}
