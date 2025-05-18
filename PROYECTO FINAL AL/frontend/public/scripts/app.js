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
            
            const activeModal = $('.modal.show').attr('id'); // Intenta obtener el ID del modal activo
            if (activeModal) {
                $(`#${activeModal}`).modal("hide");
            } else { // Fallback por si no se detecta
                $("#loginModal").modal("hide");
            }

            setTimeout(() => { // Pequeño delay para que el modal se cierre visualmente antes de la alerta
                alert('¡Inicio de sesión exitoso!');
                updateUIForLoggedInUser(data.name, data.role);
                if (window.location.pathname === '/home' || window.location.pathname === '/') {
                    cargarMascotas(); 
                }
                if (window.location.pathname.startsWith('/mascota/')) {
                    loadPetDetails(); // Recargar detalles si estamos en esa página
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
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ userId: data.userId, name: data.name, role: data.role }));
            
            const activeModal = $('.modal.show').attr('id');
             if (activeModal) {
                $(`#${activeModal}`).modal("hide");
            } else {
                $("#registerModal").modal("hide");
            }
            
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
        console.log("Navbar update for role:", role);
        const misSolicitudesNavItem = document.getElementById('misSolicitudesNavItem');
        const registrarMascotaNavItem = document.getElementById('registrarMascotaNavItem');

        if (localStorage.getItem('token')) { // Solo mostrar si está logueado
            if (misSolicitudesNavItem) misSolicitudesNavItem.style.display = 'list-item';
            
            if (registrarMascotaNavItem) {
                if (role === 'dueño/rescatista' || role === 'admin') {
                    registrarMascotaNavItem.style.display = 'list-item';
                } else {
                    registrarMascotaNavItem.style.display = 'none';
                }
            }
        } else { // Si no está logueado, ocultar ambos
            if (misSolicitudesNavItem) misSolicitudesNavItem.style.display = 'none';
            if (registrarMascotaNavItem) registrarMascotaNavItem.style.display = 'none';
        }
    }

    function restoreNavbarForLoggedOutUser() {
        console.log("Restoring navbar for logged out user");
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
        updateNavbarForUserRole(null); // Esto ocultará 'Mis Solicitudes' y 'Registrar Mascota'
    }

    function updateUIForLoggedInUser(userName, userRole) {
        console.log("Updating UI for logged in user:", userName, userRole);
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
        if (['/mis-solicitudes', '/perfil', '/registrar-mascota'].includes(window.location.pathname)) {
            window.location.href = '/home';
        } else if (typeof cargarMascotas === "function" && (window.location.pathname.includes('/home') || window.location.pathname === '/')) {
             setTimeout(() => cargarMascotas(), 0);
        } else if (window.location.pathname.startsWith('/mascota/')) {
            loadPetDetails(); // Recargar para mostrar estado correcto del botón de adopción
        }
    }

    // ========== FUNCIONES DE GESTIÓN DE MASCOTAS ==========
    async function cargarMascotas(filters = {}) {
        const petsList = document.getElementById("petsList");
        if (!petsList) return;
        petsList.innerHTML = "<div class='col-12 text-center'><i class='fas fa-spinner fa-spin fa-3x'></i><p>Cargando mascotas...</p></div>";
        
        let queryStringParts = [];
        if (filters.type) queryStringParts.push(`type=${encodeURIComponent(filters.type)}`);
        if (filters.city) queryStringParts.push(`city=${encodeURIComponent(filters.city)}`);
        if (filters.minAge) queryStringParts.push(`minAge=${encodeURIComponent(filters.minAge)}`);
        if (filters.maxAge) queryStringParts.push(`maxAge=${encodeURIComponent(filters.maxAge)}`);
        // Por defecto siempre pedimos status disponible, a menos que un filtro diga lo contrario (no implementado)
        queryStringParts.push(`status=disponible`); 

        const queryString = `/api/pets?${queryStringParts.join('&')}`;

        try {
            const response = await fetch(queryString);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errData.message || `Error al cargar mascotas: ${response.status}`);
            }
            const mascotas = await response.json();
            petsList.innerHTML = ""; 
            if (mascotas.length === 0) {
                petsList.innerHTML = "<p class='col-12 text-center'>No se encontraron mascotas con los criterios seleccionados.</p>";
                return;
            }
            const currentUserData = localStorage.getItem('user');
            const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
            mascotas.forEach(mascota => {
                const col = document.createElement("div");
                col.className = "col-lg-4 col-md-6 mb-4";
                let petImage = '/images/default-pet.png';
                if (mascota.photos && mascota.photos.length > 0 && mascota.photos[0]) petImage = mascota.photos[0];
                let adminButtons = '';
                if (currentUser && mascota.owner && currentUser.userId === (mascota.owner._id || mascota.owner)) { // Compara con _id si owner es objeto
                    adminButtons = `
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-info mr-2" onclick="editPet('${mascota._id}')">Editar</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deletePet('${mascota._id}')">Borrar</button>
                        </div>`;
                }
                col.innerHTML = `
                    <div class="card h-100">
                        <img src="${petImage}" class="card-img-top pet-img" alt="${mascota.name || 'Mascota'}" onerror="this.onerror=null;this.src='/images/default-pet.png';">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${mascota.name || 'Nombre no disponible'}</h5>
                            <p class="card-text mb-1">${mascota.type || 'N/A'} ${mascota.breed ? '• ' + mascota.breed : ''}</p>
                            <p class="card-text mb-1"><small class="text-muted">${mascota.age !== undefined ? mascota.age + (mascota.age === 1 ? ' año' : ' años') : 'Edad N/A'}</small></p>
                            <p class="card-text"><small class="text-muted"><i class="fas fa-map-marker-alt"></i> ${mascota.city || 'N/A'}</small></p>
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
            if (!response.ok) throw new Error(data.message || data.msg || 'Error al eliminar la mascota.');
            alert(data.msg || 'Mascota eliminada exitosamente.');
            cargarMascotas();
        } catch (error) { console.error('Error al eliminar mascota:', error); alert(`Error: ${error.message}`); }
    }
    
    // ========== FUNCIONES PARA DETAILS.HTML ==========
    async function loadPetDetails() {
        const pathParts = window.location.pathname.split('/');
        const petId = pathParts[pathParts.length - 1];
        const detailContainer = document.getElementById('petDetailContainer');

        if (!petId || !/^[a-f\d]{24}$/i.test(petId)) {
            console.error("ID de mascota no válido en la URL:", petId);
            if(detailContainer) detailContainer.innerHTML = '<p class="text-danger text-center display-4 mt-5">ID de mascota no válido.</p>';
            return;
        }
        
        // Actualizar placeholders a "Cargando..." si no lo están ya
        document.getElementById('petName').textContent = 'Cargando...';
        // (y así para los otros campos si se desea un feedback más granular)

        try {
            console.log(`Workspaceing pet details for ID: ${petId}`);
            const response = await fetch(`/api/pets/${petId}`);
            const responseContentType = response.headers.get("content-type");

            if (!response.ok) {
                let errorData = { message: `Error ${response.status}: ${response.statusText}` };
                try { errorData = await response.json(); } catch (e) { /* No es JSON */ }
                throw new Error(errorData.message || errorData.msg || `Error ${response.status}`);
            }
             if (!(responseContentType && responseContentType.includes("application/json"))) {
                throw new Error("Respuesta inesperada del servidor (no es JSON).");
            }
            const mascota = await response.json();
            if (!mascota || Object.keys(mascota).length === 0 || !mascota.name) {
                throw new Error("Mascota no encontrada o datos incompletos.");
            }

            document.getElementById('mainImage').src = (mascota.photos && mascota.photos.length > 0 && mascota.photos[0]) ? mascota.photos[0] : '/images/default-pet.png';
            document.getElementById('mainImage').alt = mascota.name;
            
            const breadcrumbPetName = document.getElementById('breadcrumbPetName');
            if (breadcrumbPetName) breadcrumbPetName.textContent = mascota.name;
            
            const thumbnailsRow = document.getElementById('petThumbnailsRow');
            if (thumbnailsRow) {
                thumbnailsRow.innerHTML = ''; 
                if (mascota.photos && mascota.photos.length > 0) {
                    mascota.photos.forEach(photoUrl => {
                        if(!photoUrl) return; // Saltar si la URL es null o vacía
                        const col = document.createElement('div');
                        col.className = 'col-3 mb-3';
                        col.innerHTML = `<img src="${photoUrl}" class="pet-thumbnail" alt="${mascota.name} thumbnail" onclick="changeImage(this.src)">`;
                        thumbnailsRow.appendChild(col);
                    });
                }
            }
            
            document.getElementById('petName').textContent = mascota.name;
            document.getElementById('petTypeBreed').textContent = `${mascota.type || 'N/A'}${mascota.breed ? ' - ' + mascota.breed : ''}`;
            document.getElementById('petAge').textContent = `${mascota.age !== undefined ? mascota.age : 'N/A'} ${mascota.age === 1 ? 'año' : 'años'}`;
            document.getElementById('petLocation').textContent = mascota.city || 'N/A';
            document.getElementById('petHealth').textContent = mascota.healthStatus || 'N/A';
            document.getElementById('petDescription').textContent = mascota.description || 'No disponible.';

            if (mascota.owner) {
                document.getElementById('ownerName').textContent = mascota.owner.name || 'No disponible';
                document.getElementById('ownerContact').textContent = mascota.owner.email || 'No disponible';
            } else {
                document.getElementById('ownerName').textContent = 'Información no disponible';
                document.getElementById('ownerContact').textContent = 'Información no disponible';
            }

            const adoptButtonContainer = document.getElementById('adoptButtonContainer');
            if (adoptButtonContainer) {
                const currentUserData = localStorage.getItem('user');
                const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
                adoptButtonContainer.innerHTML = ''; 

                if (mascota.status === 'adoptado') {
                    adoptButtonContainer.innerHTML = `<p class="alert alert-success text-center">¡Esta mascota ya ha sido adoptada!</p>`;
                } else if (mascota.status === 'en proceso') {
                     adoptButtonContainer.innerHTML = `<p class="alert alert-info text-center">Esta mascota está en proceso de adopción.</p>`;
                } else if (mascota.status === 'disponible') {
                    if (currentUser && mascota.owner && currentUser.userId !== (mascota.owner._id || mascota.owner)) {
                        adoptButtonContainer.innerHTML = `<button class="btn btn-dark btn-lg btn-block btn-adopt" onclick="requestAdoption('${mascota._id}')">Solicitar Adopción</button>`;
                    } else if (currentUser && mascota.owner && currentUser.userId === (mascota.owner._id || mascota.owner)) {
                        adoptButtonContainer.innerHTML = `<p class="text-info text-center">Eres el dueño/rescatista de esta mascota.<br><span class="text-muted small">Estado actual: <span class="badge badge-primary p-1">${mascota.status}</span></span></p>`;
                    } else if (!currentUser) {
                        adoptButtonContainer.innerHTML = `<p class="text-center"><a href="#" data-toggle="modal" data-target="#loginModal">Inicia sesión</a> para solicitar adopción.</p>`;
                    }
                } else {
                     adoptButtonContainer.innerHTML = `<p class="text-muted text-center">Estado de la mascota: ${mascota.status || 'No especificado'}</p>`;
                }
            }
        } catch (error) {
            console.error('Error al cargar detalles de la mascota:', error);
            if(detailContainer) detailContainer.innerHTML = `<p class="text-danger text-center display-4 mt-5">Error al cargar detalles: ${error.message}</p>`;
        }
    }
    window.changeImage = function(newSrc) { const main = document.getElementById('mainImage'); if(main) main.src = newSrc; }
    window.requestAdoption = async function(petId) {
        const token = localStorage.getItem('token');
        if (!token) { alert('Debes iniciar sesión para solicitar una adopción.'); $('#loginModal').modal('show'); return; }
        if (!confirm('¿Estás seguro de enviar una solicitud de adopción para esta mascota?')) return;
        try {
            const response = await fetch(`/api/adoption-requests/pet/${petId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || `Error ${response.status}`);
            alert(result.message || 'Solicitud de adopción enviada exitosamente.');
            const adoptButtonContainer = document.getElementById('adoptButtonContainer');
            if (adoptButtonContainer) adoptButtonContainer.innerHTML = '<p class="alert alert-success text-center">Solicitud enviada. El dueño/rescatista se pondrá en contacto.</p>';
            loadPetDetails(); // Recargar para reflejar si el estado de la mascota cambió
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
            if (statusGroup) statusGroup.style.display = 'block';
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const response = await fetch(`/api/pets/${petIdToEdit}`, { headers });
                if (!response.ok) { 
                    const err = await response.json().catch(()=>({message: response.statusText}));
                    throw new Error(err.message || 'No se pudo cargar la mascota para editar.');
                }
                const petData = await response.json();
                const currentUserData = localStorage.getItem('user');
                const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
                if (!currentUser || !petData.owner || (currentUser.userId !== (petData.owner._id || petData.owner))) {
                     alert('No tienes permiso para editar esta mascota.'); window.location.href = '/home'; return;
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
                alert("Error al cargar datos para editar: " + error.message);
                isEditMode = false;
                if (formTitle) formTitle.textContent = 'Registrar Nueva Mascota';
                if (statusGroup) statusGroup.style.display = 'none';
            }
        } else {
            if (formTitle) formTitle.textContent = 'Registrar Nueva Mascota';
            if (statusGroup) statusGroup.style.display = 'none';
             // Limpiar el formulario si no es modo edición
            formElement.reset();
        }
        formElement.addEventListener('submit', async function(event) {
            event.preventDefault();
            const token = localStorage.getItem('token');
            if (!token) { alert('Debes iniciar sesión.'); $('#loginModal').modal('show'); return; }
            const formData = new FormData(formElement);
            const petData = {};
            formData.forEach((value, key) => {
                if (key === 'photos') {
                    petData[key] = value.split(',').map(url => url.trim()).filter(url => url && (url.startsWith('http://') || url.startsWith('https://')));
                } else if (key === 'age' && value !== '') { // Asegurarse que la edad no sea string vacío
                    petData[key] = parseInt(value);
                } else if (value !== '') { // Solo incluir campos con valor
                    petData[key] = value;
                }
            });
            if (!isEditMode) delete petData.status; // No enviar status en creación
            else if (!petData.status) delete petData.status; // No enviar status si está vacío en edición


            try {
                const url = isEditMode ? `/api/pets/${petIdToEdit}` : '/api/pets';
                const method = isEditMode ? 'PATCH' : 'POST';
                const response = await fetch(url, {
                    method: method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(petData)
                });
                const result = await response.json();
                if (!response.ok) {
                    const errorMessage = result.errors ? result.errors.map(err => `${err.path || err.param || 'Error'}: ${err.msg}`).join('\n') : (result.message || `Error ${response.status}`);
                    throw new Error(errorMessage);
                }
                alert(isEditMode ? '¡Mascota actualizada!' : '¡Mascota registrada!');
                window.location.href = `/mascota/${isEditMode ? petIdToEdit : result._id}`;
            } catch (error) { console.error('Error al guardar mascota:', error); alert(`Error: ${error.message}`); }
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
    window.cancelAdoptionRequest = async function(requestId) {
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
    document.querySelectorAll('form#loginForm').forEach(form => { // Más específico para el ID del form
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const emailInput = this.querySelector('#loginEmail'); 
            const passwordInput = this.querySelector('#loginPassword');
            if (emailInput && passwordInput) {
                handleLogin(emailInput.value, passwordInput.value);
            }
        });
    });
    document.querySelectorAll('form#registerForm').forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = this.querySelector('#registerName')?.value;
            const email = this.querySelector('#registerEmail')?.value;
            const password = this.querySelector('#registerPassword')?.value;
            const city = this.querySelector('#registerCity')?.value;
            if (name && email && password && city) {
                 handleRegister(name, email, password, city);
            } else {
                alert("Por favor completa todos los campos del registro.");
            }
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

    // Carga de contenido específico de la página
    const currentPagePath = window.location.pathname;
    if (document.getElementById("petsList") && (currentPagePath === '/home' || currentPagePath === '/')) {
        cargarMascotas();
    }
    
    const registerPetFormElement = document.getElementById('registerPetForm');
    if (registerPetFormElement && currentPagePath.includes('/registrar-mascota')) {
        handlePetRegistrationForm(registerPetFormElement);
    }
    
    if (currentPagePath.startsWith('/mascota/')) {
        loadPetDetails();
    } else if (currentPagePath === '/mis-solicitudes') {
        const refreshButton = document.getElementById('refreshRequestsButton');
        if (refreshButton) {
            refreshButton.addEventListener('click', loadMyAdoptionRequests);
        }
        if (localStorage.getItem('token')) {
            loadMyAdoptionRequests();
        } else {
            const solicitudesList = document.getElementById('solicitudesList');
            if(solicitudesList) solicitudesList.innerHTML = '<p class="col-12 text-center text-warning">Debes <a href="#" data-toggle="modal" data-target="#loginModal">iniciar sesión</a> para ver tus solicitudes.</p>';
        }
    }
});