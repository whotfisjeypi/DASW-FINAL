// filepath: /pet-adoption-platform/pet-adoption-platform/src/utils/api.js

const API_BASE_URL = 'https://api.example.com/pets';

export const fetchPets = async (filters) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}?${query}`);
    if (!response.ok) {
        throw new Error('Failed to fetch pets');
    }
    return response.json();
};

export const registerPet = async (petData) => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
    });
    if (!response.ok) {
        throw new Error('Failed to register pet');
    }
    return response.json();
};

export const cancelRequest = async (requestId) => {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to cancel request');
    }
    return response.json();
};