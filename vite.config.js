import {defineConfig} from 'vite';import {resolve} from 'node:path';
export default defineConfig({build:{rollupOptions:{input:{camera:resolve('index.html'),admin:resolve('admin/index.html')}}},server:{proxy:{'/nail/api':{target:'http://127.0.0.1:8796'}}}});
