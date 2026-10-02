import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// React Compiler runs as a Babel plugin — it auto-memoizes components,
// so no manual useMemo / useCallback / React.memo is needed.
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
  ],
});
