import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/search">Buscar Mascota</Link></li>
        <li><Link to="/register">Registrar Mascota</Link></li>
        <li><Link to="/requests">Mis Solicitudes</Link></li>
        <li><Link to="/profile">Mi Perfil</Link></li>
        <li><Link to="/logout">Cerrar Sesión</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;