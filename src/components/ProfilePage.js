import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db, storage } from "../firebase";
import DefaultProfilePicture from '../assets/default-profile.png';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Navbar from './Navbar'; // Importar o Navbar

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #111b21;
  color: white;
  min-height: 100vh;
  padding-top: 80px; /* Ajuste para o Navbar */
  padding-bottom: 80px; /* Ajuste para o Navbar */
`;

const ProfileHeader = styled.h1`
  font-size: 24px;
  color: white;
  margin-bottom: 20px;
`;

const AvatarContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
`;

const EditAvatarButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #00a884;
  color: white;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
`;

const InfoSection = styled.div`
  width: 80%;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #2a2f32;
  text-align: left;
`;

const InfoLabel = styled.p`
  color: #00a884;
  font-size: 14px;
  margin-bottom: 5px;
`;

const InfoText = styled.p`
  font-size: 18px;
  margin-bottom: 5px;
  color: white;
`;

const EditButton = styled.button`
  background-color: transparent;
  border: none;
  color: #00a884;
  cursor: pointer;
  font-size: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  background-color: #2a2f32;
  border: none;
  border-radius: 5px;
  color: white;
  font-size: 18px;
  margin-bottom: 10px;
`;

const SaveButton = styled.button`
  background-color: #00a884;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
`;

const ProfilePage = () => {
  const [profilePic, setProfilePic] = useState(DefaultProfilePicture);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [userId, setUserId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    // Monitora a autenticação e busca as informações do Firestore
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid); // Defina o userId
        const docRef = doc(db, "users", user.uid); // Acessa a coleção de 'users' no Firestore
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name || "");
          setAbout(userData.about || "");
          setProfilePic(userData.profilePic || DefaultProfilePicture);
        } else {
          // Se o documento não existir, crie um novo
          await setDoc(docRef, {
            uid: user.uid,
            email: user.email,
            name: user.displayName || "",
            about: "",
            profilePic: DefaultProfilePicture,
          });
          setName(user.displayName || "");
          setAbout("");
          setProfilePic(DefaultProfilePicture);
        }
      } else {
        console.log("Usuário não autenticado.");
      }
    });
  }, []);

  // Atualiza a foto de perfil no Firebase Storage
  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (file && userId) {
      setUploading(true);
      const storageRef = ref(storage, `profile_pictures/${userId}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      try {
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => {
              console.error("Erro no upload da imagem:", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              await updateDoc(doc(db, "users", userId), { profilePic: downloadURL });
              setProfilePic(downloadURL);
              resolve();
            }
          );
        });
      } catch (error) {
        console.error("Erro ao fazer upload da imagem:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  // Salva o novo nome no Firestore
  const handleSaveName = async () => {
    if (userId) {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { name });
      setIsEditingName(false);
    }
  };

  // Salva o novo "about" no Firestore
  const handleSaveAbout = async () => {
    if (userId) {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { about });
      setIsEditingAbout(false);
    }
  };

  return (
    <>
      <ProfileContainer>
        <ProfileHeader>Perfil</ProfileHeader>

        {/* Foto de perfil com upload */}
        <AvatarContainer>
          <Avatar src={profilePic} alt="Profile" />
          <EditAvatarButton htmlFor="profilePicUpload">
            {uploading ? '...' : '✏️'}
          </EditAvatarButton>
        </AvatarContainer>
        <input
          id="profilePicUpload"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleProfilePicChange}
        />

        {/* Nome do usuário */}
        <InfoSection>
          <InfoLabel>Seu nome</InfoLabel>
          {isEditingName ? (
            <>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <SaveButton onClick={handleSaveName}>Salvar</SaveButton>
            </>
          ) : (
            <>
              <InfoText>{name || "Sem nome"}</InfoText>
              <EditButton onClick={() => setIsEditingName(true)}>Editar</EditButton>
            </>
          )}
        </InfoSection>

        {/* Sobre o usuário */}
        <InfoSection>
          <InfoLabel>Sobre</InfoLabel>
          {isEditingAbout ? (
            <>
              <Input
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
              <SaveButton onClick={handleSaveAbout}>Salvar</SaveButton>
            </>
          ) : (
            <>
              <InfoText>{about || "Sem informações"}</InfoText>
              <EditButton onClick={() => setIsEditingAbout(true)}>Editar</EditButton>
            </>
          )}
        </InfoSection>
      </ProfileContainer>
      <Navbar /> {/* Adicionar o Navbar na parte inferior */}
    </>
  );
};

export default ProfilePage;
