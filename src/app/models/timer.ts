import { v4 as uuidv4 } from 'uuid';

export class Timer {
  id: string;
  avatar: string;
  dtCreated;
  title: string;
  description: string;
  hours: number;
  minutes: number;
  seconds: number;
  state: string;
  loop: boolean;
  loopCounter: number;
  timerRestarted: boolean;
  initialValue;
  interval;

  constructor() {
    this.id = uuidv4();
    this.avatar = '';
    this.dtCreated = new Date();
    this.title = '';
    this.description = '';
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.loop = false;
    this.loopCounter = 0;
    this.timerRestarted = false;
    this.initialValue = [0, 0, 0];
    this.state = 'waiting'; //paused,running
  }
}
