import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import { AppContainer } from '@lark-apaas/client-toolkit/components/AppContainer';
import { ErrorRender } from '@lark-apaas/client-toolkit/components/ErrorRender';

import RoutesComponent from './app.tsx';
import './index.css';
import { createPortal } from 'react-dom';
import { Toaster } from '@client/src/components/ui/sonner';

const CLIENT_BASE_PATH = process.env.CLIENT_BASE_PATH || '/';

const isTemplatePlaceholder = (value: string) => value.startsWith('{{') && value.endsWith('}}');

const getClientBasePath = () => {
  if (CLIENT_BASE_PATH !== '/' && !isTemplatePlaceholder(CLIENT_BASE_PATH)) {
    const normalized = CLIENT_BASE_PATH.endsWith('/')
      ? CLIENT_BASE_PATH.slice(0, -1) || '/'
      : CLIENT_BASE_PATH;
    if (
      normalized !== '/' &&
      (window.location.pathname === normalized || window.location.pathname.startsWith(`${normalized}/`))
    ) {
      return normalized;
    }
  }
  if (window.location.pathname === '/app' || window.location.pathname.startsWith('/app/')) return '/app';
  if (window.location.pathname === '/client' || window.location.pathname.startsWith('/client/')) return '/client';
  return '/';
};

const runtimeBasePath = getClientBasePath();

const MainApp = () => {
  return (
    <BrowserRouter basename={runtimeBasePath}>
      <AppContainer defaultTheme="light">
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ErrorRender
              error={error as Error}
              resetErrorBoundary={resetErrorBoundary}
            />
          )}
        >
          <RoutesComponent />
          {createPortal(<Toaster />, document.body)}
        </ErrorBoundary>
      </AppContainer>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<MainApp />);
