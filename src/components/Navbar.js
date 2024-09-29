import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaComments, FaUser } from 'react-icons/fa'; // Adicionar ícones

const NavbarContainer = styled.nav`
  width: 100%;
  height: 60px;
  background-color: #008069;
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0; /* Mover para a parte inferior */
  z-index: 1000;
`;

const NavButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${(props) => (props.active ? 'white' : '#d9d9d9')};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    color: white;
  }

  & > span {
    font-size: 0.8rem;
    margin-top: 5px;
  }
`;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <NavbarContainer>
      <NavButton
        onClick={() => navigate('/chat')}
        active={location.pathname === '/chat'}
      >
        <FaComments />
        <span>Chat</span>
      </NavButton>
      <NavButton
        onClick={() => navigate('/profile')}
        active={location.pathname === '/profile'}
      >
        <FaUser />
        <span>Perfil</span>
      </NavButton>
    </NavbarContainer>
  );
};

export default Navbar;
