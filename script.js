// Gerenciamento do Estado da Aplicação usando LocalStorage
let tasks = JSON.parse(localStorage.getItem('kanban_tasks')) || [];

// Elementos do DOM
const modal = document.getElementById('taskModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.querySelector('.close-btn');
const taskForm = document.getElementById('taskForm');

// Abrir e fechar o Modal
openModalBtn.onclick = () => modal.style.display = 'flex';
closeModalBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; }

// Adicionar Nova Tarefa
taskForm.onsubmit = (e) => {
    e.preventDefault();
    
    const newTask = {
        id: 'task-' + Date.now(),
        title: document.getElementById('taskTitle').value,
        desc: document.getElementById('taskDesc').value,
        priority: document.getElementById('taskPriority').value,
        status: 'todo' // status inicial
    };

    tasks.push(newTask);
    saveAndRender();
    taskForm.reset();
    modal.style.display = 'none';
};

// Salvar no LocalStorage e Renderizar a Tela
function saveAndRender() {
    localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
    renderTasks();
}

// Renderizar os cards nas colunas corretas
function renderTasks() {
    document.getElementById('todo-list').innerHTML = '';
    document.getElementById('doing-list').innerHTML = '';
    document.getElementById('done-list').innerHTML = '';

    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <button class="delete-btn" onclick="deleteTask('${task.id}')">&times;</button>
            <h3>${task.title}</h3>
            <p>${task.desc}</p>
            <span class="badge ${task.priority}">${task.priority}</span>
            <div class="move-buttons">
                ${task.status !== 'todo' ? `<button onclick="changeStatus('${task.id}', 'prev')">◀</button>` : ''}
                ${task.status !== 'done' ? `<button onclick="changeStatus('${task.id}', 'next')">▶</button>` : ''}
            </div>
        `;

        document.getElementById(`${task.status}-list`).appendChild(taskCard);
    });
}

// Mudar o Status/Coluna da Tarefa
window.changeStatus = (id, direction) => {
    const statuses = ['todo', 'doing', 'done'];
    const task = tasks.find(t => t.id === id);
    let currentIndex = statuses.indexOf(task.status);

    if (direction === 'next' && currentIndex < 2) currentIndex++;
    if (direction === 'prev' && currentIndex > 0) currentIndex--;

    task.status = statuses[currentIndex];
    saveAndRender();
};

// Deletar uma Tarefa
window.deleteTask = (id) => {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
};

// Inicializar a renderização ao carregar a página
renderTasks();
