// tests/setupEnv.ts
jest.mock("@/utils/logger", () => {
    return {
        log: {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            http: jest.fn(),
            child: () => ({
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
            })
        }
    };
});
