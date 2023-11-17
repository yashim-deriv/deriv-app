import React from 'react';
import { StandaloneAPIProvider } from '@deriv/api';
import { ModalProvider } from './components/ModalProvider';
import AppContent from './AppContent';
import './styles/fonts.scss';
import './index.scss';

const App: React.FC = () => (
    <StandaloneAPIProvider>
        <ModalProvider>
            <AppContent />
        </ModalProvider>
    </StandaloneAPIProvider>
);

export default App;
