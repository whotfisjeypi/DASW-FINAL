// frontend/public/scripts/app.js

document.addEventListener("DOMContentLoaded", function() {
    // ========== FUNCIONES DE AUTENTICACIÓN ==========
    async function handleLogin(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMessage = data.errors ? data.errors.map(err => err.msg).join(', ') : data.message;
                throw new Error(errorMessage || `Error ${response.status}`);
            }
            console.log('Login exitoso:', data);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ userId: data.userId, name: data.name, role: data.role }));
            $("#loginModal").modal("hide");
            // Esperar a que el modal se cierre antes de la alerta para evitar problemas de UI
            setTimeout(() => {
                alert('¡Inicio de sesión exitoso!');
                updateUIForLoggedInUser(data.name, data.role);
                if (window.location.pathname === '/home' || window.location.pathname === '/') {
                    cargarMascotas(); // Recargar mascotas para actualizar botones de admin si es necesario
                }
            }, 200);
        } catch (error) {
            console.error('Error de login:', error);
            alert(`Error al iniciar sesión: ${error.message}`);
        }
    }

    async function handleRegister(name, email, password, city, role = 'adoptante') {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, city, role }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMessage = data.errors ? data.errors.map(err => err.msg).join(', ') : data.message;
                throw new Error(errorMessage || `Error ${response.status}`);
            }
            console.log('Registro exitoso:', data);
            localStorage.setItem('token', data.token); // Guardar token también en registro
            localStorage.setItem('user', JSON.stringify({ userId: data.userId, name: data.name, role: data.role }));
            $("#registerModal").modal("hide");
             setTimeout(() => {
                alert('¡Registro exitoso! Se ha iniciado sesión automáticamente.');
                updateUIForLoggedInUser(data.name, data.role);
                if (window.location.pathname === '/home' || window.location.pathname === '/') {
                    cargarMascotas();
                }
            }, 200);
        } catch (error) {
            console.error('Error de registro:', error);
            alert(`Error en el registro: ${error.message}`);
        }
    }

    function updateNavbarForUserRole(role) {
        console.log("updateNavbarForUserRole - role:", role); // DEBUG
        const misSolicitudesNavItem = document.getElementById('misSolicitudesNavItem');
        const registrarMascotaNavItem = document.getElementById('registrarMascotaNavItem');

        if (misSolicitudesNavItem) { // Siempre visible si está logueado
            misSolicitudesNavItem.style.display = 'list-item';
        }
        if (registrarMascotaNavItem) {
            if (role === 'dueño/rescatista' || role === 'admin') {
                registrarMascotaNavItem.style.display = 'list-item';
            } else {
                registrarMascotaNavItem.style.display = 'none';
            }
        }
    }

    function restoreNavbarForLoggedOutUser() {
        console.log("restoreNavbarForLoggedOutUser called"); // DEBUG
        const navUserSection = document.getElementById('navUserSection');
        if (navUserSection) {
            navUserSection.innerHTML = `
            <li class="nav-item" id="loginNavItem">
                <a class="nav-link btn btn-outline-light nav-button" href="#" data-toggle="modal" data-target="#loginModal">Ingresar</a>
            </li>
            <li class="nav-item" id="registerNavItem">
                <a class="nav-link btn btn-dark nav-button ml-2" href="#" data-toggle="modal" data-target="#registerModal">Registrarme</a>
            </li>`;
        }
        const misSolicitudesNavItem = document.getElementById('misSolicitudesNavItem');
        const registrarMascotaNavItem = document.getElementById('registrarMascotaNavItem');
        if (misSolicitudesNavItem) misSolicitudesNavItem.style.display = 'none';
        if (registrarMascotaNavItem) registrarMascotaNavItem.style.display = 'none';
    }

    function updateUIForLoggedInUser(userName, userRole) {
        console.log("updateUIForLoggedInUser - userName:", userName, "userRole:", userRole); //DEBUG
        const navUserSection = document.getElementById('navUserSection');
        if (navUserSection) {
            navUserSection.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Hola, ${userName}
                </a>
                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarUserDropdown">
                    <a class="dropdown-item" href="/perfil">Mi Perfil</a>
                    <div class="dropdown-divider"></div>
                    <button id="logoutButton" class="dropdown-item" type="button">Salir</button>
                </div>
            </li>`;
            const logoutButton = document.getElementById('logoutButton');
            if(logoutButton) {
                logoutButton.addEventListener('click', handleLogout);
            }
        }
        updateNavbarForUserRole(userRole);
    }

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Has cerrado sesión.');
        restoreNavbarForLoggedOutUser();
        if (window.location.pathname === '/mis-solicitudes' || window.location.pathname === '/perfil' || window.location.pathname === '/registrar-mascota') {
            window.location.href = '/home';
        } else if (typeof cargarMascotas === "function" && (window.location.pathname.includes('/home') || window.location.pathname === '/')) {
             setTimeout(() => cargarMascotas(), 0); // Recargar para actualizar UI
        }
    }

    // ========== FUNCIONES DE GESTIÓN DE MASCOTAS ==========
    async function cargarMascotas(filters = {}) {
        const petsList = document.getElementById("petsList");
        if (!petsList) return;
        petsList.innerHTML = "<div class='col-12 text-center'><i class='fas fa-spinner fa-spin fa-3x'></i><p>Cargando mascotas...</p></div>";
        let queryString = '/api/pets?status=disponible';
        if (filters.type) queryString += `&type=${encodeURIComponent(filters.type)}`;
        if (filters.city) queryString += `&city=${encodeURIComponent(filters.city)}`;
        if (filters.minAge) queryString += `&minAge=${encodeURIComponent(filters.minAge)}`;
        if (filters.maxAge) queryString += `&maxAge=${encodeURIComponent(filters.maxAge)}`;
        try {
            const response = await fetch(queryString);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errData.message || `Error al cargar mascotas: ${response.status}`);
            }
            const mascotas = await response.json();
            petsList.innerHTML = ""; 
            if (mascotas.length === 0) {
                petsList.innerHTML = "<p class='col-12 text-center'>No se encontraron mascotas con esos criterios.</p>";
                return;
            }
            const currentUserData = localStorage.getItem('user');
            const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
            mascotas.forEach(mascota => {
                const col = document.createElement("div");
                col.className = "col-md-4 mb-4";
                let petImage = '/images/default-pet.png';
                if (mascota.photos && mascota.photos.length > 0 && mascota.photos[0]) petImage = mascota.photos[0];
                let adminButtons = '';
                if (currentUser && mascota.owner && currentUser.userId === (mascota.owner._id || mascota.owner)) {
                    adminButtons = `
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-info mr-2" onclick="editPet('${mascota._id}')">Editar</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deletePet('${mascota._id}')">Borrar</button>
                        </div>`;
                }
                col.innerHTML = `
                    <div class="card h-100">
                        <img src="${petImage}" class="card-img-top pet-img" alt="${mascota.name}" onerror="this.onerror=null;this.src='/images/default-pet.png';">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${mascota.name}</h5>
                            <p class="card-text">${mascota.type} ${mascota.breed ? '• ' + mascota.breed : ''} • ${mascota.age} ${mascota.age === 1 ? 'año' : 'años'}</p>
                            <p class="card-text"><small class="text-muted"><i class="fas fa-map-marker-alt"></i> ${mascota.city}</small></p>
                            <a href="/mascota/${mascota._id}" class="btn btn-outline-dark btn-block mt-auto">Ver detalles</a>
                            ${adminButtons}
                        </div>
                    </div>`;
                petsList.appendChild(col);
            });
        } catch (error) {
            console.error("Error en cargarMascotas:", error);
            petsList.innerHTML = `<p class='col-12 text-center text-danger'>Error al cargar las mascotas: ${error.message}</p>`;
        }
    }
    window.editPet = function(petId) { window.location.href = `/registrar-mascota?edit=${petId}`; }
    window.deletePet = async function(petId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta mascota?')) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) { alert('Debes iniciar sesión para eliminar mascotas.'); return; }
            const response = await fetch(`/api/pets/${petId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error al eliminar la mascota.');
            alert(data.msg || 'Mascota eliminada exitosamente.');
            cargarMascotas();
        } catch (error) { console.error('Error al eliminar mascota:', error); alert(`Error: ${error.message}`); }
    }
    
    // ========== FUNCIONES PARA DETAILS.HTML ==========
    async function loadPetDetails() {
        const pathParts = window.location.pathname.split('/');
        const petId = pathParts[pathParts.length - 1];
        const detailContainer = document.getElementById('petDetailContainer');
        if (!petId || petId.toLowerCase() === 'details.html') {
            if(detailContainer) detailContainer.innerHTML = '<p class="text-danger text-center">ID de mascota no válido en la URL.</p>';
            return;
        }
        if (detailContainer) detailContainer.innerHTML = '<p class="text-center">Cargando detalles de la mascota...</p>';
        try {
            console.log(`Workspaceing pet details for ID: ${petId}`); // DEBUG
            const response = await fetch(`/api/pets/${petId}`);
            const responseContentType = response.headers.get("content-type");
            if (!response.ok) {
                let errorData = { message: `Error ${response.status}: ${response.statusText}` };
                if (responseContentType && responseContentType.includes("application/json")) {
                    errorData = await response.json();
                }
                throw new Error(errorData.message || errorData.msg || `Error ${response.status}`);
            }
             if (!(responseContentType && responseContentType.includes("application/json"))) {
                throw new Error("Respuesta inesperada del servidor (no es JSON).");
            }
            const mascota = await response.json();
            if (!mascota || !mascota.name) { // Chequeo básico si la mascota tiene datos
                throw new Error("Datos de mascota no encontrados o incompletos en la respuesta.");
            }

            if (detailContainer) detailContainer.innerHTML = '';

            document.getElementById('mainImage').src = (mascota.photos && mascota.photos[0]) ? mascota.photos[0] : '/images/default-pet.png';
            document.getElementById('mainImage').alt = mascota.name;
            const breadcrumbPetName = document.getElementById('breadcrumbPetName');
            if (breadcrumbPetName) breadcrumbPetName.textContent = mascota.name;
            const thumbnailsRow = document.getElementById('petThumbnailsRow');
            if (thumbnailsRow) {
                thumbnailsRow.innerHTML = ''; 
                if (mascota.photos && mascota.photos.length > 0) {
                    mascota.photos.forEach(photoUrl => {
                        const col = document.createElement('div');
                        col.className = 'col-3 mb-3';
                        col.innerHTML = `<img src="${photoUrl}" class="pet-thumbnail" alt="${mascota.name}" onclick="changeImage(this.src)">`; // Corregido: changeImage global
                        thumbnailsRow.appendChild(col);
                    });
                } else {
                    thumbnailsRow.innerHTML = '<div class="col-12 text-center"><p>No hay imágenes adicionales.</p></div>';
                }
            }
            document.getElementById('petName').textContent = mascota.name;
            document.getElementById('petTypeBreed').textContent = `${mascota.type}${mascota.breed ? ' - ' + mascota.breed : ''}`;
            document.getElementById('petAge').textContent = `${mascota.age} ${mascota.age === 1 ? 'año' : 'años'}`;
            document.getElementById('petLocation').textContent = mascota.city;
            document.getElementById('petHealth').textContent = mascota.healthStatus;
            document.getElementById('petDescription').textContent = mascota.description;
            if (mascota.owner) {
                document.getElementById('ownerName').textContent = mascota.owner.name || 'No disponible';
                document.getElementById('ownerContact').textContent = mascota.owner.email || 'No disponible';
            }
            const adoptButtonContainer = document.getElementById('adoptButtonContainer');
            if (adoptButtonContainer) {
                const currentUserData = localStorage.getItem('user');
                const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
                if (currentUser && mascota.owner && currentUser.userId !== (mascota.owner._id || mascota.owner)) {
                    adoptButtonContainer.innerHTML = `<button class="btn btn-dark btn-lg btn-block btn-adopt" onclick="requestAdoption('${mascota._id}')">Solicitar Adopción</button>`;
                } else if (currentUser && mascota.owner && currentUser.userId === (mascota.owner._id || mascota.owner)) {
                    adoptButtonContainer.innerHTML = `<p class="text-info">Eres el dueño/rescatista de esta mascota.</p>`;
                } else if (!currentUser) {
                    adoptButtonContainer.innerHTML = `<p><a href="#" data-toggle="modal" data-target="#loginModal">Inicia sesión</a> para solicitar adopción.</p>`;
                } else { adoptButtonContainer.innerHTML = ''; }
            }
        } catch (error) {
            console.error('Error al cargar detalles de la mascota:', error);
            if(detailContainer) detailContainer.innerHTML = `<p class="text-danger text-center">Error al cargar detalles: ${error.message}</p>`;
        }
    }
    window.changeImage = function(newSrc) { document.getElementById('mainImage').src = newSrc; } // Hacer global
    window.requestAdoption = async function(petId) { // Hacer global
        const token = localStorage.getItem('token');
        if (!token) { alert('Debes iniciar sesión para solicitar una adopción.'); $('#loginModal').modal('show'); return; }
        if (!confirm('¿Estás seguro de enviar una solicitud de adopción para esta mascota?')) return;
        try {
            const response = await fetch(`/api/adoption-requests/pet/${petId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || `Error ${response.status}`);
            alert(result.message || 'Solicitud de adopción enviada exitosamente.');
            document.getElementById('adoptButtonContainer').innerHTML = '<p class="text-success">Solicitud enviada.</p>';
        } catch (error) { console.error('Error al solicitar adopción:', error); alert(`Error: ${error.message}`); }
    }

    // ========== FUNCIONES PARA REGISTRARMASCOTA.HTML ==========
    async function handlePetRegistrationForm(formElement) {
        const urlParams = new URLSearchParams(window.location.search);
        const petIdToEdit = urlParams.get('edit');
        let isEditMode = !!petIdToEdit;
        const formTitle = document.getElementById('formTitle');
        const statusGroup = document.getElementById('petStatusGroup');

        if (isEditMode) {
            if (formTitle) formTitle.textContent = 'Editar Mascota';
            if (statusGroup) statusGroup.style.display = 'block'; // Mostrar grupo de estado en modo edición
            try {
                const token = localStorage.getItem('token'); // Necesitas token para ver detalles si la mascota no es tuya y no está disponible, etc.
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const response = await fetch(`/api/pets/${petIdToEdit}`, { headers });
                if (!response.ok) { 
                    const err = await response.json();
                    throw new Error(err.message || 'No se pudo cargar la mascota para editar.');
                }
                const petData = await response.json();
                // Verificar si el usuario logueado es el dueño
                const currentUserData = localStorage.getItem('user');
                const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
                if (!currentUser || !petData.owner || (currentUser.userId !== (petData.owner._id || petData.owner))) {
                     alert('No tienes permiso para editar esta mascota.');
                     window.location.href = '/home';
                     return;
                }

                formElement.name.value = petData.name || '';
                formElement.type.value = petData.type || '';
                formElement.breed.value = petData.breed || '';
                formElement.age.value = petData.age || '';
                formElement.city.value = petData.city || '';
                formElement.healthStatus.value = petData.healthStatus || '';
                formElement.description.value = petData.description || '';
                formElement.photos.value = (petData.photos || []).join(', ');
                if(formElement.status && petData.status) formElement.status.value = petData.status;
            } catch (error) {
                console.error("Error cargando mascota para editar:", error);
                alert("Error al cargar datos de la mascota para editar: " + error.message);
                isEditMode = false;
                if (formTitle) formTitle.textContent = 'Registrar Nueva Mascota';
                if (statusGroup) statusGroup.style.display = 'none';
            }
        } else {
            if (formTitle) formTitle.textContent = 'Registrar Nueva Mascota';
            if (statusGroup) statusGroup.style.display = 'none';
        }
        formElement.addEventListener('submit', async function(event) {
            event.preventDefault();
            const token = localStorage.getItem('token');
            if (!token) { alert('Debes iniciar sesión para esta acción.'); $('#loginModal').modal('show'); return; }
            const formData = new FormData(formElement);
            const petData = {};
            formData.forEach((value, key) => {
                if (key === 'photos') {
                    petData[key] = value.split(',').map(url => url.trim()).filter(url => url && (url.startsWith('http://') || url.startsWith('https://')));
                } else {
                    petData[key] = value;
                }
            });
            if(petData.age) petData.age = parseInt(petData.age);
            if (!isEditMode) { // En modo creación, el status es por defecto 'disponible' desde el backend
                delete petData.status;
            }

            try {
                const url = isEditMode ? `/api/pets/${petIdToEdit}` : '/api/pets';
                const method = isEditMode ? 'PATCH' : 'POST';
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(petData)
                });
                const result = await response.json();
                if (!response.ok) {
                    const errorMessage = result.errors ? result.errors.map(err => `${err.path || err.param || 'Error'}: ${err.msg}`).join('\n') : result.message;
                    throw new Error(errorMessage || `Error ${response.status}`);
                }
                alert(isEditMode ? '¡Mascota actualizada exitosamente!' : '¡Mascota registrada exitosamente!');
                window.location.href = isEditMode ? `/mascota/${petIdToEdit}` : `/mascota/${result._id}`; // Ir al detalle de la mascota nueva o editada
            } catch (error) {
                console.error('Error al registrar/actualizar mascota:', error);
                alert(`Error: ${error.message}`);
            }
        });
    }

    // ========== FUNCIONES PARA MISSOLICITUDES.HTML ==========
    async function loadMyAdoptionRequests() {
        const solicitudesList = document.getElementById('solicitudesList');
        if (!solicitudesList) return;
        solicitudesList.innerHTML = '<p class="col-12 text-center">Cargando tus solicitudes...</p>';
        const token = localStorage.getItem('token');
        if (!token) {
            solicitudesList.innerHTML = '<p class="col-12 text-warning text-center">Debes <a href="#" data-toggle="modal" data-target="#loginModal">iniciar sesión</a> para ver tus solicitudes.</p>';
            return;
        }
        try {
            const response = await fetch('/api/adoption-requests/my-requests', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({message: response.statusText}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }
            const requests = await response.json();
            solicitudesList.innerHTML = ''; 
            if (requests.length === 0) {
                solicitudesList.innerHTML = '<p class="col-12 text-center">No has enviado ninguna solicitud de adopción aún.</p>';
                return;
            }
            requests.forEach(req => {
                const pet = req.pet; 
                let petImage = (pet && pet.photos && pet.photos.length > 0) ? pet.photos[0] : '/images/default-pet.png';
                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4 mb-4';
                card.innerHTML = `
                    <div class="card h-100">
                        ${pet ? `<img src="${petImage}" class="card-img-top" alt="${pet.name || 'Mascota'}" style="height: 150px; object-fit: cover;" onerror="this.onerror=null;this.src='/images/default-pet.png';">` : '<div class="text-center p-3">Info. mascota no disponible</div>'}
                        <div class="card-body">
                            <h5 class="card-title">Mascota: ${pet ? `<a href="/mascota/${pet._id}">${pet.name || 'Nombre no disponible'}</a>` : 'Mascota no disponible'}</h5>
                            <p class="card-text">
                                Dueño/Rescatista: ${ (pet && pet.owner && pet.owner.name) ? pet.owner.name : 'No disponible'}<br>
                                Fecha Solicitud: ${new Date(req.requestDate).toLocaleDateString()}<br>
                                Estado: <span class="badge badge-${getStatusBadgeClass(req.status)} p-2">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
                            </p>
                            ${req.status === 'pendiente' ? 
                                `<button class="btn btn-sm btn-outline-danger mt-2" onclick="cancelAdoptionRequest('${req._id}')">Cancelar Solicitud</button>` : 
                                ''}
                        </div>
                    </div>`;
                solicitudesList.appendChild(card);
            });
        } catch (error) {
            console.error('Error al cargar mis solicitudes:', error);
            solicitudesList.innerHTML = `<p class="col-12 text-danger text-center">Error al cargar tus solicitudes: ${error.message}</p>`;
        }
    }
    window.cancelAdoptionRequest = async function(requestId) { // Hacer global
        if (!confirm('¿Estás seguro de que quieres cancelar esta solicitud de adopción?')) return;
        const token = localStorage.getItem('token');
        if (!token) { alert('Debes iniciar sesión.'); return; }
        try {
            const response = await fetch(`/api/adoption-requests/${requestId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status: 'cancelada' }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Error al cancelar la solicitud.');
            alert('Solicitud cancelada exitosamente.');
            loadMyAdoptionRequests();
        } catch (error) { console.error('Error al cancelar solicitud:', error); alert(`Error: ${error.message}`);}
    }
    function getStatusBadgeClass(status) {
        const statusClasses = { pendiente: 'warning', aceptada: 'success', rechazada: 'danger', cancelada: 'secondary' };
        return statusClasses[status] || 'light';
    }

    // ========== EVENT LISTENERS GLOBALES Y CARGA INICIAL ==========
    // Listeners para modales (asumiendo IDs genéricos loginForm, registerForm, etc. en los modales de CADA página)
    const loginForms = document.querySelectorAll("#loginForm"); // Puede haber varios si copiaste modales
    loginForms.forEach(form => {
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const emailInput = form.querySelector("input[type='email']"); // Busca por tipo dentro del form actual
            const passwordInput = form.querySelector("input[type='password']");
            if (emailInput && passwordInput) {
                handleLogin(emailInput.value, passwordInput.value);
            }
        });
    });

    const registerForms = document.querySelectorAll("#registerForm");
    registerForms.forEach(form => {
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            // Busca por name attribute o un ID más específico si es necesario
            const name = form.querySelector("#registerName") ? form.querySelector("#registerName").value : form.elements['name']?.value;
            const email = form.querySelector("#registerEmail") ? form.querySelector("#registerEmail").value : form.elements['email']?.value;
            const password = form.querySelector("#registerPassword") ? form.querySelector("#registerPassword").value : form.elements['password']?.value;
            const city = form.querySelector("#registerCity") ? form.querySelector("#registerCity").value : form.elements['city']?.value;
            // const role = form.querySelector("#registerRole") ? form.querySelector("#registerRole").value : 'adoptante';
            handleRegister(name, email, password, city /*, role*/);
        });
    });

    const filterForm = document.getElementById("filterForm");
    if (filterForm) {
        filterForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const filters = {
                type: document.getElementById('animalType').value,
                city: document.getElementById('citySelect').value,
                minAge: document.getElementById('minAge').value,
                maxAge: document.getElementById('maxAge').value
            };
            Object.keys(filters).forEach(key => { if (!filters[key]) delete filters[key]; });
            cargarMascotas(filters);
        });
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            if(user && user.name && user.role) updateUIForLoggedInUser(user.name, user.role);
            else handleLogout(); 
        } catch(e) { console.error("Error parsing stored user", e); handleLogout(); }
    } else {
        restoreNavbarForLoggedOutUser();
    }

    if (document.getElementById("petsList")) cargarMascotas();
    if (window.location.pathname.startsWith('/mascota/')) loadPetDetails();
    
    const registerPetFormElement = document.getElementById('registerPetForm');
    if (registerPetFormElement) handlePetRegistrationForm(registerPetFormElement);
    
    if (window.location.pathname === '/mis-solicitudes') {
        const refreshButton = document.getElementById('refreshRequestsButton');
        if (refreshButton) refreshButton.addEventListener('click', loadMyAdoptionRequests);
        if (localStorage.getItem('token')) loadMyAdoptionRequests();
        else {
            const solicitudesList = document.getElementById('solicitudesList');
            if(solicitudesList) solicitudesList.innerHTML = '<p class="col-12 text-center text-warning">Debes <a href="#" data-toggle="modal" data-target="#loginModal">iniciar sesión</a> para ver tus solicitudes.</p>';
        }
    }
});