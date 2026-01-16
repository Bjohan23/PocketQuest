/**
 * Shims para socket.io-client en React Native
 * Configura globals necesarios para que socket.io funcione
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
