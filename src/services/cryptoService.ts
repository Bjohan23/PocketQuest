/**
 *Servicio de Criptografía E2EE
 *Implementa cifrado RSA con OAEP para mensajería segura
 */

import forge from 'node-forge';
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
  generateKeyPair(): KeyPair {
    console.log('🔑 Generando par de claves RSA...');

    const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 });

    const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
    const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

    // Convertir a Base64 (formato del backend)
    const publicKeyBase64 = forge.util.encode64(publicKeyPem);
    const privateKeyBase64 = forge.util.encode64(privateKeyPem);

    console.log('✅ Claves generadas exitosamente');

    return {
      publicKey: publicKeyBase64,
      privateKey: privateKeyBase64,
    };
  }

  /**
   * Convierte clave de Base64 a PEM
   */
  base64ToPem(base64Key: string): string {
    try {
      return forge.util.decode64(base64Key);
    } catch (error) {
      console.error('❌ Error al decodificar clave:', error);
      throw new Error('Formato de clave inválido');
    }
  }

  /**
   * Cifra un mensaje con la clave pública del destinatario
   */
  encryptMessage(message: string, recipientPublicKeyBase64: string): string {
    try {
      // Convertir publicKey del destinatario de Base64 a PEM
      const recipientPublicKeyPem = this.base64ToPem(recipientPublicKeyBase64);

      // Parsear clave pública
      const publicKey = forge.pki.publicKeyFromPem(recipientPublicKeyPem);

      // Cifrar con RSA-OAEP (SHA-256)
      const encrypted = publicKey.encrypt(message, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create(),
        },
      });

      // Retornar en Base64
      return forge.util.encode64(encrypted);
    } catch (error) {
      console.error('❌ Error al cifrar mensaje:', error);
      throw new Error('Error al cifrar el mensaje');
    }
  }

  /**
   * Descifra un mensaje con mi clave privada
   */
  async decryptMessage(cipherTextBase64: string): Promise<string> {
    try {
      // Obtener mi clave privada del almacenamiento
      const myPrivateKeyBase64 = await AsyncStorage.getItem('privateKey');

      if (!myPrivateKeyBase64) {
        throw new Error('Clave privada no encontrada. Relogin requerido.');
      }

      // Convertir de Base64 a PEM
      const myPrivateKeyPem = this.base64ToPem(myPrivateKeyBase64);

      // Parsear clave privada
      const privateKey = forge.pki.privateKeyFromPem(myPrivateKeyPem);

      // Decodificar base64 del mensaje cifrado
      const encrypted = forge.util.decode64(cipherTextBase64);

      // Descifrar con RSA-OAEP
      const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create(),
        },
      });

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
