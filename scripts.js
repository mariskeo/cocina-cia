document.addEventListener('DOMContentLoaded', () => {
    const consoleForm = document.getElementById('console-form');
    const userInput = document.getElementById('user-input');
    const chatOutput = document.getElementById('chat-output');
    const iaAlert = document.getElementById('ia-alert');

    // Simulating IA interaction
    consoleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = userInput.value.trim();
        if (!query) return;

        // Clear welcome message if first chat
        if (chatOutput.querySelector('.chat-welcome')) {
            chatOutput.innerHTML = '';
        }

        addMessage('user', query);
        userInput.value = '';

        // Simulate thinking and response
        setTimeout(() => {
            const response = generateAIResponse(query);
            addMessage('ai', response);
        }, 800);
    });

    function addMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.style.marginBottom = '15px';
        msgDiv.style.padding = '12px 18px';
        msgDiv.style.borderRadius = '12px';
        msgDiv.style.fontSize = '14px';
        msgDiv.style.lineHeight = '1.5';
        msgDiv.style.maxWidth = '85%';

        if (sender === 'user') {
            msgDiv.style.background = 'rgba(255,255,255,0.05)';
            msgDiv.style.marginLeft = 'auto';
            msgDiv.style.border = '1px solid rgba(255,255,255,0.1)';
            msgDiv.innerHTML = `<span style="color:var(--primary); font-weight:700; display:block; margin-bottom:5px;">MARISKE</span>${text}`;
        } else {
            msgDiv.style.background = 'rgba(191,255,0,0.05)';
            msgDiv.style.border = '1px solid rgba(191,255,0,0.1)';
            msgDiv.innerHTML = `<span style="color:var(--primary); font-weight:700; display:block; margin-bottom:5px;">CEREBRO COCINA&CIA</span>${text}`;
        }

        chatOutput.appendChild(msgDiv);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }

    function generateAIResponse(query) {
        const q = query.toLowerCase();
        if (q.includes('margen')) {
            return "Analizando 01_Market_Intelligence... El margen promedio actual es del 32%. He detectado un riesgo en el Pollo al Curry por el aumento del 12% en el proveedor de proteína.";
        } else if (q.includes('producción') || q.includes('plan')) {
            return "Revisando pedidos en 00_Core_Logic. He generado una proyección de 145 porciones para el turno de almuerzo. Consulta el 02_Production_Playbook para el mise en place.";
        } else if (q.includes('merma')) {
            return "La desviación de mermas según el 03_Operational_Log es del 5%. Estamos bajo el límite teórico del 10%. Buen trabajo de control operativo.";
        }
        return "He recibido tu consulta sobre '" + query + "'. Estoy procesando los datos de tus 4 archivos maestros para darte una respuesta basada en evidencia.";
    }

    // Smart Actions
    window.triggerAction = (action) => {
        if (chatOutput.querySelector('.chat-welcome')) {
            chatOutput.innerHTML = '';
        }

        let message = "";
        switch (action) {
            case 'Producción':
                message = "⚙️ **Generando Plan de Producción...** Basándome en los pedidos de la semana, he calculado que necesitas preparar 18kg de base para Curry.";
                break;
            case 'Auditoría':
                message = "🔍 **Iniciando Auditoría de Costos...** Comparando 01 (Precios Mercado) con 02 (Escandallos). No hay incrementos críticos fuera del Pollo ya reportado.";
                break;
            case 'Cierre':
                message = "📝 **Cierre de Turno activado.** Abriendo el 03_Operational_Log para tu registro. Recuerda anotar la merma detectada hoy.";
                break;
        }
        addMessage('ai', message);
    };

    // Micro-animations for KPI cards
    const cards = document.querySelectorAll('.kpi-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});
