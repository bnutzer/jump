import { createRoot } from 'react-dom/client';
import { t } from '../i18n';
import { DialogProvider } from '../shared/DialogContext';
import { ToastProvider } from '../shared/ToastContext';
import '../shared/theme.css';
import './options.css';
import App from './App';

document.title = t('optionsHeading');
createRoot(document.getElementById('root')!).render(
    <DialogProvider>
        <ToastProvider>
            <App />
        </ToastProvider>
    </DialogProvider>,
);
