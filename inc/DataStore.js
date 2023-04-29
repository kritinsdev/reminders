import { Event } from "./Event";

export class DataStore {
  constructor() {
    this.data = this.fetchData();
  }

  fetchData() {
    const storedData = localStorage.getItem('calendarData');
    return storedData ? JSON.parse(storedData) : {};
  }

  saveData(data) {
    localStorage.setItem('calendarData', JSON.stringify(data));
  }

  addEvent(event) {
    const year = event.date.getFullYear();
    const month = event.date.getMonth() + 1;
    const day = event.date.getDate();

    if (!this.data[year]) this.data[year] = {};
    if (!this.data[year][month]) this.data[year][month] = {};
    if (!this.data[year][month][day]) this.data[year][month][day] = [];

    this.data[year][month][day].push(event);

    // Handle repeating events
    switch (event.repeat) {
      case 'every-month':
        this._createEventForEveryMonth(event);
        break;
      case 'every-year':
        this._createEventForEveryYear(event);
        break;
      default:
        // No repeat
        break;
    }

    this.saveData(this.data);
  }

  getTodaysEvents(today) {
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const todaysData = this.data?.[year]?.[month]?.[date];
    return todaysData ? todaysData : [];
  }

  getUpcomingEvents(eventCount, year, month, today) {
    const upcomingEvents = [];
    const currentDate = new Date(year, month - 1, today.getDate());

    for (let i = 1; i <= eventCount; i++) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + i);
      const nextYear = nextDate.getFullYear();
      const nextMonth = nextDate.getMonth() + 1;
      const nextDay = nextDate.getDate();

      const eventData = this.data?.[nextYear]?.[nextMonth]?.[nextDay];

      if (eventData) {
        eventData.forEach(event => {
          upcomingEvents.push({
            date: `${nextDay}/${nextMonth}`,
            type: event.type,
            title: event.title,
            description: event.description
          });
        });
      }
    }

    return upcomingEvents;
  }

  _createEventForEveryMonth(event) {
    const newDate = new Date(event.date);
    for (let i = 1; i <= 12; i++) {
      newDate.setMonth(newDate.getMonth() + 1);
      const newEvent = new Event(newDate, event.type, event.title, event.description, 'no-repeat');
      this.addEvent(newEvent);
    }
  }

  _createEventForEveryYear(event) {
    const newDate = new Date(event.date);
    for (let i = 1; i <= 10; i++) {
      newDate.setFullYear(newDate.getFullYear() + 1);
      const newEvent = new Event(newDate, event.type, event.title, event.description, 'no-repeat');
      this.addEvent(newEvent);
    }
  }

}