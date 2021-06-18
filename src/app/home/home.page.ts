import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  hours = 0;
  minutes = 0;
  seconds = 0;
  interval;

  constructor(public alertController: AlertController) {}

  playAlert() {
    let audio = new Audio();
    audio.src = 'assets/sound/mixkit-fairy-bells-583.mp3';
    audio.load();
    audio.play();
  }

  play() {
    this.clearCounter();
    console.log('play', this.hours, this.minutes, this.seconds);

    this.interval = setInterval(() => {
      if (this.hours === 0 && this.minutes === 0 && this.seconds === 0) {
        this.playAlert();
        this.clearCounter();
      } else {
        if (this.seconds === 0 && this.minutes > 0) {
          this.seconds = 60;
          this.minutes--;
        }
        if (this.seconds === 0 && this.minutes === 0 && this.hours > 0) {
          this.seconds = 60;
          this.minutes = 59;
          this.hours--;
        }
        this.seconds--;
      }
    }, 1000);
  }

  clearCounter() {
    console.log('clear');
    clearInterval(this.interval);
  }

  stop() {
    console.log('stop');
    this.clearCounter();
  }

  reset() {
    console.log('reset');
    this.clearCounter();
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
  }

  async checkValue(value, type) {
    let msg = 'Value cannot be negative or above 59';

    if (type == 'hours') {
      msg = 'Hours cannot be negative';
      if (value < 0) {
        this.hours = 0;
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
