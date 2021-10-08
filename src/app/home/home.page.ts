import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import { AlertController } from '@ionic/angular';

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
    private titleService: Title
  ) {}

  timeAction(type, action) {
    if (type == 'hours') {
      if (action == 'add') {
        this.hours++;
      } else {
        this.hours--;
      }
      this.checkValue(this.hours, 'hours');
    } else if (type == 'minutes') {
      if (action == 'add') {
        this.minutes++;
      } else {
        this.minutes--;
      }
      this.checkValue(this.minutes, 'minutes');
    } else {
      if (action == 'add') {
        this.seconds++;
      } else {
        this.seconds--;
      }
      this.checkValue(this.seconds, 'seconds');
    }
  }

  async playAlert() {
    let audio = new Audio();
    audio.src = 'assets/sound/mixkit-fairy-bells-583.mp3';
    audio.load();
    audio.play();

    let msg = 'Timer Completed!';

    const alert = await this.alertController.create({
      message: msg,
      buttons: ['OK'],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }

  start() {
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
      console.log(res);
      this.hours = Number(res.split(':')[0]);
      this.minutes = Number(res.split(':')[1]);
      this.seconds = Number(res.split(':')[2]);

      this.titleService.setTitle(res);
      if (res == '00:00:00') {
        this.stop();
        this.titleService.setTitle('Timer');
        this.playAlert();
      }
    }, 1000);
  }

  stop() {
    clearInterval(this.interval);
  }

  reset() {
    this.titleService.setTitle('Timer');
    this.stop();
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
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
