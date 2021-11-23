import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import { AlertController } from '@ionic/angular';
import { StorageService } from '../storage.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public hours = 0;
  public minutes = 0;
  public seconds = 0;
  interval;

  constructor(
    public alertController: AlertController,
    private titleService: Title,
    public storage: StorageService,
    public toastController: ToastController
  ) {
    this.startNotification();
    this.storage.get('time').then((value) => {
      if (value) {
        // console.log('Value returned ', value);
        if (value[0]) {
          this.hours = value[0];
        }
        if (value[1]) {
          this.minutes = value[1];
        }
        if (value[2]) {
          this.seconds = value[2];
        }
      }
    });
  }

  startNotification() {
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification');
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === 'granted') {
      // If it's okay let's create a notification
      // var options = {
      //   icon: './assets/icon/clock.png',
      // };
      // var notification = new Notification('Hi there!', options);
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {
        // var options = {
        //   icon: './assets/icon/clock.png',
        // };
        // // If the user accepts, let's create a notification
        // if (permission === 'granted') {
        //   var notification = new Notification('Hi there!', options);
        // }
      });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
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

  async playAlert() {
    let audio = new Audio();
    audio.src = 'assets/sound/mixkit-fairy-bells-583.mp3';
    audio.load();
    audio.play();

    let msg = 'Timer Completed!';

    const alert = await this.alertController.create({
      message: msg,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.titleService.setTitle('Timer');
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }

  start() {
    this.presentToast('success', 'Timer Started');
    // console.log('start ', this.hours, this.minutes, this.seconds);

    var input = moment()
      .add(this.hours, 'hours')
      .add(this.minutes, 'minutes')
      .add(this.seconds, 'seconds')
      .format('HH:mm:ss')
      .toString();

    this.interval = setInterval(() => {
      var now = moment().format('HH:mm:ss').toString();

      // console.log(input, now);

      let res = moment
        .utc(moment(input, 'HH:mm:ss').diff(moment(now, 'HH:mm:ss')))
        .format('HH:mm:ss');

      // console.log(res);

      this.hours = Number(res.split(':')[0]);
      this.minutes = Number(res.split(':')[1]);
      this.seconds = Number(res.split(':')[2]);

      this.storage.set('time', [this.hours, this.minutes, this.seconds]);

      this.titleService.setTitle(res);

      if (res == '00:00:00') {
        this.stop();
        this.titleService.setTitle('Timer Completed!');

        if (Notification.permission === 'granted') {
          // If it's okay let's create a notification
          var options = {
            icon: './assets/icon/clock.png',
          };
          var notification = new Notification('Timer Completed!', options);
        }

        this.playAlert();
      }
    }, 1000);
  }

  stop() {
    // console.log('stop', this.hours, this.minutes, this.seconds);

    if (this.hours > 0 || this.minutes > 0 || this.seconds > 0) {
      this.presentToast('danger', 'Timer Paused');

      var input = moment()
        .add(this.hours, 'hours')
        .add(this.minutes, 'minutes')
        .add(this.seconds, 'seconds')
        .format('HH:mm:ss')
        .toString();
      var now = moment().format('HH:mm:ss').toString();

      // console.log(input, now);

      let res = moment
        .utc(moment(input, 'HH:mm:ss').diff(moment(now, 'HH:mm:ss')))
        .format('HH:mm:ss');
      this.titleService.setTitle(`PAUSED - ${res}`);
    }

    clearInterval(this.interval);
  }

  reset() {
    // console.log('reset');

    this.stop();
    this.titleService.setTitle('Timer');
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.storage.clear();
    this.presentToast('dark', 'Timer Reseted');
  }

  disableButton() {
    let handler = false;
    if (this.hours == 0 && this.minutes == 0 && this.seconds == 0) {
      handler = true;
    } else {
      handler = false;
    }

    return handler;
  }

  async checkValue(value, type) {
    if (value == null) {
      if (type == 'hours') {
        this.hours = 0;
      }
      if (type == 'minutes') {
        this.minutes = 0;
      }
      if (type == 'seconds') {
        this.seconds = 0;
      }
    }

    let msg = 'Value cannot be negative or above 59';

    if (type == 'hours') {
      msg = 'Value cannot be negative or above 23';
      if (value < 0) {
        this.hours = 0;
      } else if (value > 23) {
        this.hours = 0;
        value = 999;
      }
    }

    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'Invalid Value',
      message: msg,
      buttons: ['OK'],
    });

    if (value >= 60 || value < 0) {
      await alert.present();
      type == 'minutes' ? (this.minutes = 0) : (this.seconds = 0);
    }

    const { role } = await alert.onDidDismiss();
  }
}
