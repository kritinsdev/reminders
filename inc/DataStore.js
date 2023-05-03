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

    const parentId = event.id;

    // Handle repeating events
    switch (event.repeat) {
      case 'every-month':
        this._createEventForEveryMonth(event, parentId);
        break;
      case 'every-year':
        this._createEventForEveryYear(event, parentId);
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

  getUpcomingEvents(eventCount = 5, year, month, today, maxDaysToSearch = 365) {
    const upcomingEvents = [];
    const currentDate = new Date(year, month - 1, today.getDate());
    let daysOffset = 1;
  
    while (upcomingEvents.length < eventCount && daysOffset <= maxDaysToSearch) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + daysOffset);
      const nextYear = nextDate.getFullYear();
      const nextMonth = nextDate.getMonth() + 1;
      const nextDay = nextDate.getDate();
  
      const eventData = this.data?.[nextYear]?.[nextMonth]?.[nextDay];
  
      if (eventData) {
        eventData.forEach(event => {
          if (upcomingEvents.length < eventCount) {
            upcomingEvents.push({
              date: `${nextDay}/${nextMonth}`,
              type: event.type,
              id: event.id,
              title: event.title,
              description: event.description
            });
          }
        });
      }
      daysOffset++;
    }
  
    return upcomingEvents;
  }

  _createEventForEveryMonth(event) {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getFullYear() + 1, 11); // 11 is the index for December
  
    const newDate = new Date(startDate);
    while (newDate <= endDate) {
      if (newDate > startDate) { // Avoid duplicating the original event
        const newEvent = new Event(newDate, event.type, event.title, event.description, 'no-repeat');
        this.addEvent(newEvent);
      }
      newDate.setMonth(newDate.getMonth() + 1);
  
      // Check if next month has enough days, if not, set to the last day of the next month
      const nextMonthDays = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
      if (startDate.getDate() > nextMonthDays) {
        newDate.setDate(nextMonthDays);
      } else {
        newDate.setDate(startDate.getDate());
      }
    }
  }

  _createEventForEveryYear(event, parentId) {
    const newDate = new Date(event.date);
    for (let i = 1; i <= 5; i++) {
      newDate.setFullYear(newDate.getFullYear() + 1);
      const newEvent = new Event(newDate, event.type, event.title, event.description, 'no-repeat', parentId);
      this.addEvent(newEvent);
    }
  }

}