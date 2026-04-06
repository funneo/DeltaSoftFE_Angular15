import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/remote-config';
import { AngularFireRemoteConfig } from '@angular/fire/compat/remote-config';

@Injectable({
  providedIn: 'root',
})
export class RemoteConfigService {

  private initialized = false;
  constructor(private remoteConfig: AngularFireRemoteConfig) {
    setTimeout(() => {
      try {
        firebase.app(); // ensure it's initialized
        firebase.remoteConfig().settings = {
          minimumFetchIntervalMillis: 0,
          fetchTimeoutMillis: 60000,
        };
        this.initialized = true;
      } catch (err) {
        console.warn('Firebase not initialized yet:', err);
      }
    });
  }
  async getRemoteConfigValue(key: string): Promise<any> {
    try {
      // Optional: wait until initialized
      if (!this.initialized) {
        await new Promise(resolve => setTimeout(resolve, 300)); // short delay
      }

      await this.remoteConfig.fetchAndActivate();
      const value = await this.remoteConfig.getValue(key);
      const str = value?.asString() ?? '';
      return this.tryParse(str);
    } catch (err) {
      console.error('🔥 Lỗi đọc remote config:', err);
      return null;
    }
  }

  private tryParse(str: string): any {
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  }
}
