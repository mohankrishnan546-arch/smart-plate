/**
 * NutriVision AI - Smart Notification Engine
 * Manages modern glassmorphic toast notifications for enterprise health insights.
 */

class SmartNotifications {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'nv-notifications-container';
        this.container.classList.add('notifications-root');
        document.body.appendChild(this.container);
        this._injectStyles();
    }

    _injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notifications-root {
                position: fixed;
                bottom: 24px;
                right: 24px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                z-index: 2000;
            }
            .nv-toast {
                background: var(--surface);
                backdrop-filter: blur(12px);
                border: 1px solid var(--surface-border);
                border-left: 4px solid var(--primary);
                padding: 16px 24px;
                border-radius: 12px;
                color: var(--text-primary);
                box-shadow: var(--shadow-lg);
                display: flex;
                align-items: center;
                gap: 12px;
                animation: toast-slide 0.4s var(--transition-spring);
                min-width: 300px;
            }
            @keyframes toast-slide {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .nv-toast-content {
                display: flex;
                flex-direction: column;
            }
            .nv-toast-title { font-weight: 700; font-size: 0.9rem; }
            .nv-toast-text { font-size: 0.85rem; color: var(--text-secondary); }
        `;
        document.head.appendChild(style);
    }

    notify(title, message, icon = '🧠') {
        const toast = document.createElement('div');
        toast.className = 'nv-toast';
        toast.innerHTML = `
            <span class="icon">${icon}</span>
            <div class="nv-toast-content">
                <div class="nv-toast-title">${title}</div>
                <div class="nv-toast-text">${message}</div>
            </div>
        `;
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = '0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
}

export const notifications = new SmartNotifications();
export default notifications;
