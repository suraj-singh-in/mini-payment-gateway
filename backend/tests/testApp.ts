// tests/testApp.ts
import request from "supertest";
import app from "../src/app"; // make sure app.ts exports the Express instance

export function api() {
    return request(app);
}
