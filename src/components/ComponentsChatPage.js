import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #111b21;
`;

export const Sidebar = styled.div`
  width: 30%;
  background-color: #202c33;
  color: white;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #2a2f32;
  position: fixed; /* Fixa a sidebar à esquerda */
  left: 0;
  height: 100%; /* Ocupa toda a altura da tela */
`;

export const ChatList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  margin-top: 10px;
`;

export const ChatHeader = styled.div`
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2a2f32;
  border-bottom: 1px solid #2a2f32;
`;

export const ProfileButton = styled.button`
  background-color: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;

  &:hover {
    color: #00a884;
  }
`;

export const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 20px;
  border: none;
  background-color: #3b4a54;
  color: white;
  outline: none;
`;

export const ChatItem = styled.div`
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #202c33;
  border-bottom: 1px solid #2a2f32;
  cursor: pointer;
  &:hover {
    background-color: #182229;
  }
`;

export const ChatInfo = styled.div`
  flex-grow: 1;
  margin-left: 10px;
  color: #b1b3b5;
`;

export const PlusButton = styled.button`
  background-color: #00a884;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
  font-size: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-right: 10px;
`;

export const ChatArea = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #0b141a;
  margin-left: 30%; /* Deixa espaço para a Sidebar */
  width: 70%; /* Ocupa o restante da tela */
  height: calc(100vh - 60px); /* Ajusta a altura para não ultrapassar a navbar */
`;

export const ChatHeaderArea = styled.div`
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #202c33;
  border-bottom: 1px solid #2a2f32;
  color: white;
`;

export const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 100px; /* Ajuste conforme a altura do InputArea */
  max-height: calc(100vh - 120px); /* Calcula a altura considerando a navbar e o InputArea */
`;

export const Message = styled.div`
  margin: 10px 0;
  display: flex;
  justify-content: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
`;

export const MessageStatus = styled.span`
  font-size: 1rem;
  color: ${(props) =>
    props.status === 'lida'
      ? '#34B7F1' // Azul para 'lida'
      : '#b0b3b5'}; // Cinza claro para os demais
  position: absolute;
  bottom: 5px;
  right: -18px;
`;

export const MessageBubble = styled.div`
  background-color: ${(props) => (props.isUser ? '#005c4b' : '#202c33')};
  color: ${(props) => (props.isUser ? 'white' : '#e1e1e1')};
  padding: 10px 20px;
  border-radius: 20px;
  max-width: 60%;
  word-wrap: break-word;
  position: relative;
  display: inline-block;
`;

export const InputArea = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #202c33;
  position: relative;
  bottom: 0;
  width: 100%;
  height: 60px; /* Altura fixa para o InputArea */
`;

export const Input = styled.input`
  flex-grow: 1;
  padding: 10px;
  border-radius: 30px;
  border: none;
  background-color: #3b4a54;
  color: white;
  outline: none;
`;

export const SendButton = styled.button`
  background-color: #00a884;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  margin-left: 10px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s;

  &:hover {
    background-color: #357ab8;
  }
`;

export const AttachButton = styled.button`
  background-color: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 10px;
`;
