import { v4 as uuidv4 } from 'uuid';

export class Logs {
  id: string;
  dtCreated;
  title: string;
  log: string;

  constructor() {
    this.id = uuidv4();
    this.dtCreated = new Date();
    this.title = '';
    this.log = '';
  }
}
