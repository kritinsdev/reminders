import {v4 as uuidv4} from 'uuid';

export class Event {
    constructor(date, type, title, description, repeat) {
      this.id = uuidv4();
      this.date = date;
      this.type = type;
      this.title = title;
      this.description = description;
      this.repeat = repeat;
    }
  }