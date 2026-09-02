const taskManager = new TaskManager();
taskManager.load();

document.addEventListener('DOMContentLoaded', () => {
    let filtroEstado = 'todas';

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

        if (counterTotal) counterTotal.innerHTML = `<i class="bi bi-clipboard-check me-1 text-secondary"></i> Total: ${total}`;
        if (counterPendientes) counterPendientes.innerHTML = `<i class="bi bi-hourglass-split me-1"></i> Pendientes: ${pendientes}`;
        if (counterCompletadas) counterCompletadas.innerHTML = `<i class="bi bi-check-circle me-1"></i> Completadas: ${completadas}`;
    }

    if (newTaskCategorySelect) {
        newTaskCategorySelect.addEventListener('change', (e) => {
            if (e.target.value === 'Otra') {
                newTaskOtraContainer.classList.remove('d-none');
            } else {
                newTaskOtraContainer.classList.add('d-none');
                newTaskOtraInput.value = '';
            }
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

            let cumpleBusqueda = (tarea.name || '').toLowerCase().includes(textoBusqueda) || 
                                   (tarea.description || '').toLowerCase().includes(textoBusqueda);

            let cumplePrioridad = !prioridadFiltro || prioridadFiltro === 'Todas' || tarea.prioridad === prioridadFiltro;
            let categoriaTarea = tarea.categoria || 'General';
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
            const indexReal = taskManager.tasks.indexOf(tarea);
            const prioridadMostrar = tarea.prioridad || 'Media';
            const categoriaMostrar = tarea.categoria || 'General';

            let clasePrioridadBadge = 'badge-priority-media';
            let claseBordeCard = 'border-priority-media';

            if (prioridadMostrar === 'Alta') {
                clasePrioridadBadge = 'badge-priority-alta';
                claseBordeCard = 'border-priority-alta';
            } else if (prioridadMostrar === 'Baja') {
                clasePrioridadBadge = 'badge-priority-baja';
                claseBordeCard = 'border-priority-baja';
            }

            let claseFecha = 'text-secondary';
            let textoVencimiento = `Fecha: ${tarea.dueDate}`;
            if (tarea.dueDate < hoy && !tarea.completada) {
                claseFecha = 'text-danger fw-bold';
                textoVencimiento += ` <i class="bi bi-exclamation-triangle-fill"></i> Vencida`;
            } else if (tarea.dueDate === hoy && !tarea.completada) {
                claseFecha = 'text-warning fw-bold';
                textoVencimiento += ` <i class="bi bi-clock-fill"></i> Vence hoy`;
            }

            const tarjetaHTML = `
                <div class="card mb-2 shadow-sm ${claseBordeCard}" data-task-id="${tarea.id}">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title h6 fw-bold task-title mb-1">${tarea.name}</h5>
                            <span class="badge ${clasePrioridadBadge} small">${prioridadMostrar}</span>
                        </div>
                        <p class="card-text text-muted small mb-1 task-desc">${tarea.description}</p>
                        <p class="card-text ${claseFecha} small mb-2">${textoVencimiento} | Categoría: ${categoriaMostrar}</p>
                        <div class="d-flex justify-content-between align-items-center mt-1">
                            <div class="form-check m-0">
                                <input class="form-check-input check-completada" type="checkbox" data-index="${indexReal}" id="check_${indexReal}" ${tarea.completada ? 'checked' : ''}>
                                <label class="form-check-label small" for="check_${indexReal}">Completada</label>
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
            
            let category = newTaskCategorySelect ? newTaskCategorySelect.value : 'General';
            if (category === 'Otra') {
                category = newTaskOtraInput.value.trim() || 'General';
            }

            if (!name || !description || !dueDate) {
                if (alertError) alertError.classList.remove('d-none');
                return;
            }

            if (alertError) alertError.classList.add('d-none');
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

    document.getElementById('btnExportar')?.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(taskManager.tasks, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "mis_tareas.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        mostrarToast('Tareas exportadas a JSON con éxito.');
    });

    const btnImportar = document.getElementById('btnImportar');
    const inputImportar = document.getElementById('inputImportar');
    btnImportar?.addEventListener('click', () => inputImportar.click());

    inputImportar?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const tasksImportadas = JSON.parse(event.target.result);
                if (Array.isArray(tasksImportadas)) {
                    taskManager.tasks = tasksImportadas;
                    taskManager.currentId = tasksImportadas.reduce((max, t) => Math.max(max, t.id || 0), 0);
                    taskManager.save();
                    renderizarTareas();
                    mostrarToast('Tareas importadas correctamente.');
                }
            } catch (error) {
                alert('El archivo JSON no es válido.');
            }
        };
        reader.readAsText(file);
    });

    if (inputBusqueda) inputBusqueda.addEventListener('input', renderizarTareas);
    if (selectPrioridad) selectPrioridad.addEventListener('change', renderizarTareas);
    if (selectCategoria) selectCategoria.addEventListener('change', renderizarTareas);
    if (inputFecha) inputFecha.addEventListener('input', renderizarTareas);

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

        const fechasConTareas = taskManager.tasks.map(t => t.dueDate);

        let htmlCeldas = '';

        for (let i = primerDiaIndex; i > 0; i--) {
            const diaPrevio = totalDiasMesAnterior - i + 1;
            htmlCeldas += `<div class="p-1 text-muted opacity-50" style="font-size: 0.75rem; min-height: 24px;">${diaPrevio}</div>`;
        }

        for (let dia = 1; dia <= totalDiasMes; dia++) {
            const mesStr = String(month + 1).padStart(2, '0');
            const diaStr = String(dia).padStart(2, '0');
            const fechaFormateada = `${year}-${mesStr}-${diaStr}`;

            const tieneTarea = fechasConTareas.includes(fechaFormateada);
            const claseIndicador = tieneTarea ? 'bg-dark text-white rounded-circle fw-bold' : 'text-dark';
            const estiloExtra = tieneTarea ? 'width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; margin: auto;' : 'padding: 2px;';

            htmlCeldas += `
                <div class="calendar-day p-0 text-center pointer" data-date="${fechaFormateada}" style="font-size: 0.75rem; cursor: pointer; min-height: 24px;">
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
        
        const inputFechaFiltro = document.getElementById('filtroFecha');
        if (inputFechaFiltro) {
            inputFechaFiltro.value = fechaSeleccionada;
            renderizarTareas();
            mostrarToast(`Filtrando tareas para: ${fechaSeleccionada}`);
        }
    });

    const notesContainer = document.getElementById('notesContainer');
    const btnAddNote = document.getElementById('btnAddNote');

    let savedNotes = JSON.parse(localStorage.getItem('quick_notes')) || [
        { id: 1, text: '¡Revisar entregas pendientes!' }
    ];

    function renderNotes() {
        if (!notesContainer) return;
        notesContainer.innerHTML = '';
        savedNotes.forEach((note, index) => {
            notesContainer.innerHTML += `
                <div class="post-it d-flex flex-column justify-content-between">
                    <span contenteditable="true" class="note-text outline-0" data-index="${index}">${note.text}</span>
                    <div class="text-end mt-1">
                        <button class="btn btn-xs text-danger p-0 delete-note" data-index="${index}"><i class="bi bi-x-lg"></i></button>
                    </div>
                </div>
            `;
        });
        localStorage.setItem('quick_notes', JSON.stringify(savedNotes));
    }

    btnAddNote?.addEventListener('click', () => {
        savedNotes.push({ id: Date.now(), text: 'Nueva nota rápida...' });
        renderNotes();
    });

    notesContainer?.addEventListener('input', (e) => {
        if (e.target.classList.contains('note-text')) {
            const index = e.target.getAttribute('data-index');
            savedNotes[index].text = e.target.textContent;
            localStorage.setItem('quick_notes', JSON.stringify(savedNotes));
        }
    });

    notesContainer?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-note');
        if (deleteBtn) {
            const index = deleteBtn.getAttribute('data-index');
            savedNotes.splice(index, 1);
            renderNotes();
            mostrarToast('Nota eliminada.');
        }
    });

    renderNotes();

    const btnToggleDark = document.getElementById('btnToggleDark');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if (btnToggleDark) btnToggleDark.innerHTML = `<i class="bi bi-sun me-1"></i> Modo Claro`;
    }

    btnToggleDark?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        btnToggleDark.innerHTML = isDark ? `<i class="bi bi-sun me-1"></i> Modo Claro` : `<i class="bi bi-moon-stars me-1"></i> Modo Oscuro`;
    });

    renderizarTareas();
});