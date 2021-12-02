import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StorageService } from '../storage.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {
  toggleSudoDelHandler: boolean = false;
  toggleLogsHandler: boolean = false;

  showInfo: boolean = true;
  logList = [];

  constructor(
    public modalController: ModalController,
    public storage: StorageService,
    public toastController: ToastController
  ) {}

  ngOnInit() {
    this.storage.get('log').then((res) => {
      console.log(res);

      if (res) {
        this.logList = res;
        this.logList.sort((a, b) => b.dtCreated - a.dtCreated);
      } else {
        this.logList = [];
      }
    });

    this.storage.get('toggleSudoDel').then((res) => {
      if (res) {
        this.toggleSudoDelHandler = res;
      }
    });

    this.storage.get('toggleLogs').then((res) => {
      if (res) {
        this.toggleLogsHandler = res;
      }
    });
  }

  async presentToast(color, msg) {
    const toast = await this.toastController.create({
      color: color,
      message: msg,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }

  toggleInfo() {
    this.showInfo = !this.showInfo;
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true,
    });
  }

  toggleSudoDel() {
    this.toggleSudoDelHandler = !this.toggleSudoDelHandler;
    this.storage.set('toggleSudoDel', this.toggleSudoDelHandler);

    if (this.toggleSudoDelHandler) {
      this.presentToast('danger', 'Delete without Warnings Enabled');
    } else {
      this.presentToast('success', 'Delete without Warnings Disabled');
    }
  }

  toggleLogs() {
    this.toggleLogsHandler = !this.toggleLogsHandler;
    this.storage.set('toggleLogs', this.toggleLogsHandler);
    if (this.toggleLogsHandler) {
      this.presentToast('success', 'Logs Enabled');
    } else {
      this.presentToast('danger', 'Logs Disabled');
    }
  }
}
