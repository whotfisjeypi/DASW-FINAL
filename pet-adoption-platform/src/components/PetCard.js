import React from 'react';

const PetCard = ({ pet }) => {
    return (
        <div className="card">
            <img src={pet.image} alt={pet.name} />
            <h3>{pet.name}</h3>
            <p>{pet.city} | {pet.breed} | {pet.age} años</p>
            <button>Ver más detalles</button>
        </div>
    );
};

export default PetCard;