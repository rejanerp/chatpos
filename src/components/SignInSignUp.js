import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import * as Components from './Components';  // Importa os componentes estilizados
import { doc, setDoc } from "firebase/firestore"; 
import { db } from "../firebase";

const SignInSignUp = () => {
  const [signIn, setSignIn] = useState(true); // Estado para alternar entre login e registro

  // Estados para o formulário de login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Estados para o formulário de registro
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState(""); // Estado para mensagens de erro

  const navigate = useNavigate(); // Para redirecionar o usuário após o login ou registro

  // Função para login com Firebase
  const handleLogin = () => {
    if (!loginEmail || !loginPassword) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      .then((userCredential) => {
        setErrorMessage("");
        navigate("/chat");
      })
      .catch((error) => {
        console.error("Erro ao fazer login:", error);
        setErrorMessage("Erro ao fazer login. Por favor, verifique suas credenciais.");
      });
  };

  // Função para criar conta com Firebase
  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;

      // Atualiza o perfil do usuário com o nome
      await updateProfile(user, {
        displayName: signupName,
      });

      // Salva os dados do usuário no Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: signupName,
        email: signupEmail,
      });

      setErrorMessage("");
      navigate("/chat");
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      setErrorMessage("Erro ao criar conta. Por favor, tente novamente.");
    }
  };

  // Função para alternar entre login e registro e limpar os campos
  const toggleForm = () => {
    setSignIn(!signIn);
    setErrorMessage(""); // Limpa mensagens de erro
    // Limpa os campos de entrada ao alternar os formulários
    setLoginEmail("");
    setLoginPassword("");
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
  };

  return (
    <Components.Container>
      {/* Componente de Registro */}
      <Components.SignUpContainer signinIn={signIn}>
        <Components.Form onSubmit={(e) => e.preventDefault()}>
          <Components.Title>Criar Conta</Components.Title>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <Components.Input 
            type='text' 
            placeholder='Nome' 
            value={signupName} 
            onChange={(e) => setSignupName(e.target.value)} 
          />
          <Components.Input 
            type='email' 
            placeholder='Email' 
            value={signupEmail} 
            onChange={(e) => setSignupEmail(e.target.value)} 
          />
          <Components.Input 
            type='password' 
            placeholder='Senha' 
            value={signupPassword} 
            onChange={(e) => setSignupPassword(e.target.value)} 
          />
          <Components.Button type="button" onClick={handleSignup}>Registrar-se</Components.Button>
        </Components.Form>
      </Components.SignUpContainer>

      {/* Componente de Login */}
      <Components.SignInContainer signinIn={signIn}>
        <Components.Form onSubmit={(e) => e.preventDefault()}>
          <Components.Title>Entrar</Components.Title>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <Components.Input 
            type='email' 
            placeholder='Email' 
            value={loginEmail} 
            onChange={(e) => setLoginEmail(e.target.value)} 
          />
          <Components.Input 
            type='password' 
            placeholder='Senha' 
            value={loginPassword} 
            onChange={(e) => setLoginPassword(e.target.value)} 
          />
          <Components.Anchor href='#'>Esqueceu sua senha?</Components.Anchor>
          <Components.Button type="button" onClick={handleLogin}>Entrar</Components.Button>
        </Components.Form>
      </Components.SignInContainer>

      {/* Painel de sobreposição para alternar entre login e registro */}
      <Components.OverlayContainer signinIn={signIn}>
        <Components.Overlay signinIn={signIn}>

          {/* Painel do lado esquerdo (quando em login) */}
          <Components.LeftOverlayPanel signinIn={signIn}>
            <Components.Title>Bem-vindo de volta!</Components.Title>
            <Components.Paragraph>
              
            </Components.Paragraph>
            <Components.GhostButton onClick={toggleForm}>
              Entrar
            </Components.GhostButton>
          </Components.LeftOverlayPanel>

          {/* Painel do lado direito (quando em registro) */}
          <Components.RightOverlayPanel signinIn={signIn}>
            <Components.Title>Olá, Amigo!</Components.Title>
            <Components.Paragraph>
              
            </Components.Paragraph>
            <Components.GhostButton onClick={toggleForm}>
              Registrar-se
            </Components.GhostButton>
          </Components.RightOverlayPanel>

        </Components.Overlay>
      </Components.OverlayContainer>

    </Components.Container>
  );
};

export default SignInSignUp;
