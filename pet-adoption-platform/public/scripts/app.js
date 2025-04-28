// filepath: /pet-adoption-platform/pet-adoption-platform/public/scripts/app.js

document.addEventListener('DOMContentLoaded', () => {
    const registerPetForm = document.querySelector('#registerPetForm');
    const searchPetsForm = document.querySelector('#searchPetsForm');
    const myRequestsSection = document.querySelector('#myRequests');
    const petCardsContainer = document.querySelector('#petCardsContainer');

    // Handle pet registration
    if (registerPetForm) {
        registerPetForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(registerPetForm);
            const petData = {
                name: formData.get('name'),
                type: formData.get('type'),
                breed: formData.get('breed'),
                age: formData.get('age'),
                city: formData.get('city'),
                description: formData.get('description'),
                image: formData.get('image')
            };

            if (validatePetData(petData)) {
                addPetCard(petData);
                registerPetForm.reset();
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // Handle pet search
    if (searchPetsForm) {
        searchPetsForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const searchData = new FormData(searchPetsForm);
            const filters = {
                city: searchData.get('city'),
                type: searchData.get('type'),
                breed: searchData.get('breed'),
                age: searchData.get('age')
            };
            searchPets(filters);
        });
    }

    // Handle request cancellation
    myRequestsSection.addEventListener('click', (event) => {
        if (event.target.classList.contains('cancel-request')) {
            const requestCard = event.target.closest('.request-card');
            requestCard.remove();
        }
    });

    function validatePetData(data) {
        return Object.values(data).every(value => value);
    }

    function addPetCard(petData) {
        const petCard = document.createElement('div');
        petCard.classList.add('card');
        petCard.innerHTML = `
            <img src="${petData.image}" alt="${petData.name}">
            <h3>${petData.name}</h3>
            <p>${petData.city} | ${petData.breed} | ${petData.age} años</p>
            <button class="view-details">Ver más detalles</button>
        `;
        petCardsContainer.appendChild(petCard);
    }

    function searchPets(filters) {
        // Implement search logic based on filters
        console.log('Searching for pets with filters:', filters);
    }
});