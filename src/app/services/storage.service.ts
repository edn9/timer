import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(public storage: Storage) {}

  public set(name, value) {
    return this.storage.set(`name:${name}`, value);
  }

  public async get(name) {
    return await this.storage.get(`name:${name}`);
  }

  public async remove(name) {
    return await this.storage.remove(`name:${name}`);
  }

  public clear() {
    this.storage.clear().then(() => {
      console.log('all values cleared');
    });
  }
}
