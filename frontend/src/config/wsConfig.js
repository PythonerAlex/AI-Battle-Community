// src/config/wsConfig.js
/*const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
export default WS_BASE_URL;*/

// src/config/wsConfig.js

const host = process.env.REACT_APP_BACKEND_HOST || 'localhost';
const port = process.env.REACT_APP_BACKEND_PORT || '8000';

// 构造完整的 URL 前缀
const WS_BASE_URL = `ws://${host}:${port}`;
const API_BASE_URL = `http://${host}:${port}`;

export { WS_BASE_URL, API_BASE_URL };

        