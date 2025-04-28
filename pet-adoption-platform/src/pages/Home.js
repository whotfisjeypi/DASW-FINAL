import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div>
      <Navbar />
      <header>
        <h1>¡Encuentra a tu mejor amigo!</h1>
        <p>Historias reales de adopciones exitosas te esperan.</p>
      </header>
      <section>
        <h2>Bienvenido a la Plataforma de Adopción de Mascotas</h2>
        <p>Explora, registra y adopta mascotas que necesitan un hogar.</p>
      </section>
      <Footer />
    </div>
  );
};

export default Home;