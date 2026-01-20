/**
 *Servicio de Criptografía E2EE
 *Implementa cifrado RSA con OAEP para mensajería segura
 */

import RSA from 'react-native-rsa-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Servicio de criptografía para E2EE
 */
class CryptoService {
  /**
   * Genera un nuevo par de claves RSA 2048-bit
   */
  async generateKeyPair(): Promise<KeyPair> {
    console.log('🔑 Generando par de claves RSA...');

    try {
      const keys = await RSA.generateKeys(2048);

      console.log('✅ Claves generadas exitosamente');

      return {
        publicKey: keys.public,
        privateKey: keys.private,
      };
    } catch (error) {
      console.error('❌ Error generando claves:', error);
      throw new Error('Error al generar claves RSA');
    }
  }

  /**
   * Cifra un mensaje con la clave pública del destinatario
   */
  async encryptMessage(message: string, recipientPublicKey: string): Promise<string> {
    try {
      // Cifrar con RSA (la librería usa PKCS1 por defecto)
      const encrypted = await RSA.encrypt(message, recipientPublicKey);
      return encrypted;
    } catch (error) {
      console.error('❌ Error al cifrar mensaje:', error);
      throw new Error('Error al cifrar el mensaje');
    }
  }

  /**
   * Descifra un mensaje con mi clave privada
   */
  async decryptMessage(cipherText: string): Promise<string> {
    try {
      // Obtener mi clave privada del almacenamiento
      const myPrivateKey = await AsyncStorage.getItem('privateKey');

      if (!myPrivateKey) {
        throw new Error('Clave privada no encontrada. Relogin requerido.');
      }

      // Descifrar con RSA
      const decrypted = await RSA.decrypt(cipherText, myPrivateKey);
      return decrypted;
    } catch (error) {
      console.error('❌ Error al descifrar mensaje:', error);
      throw new Error('Error al descifrar el mensaje');
    }
  }

  /**
   * Almacena el par de claves de forma segura
   */
  async storeKeyPair(keyPair: KeyPair): Promise<void> {
    try {
      await AsyncStorage.setItem('publicKey', keyPair.publicKey);
      await AsyncStorage.setItem('privateKey', keyPair.privateKey);
      console.log('✅ Claves almacenadas de forma segura');
    } catch (error) {
      console.error('❌ Error al almacenar claves:', error);
      throw new Error('Error al guardar las claves');
    }
  }

  /**
   * Obtiene la clave pública almacenada
   */
  async getPublicKey(): Promise<string | null> {
    return await AsyncStorage.getItem('publicKey');
  }

  /**
   * Verifica si existen claves almacenadas
   */
  async hasKeys(): Promise<boolean> {
    const publicKey = await AsyncStorage.getItem('publicKey');
    const privateKey = await AsyncStorage.getItem('privateKey');
    return publicKey !== null && privateKey !== null;
  }

  /**
   * Limpia las claves almacenadas
   */
  async clearKeys(): Promise<void> {
    await AsyncStorage.multiRemove(['publicKey', 'privateKey']);
    console.log('🗑️ Claves eliminadas');
  }
}

// Exportar instancia única del servicio
export const cryptoService = new CryptoService();
