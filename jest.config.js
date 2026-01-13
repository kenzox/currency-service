module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    setupFiles: ['dotenv/config'],
    transformIgnorePatterns: [
        'node_modules/(?!(uuid)/)'
    ]
};
