import React, { useState, useEffect } from 'react';
import PetCard from '../components/PetCard';
import { fetchPets } from '../utils/api';

const SearchPets = () => {
  const [pets, setPets] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    animalType: '',
    breed: '',
    age: ''
  });

  useEffect(() => {
    const loadPets = async () => {
      const petData = await fetchPets(filters);
      setPets(petData);
    };
    loadPets();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Trigger fetch with updated filters
  };

  return (
    <div>
      <h2>Buscar Mascota</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          name="city"
          placeholder="Ciudad"
          value={filters.city}
          onChange={handleFilterChange}
        />
        <select name="animalType" value={filters.animalType} onChange={handleFilterChange}>
          <option value="">Tipo de Animal</option>
          <option value="Perro">Perro</option>
          <option value="Gato">Gato</option>
        </select>
        <input
          type="text"
          name="breed"
          placeholder="Raza"
          value={filters.breed}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="age"
          placeholder="Edad (años)"
          value={filters.age}
          onChange={handleFilterChange}
        />
        <button type="submit">Buscar</button>
      </form>
      <div>
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  );
};

export default SearchPets;