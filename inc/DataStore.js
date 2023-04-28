export class DataStore {
    constructor() {
        this.data = {};
    }

    fetchData(callback) {
        const storedData = localStorage.getItem('calendarData');
        this.data = JSON.parse(storedData);
        callback();
    }

    saveData() {
        localStorage.setItem('calendarData', JSON.stringify(this.data));
    }

    getTodaysEvents() {
        const todaysData = this.data?.[this.year]?.[this.month]?.[this.today.getDate()];
        return todaysData ? todaysData : [];
    }

    getUpcomingEvents(eventCount) {
        const upcomingEvents = [];
        const currentDate = new Date(this.year, this.month - 1, this.today.getDate());
    
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
                title: event.title
              });
            });
          }
        }
    
        return upcomingEvents;
      }
}