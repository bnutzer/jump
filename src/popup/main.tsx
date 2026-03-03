import { createRoot } from 'react-dom/client';
import { t } from '../i18n';
import '../shared/theme.css';
import './popup.css';
import App from './App';

document.title = t('popupHeading');
createRoot(document.getElementById('root')!).render(<App />);
