export class DataStore {
    constructor() {
        this.data = this.fetchData();
    }

    fetchData() {
        const storedData = localStorage.getItem('calendarData');
        return JSON.parse(storedData);
    }

    saveData(data) {
        localStorage.setItem('calendarData', JSON.stringify(data));
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
                title: event.title
              });
            });
          }
        }
    
        return upcomingEvents;
      }
}