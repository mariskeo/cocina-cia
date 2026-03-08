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
        'Clientes': document.getElementById('view-clientes'),
        'Inventario': document.getElementById('view-inventario')
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
                } else if (viewName === 'Inventario') {
                    renderInventory();
                }
            }
        });
    });

    // --- Inventory Data & Logic ---
    const providers = [
        "Distribuidora El Galpón (Proteínas)",
        "Surtifruver del Campo (Vegetales)",
        "Abarrotes Central (Secos)",
        "Destilería Local (Bebidas)",
        "Panadería La Espiga (Pan)"
    ];

    const inventoryData = [
        { id: 'P-001', name: 'Pechuga de Pollo', stock: 12, min: 15, unit: 'kg', needed: 25, provider: providers[0] },
        { id: 'V-001', name: 'Cebolla Blanca', stock: 8, min: 5, unit: 'kg', needed: 3, provider: providers[1] },
        { id: 'C-001', name: 'Arroz Blanco', stock: 4, min: 10, unit: 'kg', needed: 15, provider: providers[2] },
        { id: 'S-001', name: 'Sal Marina', stock: 12, min: 2, unit: 'kg', needed: 0, provider: providers[2] },
        { id: 'E-001', name: 'Especias Curry', stock: 0.5, min: 1, unit: 'kg', needed: 2, provider: providers[2] },
        { id: 'V-002', name: 'Tomate Chonto', stock: 5, min: 8, unit: 'kg', needed: 10, provider: providers[1] },
        { id: 'B-001', name: 'Cerveza Artesana', stock: 24, min: 12, unit: 'und', needed: 0, provider: providers[3] },
        { id: 'P-002', name: 'Pan Brioche', stock: 6, min: 20, unit: 'und', needed: 30, provider: providers[4] }
    ];

    let shoppingCart = [];

    const inventoryGrid = document.getElementById('inventory-grid');
    const orderCount = document.getElementById('order-count');
    const orderPanel = document.getElementById('order-panel');
    const orderItems = document.getElementById('order-items');
    const inventorySearch = document.getElementById('inventory-search');
    const inventorySort = document.getElementById('inventory-sort');

    function renderInventory() {
        if (!inventoryGrid) return;

        const searchTerm = inventorySearch.value.toLowerCase();
        const sortBy = inventorySort.value;

        let filtered = inventoryData.filter(item => item.name.toLowerCase().includes(searchTerm));

        // Urgency Calculation: ratio = current / min. Low ratio = high urgency.
        if (sortBy === 'urgencia') {
            filtered.sort((a, b) => (a.stock / a.min) - (b.stock / b.min));
        } else if (sortBy === 'nombre') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'stock') {
            filtered.sort((a, b) => a.stock - b.stock);
        }

        inventoryGrid.innerHTML = '';
        filtered.forEach(item => {
            const urgencyRatio = item.stock / item.min;
            let statusClass = 'status-ok';
            let statusText = 'Suficiente';

            if (urgencyRatio < 0.5) { statusClass = 'status-critical'; statusText = 'CRÍTICO'; }
            else if (urgencyRatio < 1) { statusClass = 'status-warning'; statusText = 'REABASTECER'; }

            const card = document.createElement('div');
            card.className = 'kpi-card inventory-card';
            card.style.padding = '20px';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <span class="kpi-label" style="font-size: 10px;">${item.id}</span>
                    <span class="status-badge ${statusClass}" style="font-size: 9px; padding: 4px 8px; border-radius: 4px; font-weight: 700;">${statusText}</span>
                </div>
                <h4 style="font-family: var(--font-head); font-size: 16px; margin-bottom: 15px;">${item.name}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                    <div>
                        <p style="font-size: 10px; color: var(--text-dim);">STOCK ACTUAL</p>
                        <p style="font-size: 18px; font-weight: 800;">${item.stock} <small style="font-size: 10px;">${item.unit}</small></p>
                    </div>
                    <div>
                        <p style="font-size: 10px; color: var(--text-dim);">DÉFICIT VENTAS</p>
                        <p style="font-size: 18px; font-weight: 800; color: ${item.needed > 0 ? 'var(--warning)' : 'var(--text-dim)'}">+${item.needed} <small style="font-size: 10px;">${item.unit}</small></p>
                    </div>
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="font-size: 10px; color: var(--text-dim); display: block; margin-bottom: 5px;">PROVEEDOR</label>
                    <select id="prov-${item.id}" class="console-input" style="padding: 8px; font-size: 11px; width: 100%; min-height: 35px;">
                        ${providers.map(p => `<option value="${p}" ${p === item.provider ? 'selected' : ''}>${p}</option>`).join('')}
                    </select>
                </div>

                <div style="display: flex; gap: 10px; align-items: flex-end;">
                    <div style="flex: 1;">
                        <label style="font-size: 10px; color: var(--text-dim); display: block; margin-bottom: 5px;">CANTIDAD</label>
                        <input type="number" id="qty-${item.id}" value="${item.needed || item.min}" class="console-input" style="padding: 8px; font-size: 11px; width: 100%; min-height: 35px;">
                    </div>
                    <button class="smart-btn" onclick="handleAddToOrder('${item.id}')" style="padding: 10px 15px; font-size: 12px; height: 35px;">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
            inventoryGrid.appendChild(card);
        });
    }

    if (inventorySearch) inventorySearch.addEventListener('input', renderInventory);
    if (inventorySort) inventorySort.addEventListener('change', renderInventory);

    window.handleAddToOrder = (id) => {
        const item = inventoryData.find(i => i.id === id);
        const qtyInput = document.getElementById(`qty-${id}`);
        const provSelect = document.getElementById(`prov-${id}`);

        if (!item || !qtyInput || !provSelect) return;

        const qty = parseFloat(qtyInput.value);
        const provider = provSelect.value;

        if (qty <= 0) return alert('La cantidad debe ser mayor a 0');

        const existing = shoppingCart.find(i => i.id === id && i.provider === provider);
        if (existing) {
            existing.qty += qty;
        } else {
            shoppingCart.push({ ...item, qty: qty, provider: provider });
        }
        updateOrderUI();
        logToHistory(`Añadido: ${item.name} (${qty} ${item.unit} - ${provider})`);
    };

    function updateOrderUI() {
        orderCount.textContent = shoppingCart.length;
        orderItems.innerHTML = '';
        shoppingCart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.style.padding = '15px 0';
            div.innerHTML = `
                <div style="flex: 1;">
                    <p style="font-weight: 700; font-size: 13px;">${item.name}</p>
                    <p style="font-size: 11px; color: var(--primary);">${item.provider}</p>
                    <p style="font-size: 11px; color: var(--text-dim);">Cant: ${item.qty} ${item.unit}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="number" value="${item.qty}" style="width: 60px; background: rgba(255,255,255,0.05); border: 1px solid var(--card-border); color: white; padding: 5px; border-radius: 4px; font-size: 12px;" onchange="updateCartQty('${item.id}', this.value)">
                    <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: var(--danger); cursor: pointer;"><i class="fas fa-trash"></i></button>
                </div>
            `;
            orderItems.appendChild(div);
        });
    }

    window.updateCartQty = (id, val) => {
        const item = shoppingCart.find(i => i.id === id);
        if (item) item.qty = parseFloat(val);
    };

    window.removeFromCart = (id) => {
        shoppingCart = shoppingCart.filter(i => i.id !== id);
        updateOrderUI();
    };

    const btnGenerateOrder = document.getElementById('btn-generate-order');
    const closeOrder = document.getElementById('close-order');
    const btnPrintOrder = document.getElementById('btn-print-order');

    if (btnGenerateOrder) btnGenerateOrder.addEventListener('click', () => orderPanel.classList.add('active'));
    if (closeOrder) closeOrder.addEventListener('click', () => orderPanel.classList.remove('active'));

    if (btnPrintOrder) btnPrintOrder.addEventListener('click', () => {
        if (shoppingCart.length === 0) return alert('La lista está vacía');

        let report = `REPORTE DE PEDIDO - COCINA&CIA\nFecha: ${new Date().toLocaleDateString()}\n\n`;
        shoppingCart.forEach(i => {
            report += `- ${i.name}: ${i.qty} ${i.unit}\n`;
        });

        const win = window.open('', '_blank');
        win.document.write(`
            <html>
            <head><title>Lista de Pedido</title></head>
            <body style="font-family: sans-serif; padding: 40px; background: #fff; color: #000;">
                <h1>COCINA&CIA | Lista de Pedido</h1>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
                <hr>
                <ul>${shoppingCart.map(i => `<li><strong>${i.name}</strong> - ${i.qty} ${i.unit}<br><small style="color: #666">Proveedor: ${i.provider}</small></li>`).join('')}</ul>
                <hr>
                <p>Total items: ${shoppingCart.length}</p>
                <script>window.print();</script>
            </body>
            </html>
        `);
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

    // AI Chat Logic (Generic)
    function setupChat(formId, inputId, outputId, context) {
        const form = document.getElementById(formId);
        const input = document.getElementById(inputId);
        const output = document.getElementById(outputId);
        if (!form || !input || !output) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = input.value.trim();
            if (!query) return;

            if (output.querySelector('.chat-welcome')) output.innerHTML = '';

            addMessage(output, 'user', query);
            logToHistory(`Consulta ${context}: "${query.substring(0, 20)}..."`);
            input.value = '';

            setTimeout(() => {
                const response = generateAIResponse(query, context);
                addMessage(output, 'ai', response);
            }, 800);
        });
    }

    setupChat('console-form', 'user-input', 'chat-output', 'Gral');
    setupChat('console-form-sales', 'user-input-sales', 'chat-output-sales', 'Ventas');

    function addMessage(target, sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = sender === 'user' ? 'message-user' : 'message-ai';

        if (sender === 'user') {
            msgDiv.innerHTML = `<span class="message-label">USER</span>${text}`;
        } else {
            msgDiv.innerHTML = `<span class="message-label">CEREBRO</span>${text}`;
        }
        target.appendChild(msgDiv);
        target.scrollTop = target.scrollHeight;
    }

    function generateAIResponse(query, context) {
        const q = query.toLowerCase();
        if (context === 'Ventas') {
            if (q.includes('peor') || q.includes('lentejas')) return "Según 04_Market_Intelligence, las lentejas tienen baja rotación los fines de semana. Sugiero ofrecerlas como 'Plato de Nutrición Consciente' con descuento del 15% los lunes.";
            if (q.includes('mejor') || q.includes('curry')) return "El Pollo al Curry tiene un margen del 38% y es el plato más vendido los fines de semana. Podríamos subir un 5% el precio sin afectar volumen.";
            return "Analizando tendencias de mercado (04) para optimizar tus ventas... Detecto oportunidad en bebidas artesanales.";
        }
        if (q.includes('margen')) return "Analizando 01_Market_Intelligence... Riesgo detectado en Pollo al Curry (Margen: 26%).";
        if (q.includes('ventas')) return "Ventas subieron un 12% este mes. Estos datos provienen de 04_Market_Intelligence.";
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
        const output = document.getElementById('chat-output');
        addMessage(output, 'ai', messages[action]);
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
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#999' } },
                    x: { grid: { display: false }, ticks: { color: '#999' } }
                }
            }
        });
    }

    let salesCircularChartInstance = null;
    function initSalesCircularChart() {
        if (salesCircularChartInstance) return;
        const ctx = document.getElementById('salesCircularChart').getContext('2d');
        salesCircularChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Proteínas', 'Bebidas', 'Postres', 'Otros'],
                datasets: [{
                    data: [55, 25, 12, 8],
                    backgroundColor: ['#BFFF00', 'rgba(191, 255, 0, 0.7)', 'rgba(191, 255, 0, 0.4)', 'rgba(191, 255, 0, 0.1)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#999', boxWidth: 10, font: { size: 10 } } }
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
