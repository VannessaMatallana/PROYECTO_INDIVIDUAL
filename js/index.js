// ==========================================
// 1. INICIALIZACIÓN GENERAL
// ==========================================
const taskManager = new TaskManager();
taskManager.load();

document.addEventListener('DOMContentLoaded', () => {
    let filtroEstado = 'todas';


    // ==========================================
    // 2. MODAL DE BIENVENIDA Y TAREAS PENDIENTES
    // ==========================================
    function verificarTareasPendientesAlEntrar() {
        const pendientes = taskManager.tasks.filter(t => !t.completada);
        const cantidad = pendientes.length;

        const spanNumero = document.getElementById('numeroPendientesModal');
        const subtexto = document.getElementById('subtextoPendientes');
        const mensajeEl = document.getElementById('mensajeBienvenida');
        const iconoEl = document.getElementById('iconoBienvenida');
        const modalElement = document.getElementById('modalBienvenida');
        
        const resumenContador = document.getElementById('resumenContadorPendientes');
        const resumenBarra = document.getElementById('resumenBarraProgreso');
        const resumenFechaMovil = document.getElementById('resumenFechaMovil');
        const resumenFechaDesktop = document.getElementById('resumenFechaDesktop');

        if (resumenContador) resumenContador.textContent = cantidad;
        
        const totalTareas = taskManager.tasks.length;
        const completadas = totalTareas - cantidad;
        const porcentaje = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0;
        if (resumenBarra) resumenBarra.style.width = `${porcentaje}%`;

        const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const fechaTextoLargo = new Date().toLocaleDateString('es-ES', opcionesFecha);
        if (resumenFechaMovil) resumenFechaMovil.textContent = fechaTextoLargo;
        if (resumenFechaDesktop) resumenFechaDesktop.textContent = fechaTextoLargo;

        if (spanNumero && modalElement && typeof bootstrap !== 'undefined') {
            spanNumero.textContent = cantidad;
            subtexto.textContent = cantidad === 1 ? 'tarea pendiente' : 'tareas pendientes';

            if (cantidad === 0) {
                iconoEl.innerHTML = '<i class="bi bi-stars"></i>';
                mensajeEl.textContent = '¡Qué paz! No tienes ninguna tarea pendiente. Disfruta tu día o aprovecha para consentirte un rato.';
            } else if (cantidad <= 3) {
                iconoEl.innerHTML = '<i class="bi bi-cup-hot"></i>';
                mensajeEl.textContent = 'Tienes poquitas cosas pendientes por hacer. ¡Estás a un paso de tener todo al día!';
            } else if (cantidad <= 7) {
                iconoEl.innerHTML = '<i class="bi bi-flower1"></i>';
                mensajeEl.textContent = 'Un pasito a la vez. Ve con calma, organízate y verás que avanzas muchísimo hoy.';
            } else {
                iconoEl.innerHTML = '<i class="bi bi-compass"></i>';
                mensajeEl.textContent = 'Se ve que tienes bastantes cositas en mente. Respira hondo, prioriza lo más importante y ¡tú puedes con esto!';
            }

            const modalBootstrap = new bootstrap.Modal(modalElement);
            modalBootstrap.show();
        }
    }

    verificarTareasPendientesAlEntrar();

    function manejarClicDiaCalendario(fechaStr) {
        const tareasDelDia = taskManager.tasks.filter(tarea => tarea.dueDate === fechaStr);
        const spanFecha = document.getElementById('fechaSeleccionadaModal');
        const listaModal = document.getElementById('listaTareasModal');

        if (!spanFecha || !listaModal) return;
        spanFecha.textContent = fechaStr;
        listaModal.innerHTML = '';
        if (tareasDelDia.length === 0) {
            listaModal.innerHTML = `<li class="list-group-item text-muted text-center">No hay tareas pendientes para esta fecha.</li>`;
        } else {
            tareasDelDia.forEach(tarea => {
                const item = document.createElement('li');
                item.className = `list-group-item d-flex justify-content-between align-items-center ${tarea.completada ? 'list-group-item-success' : ''}`;
                item.innerHTML = `
                <span><strong>${tarea.name}</strong> - ${tarea.description || 'Sin descripción'}</span>
                <span class="badge bg-${tarea.completada ? 'success' : 'warning'} rounded-pill">
                ${tarea.completada ? 'Completada' : 'Pendiente'}
                </span>
                `;
                listaModal.appendChild(item);
            });
        }

        const modalElement = document.getElementById('modalTareasDia');

        if (modalElement && typeof bootstrap !== 'undefined') {
            const modalBootstrap = new bootstrap.Modal(modalElement);
            modalBootstrap.show();
        }
    }


    // ==========================================
    // 3. RELOJ EN VIVO
    // ==========================================
    function actualizarReloj() {
        const relojElemento = document.getElementById('liveClock');
        if (!relojElemento) return;
        
        const ahora = new Date();
        const opciones = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        };
        
        relojElemento.textContent = ahora.toLocaleDateString('es-ES', opciones);
    }

    actualizarReloj();
    setInterval(actualizarReloj, 1000);


    // ==========================================
    // 4. SELECTORES Y ELEMENTOS DEL DOM (GLOBALES)
    // ==========================================
    const contenedorTareas = document.getElementById('contenedor-tareas');
    const taskForm = document.getElementById('taskForm');
    const alertError = document.getElementById('alertError');
    const inputBusqueda = document.getElementById('buscarTarea');
    const selectPrioridad = document.getElementById('filtroPrioridad');
    const selectCategoria = document.getElementById('filtroCategoria');
    const inputFecha = document.getElementById('filtroFecha');

    const newTaskCategorySelect = document.getElementById('newTaskCategorySelect');
    const newTaskOtraContainer = document.getElementById('newTaskOtraContainer');
    const newTaskOtraInput = document.getElementById('newTaskOtraInput');


    // ==========================================
    // 5. GESTIÓN DE CATEGORÍAS PERSONALIZADAS
    // ==========================================
    const STORAGE_KEY_CATS = 'categoriasPersonalizadas_app';

    function obtenerCategoriasCustom() {
        const guardadas = localStorage.getItem(STORAGE_KEY_CATS);
        return guardadas ? JSON.parse(guardadas) : [];
    }

    function guardarCategoriaCustom(nuevaCat) {
        let customCats = obtenerCategoriasCustom();
        if (!customCats.includes(nuevaCat) && ['Trabajo', 'Personal', 'Estudio', 'Otra'].indexOf(nuevaCat) === -1) {
            customCats.push(nuevaCat);
            localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(customCats));
            sincronizarSelectoresCategorias();
        }
    }

    function eliminarCategoriaCustom(catAEliminar) {
        let customCats = obtenerCategoriasCustom();
        customCats = customCats.filter(c => c !== catAEliminar);
        localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(customCats));
        sincronizarSelectoresCategorias();
        renderizarAdminCategorias();
        if (typeof mostrarToast === 'function') {
            mostrarToast(`Categoría "${catAEliminar}" eliminada.`);
        }
    }

    function sincronizarSelectoresCategorias() {
        const customCats = obtenerCategoriasCustom();
        
        if (newTaskCategorySelect) {
            const valorActual = newTaskCategorySelect.value;
            
            newTaskCategorySelect.innerHTML = `
                <option value="" selected disabled>Selecciona...</option>
                <option value="Trabajo">Trabajo</option>
                <option value="Personal">Personal</option>
                <option value="Estudio">Estudio</option>
            `;

            customCats.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                newTaskCategorySelect.appendChild(opt);
            });

            const optOtra = document.createElement('option');
            optOtra.value = 'Otra';
            optOtra.textContent = 'Otra...';
            newTaskCategorySelect.appendChild(optOtra);

            if (valorActual) newTaskCategorySelect.value = valorActual;
        }

        const selectFiltroCat = document.getElementById('filtroCategoria');
        if (selectFiltroCat) {
            const filtroActual = selectFiltroCat.value;
            selectFiltroCat.innerHTML = `
                <option selected value="Todas">Todas</option>
                <option value="Trabajo">Trabajo</option>
                <option value="Personal">Personal</option>
                <option value="Estudio">Estudio</option>
            `;
            customCats.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                selectFiltroCat.appendChild(opt);
            });
            if (filtroActual) selectFiltroCat.value = filtroActual;
        }
    }

    function renderizarAdminCategorias() {
        const listaDiv = document.getElementById('listaCategoriasPersonalizadas');
        if (!listaDiv) return;
        
        const customCats = obtenerCategoriasCustom();
        if (customCats.length === 0) {
            listaDiv.innerHTML = '<span class="text-muted small">No hay categorías personalizadas guardadas.</span>';
            return;
        }

        listaDiv.innerHTML = '';
        customCats.forEach(cat => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary d-inline-flex align-items-center gap-1 p-2';
            badge.innerHTML = `
                ${cat} 
                <button type="button" class="btn-close btn-close-white btn-sm fs-xs" aria-label="Eliminar" data-cat="${cat}"></button>
            `;
            listaDiv.appendChild(badge);
        });
    }

    const btnAdminCats = document.getElementById('btnAdministrarCategorias');
    const containerAdminCats = document.getElementById('containerAdminCategorias');
    
    btnAdminCats?.addEventListener('click', () => {
        containerAdminCats.classList.toggle('d-none');
        renderizarAdminCategorias();
    });

    containerAdminCats?.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('.btn-close');
        if (closeBtn) {
            const catToDel = closeBtn.getAttribute('data-cat');
            eliminarCategoriaCustom(catToDel);
        }
    });

    sincronizarSelectoresCategorias();


    // ==========================================
    // 6. UTILIDADES (TOASTS Y CONTADORES)
    // ==========================================
    function mostrarToast(mensaje) {
        const toastEl = document.getElementById('liveToast');
        const toastMessage = document.getElementById('toastMessage');
        if (toastEl && toastMessage) {
            toastMessage.textContent = mensaje;
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        }
    }

    function actualizarContadores() {
        const total = taskManager.tasks.length;
        const completadas = taskManager.tasks.filter(t => t.completada).length;
        const pendientes = total - completadas;

        const counterTotal = document.getElementById('counterTotal');
        const counterPendientes = document.getElementById('counterPendientes');
        const counterCompletadas = document.getElementById('counterCompletadas');

        if (counterTotal) counterTotal.innerHTML = `Total: ${total}`;
        if (counterPendientes) counterPendientes.innerHTML = `Pend: ${pendientes}`;
        if (counterCompletadas) counterCompletadas.innerHTML = `Comp: ${completadas}`;

        const resumenContador = document.getElementById('resumenContadorPendientes');
        const resumenBarra = document.getElementById('resumenBarraProgreso');
        if (resumenContador) resumenContador.textContent = pendientes;
        const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
        if (resumenBarra) resumenBarra.style.width = `${porcentaje}%`;
    }

    if (newTaskCategorySelect) {
        newTaskCategorySelect.addEventListener('change', (e) => {
            if (e.target.value === 'Otra') {
                newTaskOtraContainer.classList.remove('d-none');
            } else {
                newTaskOtraContainer.classList.add('d-none');
                if (newTaskOtraInput) newTaskOtraInput.value = '';
            }
        });
    }


    // ==========================================
    // 7. LÓGICA Y RENDERIZADO DE TAREAS
    // ==========================================
    function calcularEstadoTarea(tarea, hoy) {
        if (tarea.completada) return 'completada';
        
        const fechaHoy = new Date(hoy);
        const fechaVencimiento = new Date(tarea.dueDate);
        
        const diferenciaTiempo = fechaVencimiento - fechaHoy;
        const diferenciaDias = Math.round(diferenciaTiempo / (1000 * 60 * 60 * 24));

        if (diferenciaDias < 0) {
            return 'vencida';
        } else if (diferenciaDias >= 0 && diferenciaDias <= 2) {
            return 'proxima';
        } else {
            return 'pendiente';
        }
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

            let cumpleBusqueda = (tarea.name || '').toLowerCase().includes(textoBusqueda) || 
                                 (tarea.description || '').toLowerCase().includes(textoBusqueda);

            let cumplePrioridad = !prioridadFiltro || prioridadFiltro === 'Todas' || tarea.prioridad === prioridadFiltro;
            let categoriaTarea = tarea.categoria || 'Personal';
            let cumpleCategoria = !categoriaFiltro || categoriaFiltro === 'Todas' || categoriaTarea === categoriaFiltro;
            let cumpleFecha = !fechaFiltro || tarea.dueDate === fechaFiltro;

            return cumpleEstado && cumpleBusqueda && cumplePrioridad && cumpleCategoria && cumpleFecha;
        });

        actualizarContadores();
        renderizarCalendarioCompleto();

        if (tareasFiltradas.length === 0) {
            contenedorTareas.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <span class="fs-2">🌌</span>
                    <p class="mt-2 small fw-bold">No se encontraron tareas con los filtros seleccionados.</p>
                </div>
            `;
            return;
        }

        const hoy = new Date().toISOString().split('T')[0];

        tareasFiltradas.forEach((tarea) => {
            const prioridadMostrar = tarea.prioridad || 'Media';
            const categoriaMostrar = tarea.categoria || 'Personal';

            let clasePrioridadBadge = 'bg-secondary';
            if (prioridadMostrar === 'Alta') clasePrioridadBadge = 'bg-danger';
            else if (prioridadMostrar === 'Media') clasePrioridadBadge = 'bg-warning text-dark';
            else if (prioridadMostrar === 'Baja') clasePrioridadBadge = 'bg-info text-dark';

            const estadoLogico = calcularEstadoTarea(tarea, hoy);

            let claseFecha = 'text-secondary';
            let textoVencimiento = `Fecha: ${tarea.dueDate}`;
            let badgeEstadoHTML = '';

            if (estadoLogico === 'completada') {
                textoVencimiento += ` <i class="bi bi-check-circle-fill text-success"></i> Completada`;
                badgeEstadoHTML = `<span class="badge bg-success small ms-1">Completada</span>`;
            } else if (estadoLogico === 'vencida') {
                claseFecha = 'text-danger fw-bold';
                textoVencimiento += ` <i class="bi bi-exclamation-triangle-fill"></i> Vencida`;
                badgeEstadoHTML = `<span class="badge bg-danger small ms-1">Vencida</span>`;
            } else if (estadoLogico === 'proxima') {
                claseFecha = 'text-warning fw-bold';
                textoVencimiento += ` <i class="bi bi-clock-fill"></i> Próxima a vencer`;
                badgeEstadoHTML = `<span class="badge bg-warning text-dark small ms-1">Próxima</span>`;
            } else {
                badgeEstadoHTML = `<span class="badge bg-secondary small ms-1">Pendiente</span>`;
            }

            const claseCompletadaCard = tarea.completada ? 'border-success bg-light opacity-75' : '';
            const estiloTextoTitulo = tarea.completada ? 'text-decoration-line-through text-muted' : '';

            let subtasksHtml = `<div class="mt-2 pt-2 border-top">
                <small class="fw-bold text-muted">Subtareas:</small>
                <ul class="list-unstyled ms-2 mb-2">`;
            
            if (tarea.subtasks && tarea.subtasks.length > 0) {
                tarea.subtasks.forEach((sub, index) => {
                    subtasksHtml += `
                        <li>
                            <input type="checkbox" class="form-check-input me-1 check-subtask" data-task-id="${tarea.id}" data-sub-index="${index}" ${sub.completed ? 'checked' : ''}>
                            <span class="${sub.completed ? 'text-decoration-line-through text-muted' : ''}">${sub.text}</span>
                        </li>`;
                });
            } else {
                subtasksHtml += `<li class="text-muted small fst-italic">No hay subtareas aún.</li>`;
            }

            subtasksHtml += `</ul>
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control form-control-sm input-nueva-subtarea" placeholder="Añadir subtarea..." data-task-id="${tarea.id}">
                    <button class="btn btn-outline-secondary btn-sm btn-add-subtask" data-task-id="${tarea.id}" type="button">+</button>
                </div>
            </div>`;

            const tarjetaHTML = `
                <div class="card mb-3 shadow-sm ${claseCompletadaCard}" data-task-id="${tarea.id}">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title h6 fw-bold task-title mb-1 ${estiloTextoTitulo}">${tarea.name}</h5>
                            <div>
                                <span class="badge ${clasePrioridadBadge} small">${prioridadMostrar}</span>
                                <span class="badge bg-light text-dark border small ms-1">${categoriaMostrar}</span>
                                ${badgeEstadoHTML}
                            </div>
                        </div>
                        <p class="card-text text-muted small mb-1 task-desc">${tarea.description}</p>
                        <p class="card-text ${claseFecha} small mb-2">${textoVencimiento}</p>
                        ${subtasksHtml}
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <div>
                                <button class="done-button btn btn-sm ${tarea.completada ? 'btn-success' : 'btn-outline-success'} py-0 px-2 me-2">
                                    <i class="bi bi-check-circle-fill"></i> ${tarea.completada ? 'Completada' : 'Completar'}
                                </button>
                            </div>
                            <div>
                                <button class="btn btn-outline-secondary btn-sm me-1 edit-button py-0 px-2"><i class="bi bi-pencil-square"></i> Editar</button>
                                <button class="delete-button btn btn-outline-danger btn-sm py-0 px-2"><i class="bi bi-trash"></i> Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            contenedorTareas.innerHTML += tarjetaHTML;
        });
    }

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('newTaskNameInput').value.trim();
            const description = document.getElementById('newTaskDescriptionInput').value.trim();
            const dueDate = document.getElementById('newTaskDateInput').value;
            const prioridad = document.querySelector('input[name="prioridad"]:checked')?.value || 'Alta';
            
            let category = newTaskCategorySelect ? newTaskCategorySelect.value : 'Personal';
            const guardarEnLista = document.getElementById('guardarCategoriaLista')?.checked;
            const customCategory = newTaskOtraInput ? newTaskOtraInput.value.trim() : '';

            if (!name || !description || !dueDate || (category === 'Otra' && !customCategory)) {
                const errorModalEl = document.getElementById('errorModal');
                if (errorModalEl) {
                    const errorMsg = document.getElementById('errorModalMessage');
                    if (errorMsg) {
                        errorMsg.textContent = 'Por favor completa todos los campos requeridos y especifica la categoría.';
                    }
                    const errorModal = new bootstrap.Modal(errorModalEl);
                    errorModal.show();
                }
                return;
            }

            if (category === 'Otra') {
                category = customCategory;
                if (guardarEnLista) {
                    guardarCategoriaCustom(category);
                }
            }

            taskManager.addTask(name, description, dueDate, 'PORHACER', category, prioridad);
            taskManager.save();
            renderizarTareas();
            taskForm.reset();
            if (newTaskOtraContainer) newTaskOtraContainer.classList.add('d-none');
            mostrarToast('¡Tarea creada con éxito!');
        });
    }

    if (contenedorTareas) {
        contenedorTareas.addEventListener('click', (e) => {
            const parentCard = e.target.closest('.card');
            if (!parentCard) return;
            
            const taskIdAttr = parentCard.getAttribute('data-task-id');
            const taskId = !isNaN(taskIdAttr) ? Number(taskIdAttr) : taskIdAttr;

            if (e.target.classList.contains('check-subtask')) {
                const subIndex = parseInt(e.target.getAttribute('data-sub-index'));
                const task = taskManager.getTaskById(taskId);
                if (task && task.subtasks && task.subtasks[subIndex]) {
                    task.subtasks[subIndex].completed = e.target.checked;
                    taskManager.save();
                    renderizarTareas();
                }
                return;
            }

            if (e.target.classList.contains('btn-add-subtask') || e.target.closest('.btn-add-subtask')) {
                const inputSub = parentCard.querySelector('.input-nueva-subtarea');
                if (inputSub && inputSub.value.trim() !== '') {
                    taskManager.addSubtask(taskId, inputSub.value.trim());
                    renderizarTareas();
                }
                return;
            }

            if (e.target.classList.contains('done-button') || e.target.closest('.done-button')) {
                const task = taskManager.getTaskById(taskId);
                if (task) {
                    task.completada = !task.completada;
                    task.status = task.completada ? 'DONE' : 'PORHACER';
                    taskManager.save();
                    renderizarTareas();
                }
                return;
            }

            if (e.target.classList.contains('delete-button') || e.target.closest('.delete-button')) {
                taskManager.deleteTask(taskId);
                taskManager.save();
                renderizarTareas();
                mostrarToast('Tarea eliminada correctamente.');
                return;
            }

            if (e.target.classList.contains('edit-button') || e.target.closest('.edit-button')) {
                const btnEdit = e.target.closest('.edit-button') || e.target;
                const titleEl = parentCard.querySelector('.task-title');
                const descEl = parentCard.querySelector('.task-desc');

                const isSaving = btnEdit.classList.contains('btn-success');

                if (!isSaving) {
                    titleEl.innerHTML = `<input type="text" class="form-control form-control-sm edit-title-input mb-1" value="${titleEl.textContent.trim()}">`;
                    descEl.innerHTML = `<textarea class="form-control form-control-sm edit-desc-input">${descEl.textContent.trim()}</textarea>`;
                    
                    btnEdit.innerHTML = `<i class="bi bi-check-lg"></i> Guardar`;
                    btnEdit.classList.replace('btn-outline-secondary', 'btn-success');
                } else {
                    const titleInput = parentCard.querySelector('.edit-title-input');
                    const descInput = parentCard.querySelector('.edit-desc-input');
                    
                    if (!titleInput || !descInput) return;

                    const newTitle = titleInput.value.trim();
                    const newDesc = descInput.value.trim();

                    if (newTitle && newDesc) {
                        if (typeof taskManager.updateTask === 'function') {
                            taskManager.updateTask(taskId, { name: newTitle, description: newDesc });
                        } else {
                            const tareaEncontrada = taskManager.tasks.find(t => t.id === taskId);
                            if (tareaEncontrada) {
                                tareaEncontrada.name = newTitle;
                                tareaEncontrada.description = newDesc;
                            }
                        }

                        taskManager.save();
                        renderizarTareas();
                        mostrarToast('¡Tarea actualizada con éxito!');
                    } else {
                        alert('Los campos no pueden estar vacíos.');
                    }
                }
            }
        });
    }

    const botonesEstadoFiltrados = Array.from(document.querySelectorAll('.btn-group button'));
    botonesEstadoFiltrados.forEach(boton => {
        boton.addEventListener('click', (e) => {
            botonesEstadoFiltrados.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const textoBoton = e.target.textContent.toLowerCase().trim();
            if (textoBoton.includes('pendiente')) filtroEstado = 'pendientes';
            else if (textoBoton.includes('completa')) filtroEstado = 'completadas';
            else filtroEstado = 'todas';

            renderizarTareas();
        });
    });


    // ==========================================
    // 8. FILTROS DE ENTRADA
    // ==========================================
    if (inputBusqueda) inputBusqueda.addEventListener('input', renderizarTareas);
    if (selectPrioridad) selectPrioridad.addEventListener('change', renderizarTareas);
    if (selectCategoria) selectCategoria.addEventListener('change', renderizarTareas);
    if (inputFecha) inputFecha.addEventListener('input', renderizarTareas);


    // ==========================================
    // 9. CALENDARIO INTERACTIVO
    // ==========================================
    let fechaActualCalendario = new Date();

    function renderizarCalendarioCompleto() {
        const containerDays = document.getElementById('calendarDaysContainer');
        const labelMonthYear = document.getElementById('currentMonthYear');
        if (!containerDays || !labelMonthYear) return;

        containerDays.innerHTML = '';

        const year = fechaActualCalendario.getFullYear();
        const month = fechaActualCalendario.getMonth();

        const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        labelMonthYear.textContent = `${nombresMeses[month]} ${year}`;

        const primerDiaIndex = (new Date(year, month, 1).getDay() + 6) % 7; 
        const totalDiasMes = new Date(year, month + 1, 0).getDate();
        const totalDiasMesAnterior = new Date(year, month, 0).getDate();

        let htmlCeldas = '';

        for (let i = primerDiaIndex; i > 0; i--) {
            const diaPrevio = totalDiasMesAnterior - i + 1;
            htmlCeldas += `<div class="p-1 text-muted opacity-50 text-center" style="font-size: 0.7rem; min-height: 24px;">${diaPrevio}</div>`;
        }

        for (let dia = 1; dia <= totalDiasMes; dia++) {
            const mesStr = String(month + 1).padStart(2, '0');
            const diaStr = String(dia).padStart(2, '0');
            const fechaFormateada = `${year}-${mesStr}-${diaStr}`;

            const tareasDelDia = taskManager.tasks.filter(t => t.dueDate === fechaFormateada);
            const tieneTarea = tareasDelDia.length > 0;
            
            const claseIndicador = tieneTarea ? 'bg-primary text-white rounded-circle fw-bold shadow-sm' : 'text-dark';
            const estiloExtra = tieneTarea ? 'width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; margin: auto;' : 'padding: 2px;';

            htmlCeldas += `
                <div class="calendar-day p-0 text-center" data-date="${fechaFormateada}" style="font-size: 0.75rem; cursor: pointer; min-height: 24px;">
                    <span class="${claseIndicador}" style="${estiloExtra}">${dia}</span>
                </div>
            `;
        }

        containerDays.innerHTML = htmlCeldas;
    }

    document.getElementById('prevMonth')?.addEventListener('click', () => {
        fechaActualCalendario.setMonth(fechaActualCalendario.getMonth() - 1);
        renderizarCalendarioCompleto();
    });

    document.getElementById('nextMonth')?.addEventListener('click', () => {
        fechaActualCalendario.setMonth(fechaActualCalendario.getMonth() + 1);
        renderizarCalendarioCompleto();
    });

    document.getElementById('calendarDaysContainer')?.addEventListener('click', (e) => {
        const diaCell = e.target.closest('.calendar-day');
        if (!diaCell) return;
        const fechaSeleccionada = diaCell.getAttribute('data-date');
        
        const tareasDelDia = taskManager.tasks.filter(t => t.dueDate === fechaSeleccionada);
        const pendientesCount = tareasDelDia.filter(t => !t.completada).length;
        const totalCount = tareasDelDia.length;

        if (totalCount > 0) {
            mostrarToast(`Fecha ${fechaSeleccionada}: Tienes ${pendientesCount} tareas pendientes (${totalCount} en total).`);
        } else {
            mostrarToast(`Fecha ${fechaSeleccionada}: No tienes tareas registradas.`);
        }

        const inputFechaFiltro = document.getElementById('filtroFecha');
        if (inputFechaFiltro) {
            inputFechaFiltro.value = fechaSeleccionada;
            renderizarTareas();
        }
    });


    // ==========================================
    // 10. NOTAS RÁPIDAS (POST-ITS)
    // ==========================================
    const notesContainer = document.getElementById('notesContainer');
    const btnAddNote = document.getElementById('btnAddNote');
    const btnAddNoteCard = document.querySelector('.btn-add-note-card');

    let savedNotes = JSON.parse(localStorage.getItem('quick_notes')) || [
        { id: 1, text: '¡Revisar entregas pendientes!' }
    ];

    function renderNotes() {
        if (!notesContainer) return;
        notesContainer.innerHTML = '';
        
        savedNotes.forEach((note, index) => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'post-it d-flex flex-column justify-content-between p-2 mb-2';
            noteDiv.innerHTML = `
                <span contenteditable="true" class="note-text outline-0 small" data-index="${index}">${note.text}</span>
                <div class="text-end mt-1">
                    <button type="button" class="btn btn-xs text-danger p-0 delete-note" data-index="${index}"><i class="bi bi-x-lg"></i></button>
                </div>
            `;
            notesContainer.appendChild(noteDiv);
        });
        
        localStorage.setItem('quick_notes', JSON.stringify(savedNotes));
    }

    function agregarNotaRapida(e) {
        e.preventDefault();
        savedNotes.push({ id: Date.now(), text: 'Nueva nota rápida...' });
        renderNotes();
    }

    btnAddNote?.addEventListener('click', agregarNotaRapida);
    btnAddNoteCard?.addEventListener('click', agregarNotaRapida);

    notesContainer?.addEventListener('input', (e) => {
        if (e.target.classList.contains('note-text')) {
            const index = e.target.getAttribute('data-index');
            if (index !== null && savedNotes[index]) {
                savedNotes[index].text = e.target.textContent;
                localStorage.setItem('quick_notes', JSON.stringify(savedNotes));
            }
        }
    });

    notesContainer?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-note');
        if (deleteBtn) {
            e.preventDefault();
            const index = deleteBtn.getAttribute('data-index');
            if (index !== null) {
                savedNotes.splice(index, 1);
                renderNotes();
                mostrarToast('Nota eliminada.');
            }
        }
    });

    renderNotes();


    // ==========================================
    // 11. ESPACIO DE BIENESTAR Y ESTADO DE ÁNIMO
    // ==========================================
    const frases = [
        "Un paso a la vez también es avanzar.",
        "No tienes que hacerlo todo hoy, prioriza tu paz.",
        "El descanso también forma parte del progreso.",
        "Cree en la constante evolución de tu camino.",
        "Tu ritmo es el correcto, no te compares.",
        "Aprender toma tiempo; sé amable con tu proceso."
    ];

    const fraseEl = document.getElementById('fraseMotivacional');
    const btnNuevaFrase = document.getElementById('btnNuevaFrase');

    function cambiarFrase() {
        if (!fraseEl) return;
        const aleatoria = frases[Math.floor(Math.random() * frases.length)];
        fraseEl.textContent = `"${aleatoria}"`;
    }

    btnNuevaFrase?.addEventListener('click', cambiarFrase);

    const textoAnimoSeleccionado = document.getElementById('textoAnimoSeleccionado');
    const mensajeAnimoEl = document.getElementById('mensajeAnimo');
    const itemsAnimo = document.querySelectorAll('.item-animo');

    const resumenIconoAnimo = document.getElementById('resumenIconoAnimo');
    const resumenTextoAnimo = document.getElementById('resumenTextoAnimo');

    const mensajesPorAnimo = {
        'Genial': '¡Aprovecha esa energía para comerte el mundo hoy!',
        'Tranquila': 'Un estado mental sereno es el mejor aliado de la productividad.',
        'Enfocada': '¡Genial! Mantén la concentración y celebra tus logros paso a paso.',
        'Cansada': 'Recuerda tomar pausas activas e hidratarte. No te exijas de más.',
        'Abrumada': 'Respira hondo. Divide las tareas grandes en pequeñas subtareas y ve despacio.'
    };

    const hoyStr = new Date().toISOString().split('T')[0];
    let historialAnimo = JSON.parse(localStorage.getItem('historial_animo_general')) || [];
    const regHoy = historialAnimo.find(item => item.fechaISO && item.fechaISO.startsWith(hoyStr));

    function actualizarUIAnimo(animo, htmlIcono) {
        if (textoAnimoSeleccionado) textoAnimoSeleccionado.innerHTML = htmlIcono;
        if (mensajeAnimoEl && mensajesPorAnimo[animo]) mensajeAnimoEl.textContent = mensajesPorAnimo[animo];
        if (resumenTextoAnimo) resumenTextoAnimo.textContent = animo;
    }

    if (regHoy) {
        const itemEncontrado = document.querySelector(`.item-animo[data-animo="${regHoy.animo}"]`);
        if (itemEncontrado) {
            actualizarUIAnimo(regHoy.animo, itemEncontrado.innerHTML);
        }
    }

    itemsAnimo.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const animoSeleccionado = item.getAttribute('data-animo');
            actualizarUIAnimo(animoSeleccionado, item.innerHTML);
            guardarRegistroAnimo(animoSeleccionado, item.innerHTML.trim());
            mostrarToast(`Estado de ánimo registrado: ${animoSeleccionado}`);
        });
    });


    // ==========================================
    // 12. HISTORIAL DE ESTADO DE ÁNIMO
    // ==========================================
    function guardarRegistroAnimo(animoSeleccionado, htmlIcono, fechaPersonalizada = null) {
        let historial = JSON.parse(localStorage.getItem('historial_animo_general')) || [];
        const fechaObj = fechaPersonalizada ? new Date(fechaPersonalizada) : new Date();
        const fechaHoraActual = fechaObj.toISOString(); 
        const fechaFormateada = fechaObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
        const fechaStr = fechaObj.toISOString().split('T')[0];
        
        historial = historial.filter(item => !item.fechaISO.startsWith(fechaStr));

        historial.unshift({
            fechaISO: fechaHoraActual,
            fechaVisual: fechaFormateada,
            animo: animoSeleccionado,
            iconoHtml: htmlIcono
        });

        if (historial.length > 30) historial.pop();
        localStorage.setItem('historial_animo_general', JSON.stringify(historial));
        renderizarHistorialAnimo();
    }

    function renderizarHistorialAnimo() {
        const listaHistorial = document.getElementById('listaHistorialAnimo');
        if (!listaHistorial) return;
        
        let historial = JSON.parse(localStorage.getItem('historial_animo_general')) || [];
        if (historial.length === 0) {
            listaHistorial.innerHTML = '<span class="text-muted text-center d-block py-2">Sin registros aún.</span>';
            return;
        }

        listaHistorial.innerHTML = '';
        historial.forEach(reg => {
            const div = document.createElement('div');
            div.className = 'list-group-item d-flex justify-content-between align-items-center py-2 px-2';
            div.innerHTML = `
                <span class="text-muted">${reg.fechaVisual}</span>
                <span class="fw-bold d-flex align-items-center gap-1">${reg.iconoHtml}</span>
            `;
            listaHistorial.appendChild(div);
        });
    }
    renderizarHistorialAnimo();


    // ==========================================
    // 13. MODO OSCURO (DARK MODE)
    // ==========================================
    const btnToggleDark = document.getElementById('btnToggleDark');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if (btnToggleDark) btnToggleDark.innerHTML = `<i class="bi bi-sun me-1"></i>`;
    }

    btnToggleDark?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        btnToggleDark.innerHTML = isDark ? `<i class="bi bi-sun me-1"></i>` : `<i class="bi bi-moon-stars me-1"></i>`;
    });


    // ==========================================
    // 14. RENDERIZADO INICIAL DE TAREAS
    // ==========================================
    renderizarTareas();
});