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
        'Inventario': document.getElementById('view-inventario'),
        'Informes': document.getElementById('view-informes'),
        'Costos': document.getElementById('view-costos'),
        'Configuración': document.getElementById('view-settings'),
        'Ajustes': document.getElementById('view-settings')
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
                } else if (viewName === 'Costos') {
                    renderCostMonitor();
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
    setupChat('console-form-reports', 'user-input-reports', 'chat-output-reports', 'Informes');

    // --- Reports Logic ---
    const reportHistoryList = [];
    const reportDateInput = document.getElementById('report-date');
    const reportHistoryContainer = document.getElementById('report-history');

    if (reportDateInput) {
        reportDateInput.valueAsDate = new Date();
    }

    window.generateReport = (type) => {
        const date = reportDateInput.value || new Date().toLocaleDateString();
        logToHistory(`Generando informe: ${type}`);

        // Add to history
        reportHistoryList.unshift({
            type: type,
            date: date,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            id: 'REP-' + Math.floor(Math.random() * 10000)
        });

        renderReportHistory();

        // Visual feedback
        const output = document.getElementById('chat-output-reports');
        if (output.querySelector('.chat-welcome')) output.innerHTML = '';
        addMessage(output, 'ai', `📊 Informe de **${type}** generado correctamente con fecha de corte **${date}**. Puedes descargarlo o verlo en el historial.`);
    };

    function renderReportHistory() {
        if (!reportHistoryContainer) return;

        if (reportHistoryList.length === 0) {
            reportHistoryContainer.innerHTML = '<div style="text-align: center; color: var(--text-dim); padding: 20px;">No hay reportes generados recientemente.</div>';
            return;
        }

        reportHistoryContainer.innerHTML = '';
        reportHistoryList.forEach(report => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.style.padding = '12px 0';
            item.innerHTML = `
                <div style="flex: 1;">
                    <p style="font-weight: 700; font-size: 13px;">${report.type}</p>
                    <p style="font-size: 11px; color: var(--text-dim);">ID: ${report.id} | Corte: ${report.date}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 10px; color: var(--text-dim);">${report.timestamp}</span>
                    <button class="smart-btn" style="padding: 5px 10px; font-size: 10px;"><i class="fas fa-download"></i></button>
                    <button class="smart-btn" style="padding: 5px 10px; font-size: 10px;"><i class="fas fa-eye"></i></button>
                </div>
            `;
            reportHistoryContainer.appendChild(item);
        });
    }

    // --- Costs Logic ---
    const plateCostsData = [
        { id: 'ALM-01', name: 'Pollo al Curry', theory: 5200, real: 5850, alert: true, suggestion: 'Revisar porcionamiento de proteína' },
        { id: 'ALM-02', name: 'Bowl Vegano', theory: 3100, real: 3200, alert: false, suggestion: 'Costo bajo control' },
        { id: 'ALM-03', name: 'Lentejas Tradicionales', theory: 2800, real: 3450, alert: true, suggestion: 'Mermas altas en sofrito' },
        { id: 'ALM-04', name: 'Pasta Pesto', theory: 4500, real: 4650, alert: false, suggestion: 'Optimizar empaque' }
    ];

    const costMonitorBody = document.getElementById('cost-monitor-body');
    const simulationForm = document.getElementById('simulation-form');
    const simModal = document.getElementById('sim-modal');
    const simResultsContent = document.getElementById('sim-results-content');

    window.renderCostMonitor = () => {
        if (!costMonitorBody) return;
        costMonitorBody.innerHTML = '';
        plateCostsData.forEach(plate => {
            const dev = ((plate.real - plate.theory) / plate.theory) * 100;
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--card-border)';
            tr.innerHTML = `
                <td style="padding: 15px 10px;">
                    <span style="font-weight: 700;">${plate.id}</span><br>
                    <span style="font-size: 11px; color: var(--text-dim);">${plate.name}</span>
                </td>
                <td style="padding: 15px 10px; font-family: 'JetBrains Mono', monospace;">$${plate.theory.toLocaleString()}</td>
                <td style="padding: 15px 10px; font-family: 'JetBrains Mono', monospace;">$${plate.real.toLocaleString()}</td>
                <td style="padding: 15px 10px; font-family: 'JetBrains Mono', monospace; color: ${dev > 5 ? 'var(--danger)' : 'var(--success)'}">
                    ${dev > 0 ? '+' : ''}${dev.toFixed(1)}% ${dev > 5 ? '<i class="fas fa-exclamation-triangle"></i>' : ''}
                </td>
                <td style="padding: 15px 10px; color: var(--primary); font-style: italic;">"${plate.suggestion}"</td>
            `;
            costMonitorBody.appendChild(tr);
        });
    }

    if (simulationForm) {
        simulationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const queryInput = document.getElementById('simulation-input');
            const query = queryInput.value.trim();
            if (!query) return;

            // Simple Logic for simulation based on keywords
            let resultHtml = '';
            if (query.toLowerCase().includes('gas') || query.toLowerCase().includes('servicios')) {
                resultHtml = `
                    <p style="margin-bottom: 20px;">Simulando incremento del 10% en servicios públicos (Gas/Energía):</p>
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Punto de Equilibrio Actual:</span>
                            <span style="font-weight: 700;">850 unidades</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; color: var(--warning);">
                            <span>Nuevo Punto de Equilibrio:</span>
                            <span style="font-weight: 700;">912 unidades</span>
                        </div>
                        <p style="font-size: 11px; color: var(--text-dim); font-style: italic;">
                            "Recomendación: Incrementar el precio de los platos de alta rotación en un 3% para compensar el costo operativo."
                        </p>
                    </div>
                `;
            } else if (query.toLowerCase().includes('arriendo') || query.toLowerCase().includes('renta')) {
                resultHtml = `
                    <p style="margin-bottom: 20px;">Simulando ajuste de Canon de Arrendamiento:</p>
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>MBO Global Proyectado:</span>
                            <span style="color: var(--danger);">28.5% (⬇️ 4%)</span>
                        </div>
                        <p style="font-size: 11px; color: var(--text-dim); font-style: italic;">
                            "Impacto significativo en gastos fijos. Se sugiere optimizar la nómina operativa en horas valle."
                        </p>
                    </div>
                `;
            } else {
                resultHtml = `
                    <p style="margin-bottom: 20px;">Analizando impacto para: "${query}"</p>
                    <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; text-align: center;">
                        <i class="fas fa-spinner fa-spin" style="margin-bottom: 10px; font-size: 24px;"></i>
                        <p>Simulando variables financieras de los archivos 01, 02 y 06...</p>
                        <p style="color: var(--primary); margin-top: 10px;">Proyección: Escenario Neutro (+0.5% en costos fijos).</p>
                    </div>
                `;
            }

            simResultsContent.innerHTML = resultHtml;
            simModal.style.display = 'flex';
            logToHistory(`Simulación ejecutada: ${query.substring(0, 15)}...`);
            queryInput.value = '';
        });
    }

    window.closeSimModal = () => {
        if (simModal) simModal.style.display = 'none';
    };

    // --- Settings Tab Logic ---
    window.switchSettingsTab = (tabName) => {
        const contents = document.querySelectorAll('.settings-tab-content');
        const buttons = document.querySelectorAll('.tab-btn');

        contents.forEach(content => content.style.display = 'none');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.color = 'var(--text-dim)';
            btn.style.borderBottom = 'none';
        });

        const activeContent = document.getElementById(`tab-${tabName}`);
        if (activeContent) {
            activeContent.style.display = tabName === 'docs' ? 'grid' : 'block';
        }

        const activeBtn = Array.from(buttons).find(btn => btn.innerText.toLowerCase().includes(tabName === 'user' ? 'usuario' : tabName === 'system' ? 'sistema' : 'documentación'));
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.color = '#fff';
            activeBtn.style.borderBottom = '2px solid var(--primary)';
        }
    };

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

    // --- Smart Pre-order Logic ---
    const btnSmartPreorder = document.getElementById('btn-smart-preorder');
    const smartModal = document.getElementById('smart-preorder-modal');
    const smartContent = document.getElementById('smart-preorder-content');
    const btnConfirmSmart = document.getElementById('btn-confirm-smart-order');

    window.handleSmartPreorder = () => {
        console.log("handleSmartPreorder triggered");
        const modal = document.getElementById('smart-preorder-modal');
        if (!modal) {
            console.error("Modal not found in DOM");
            return;
        }

        // Cross-reference logic (Hoisted function)
        generateSmartPreorder();

        modal.style.display = 'flex';
        console.log("Modal display set to flex");
    };

    if (btnSmartPreorder) {
        btnSmartPreorder.addEventListener('click', (e) => {
            e.preventDefault();
            window.handleSmartPreorder();
        });
    }

    function generateSmartPreorder() {
        // Mocking the "cross-referencing" intelligence
        // We filter items that have a deficit (item.needed > 0)
        // and add some "IA" logic (e.g., adding a safety buffer for high-sales items)

        const suggestedItems = inventoryData.filter(item => item.needed > 0).map(item => {
            // Intelligent Buffer: +15% if it's a high-demand item (simulated)
            const iaBuffer = Math.ceil(item.needed * 0.15);
            return {
                ...item,
                suggestedQty: item.needed + iaBuffer,
                priority: item.needed > (item.min * 2) ? 'Alta' : 'Normal'
            };
        });

        // Group by Provider
        const grouped = suggestedItems.reduce((acc, item) => {
            if (!acc[item.provider]) acc[item.provider] = [];
            acc[item.provider].push(item);
            return acc;
        }, {});

        renderSmartPreorder(grouped);
    }

    function renderSmartPreorder(grouped) {
        smartContent.innerHTML = '';

        if (Object.keys(grouped).length === 0) {
            smartContent.innerHTML = '<p style="text-align: center; color: var(--text-dim); padding: 40px;">No se detectaron necesidades críticas de reabastecimiento tras el cruce de datos.</p>';
            return;
        }

        for (const provider in grouped) {
            const groupDiv = document.createElement('div');
            groupDiv.style.background = 'rgba(255,255,255,0.02)';
            groupDiv.style.border = '1px solid var(--card-border)';
            groupDiv.style.borderRadius = '16px';
            groupDiv.style.padding = '25px';

            groupDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h4 style="color: var(--primary); font-family: var(--font-head); font-size: 18px;">
                        <i class="fas fa-truck"></i> ${provider}
                    </h4>
                    <span style="font-size: 11px; color: var(--text-dim); background: rgba(255,255,255,0.05); padding: 5px 12px; border-radius: 20px;">
                        Canal: WhatsApp / API
                    </span>
                </div>
                <div style="display: grid; gap: 15px;">
                    ${grouped[provider].map(item => `
                        <div style="display: grid; grid-template-columns: 2fr 1fr 1.5fr; gap: 15px; align-items: center; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                            <div>
                                <p style="font-weight: 700; font-size: 13px;">${item.name}</p>
                                <p style="font-size: 10px; color: var(--text-dim);">Stock: ${item.stock} ${item.unit} | Sugerido: ${item.needed} + IA Buffer</p>
                            </div>
                            <div>
                                <input type="number" value="${item.suggestedQty}" class="console-input" style="padding: 6px 12px; font-size: 12px; width: 80px;">
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <select class="console-input" style="padding: 6px; font-size: 11px; flex: 1;">
                                    <option>Entrega Normal</option>
                                    <option>Urgente (AM)</option>
                                    <option>Consolidado Semanal</option>
                                </select>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 15px;">
                    <textarea class="console-input" placeholder="Nota para el proveedor..." style="width: 100%; height: 60px; padding: 10px; font-size: 12px; resize: none;"></textarea>
                </div>
            `;
            smartContent.appendChild(groupDiv);
        }
    }

    if (btnConfirmSmart) {
        btnConfirmSmart.addEventListener('click', () => {
            logToHistory("Pre-pedido IA Confirmado y Enviado");
            smartModal.style.display = 'none';
            alert("¡Pre-pedido inteligente enviado con éxito a los canales de proveedores!");
        });
    }
});
