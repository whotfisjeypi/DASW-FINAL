// --- Auth helpers ---
function setToken(token) {
    localStorage.setItem('token', token);
}
function getToken() {
    return localStorage.getItem('token');
}
function clearToken() {
    localStorage.removeItem('token');
}
function authFetch(url, opts = {}) {
    const token = getToken();
    opts.headers = {
        'Content-Type': 'application/json',
        ...(opts.headers||{}),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    };
    return fetch(url, opts);
}

// --- Navbar logic ---
function updateNav() {
    const logged = !!getToken();
    document.getElementById('login-link').style.display     = logged ? 'none' : 'inline';
    document.getElementById('register-link').style.display  = logged ? 'none' : 'inline';
    document.getElementById('logout-link').style.display    = logged ? 'inline' : 'none';
}
window.addEventListener('DOMContentLoaded', updateNav);

// Logout
document.addEventListener('click', e => {
    if (e.target.id === 'btn-logout') {
        clearToken();
        updateNav();
        window.location = 'Home.html';
    }
});

// --- Ejemplo: cargar mascotas con authFetch ---
async function cargarMascotas() {
    try {
        const res = await authFetch('/api/pets');
        if (!res.ok) throw await res.json();
        const pets = await res.json();
        // aquí tu código para mostrarlas...
    } catch(err) {
        console.error(err);
        if (err.msg === 'Token inválido') {
            clearToken();
            updateNav();
            window.location = 'login.html';
        }
    }
}


document.addEventListener("DOMContentLoaded", function() {
    // ========== LOGIN ==========
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            console.log("Iniciando sesión...");
            $("#loginModal").modal("hide");
        });
    }

    // ========== REGISTRO ==========
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function(event) {
            event.preventDefault();
            console.log("Registrando usuario...");
            $("#registerModal").modal("hide");
        });
    }

    // ========== FILTRO DE MASCOTAS ==========
    const filterForm = document.getElementById("filterForm");
    if (filterForm) {
        filterForm.addEventListener("submit", function(event) {
            event.preventDefault();
            console.log("Aplicando filtros...");
            cargarMascotas(); // Aquí cargarías mascotas filtradas
        });
    }

    // ========== CARGAR MASCOTAS (simulado ahora) ==========
    function cargarMascotas() {
        const petsList = document.getElementById("petsList");
        if (!petsList) return;

        petsList.innerHTML = ""; // Limpia antes de cargar

        // Mascotas simuladas
        const mascotas = [
            { id: 1, nombre: "Luna", tipo: "Gato", raza: "Siamés", edad: 2, ciudad: "Guadalajara" },
            { id: 2, nombre: "Max", tipo: "Perro", raza: "Labrador", edad: 3, ciudad: "Zapopan" },
            { id: 3, nombre: "Rocky", tipo: "Perro", raza: "Pastor Alemán", edad: 1, ciudad: "Tlaquepaque" }
        ];

        mascotas.forEach(mascota => {
            const col = document.createElement("div");
            col.className = "col-md-4 mb-4";

            col.innerHTML = `
                <div class="card">
                    <img src="/api/placeholder/300/200" class="card-img-top pet-img" alt="Mascota">
                    <div class="card-body">
                        <h5 class="card-title">${mascota.nombre}</h5>
                        <p class="card-text">${mascota.tipo} • ${mascota.raza} • ${mascota.edad} años</p>
                        <p class="card-text"><small class="text-muted">${mascota.ciudad}</small></p>
                        <a href="/mascota/${mascota.id}" class="btn btn-outline-dark btn-block">Ver detalles</a>
                    </div>
                </div>
            `;

            petsList.appendChild(col);
        });
    }
// --- Auth helpers (añádelos al inicio de app.js) ---
    function setToken(token) {
        localStorage.setItem('token', token);
    }
    function getToken() {
        return localStorage.getItem('token');
    }
    function clearToken() {
        localStorage.removeItem('token');
    }
// función para hacer fetch con el header Authorization
    function authFetch(url, opts = {}) {
        const token = getToken();
        opts.headers = {
            'Content-Type': 'application/json',
            ...(opts.headers||{}),
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        };
        return fetch(url, opts);
    }

// --- EXTRA: extraer el ID del payload del JWT ---
    function getUserId() {
        const token = getToken();
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    }

// ahora exporta o deja global (si no usas módulos)…
    window.getUserId  = getUserId;
    window.authFetch  = authFetch;
    window.clearToken = clearToken;
    window.setToken   = setToken;

    cargarMascotas(); // Se llama automáticamente al abrir
});
