/**
 * Shims para React Native
 * Configura globals necesarios para socket.io y node-forge
 */

import { Buffer } from 'buffer';
import process from 'process';

// Configurar globals
global.Buffer = Buffer;
global.process = process;

// Si no existe window, crear objeto mock
if (typeof global.window === 'undefined') {
  global.window = global;
}

// Asegurar que location existe
if (typeof global.location === 'undefined') {
  global.location = {
    protocol: 'http:',
    host: 'localhost',
  };
}

// Shims para node-forge
if (typeof global.navigator === 'undefined') {
  global.navigator = {};
}

// Mock de crypto para node-forge
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  };
}

// Polyfill para TextEncoder si no existe
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str) {
      const buf = Buffer.from(str, 'utf-8');
      return new Uint8Array(buf);
    }
  };
}

// Polyfill para TextDecoder si no existe
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(arr) {
      return Buffer.from(arr).toString('utf-8');
    }
  };
}
