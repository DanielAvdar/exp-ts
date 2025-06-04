import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css'; // Import global styles
import { MockSal } from './sal/MockSal';
import { VSCodeSal } from './sal/VSCodeSal';
import { ServiceAbstractionLayer } from './sal';


let salInstance: ServiceAbstractionLayer;

// Check if running in a VS Code webview environment
// @ts-ignore
if (typeof acquireVsCodeApi === 'function') {
  salInstance = new VSCodeSal();
  console.log("Using VSCodeSal for communication.");
} else {
  salInstance = new MockSal();
  console.warn("MockSal is being used. VSCode specific functionalities will not be available.");
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App salInstance={salInstance} />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. UI will not be rendered.");
}
