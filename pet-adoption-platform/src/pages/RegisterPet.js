import React, { useState } from 'react';

const RegisterPet = () => {
    const [petData, setPetData] = useState({
        name: '',
        type: '',
        breed: '',
        age: '',
        city: '',
        description: '',
        image: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPetData({ ...petData, [name]: value });
    };

    const handleFileChange = (e) => {
        setPetData({ ...petData, image: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate form fields
        if (!petData.name || !petData.type || !petData.breed || !petData.age || !petData.city || !petData.description) {
            alert('Please fill in all fields');
            return;
        }
        // Submit the form data to the API
        console.log('Submitting pet data:', petData);
        // Reset form after submission
        setPetData({
            name: '',
            type: '',
            breed: '',
            age: '',
            city: '',
            description: '',
            image: null,
        });
    };

    return (
        <section id="register">
            <h2>Registrar Nueva Mascota</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Nombre" value={petData.name} onChange={handleChange} />
                <select name="type" value={petData.type} onChange={handleChange}>
                    <option value="">Tipo de Animal</option>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                </select>
                <input type="text" name="breed" placeholder="Raza" value={petData.breed} onChange={handleChange} />
                <input type="number" name="age" placeholder="Edad (años)" value={petData.age} onChange={handleChange} />
                <input type="text" name="city" placeholder="Ciudad" value={petData.city} onChange={handleChange} />
                <textarea name="description" placeholder="Estado de salud y descripción" value={petData.description} onChange={handleChange}></textarea>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button type="submit">Registrar Mascota</button>
            </form>
        </section>
    );
};

export default RegisterPet;