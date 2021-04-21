import io from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:8081";

export const socket = io(ENDPOINT);