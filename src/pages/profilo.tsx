import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { GradientText } from '../components/layout/GradientText';
import contactBg from '../components/layout/BG.jpg';

export function Profilo() {
  const { user } = useAuthStore();
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const db = getFirestore(app);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setEditedData(userDoc.data());
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    if (user) {
      const db = getFirestore(app);
      await updateDoc(doc(db, 'users', user.uid), editedData);
      setUserData(editedData);
      setIsEditing(false);
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <section className="relative min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black z-10" />
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${contactBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 mix-blend-overlay" />
      </div>

      <div className="relative z-20 max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8 text-center">
          <GradientText>Profilo Utente</GradientText>
        </h1>

        <div className="bg-black/50 p-6 rounded-md shadow-sm backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Nome</label>
              <input
                type="text"
                name="nome"
                value={editedData.nome || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 bg-gray-700 text-white rounded-md ${
                  isEditing ? 'border border-yellow-600 focus:ring-yellow-500 focus:border-yellow-500' : ''
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Cognome</label>
              <input
                type="text"
                name="cognome"
                value={editedData.cognome || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 bg-gray-700 text-white rounded-md ${
                  isEditing ? 'border border-yellow-600 focus:ring-yellow-500 focus:border-yellow-500' : ''
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={editedData.email || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-3 py-2 bg-gray-700 text-white rounded-md ${
                  isEditing ? 'border border-yellow-600 focus:ring-yellow-500 focus:border-yellow-500' : ''
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Ruolo</label>
              <input
                type="text"
                name="ruolo"
                value={editedData.ruolo || ''}
                disabled
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Referral Link</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  name="referralLink"
                  value={editedData.referralLink || ''}
                  disabled
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(editedData.referralLink)}
                  className="bg-yellow-400 text-black py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-400 text-black py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
              >
                Modifica
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditedData(userData);
                    setIsEditing(false);
                  }}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="bg-yellow-400 text-black py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors"
                >
                  Salva
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}