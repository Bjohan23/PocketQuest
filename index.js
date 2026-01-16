/**
 * @format
 */

// Importar shims para socket.io-client PRIMERO
import './shim';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
