# Core Chat UI

This project contains the core UI components for the LangGraph Chat interface, built with React and Vite. It is designed to be embeddable in various host applications (like VS Code extensions or Chrome extensions) via a Service Abstraction Layer (SAL).

## Development

1.  **Navigate to directory**: `cd core-ui`
2.  **Install dependencies**: `npm install` (or `npm ci` if `package-lock.json` exists)
3.  **Start development server**: `npm run dev`
    - This will start Vite's dev server, typically on `http://localhost:5173`. The UI will run using the `MockSal` for local development.
4.  **Run tests**: `npm test`
5.  **Build for production**: `npm run build`
    - Output will be in the `dist/` directory. This `dist` folder is intended to be bundled into host applications.

## Key Technologies

-   React
-   TypeScript
-   Vite (for building and dev server)
-   Vitest (for unit testing)
-   Service Abstraction Layer (SAL) for host communication
-   (Conceptually) CopilotKit for UI components

## Integration

This UI is designed to communicate with a host application through the Service Abstraction Layer (`src/sal/index.ts`). Different SAL implementations (`MockSal.ts`, `VSCodeSal.ts`) allow it to run in various environments.
