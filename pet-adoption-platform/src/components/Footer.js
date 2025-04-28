import React from 'react';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: '#fefefe', padding: '1rem', textAlign: 'center' }}>
            <p>&copy; {new Date().getFullYear()} Adopta una Mascota. Todos los derechos reservados.</p>
            <p>
                <a href="/privacy-policy">Política de Privacidad</a> | 
                <a href="/terms-of-service">Términos de Servicio</a>
            </p>
        </footer>
    );
};

export default Footer;