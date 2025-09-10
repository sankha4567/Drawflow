import { io } from "socket.io-client";
import parser from "socket.io-msgpack-parser"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
export const socket = io(BACKEND_URL, {
    parser
});