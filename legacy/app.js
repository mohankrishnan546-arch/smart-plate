/**
 * NutriVision AI - Enterprise App Orchestrator
 */

import { view } from './js/view.js';
import { store } from './js/store.js';
import { notifications } from './js/notifications.js';

console.log(`[NutriVision AI] v4.0 - Digital Health Intelligence for Enterprise`);
console.log(`[NV-Core] Initializing vision systems and data synchronization...`);

// Welcome Alert
setTimeout(() => {
    notifications.notify('System Online', 'NutriVision Enterprise AI is active.', '🔋');
}, 1000);

// Initialized via module import: ViewController automatic instantiation

// Global State Watchers
window.addEventListener('storage', (event) => {
    if (event.key === store.DB_KEY) {
        console.log('[NV-Store] External change detected. Synchronizing view...');
        view.renderDashboard();
    }
});

// User Interaction Feedback
document.querySelectorAll('.nav-item').forEach(nav => {
    nav.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        nav.classList.add('active');
        
        const viewId = nav.getAttribute('data-view');
        view.switchView(viewId);
    });
});

// Smart Reminders Logic (Every 5 mins for production, but 1m for demo)
const reminders = [
    { title: 'Hydration Goal', text: 'You are 0.4L behind your daily water goal.', icon: '💧' },
    { title: 'Protein Intake', text: 'Consider a high-protein snack to hit your 150g target.', icon: '🍗' },
    { title: 'Community Update', text: 'Dr. Emily Watson just shared a new recipe!', icon: '✨' }
];

setInterval(() => {
    const reminder = reminders[Math.floor(Math.random() * reminders.length)];
    notifications.notify(reminder.title, reminder.text, reminder.icon);
}, 60000); 

// Offline Support Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('[NV-Service] Ready. Enterprise Offline Mode Active.'))
            .catch(err => console.error('[NV-Service] Failed to establish offline core:', err));
    });
}
