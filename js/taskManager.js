class TaskManager {
    constructor(currentId = 0) {
        this.tasks = [];
        this.currentId = currentId;
    }

    addTask(name, description, dueDate, status = 'PORHACER') {
        this.currentId++;
        const nuevaTarea = {
            id: this.currentId,
            name: name,
            description: description,
            dueDate: dueDate,
            status: status
        };
        this.tasks.push(nuevaTarea);
    }
}