// URL del archivo JSON
const urlProductos = './js/product-list.json';

// Número de WhatsApp al que se enviarán los mensajes
const numeroWhatsapp = '3845406503'; // Reemplaza con el número de WhatsApp deseado

// Variables de estado
let paginaActual = 1;
const productosPorPagina = 12;
let productos = [];
let categoriaSeleccionada = 'Todos';
let filtrosPrecios = [];

// Función para cargar los datos del JSON
async function cargarDatos() {
    try {
        const response = await fetch(urlProductos);
        if (!response.ok) {
            throw new Error('Error al cargar el archivo JSON');
        }
        productos = await response.json();
        mostrarProductosFiltrados('Todos'); // Mostrar todos los productos inicialmente
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

// Función para mostrar productos con paginación
function mostrarProductosConPaginacion(productosFiltrados) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Limpiar la lista de productos

    // Calcular índices de inicio y fin
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosFiltrados.slice(inicio, fin);

    // Iterar sobre los productos de la página actual y crear elementos HTML
    productosPagina.forEach(producto => {
        const productDiv = document.createElement('div');
        productDiv.className = 'col-lg-4 col-md-6 col-sm-6 pb-1';

        productDiv.innerHTML = `
            <div class="product-item bg-light mb-4">
                <div class="product-img position-relative overflow-hidden">
                    <img class="img-fluid w-100" src="${producto.imagen}" alt="${producto.nombre}">
                    <div class="product-action">
                        <a class="btn btn-outline-dark btn-square" href="https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${encodeURIComponent(producto.mensajeWhatsapp)}" target="_blank"><i class="fa fa-whatsapp"></i></a>
                    </div>
                </div>
                <div class="text-center py-4">
                    <a class="h6 text-decoration-none text-truncate" href="#">${producto.nombre}</a>
                    <div class="d-flex align-items-center justify-content-center mt-2">
                        <h5>$${producto.precio.toFixed(2)}</h5>
                    </div>
                </div>
            </div>
        `;

        productList.appendChild(productDiv);
    });

    // Actualizar la barra de paginación
    actualizarPaginacion(productosFiltrados);
}

// Función para actualizar los botones de paginación
function actualizarPaginacion(productosFiltrados) {
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    // Botón de página anterior
    const prevButton = document.createElement('li');
    prevButton.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = `<a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1})">Previous</a>`;
    pagination.appendChild(prevButton);

    // Botones de número de página
    for (let i = 1; i <= totalPaginas; i++) {
        const pageButton = document.createElement('li');
        pageButton.className = `page-item ${i === paginaActual ? 'active' : ''}`;
        pageButton.innerHTML = `<a class="page-link" href="#" onclick="cambiarPagina(${i})">${i}</a>`;
        pagination.appendChild(pageButton);
    }

    // Botón de página siguiente
    const nextButton = document.createElement('li');
    nextButton.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
    nextButton.innerHTML = `<a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1})">Next</a>`;
    pagination.appendChild(nextButton);
}

// Función para cambiar de página
function cambiarPagina(pagina) {
    paginaActual = pagina;
    mostrarProductosConPaginacion(filtrarProductosPorCategoria(categoriaSeleccionada));
}

// Función para filtrar productos por categoría
function filtrarProductosPorCategoria(categoria) {
    if (categoria === 'Todos') {
        return productos; // Mostrar todos los productos
    }
    return productos.filter(producto => producto.categorias.includes(categoria));
}


// Función para mostrar productos filtrados
function mostrarProductosFiltrados(categoria) {
    categoriaSeleccionada = categoria;
    paginaActual = 1; // Reiniciar a la primera página al cambiar de categoría
    mostrarProductosConPaginacion(filtrarProductosPorCategoria(categoria));
}

// Inicializar la carga de productos al cargar la página
document.addEventListener('DOMContentLoaded', cargarDatos);

// Mantener referencias a los temporizadores para cada categoría
const timeoutIds = {};

document.querySelectorAll('.categories-menu li').forEach(li => {
    li.addEventListener('mouseenter', () => {
        // Limpiar cualquier temporizador que esté ejecutándose
        if (timeoutIds[li.dataset.id]) {
            clearTimeout(timeoutIds[li.dataset.id]);
        }

        // Mostrar el submenú con una pequeña demora
        const submenu = li.querySelector('ul');
        if (submenu) {
            submenu.classList.add('show');
        }
    });

    li.addEventListener('mouseleave', () => {
        // Establecer un temporizador para cerrar el submenú después de un pequeño retraso
        const submenu = li.querySelector('ul');
        if (submenu) {
            timeoutIds[li.dataset.id] = setTimeout(() => {
                submenu.classList.remove('show');
            }, 300); // Ajustar el retraso según sea necesario
        }
    });
});

let timer;
function openSubcategories(element) {
    clearTimeout(timer);
    const subcategories = element.querySelector('ul');
    if (subcategories) {
        subcategories.style.display = 'block';
    }
}

function closeSubcategories(element) {
    timer = setTimeout(() => {
        const subcategories = element.querySelector('ul');
        if (subcategories) {
            subcategories.style.display = 'none';
        }
    }, 600);
}

// Función para filtrar productos por categoría y precio
function filtrarProductos() {
    let productosFiltrados = productos;

    if (categoriaSeleccionada !== 'Todos') {
        productosFiltrados = productosFiltrados.filter(producto => producto.categoria.includes(categoriaSeleccionada));
    }

    if (filtrosPrecios.length > 0) {
        productosFiltrados = productosFiltrados.filter(producto => {
            return filtrosPrecios.some(filtro => {
                return producto.precio >= filtro.min && producto.precio <= filtro.max;
            });
        });
    }

    return productosFiltrados;
}

// Función para mostrar productos filtrados
function mostrarProductosFiltrados(categoria) {
    categoriaSeleccionada = categoria;
    paginaActual = 1; // Reiniciar a la primera página al cambiar de categoría
    mostrarProductosConPaginacion(filtrarProductos());
}

// Función para actualizar los filtros de precios
function actualizarFiltrosPrecios() {
    const checkboxes = document.querySelectorAll('#price-filter-form input[type="checkbox"]:checked');
    filtrosPrecios = Array.from(checkboxes).map(checkbox => ({
        min: parseFloat(checkbox.getAttribute('data-min')),
        max: parseFloat(checkbox.getAttribute('data-max'))
    }));
    mostrarProductosFiltrados(categoriaSeleccionada);
}

// Añadir eventos a los checkboxes de precios
document.querySelectorAll('#price-filter-form input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', actualizarFiltrosPrecios);
});

