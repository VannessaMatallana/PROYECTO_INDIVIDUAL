const taskManager = new TaskManager();

document.addEventListener('DOMContentLoaded', () => {
    taskManager.addTask('Comprar materiales para proyecto', 'Adquirir telas e implementos de costura para mi emprendimiento.', '2026-06-15', 'PORHACER');
    taskManager.addTask('Revisar repositorio en GitHub', 'Actualizar los commits y verificar que la rama principal esté al día.', '2026-06-18', 'PORHACER');

    let filtroEstado = 'todas';

    const contenedorTareas = document.getElementById('contenedor-tareas');
    const taskForm = document.getElementById('taskForm');
    const alertError = document.getElementById('alertError');
    const inputBusqueda = document.querySelector('input[placeholder*="buscar"]');
    const selects = document.querySelectorAll('select');
    const selectPrioridad = selects[0];
    const selectCategoria = selects[1];
    const inputFecha = document.querySelector('input[type="date"]');
    const btnToggleDark = document.getElementById('btnToggleDark');

    if (btnToggleDark) {
        btnToggleDark.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            btnToggleDark.textContent = isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
        });
    }

    function renderizarTareas() {
        if (!contenedorTareas) return;
        contenedorTareas.innerHTML = '';

        let textoBusqueda = inputBusqueda ? inputBusqueda.value.toLowerCase().trim() : '';
        let prioridadFiltro = selectPrioridad ? selectPrioridad.value : 'Todas';
        let categoriaFiltro = selectCategoria ? selectCategoria.value : 'Todas';
        let fechaFiltro = inputFecha ? inputFecha.value : '';

        let tareasFiltradas = taskManager.tasks.filter(tarea => {
            let cumpleEstado = true;
            if (filtroEstado === 'completadas') cumpleEstado = tarea.completada === true;
            if (filtroEstado === 'pendientes') cumpleEstado = tarea.completada !== true;

            let titulo = tarea.name || tarea.titulo || '';
            let descripcion = tarea.description || tarea.descripcion || '';
            let cumpleBusqueda = titulo.toLowerCase().includes(textoBusqueda) || 
                                 descripcion.toLowerCase().includes(textoBusqueda);

            let cumplePrioridad = !prioridadFiltro || prioridadFiltro === 'Todas' || tarea.prioridad === prioridadFiltro;
            let cumpleCategoria = !categoriaFiltro || categoriaFiltro === 'Todas' || tarea.categoria === categoriaFiltro;
            let fechaValor = tarea.dueDate || tarea.fecha || '';
            let cumpleFecha = !fechaFiltro || fechaValor === fechaFiltro;

            return cumpleEstado && cumpleBusqueda && cumplePrioridad && cumpleCategoria && cumpleFecha;
        });

        tareasFiltradas.forEach((tarea) => {
            const indexReal = taskManager.tasks.indexOf(tarea);
            const tituloMostrar = tarea.name || tarea.titulo;
            const descripcionMostrar = tarea.description || tarea.descripcion;
            const fechaMostrar = tarea.dueDate || tarea.fecha;
            const prioridadMostrar = tarea.prioridad || 'Media';
            const estadoMostrar = tarea.status || 'PORHACER';

            let clasePrioridad = 'border-priority-baja';
            let claseBadge = 'badge-priority-baja';
            if (prioridadMostrar === 'Alta') {
                clasePrioridad = 'border-priority-alta';
                claseBadge = 'badge-priority-alta';
            } else if (prioridadMostrar === 'Media') {
                clasePrioridad = 'border-priority-media';
                claseBadge = 'badge-priority-media';
            }

            const tarjetaHTML = `
                <div class="card mb-3 shadow-sm ${clasePrioridad}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title h6 fw-bold">${tituloMostrar}</h5>
                            <span class="${claseBadge}">${prioridadMostrar}</span>
                        </div>
                        <p class="card-text text-muted small mb-1">${descripcionMostrar}</p>
                        <p class="card-text text-secondary small mb-2">Fecha: ${fechaMostrar} | Estado: <span class="badge bg-secondary">${estadoMostrar}</span></p>
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
        if (badgeTotal && !badgeTotal.id) badgeTotal.textContent = `📋 Tareas: ${taskManager.tasks.length}`;
    }

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('newTaskNameInput').value.trim();
            const description = document.getElementById('newTaskDescriptionInput').value.trim();
            const dueDate = document.getElementById('newTaskDateInput').value;
            const categoriaSelect = document.getElementById('newTaskCategoryInput');
            const categoria = categoriaSelect ? categoriaSelect.value.trim() : 'General';
            
            const prioridadSeleccionada = document.querySelector('input[name="prioridad"]:checked');
            const prioridad = prioridadSeleccionada ? prioridadSeleccionada.value : 'Media';

            if (!name || !description || !dueDate) {
                if (alertError) alertError.classList.remove('d-none');
                return;
            }

            if (alertError) alertError.classList.add('d-none');

            taskManager.addTask(name, description, dueDate, 'PORHACER');
            
            const ultimaTarea = taskManager.tasks[taskManager.tasks.length - 1];
            ultimaTarea.categoria = categoria;
            ultimaTarea.prioridad = prioridad;

            renderizarTareas();
            taskForm.reset();
        });
    }

    if (contenedorTareas) {
        contenedorTareas.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-eliminar')) {
                const index = e.target.getAttribute('data-index');
                taskManager.tasks.splice(index, 1);
                renderizarTareas();
            }
        });

        contenedorTareas.addEventListener('change', (e) => {
            if (e.target.classList.contains('check-completada')) {
                const index = e.target.getAttribute('data-index');
                taskManager.tasks[index].completada = e.target.checked;
                renderizarTareas();
            }
        });
    }

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
            
            e.target.style.backgroundColor = 'var(--primary-purple)';
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