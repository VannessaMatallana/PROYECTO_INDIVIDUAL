document.addEventListener('DOMContentLoaded', () => {
    let tareas = [
        { id: 'check1', titulo: 'Comprar materiales para proyecto', descripcion: 'Adquirir telas e implementos de costura para mi emprendimiento.', fecha: '2026-06-15', categoria: 'Estudio', prioridad: 'Alta', completada: false },
        { id: 'check2', titulo: 'Revisar repositorio en GitHub', descripcion: 'Actualizar los commits y verificar que la rama principal esté al día.', fecha: '2026-06-18', categoria: 'Desarrollo', prioridad: 'Media', completada: false },
        { id: 'check3', titulo: 'Organizar escritorio de trabajo', descripcion: 'Limpiar el área y ordenar los apuntes de la clase de Java.', fecha: '2026-06-20', categoria: 'Personal', prioridad: 'Baja', completada: false },
        { id: 'check4', titulo: 'Revisar tareas y talleres pendientes del SENA', descripcion: 'Verificar las tareas y trabajos pendientes y realizarlos antes de la fecha límite.', fecha: '2026-06-12', categoria: 'Bootcamp', prioridad: 'Alta', completada: true },
        { id: 'check5', titulo: 'Practicar conversación en portugués', descripcion: 'Dedicar 30 minutos a la práctica de vocabulario fluido.', fecha: '2026-06-16', categoria: 'Idiomas', prioridad: 'Media', completada: false }
    ];

    let filtroEstado = 'todas';

    const contenedorTareas = document.getElementById('contenedor-tareas');
    const taskForm = document.getElementById('taskForm');
    const alertError = document.getElementById('alertError');
    const botonesEstado = document.querySelectorAll('.btn-group button, .btn-group-toggle button, div > button, button');
    const inputBusqueda = document.querySelector('input[placeholder*="buscar"]');
    const selects = document.querySelectorAll('select');
    const selectPrioridad = selects[0];
    const selectCategoria = selects[1];
    const inputFecha = document.querySelector('input[type="date"]');

    function renderizarTareas() {
        contenedorTareas.innerHTML = '';

        let textoBusqueda = inputBusqueda ? inputBusqueda.value.toLowerCase().trim() : '';
        let prioridadFiltro = selectPrioridad ? selectPrioridad.value : 'Todas';
        let categoriaFiltro = selectCategoria ? selectCategoria.value : 'Todas';
        let fechaFiltro = inputFecha ? inputFecha.value : '';

        let tareasFiltradas = tareas.filter(tarea => {
            let cumpleEstado = true;
            if (filtroEstado === 'completadas') cumpleEstado = tarea.completada;
            if (filtroEstado === 'pendientes') cumpleEstado = !tarea.completada;

            let cumpleBusqueda = tarea.titulo.toLowerCase().includes(textoBusqueda) || 
                                 tarea.descripcion.toLowerCase().includes(textoBusqueda);

            let cumplePrioridad = !prioridadFiltro || prioridadFiltro === 'Todas' || tarea.prioridad === prioridadFiltro;

            let cumpleCategoria = !categoriaFiltro || categoriaFiltro === 'Todas' || tarea.categoria === categoriaFiltro;

            let cumpleFecha = !fechaFiltro || tarea.fecha === fechaFiltro;

            return cumpleEstado && cumpleBusqueda && cumplePrioridad && cumpleCategoria && cumpleFecha;
        });

        tareasFiltradas.forEach((tarea) => {
            const indexReal = tareas.indexOf(tarea);

            let clasePrioridad = 'border-priority-baja';
            let claseBadge = 'badge-priority-baja';
            if (tarea.prioridad === 'Alta') {
                clasePrioridad = 'border-priority-alta';
                claseBadge = 'badge-priority-alta';
            } else if (tarea.prioridad === 'Media') {
                clasePrioridad = 'border-priority-media';
                claseBadge = 'badge-priority-media';
            }

            const tarjetaHTML = `
                <div class="card mb-3 shadow-sm ${clasePrioridad}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title h6 fw-bold">${tarea.titulo}</h5>
                            <span class="${claseBadge}">${tarea.prioridad}</span>
                        </div>
                        <p class="card-text text-muted small mb-1">${tarea.descripcion}</p>
                        <p class="card-text text-secondary small mb-2">Fecha: ${tarea.fecha} | Categoría: ${tarea.categoria}</p>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <div class="form-check">
                                <input class="form-check-input check-completada" type="checkbox" data-index="${indexReal}" id="check_${indexReal}" ${tarea.completada ? 'checked' : ''}>
                                <label class="form-check-label small" for="check_${indexReal}">Completada</label>
                            </div>
                            <button class="btn btn-outline-danger btn-sm btn-eliminar" data-index="${indexReal}">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
            contenedorTareas.innerHTML += tarjetaHTML;
        });

        const badgeTotal = document.querySelector('.badge');
        if(badgeTotal) badgeTotal.textContent = `📋 Tareas: ${tareas.length}`;
    }

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const titulo = document.getElementById('newTaskNameInput').value.trim();
        const descripcion = document.getElementById('newTaskDescriptionInput').value.trim();
        const categoria = document.getElementById('newTaskCategoryInput').value.trim();
        const fecha = document.getElementById('newTaskDateInput').value;
        
        const prioridadSeleccionada = document.querySelector('input[name="prioridad"]:checked');
        const prioridad = prioridadSeleccionada ? prioridadSeleccionada.value : 'Media';

        if (!titulo || !descripcion || !categoria || !fecha) {
            alertError.classList.remove('d-none');
            return;
        }

        alertError.classList.add('d-none');

        const nuevaTarea = {
            id: 'check_' + Date.now(),
            titulo,
            descripcion,
            fecha,
            categoria,
            prioridad,
            completada: false
        };

        tareas.push(nuevaTarea);
        renderizarTareas();
        taskForm.reset();
    });

    contenedorTareas.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-eliminar')) {
            const index = e.target.getAttribute('data-index');
            tareas.splice(index, 1);
            renderizarTareas();
        }
    });

    contenedorTareas.addEventListener('change', (e) => {
        if (e.target.classList.contains('check-completada')) {
            const index = e.target.getAttribute('data-index');
            tareas[index].completada = e.target.checked;
            renderizarTareas();
        }
    });

    const botonesEstadoFiltrados = Array.from(document.querySelectorAll('button')).filter(b => {
        const t = b.textContent.toLowerCase();
        return t.includes('todas') || t.includes('pendientes') || t.includes('completadas');
    });

    botonesEstadoFiltrados.forEach(boton => {
        boton.addEventListener('click', (e) => {
            botonesEstadoFiltrados.forEach(b => {
                b.style.backgroundColor = '';
                b.style.color = '';
            });
            
            e.target.style.backgroundColor = '#4A154B';
            e.target.style.color = '#FFFFFF';

            const textoBoton = e.target.textContent.toLowerCase().trim();
            if (textoBoton.includes('pendiente')) {
                filtroEstado = 'pendientes';
            } else if (textoBoton.includes('completa')) {
                filtroEstado = 'completadas';
            } else {
                filtroEstado = 'todas';
            }
            renderizarTareas();
        });
    });

    if (inputBusqueda) inputBusqueda.addEventListener('input', renderizarTareas);
    if (selectPrioridad) selectPrioridad.addEventListener('change', renderizarTareas);
    if (selectCategoria) selectCategoria.addEventListener('change', renderizarTareas);
    if (inputFecha) inputFecha.addEventListener('input', renderizarTareas);

    renderizarTareas();
});