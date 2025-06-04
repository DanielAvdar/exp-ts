// Optional: Import extended matchers for Jest-DOM
import '@testing-library/jest-dom/extend-expect';

// You can add other global setup code here if needed.
// For example, mocking global objects or functions.

// Example: Mocking localStorage
// const localStorageMock = (function() {
//   let store: Record<string, string> = {};
//   return {
//     getItem: function(key: string) {
//       return store[key] || null;
//     },
//     setItem: function(key: string, value: string) {
//       store[key] = value.toString();
//     },
//     clear: function() {
//       store = {};
//     },
//     removeItem: function(key: string) {
//       delete store[key];
//     }
//   };
// })();
// Object.defineProperty(window, 'localStorage', { value: localStorageMock });

console.log('Vitest setupTests.ts loaded.');
