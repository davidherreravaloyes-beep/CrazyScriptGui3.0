import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Camera, Check, Loader2, Gavel, Upload } from 'lucide-react';
import { auth, updateProfile, db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isAdmin?: boolean;
}

export function ProfileModal({ isOpen, onClose, user, isAdmin }: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, isOpen]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: photoURL
      });

      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: displayName,
        photoURL: photoURL,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Update profile failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-[400px] bg-[#0d0d0f] border border-white/5 rounded-[20px] overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-center text-brand font-bold text-[10px] uppercase tracking-[0.2em] mb-10 hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
              >
                <Upload size={14} />
                UPLOAD NEW PHOTO
              </button>

              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                    DISPLAY NAME
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#16161a] border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand/50 transition-all font-medium placeholder:text-zinc-700"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                    CURRENT PHOTO URL
                  </label>
                  <input
                    type="text"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="w-full bg-[#16161a] border border-white/10 rounded-xl px-5 py-4 text-white text-sm focus:outline-none focus:border-brand/50 transition-all font-medium placeholder:text-zinc-700"
                    placeholder="Photo URL"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full py-4 bg-brand text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-brand-muted transition-all active:scale-95 disabled:opacity-50 mt-6 shadow-[0_0_20px_-5px_rgba(139,92,246,0.6)]"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin text-white" />
                  ) : success ? (
                    <>
                      <Check size={20} />
                      Saved
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </form>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !user) return;
                setLoading(true);
                try {
                  const storageRef = ref(storage, `profiles/${user.uid}/avatar`);
                  const snapshot = await uploadBytes(storageRef, file);
                  const url = await getDownloadURL(snapshot.ref);
                  setPhotoURL(url);
                } catch (error) {
                  console.error("Upload failed", error);
                } finally {
                  setLoading(false);
                }
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
