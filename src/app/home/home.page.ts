import { Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import { AlertController, IonContent } from '@ionic/angular';
import { StorageService } from '../storage.service';
import { ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { InfoPage } from '../info/info.page';
import { Timer } from '../models/timer';
import { Logs } from '../models/logs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild(IonContent, { read: IonContent, static: false })
  myContent: IonContent;

  public list = [];
  public id = '';
  public title = '';
  public description = '';
  public hours = 0;
  public minutes = 0;
  public seconds = 0;
  interval;

  constructor(
    public alertController: AlertController,
    private titleService: Title,
    public storage: StorageService,
    public toastController: ToastController,
    public modalController: ModalController
  ) {
    this.newLog('App Opened', 'Page Loaded and ready for use');

    this.startNotification();

    this.storage.get('list').then((res) => {
      // console.log('storage value is', res);

      if (res) {
        this.list = res;

        let resumeCount = 0;

        this.list.forEach((item) => {
          if (item.state == 'running') {
            resumeCount = resumeCount + 1;
          }
        });

        if (resumeCount > 0) {
          this.resumeTimer();
        }
      } else {
        this.list = [];
      }
    });

    // this.storage.get('time').then((value) => {
    //   if (value) {
    //     // console.log('Value returned ', value);
    //     if (value[0]) {
    //       this.hours = value[0];
    //     }
    //     if (value[1]) {
    //       this.minutes = value[1];
    //     }
    //     if (value[2]) {
    //       this.seconds = value[2];
    //     }
    //   }
    // });
  }

  newLog(title, log) {
    this.storage.get('toggleLogs').then((res) => {
      if (res) {
        let data = new Logs();
        data.title = title;
        data.log = JSON.stringify(log);

        let logList = [];
        logList.push(data);

        this.storage.get('log').then((res) => {
          if (res) {
            logList = res;
            logList.push(data);
            this.storage.set('log', logList);
          } else {
            this.storage.set('log', logList);
          }
        });
      } else {
        console.log('log saving disabled');
      }
    });
  }

  async resumeTimer() {
    const alert = await this.alertController.create({
      header: 'Resume',
      message: `Do you want to continue the timer?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.list.forEach((item) => {
              if (item.state == 'running') {
                item.state = 'waiting';
              }
            });
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.list.forEach((item) => {
              if (item.state == 'running') {
                this.start(item);
              }
            });
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }

  saveStorage() {
    this.storage.set('list', this.list);
    // console.log('storage updated', this.list[0]);

    // console.log(
    //   'timer',
    //   this.list[0].hours,
    //   this.list[0].minutes,
    //   this.list[0].seconds
    // );
    // console.log('initial value', this.list[0].initialValue);
  }

  async hardReset() {
    this.newLog('Hard Reset call', ``);

    this.storage.get('toggleSudoDel').then((res) => {
      if (res) {
        this.hardResetSudo();
      } else {
        console.log('asking before deleting');
        this.askingHardReset();
      }
    });
  }

  hardResetSudo() {
    this.list = [];
    this.storage.clear();
    this.newLog('Hard Reset call', `accepted`);
  }

  async askingHardReset() {
    const alert = await this.alertController.create({
      header: 'Warning',
      message: `Are you sure you want to delete everything? (This action cannot be reverted)`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.newLog('Hard Reset call', `canceled`);
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.list = [];
            this.storage.clear();
            this.newLog('Hard Reset call', `accepted`);
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }

  add() {
    this.newLog('New Timer created', ``);
    // console.log('new timer added');
    this.list.push(new Timer());
    this.saveStorage();
    this.ScrollToBottom();

    // console.log(this.list, this.list.length);
  }

  ScrollToBottom() {
    setTimeout(() => {
      this.myContent.scrollToBottom(300);
    }, 50);
  }

  async delConfirm(index) {
    this.newLog(`User clicked to Delete timer ${index}`, ``);

    this.storage.get('toggleSudoDel').then((res) => {
      if (res) {
        this.del(index);
      } else {
        console.log('asking before deleting');
        this.softDel(index);
      }
    });
  }

  del(index) {
    this.list.splice(index, 1);
    this.saveStorage();

    // console.log('deleted ->', index);
  }

  async softDel(index) {
    let msg = `Are you sure you want to delete the ${index + 1}.Timer?`;
    if (this.list[index].title) {
      msg = `Are you sure you want to delete the ${index + 1}.Timer - ${
        this.list[index].title
      }?`;
    }

    const alert = await this.alertController.create({
      header: 'Warning',
      message: msg,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.newLog(`User clicked to Delete timer ${index}`, `denied`);
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.del(index);
            this.newLog(`User clicked to Delete timer ${index}`, `accepted`);
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    // console.log('onDidDismiss resolved with role', role);
  }

  async info() {
    const modal = await this.modalController.create({
      component: InfoPage,
    });
    return await modal.present();
  }

  startNotification() {
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification');
      this.newLog(
        'Notification',
        'This browser does not support desktop notification'
      );
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === 'granted') {
      // If it's okay let's create a notification
      // var options = {
      //   icon: './assets/icon/clock.png',
      // };
      // var notification = new Notification('Hi there!', options);
      this.newLog('Notification', 'Notification Granted by User');
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
        this.newLog(
          'Notification',
          'Notification Granted by User after first denied'
        );
      });
    }
  }

  async presentToast(color, msg) {
    let log = JSON.stringify(`${color}, ${msg}`);
    this.newLog('Toast', log);

    const toast = await this.toastController.create({
      color: color,
      message: msg,
      duration: 2000,
      position: 'top',
    });
    toast.present();
  }

  async playAlert(item?) {
    this.newLog('Alert Audio Played', item);

    let audio = new Audio();
    audio.src = 'assets/sound/mixkit-fairy-bells-583.mp3';
    audio.load();
    audio.play();

    let msg = 'Timer Completed!';

    if (item.title) {
      msg = `Timer ${item.title} Completed!`;
    }

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

  start(item) {
    this.newLog('Timer Started', item);
    // console.log('start ', this.hours, this.minutes, this.seconds);
    if (item.timerRestarted == false) {
      let msg = 'Timer Started';
      if (item.title) {
        msg = `Timer ${item.title} Started`;
      }
      this.presentToast('success', msg);

      // console.log('1. TIMER SETADO INITIAL VALUE');

      item.initialValue = [item.hours, item.minutes, item.seconds];

      // console.log('timer', item.hours, item.minutes, item.seconds);
      // console.log('initial value', item.initialValue);
    }

    var input = moment()
      .add(item.hours, 'hours')
      .add(item.minutes, 'minutes')
      .add(item.seconds, 'seconds')
      .format('HH:mm:ss')
      .toString();

    item.interval = setInterval(() => {
      var now = moment().format('HH:mm:ss').toString();

      // console.log(input, now);

      let res = moment
        .utc(moment(input, 'HH:mm:ss').diff(moment(now, 'HH:mm:ss')))
        .format('HH:mm:ss');

      // console.log(res);

      item.hours = Number(res.split(':')[0]);
      item.minutes = Number(res.split(':')[1]);
      item.seconds = Number(res.split(':')[2]);

      // this.storage.set('time', [this.hours, this.minutes, this.seconds]);

      this.titleService.setTitle(`(${this.list.length}) ${res}`);
      item.state = 'running';

      this.saveStorage();

      if (res == '00:00:00') {
        if (item.loop == false) {
          this.stop(item);
          let msg = 'Timer Completed!';
          if (item.title) {
            msg = `Timer ${item.title} Completed!`;
          }
          this.titleService.setTitle(msg);
          item.state = 'waiting';

          this.newLog(msg, item);

          if (Notification.permission === 'granted') {
            // If it's okay let's create a notification
            let img = './assets/icon/clock.png';
            if (item.avatar) {
              img = item.avatar;
            }
            var options = {
              icon: img,
            };

            var notification = new Notification(msg, options);

            this.newLog(
              msg,
              `Notification sended Browser Desktop, ${notification}`
            );
          }

          this.playAlert(item);

          item.timerRestarted = false;

          // console.log('3. TIMER ACABOU', item);
        } else {
          this.repeatLoop(item);
        }
      }
    }, 1000);
  }

  repeatLoop(item) {
    clearInterval(item.interval);

    item.loopCounter = item.loopCounter + 1;
    item.hours = Number(item.initialValue[0]);
    item.minutes = Number(item.initialValue[1]);
    item.seconds = Number(item.initialValue[2]);

    // console.log(
    //   item.initialValue,
    //   item.initialValue[0],
    //   item.initialValue[1],
    //   item.initialValue[2]
    // );

    // console.log('2. TIMER LOPADO', item);

    item.timerRestarted = true;

    this.newLog('Timer Repeat by Loop', item);

    this.start(item);
  }

  loop(item) {
    // console.log('loop this timer', item);
    item.loop = !item.loop;
    let msg = 'Loop Enabled';
    if (!item.loop) {
      msg = 'Loop Disabled';
    }
    this.presentToast('dark', msg);
    this.saveStorage();

    // console.log('?. TIMER LOOP ENABLED?', item.loop);
  }

  stop(item) {
    // console.log('stop', this.hours, this.minutes, this.seconds);

    this.newLog('Timer Paused', item);

    if (item.hours > 0 || item.minutes > 0 || item.seconds > 0) {
      let msg = 'Timer Paused';
      if (item.title) {
        msg = `Timer ${item.title} Paused`;
      }
      this.presentToast('warning', msg);

      var input = moment()
        .add(item.hours, 'hours')
        .add(item.minutes, 'minutes')
        .add(item.seconds, 'seconds')
        .format('HH:mm:ss')
        .toString();
      var now = moment().format('HH:mm:ss').toString();

      // console.log(input, now);

      let res = moment
        .utc(moment(input, 'HH:mm:ss').diff(moment(now, 'HH:mm:ss')))
        .format('HH:mm:ss');
      this.titleService.setTitle(`PAUSED - ${res}`);
      item.state = 'paused';
    }

    clearInterval(item.interval);

    this.saveStorage();
  }

  reset(item) {
    this.newLog('Timer Reseted', item);

    // console.log('reset');

    this.stop(item);
    this.titleService.setTitle('Timer');
    item.hours = 0;
    item.minutes = 0;
    item.seconds = 0;
    item.loop = false;
    item.loopCounter = 0;
    item.initialValue = [0, 0, 0];
    item.timerRestarted = false;
    // this.storage.clear();
    this.saveStorage();

    item.state = 'waiting';
    let msg = 'Timer Reseted';
    if (item.title) {
      msg = `Timer ${item.title} Reseted`;
    }
    this.presentToast('dark', msg);
  }

  disableButton(item) {
    let handler = false;
    if (item.hours == 0 && item.minutes == 0 && item.seconds == 0) {
      handler = true;
    } else {
      handler = false;
    }

    return handler;
  }

  async checkValue(value, type) {
    this.newLog('Value of Timer checked', `${value}, ${type}`);

    // console.log('check value', value, 'type', type);

    if (value.hours == null || value.minutes == null || value.seconds == null) {
      if (type == 'hours') {
        value.hours = 0;
      }
      if (type == 'minutes') {
        value.minutes = 0;
      }
      if (type == 'seconds') {
        value.seconds = 0;
      }
    }

    let msg = `Value of ${type} cannot be negative or above 59`;
    234242;

    if (type == 'hours') {
      msg = 'Value of Hours cannot be negative or above 23';
      if (value.hours < 0) {
        value.hours = 0;
      } else if (value.hours > 23) {
        value.hours = 23;
      }
    }

    const alert = await this.alertController.create({
      subHeader: 'Alert',
      message: msg,
      buttons: ['OK'],
    });

    if (
      value.minutes >= 60 ||
      value.minutes < 0 ||
      value.seconds >= 60 ||
      value.seconds < 0
    ) {
      await alert.present();
      type == 'minutes' ? (value.minutes = 0) : (value.seconds = 0);
    }

    this.saveStorage();

    const { role } = await alert.onDidDismiss();
  }
}
