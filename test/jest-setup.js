import { webcrypto } from "node:crypto";

if (!global.crypto) {
    global.crypto = webcrypto;
}