import React, { useState } from 'react';

const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form validation and submission logic here
    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }
    // Submit the form data to the API
  };

  return (
    <div className="profile">
      <h2>Mi Perfil</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Nueva Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Actualizar Perfil</button>
      </form>
    </div>
  );
};

export default Profile;