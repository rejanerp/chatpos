import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom'; 
import styled from "styled-components";
import { collection, query, where, addDoc, getDocs, orderBy, onSnapshot, writeBatch, doc, updateDoc} from "firebase/firestore"; 
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db,storage } from "../firebase"; 
import { getAuth, onAuthStateChanged } from "firebase/auth";
import defaultProfilePic from '../assets/default-profile.png'; 
import * as CompoChat from './ComponentsChatPage'; 
import Navbar from './Navbar';




const ContentContainer = styled.div`
  margin-top: 0px;
`;

const ChatPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]); 
  const [foundUsers, setFoundUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
 



  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchRecentChats(user.uid);
      } else {
        navigate('/');
      }
    });
  }, [navigate]);

  const fetchRecentChats = (userId) => {
    const messagesQuery = query(
      collection(db, "messages"),
      where("participants", "array-contains", userId),
      orderBy("timestamp", "desc")
    );

    onSnapshot(messagesQuery, async (snapshot) => {
      const chatsMap = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const otherUserId = data.participants.find(p => p !== userId);
        if (!chatsMap[otherUserId]) {
          chatsMap[otherUserId] = {
            lastMessage: data.text || (data.fileType && data.fileType.startsWith('image/') ? 'Imagem' : 'Arquivo'),
            timestamp: data.timestamp.toDate(),
            unreadCount: 0, 
            otherUserId,
          };
        }
      });

      const chatsArray = await Promise.all(Object.keys(chatsMap).map(async (otherUserId) => {
        const userInfo = await getUserInfoById(otherUserId);
        return {
          ...chatsMap[otherUserId],
          name: userInfo.name,
          photoUrl: userInfo.photoUrl || defaultProfilePic,
        };
      }));

      setChats(chatsArray);
    });
  };
  

  const handleSelectUser = async (item, type) => {
    if (type === 'chat') {
      const otherUserId = item.otherUserId;
      const otherUserInfo = await getUserInfoById(otherUserId); 
      setSelectedUser({
        uid: otherUserId,
        name: otherUserInfo.name,
        photoUrl: otherUserInfo.photoUrl,
      });

      fetchMessages(otherUserId); 
    } else if (type === 'user') {
      const otherUserId = item.uid;
      setSelectedUser({
        uid: otherUserId,
        name: item.name,
        photoUrl: item.photoUrl || defaultProfilePic,
      });

      fetchMessages(otherUserId); 
      setFoundUsers([]);
      setSearchEmail("");
    }
  };
  

  const generateChatId = (user1Id, user2Id) => {
    if (!user1Id || !user2Id) {
      console.error("IDs dos usuários inválidos para gerar o chatId.");
      return null; // Evita gerar um chatId inválido
    }
    return [user1Id, user2Id].sort().join('_');
  };
  

  const fetchMessages = (selectedUserId) => {
    if (!currentUser || !currentUser.uid) return;

    const chatId = generateChatId(currentUser.uid, selectedUserId);

    const messagesQuery = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc")
    );

    onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => {
        const data = doc.data();

        // Se a mensagem foi enviada pelo outro usuário e o status é 'enviada', atualize para 'entregue'
        if (data.sender === selectedUserId && data.status === 'enviada') {
          updateMessageStatus(doc.id, 'entregue');
        }

        return {
          id: doc.id,
          ...data,
        };
      });
      setMessages(fetchedMessages);
    });
  };
  
  
  const updateMessageStatus = async (messageId, status) => {
    try {
      const messageRef = doc(db, "messages", messageId);
      await updateDoc(messageRef, { status });
    } catch (error) {
      console.error("Erro ao atualizar o status da mensagem:", error);
    }
  }; 

  const sendMessage = async () => {
    if ((!messageInput.trim() && !file) || !selectedUser?.uid) return;
  
    const chatId = generateChatId(currentUser.uid, selectedUser.uid);
  
    let fileUrl = null;
    let fileType = null;
  
    if (file) {
      console.log("storage:", storage);
  
      const storageRef = ref(storage, `chat_files/${chatId}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      try {
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => {
              console.error("Erro no upload do arquivo:", error);
              reject(error);
            },
            async () => {
              fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
              fileType = file.type;
              resolve();
            }
          );
        });
      } catch (error) {
        console.error("Erro ao fazer upload do arquivo:", error);
        return;
      }
    }
  
    try {
      const newMessage = {
        sender: currentUser.uid,
        receiver: selectedUser.uid,
        text: messageInput || '',
        timestamp: new Date(),
        participants: [currentUser.uid, selectedUser.uid],
        chatId,
        status: 'enviada',
        fileUrl: fileUrl || null,
        fileType: fileType || null,
      };
  
      await addDoc(collection(db, "messages"), newMessage);
      setMessageInput("");
      setFile(null);
    } catch (error) {
      console.error("Erro ao enviar a mensagem:", error);
    }
  };
  

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const searchUserByEmail = async () => {
    if (!searchEmail.trim()) return;

    try {
      const q = query(collection(db, "users"), where("email", "==", searchEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const foundUsersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFoundUsers(foundUsersList);
      } else {
        setFoundUsers([]);
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    }
  };

  const getUserInfoById = async (userId) => {
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("uid", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return {
          name: userData.name || "Usuário",
          photoUrl: userData.photoUrl || defaultProfilePic,
        };
      } else {
        return { name: "Usuário", photoUrl: defaultProfilePic };
      }
    } catch (error) {
      return { name: "Usuário", photoUrl: defaultProfilePic };
    }
  };

  const deleteChat = async (chatId) => {
    if (!chatId) {
      console.error('Chat ID inválido ou indefinido');
      return;  // Evita tentar excluir um chat com ID indefinido
    }
  
    try {
      // Busca todas as mensagens relacionadas ao chatId
      const messagesQuery = query(collection(db, "messages"), where("chatId", "==", chatId));
      const snapshot = await getDocs(messagesQuery);
  
      // Usa um batch para deletar múltiplos documentos
      const batch = writeBatch(db);
  
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);  // Exclui cada documento relacionado ao chatId
      });
  
      await batch.commit();  // Executa o batch de exclusão
      console.log(`Chat com ID ${chatId} excluído com sucesso.`);
    } catch (error) {
      console.error("Erro ao excluir o chat:", error);  // Log para verificar o erro
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'enviada':
        return '✓';
      case 'entregue':
        return '✓✓';
      case 'lida':
        return '✓✓';
      default:
        return '';
    }
  };
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  

  return (
    <>
      <Navbar />
      <ContentContainer>
        <CompoChat.Container>
          <CompoChat.Sidebar>
            <CompoChat.ChatHeader>
              <h2>Chats</h2>
              <CompoChat.PlusButton onClick={searchUserByEmail}>+</CompoChat.PlusButton>
            </CompoChat.ChatHeader>
            <CompoChat.SearchBar
              type="text"
              placeholder="Buscar por email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
            <CompoChat.ChatList>
              {foundUsers.length > 0 && (
                <>
                  <h3>Resultados da Busca</h3>
                  {foundUsers.map((user) => (
                    <CompoChat.ChatItem key={user.uid} onClick={() => handleSelectUser(user, 'user')}>
                      <img
                        src={user.photoUrl || defaultProfilePic}
                        alt={user.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          marginRight: '10px',
                        }}
                      />
                      <CompoChat.ChatInfo>
                        <strong>{user.name}</strong>
                        <p>{user.email}</p>
                      </CompoChat.ChatInfo>
                    </CompoChat.ChatItem>
                  ))}
                </>
              )}

              <h3>Conversas Recentes</h3>
              {chats.map((chat) => (
                <CompoChat.ChatItem key={chat.otherUserId} onClick={() => handleSelectUser(chat, 'chat')}>
                  <img
                    src={chat.photoUrl || defaultProfilePic}
                    alt={chat.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      marginRight: '10px',
                    }}
                  />
                  <CompoChat.ChatInfo>
                    <strong>{chat.name}</strong>
                    <p>{chat.lastMessage}</p>
                    <small>{new Date(chat.timestamp).toLocaleString()}</small>
                    {chat.unreadCount > 0 && <span style={{ color: 'red' }}>{chat.unreadCount}</span>}
                  </CompoChat.ChatInfo>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.chatId);
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'red',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Excluir
                  </button>
                </CompoChat.ChatItem>
              ))}
            </CompoChat.ChatList>
          </CompoChat.Sidebar>

          <CompoChat.ChatArea>
            <CompoChat.ChatHeaderArea>
              {selectedUser ? <h2>{selectedUser.name}</h2> : <h2>Selecione um chat</h2>}
              {/* Removido o botão de perfil, pois o Navbar já o substitui */}
            </CompoChat.ChatHeaderArea>

            <CompoChat.MessagesArea>
              {messages.map((msg) => (
                <CompoChat.Message key={msg.id} isUser={msg.sender === currentUser.uid}>
                  <CompoChat.MessageBubble isUser={msg.sender === currentUser.uid}>
                    {msg.text}
                    {msg.fileUrl && (
                      <>
                        {msg.fileType && msg.fileType.startsWith('image/') ? (
                          <img
                            src={msg.fileUrl}
                            alt="Imagem enviada"
                            style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '10px' }}
                          />
                        ) : (
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00a884' }}>
                            Baixar arquivo
                          </a>
                        )}
                      </>
                    )}
                    {msg.sender === currentUser.uid && (
                      <CompoChat.MessageStatus status={msg.status}>
                        {getStatusIcon(msg.status)}
                      </CompoChat.MessageStatus>
                    )}
                  </CompoChat.MessageBubble>
                </CompoChat.Message>
              ))}
              <div ref={messagesEndRef} />
            </CompoChat.MessagesArea>

            <CompoChat.InputArea>
              <CompoChat.AttachButton onClick={() => fileInputRef.current.click()}>
                📎
              </CompoChat.AttachButton>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <CompoChat.Input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
              />
              <CompoChat.SendButton onClick={sendMessage}>➤</CompoChat.SendButton>
            </CompoChat.InputArea>
          </CompoChat.ChatArea>
        </CompoChat.Container>
      </ContentContainer>
    </>
  );
};

export default ChatPage;
