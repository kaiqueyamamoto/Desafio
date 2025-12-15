const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Configuração base
const baseConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/app/api/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    'src/middleware.ts',
    'src/components/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/lib/hooks/**',
    '!src/lib/providers/**',
  ],
};

// Função para determinar o ambiente baseado no caminho do teste
function getTestEnvironment(testPath) {
  if (testPath.includes('/tests/api/')) {
    return 'node';
  }
  return 'jsdom';
}

// Configuração customizada
const customJestConfig = {
  ...baseConfig,
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  // O next/jest vai usar jsdom por padrão, mas podemos sobrescrever por arquivo
  testEnvironment: 'jsdom',
};

module.exports = createJestConfig(customJestConfig);
