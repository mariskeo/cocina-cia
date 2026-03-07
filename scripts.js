document.addEventListener('DOMContentLoaded', () => {
    const consoleForm = document.getElementById('console-form');
    const userInput = document.getElementById('user-input');
    const chatOutput = document.getElementById('chat-output');
    const actionHistory = document.getElementById('action-history');

    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const views = {
        'Tablero': document.getElementById('view-dashboard'),
        'Ventas': document.getElementById('view-sales'),
        'Clientes': document.getElementById('view-clientes')
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const viewName = link.textContent.trim();
            if (views[viewName]) {
                e.preventDefault();
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Switch views
                Object.values(views).forEach(v => {
                    if (v) v.classList.remove('active');
                });
                if (views[viewName]) views[viewName].classList.add('active');

                if (viewName === 'Ventas') {
                    initSalesChart();
                } else if (viewName === 'Clientes') {
                    initClientsChart();
                }
            }
        });
    });

    // Action History Helper
    function logToHistory(text) {
        const li = document.createElement('li');
        li.className = 'history-item';
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        li.innerHTML = `<span>${text}</span><span class="history-time">${timeStr}</span>`;
        actionHistory.prepend(li); // Newest on top
        if (actionHistory.children.length > 5) actionHistory.lastChild.remove();
    }

    // AI Chat Logic
    consoleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = userInput.value.trim();
        if (!query) return;

        if (chatOutput.querySelector('.chat-welcome')) chatOutput.innerHTML = '';

        addMessage('user', query);
        logToHistory(`Consulta IA: "${query.substring(0, 20)}..."`);
        userInput.value = '';

        setTimeout(() => {
            const response = generateAIResponse(query);
            addMessage('ai', response);
        }, 800);
    });

    function addMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.style.marginBottom = '12px';
        msgDiv.style.padding = '10px 15px';
        msgDiv.style.borderRadius = '10px';
        msgDiv.style.fontSize = '13px';
        msgDiv.className = sender === 'user' ? 'message-user' : 'message-ai';

        if (sender === 'user') {
            msgDiv.style.background = 'rgba(255,255,255,0.05)';
            msgDiv.style.marginLeft = 'auto';
            msgDiv.innerHTML = `<span style="color:var(--primary); font-weight:700; display:block;">MARISKE</span>${text}`;
        } else {
            msgDiv.style.background = 'rgba(191,255,0,0.05)';
            msgDiv.innerHTML = `<span style="color:var(--primary); font-weight:700; display:block;">CEREBRO COCINA&CIA</span>${text}`;
        }
        chatOutput.appendChild(msgDiv);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }

    function generateAIResponse(query) {
        const q = query.toLowerCase();
        if (q.includes('margen')) return "Analizando 01_Market_Intelligence... Riesgo detectado en Pollo al Curry (Margen: 26%).";
        if (q.includes('ventas')) return "Ventas subieron un 12% este mes. Estos datos provienen de 04_Market_Intelligence. He actualizado el gráfico en la sección 'Ventas'.";
        if (q.includes('cliente') || q.includes('base')) return "Consultando 05_Client_Base... Tienes 150 clientes activos con una recurrencia del 22%.";
        return "Procesando datos maestros (00-05) para responder a: " + query;
    }

    // Smart Actions
    window.triggerAction = (action) => {
        logToHistory(`Acción: ${action} ejecutada`);
        const messages = {
            'Producción': "⚙️ Plan generado: 18kg de base para Curry necesarios.",
            'Auditoría': "🔍 Auditoría completada. Margen global estable al 32%.",
            'Cierre': "📝 Cierre registrado. Archivo 03_Operational_Log actualizado."
        };
        addMessage('ai', messages[action]);
    };

    // Chart.js Implementation
    let salesChartInstance = null;
    function initSalesChart() {
        if (salesChartInstance) return;

        const ctx = document.getElementById('salesChart').getContext('2d');
        salesChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
                datasets: [{
                    label: 'Ventas (COP)',
                    data: [1200, 1900, 1500, 2500, 3200, 4100, 3800],
                    borderColor: '#BFFF00',
                    backgroundColor: 'rgba(191, 255, 0, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#999' } },
                    x: { grid: { display: false }, ticks: { color: '#999' } }
                }
            }
        });
    }

    let clientsChartInstance = null;
    function initClientsChart() {
        if (clientsChartInstance) return;
        const ctx = document.getElementById('clientsChart').getContext('2d');
        clientsChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Directo', 'Social', 'Referidos', 'Email'],
                datasets: [{
                    data: [40, 30, 20, 10],
                    backgroundColor: ['#BFFF00', 'rgba(191, 255, 0, 0.6)', 'rgba(191, 255, 0, 0.3)', 'rgba(191, 255, 0, 0.1)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#999' } }
                }
            }
        });
    }
});
