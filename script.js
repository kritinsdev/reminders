class Calendar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.prevMonthBtn = document.getElementById('prev-month-btn');
    this.nextMonthBtn = document.getElementById('next-month-btn');
    this.today = new Date();
    this.year = this.today.getUTCFullYear();
    this.month = this.today.getUTCMonth() + 1;
    this.data = {};
    this.upcomingEventCount = 5;

    this.events();
  }

  events() {
    document.addEventListener('click', this.handleButtonClick.bind(this));

    this.fetchData(() => {
      this.generateCalendar();
    });
  }

  daysInMonth(year, month) {
    const days = [31, (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return days[month - 1];
  }

  changeMonth(change) {
    this.month += change;

    if (this.month < 1) {
      this.month = 12;
      this.year -= 1;
    } else if (this.month > 12) {
      this.month = 1;
      this.year += 1;
    }
  }

  fetchData(callback) {
    const storedData = localStorage.getItem('calendarData');

    if (storedData) {
      // Use the stored data if available
      this.data = JSON.parse(storedData);
      callback();
    } else {
      // Fetch the data if not available in localStorage
      fetch('data.json')
        .then(response => response.json())
        .then(data => {
          this.data = data;
          localStorage.setItem('calendarData', JSON.stringify(data));
          callback();
        })
        .catch(error => console.error(error));
    }
  }

  generateCalendar() {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const firstDay = new Date(Date.UTC(this.year, this.month - 1, 1)).getUTCDay();
    const numDays = this.daysInMonth(this.year, this.month);
    const monthData = this.data[this.year] && this.data[this.year][this.month] ? this.data[this.year][this.month] : null;

    let calendarHtml = `
        <div class="calendar-wrap">
          <div class="calendar-info">
            <div class='current-date'>
              <span>${this.today.getDate()}</span>
              <span>Friday</span>
            </div>
            <div class="events">
              <div class="events-title">Today's reminders</div>
              ${this.getTodaysEvents()}
            </div>
            <div class="events upcoming">
              <div class="events-title">Upcoming events</div>
              ${this.getUpcomingEvents()}
            </div>
            <div class="create-event">
            Create event <i class="fi fi-sr-add"></i>
            </div>
          </div>
          <div class="calendar-body">
            <div class="months">
                <span id="prev-month-btn"><i class="fi fi-sr-caret-left"></i></span>
                <span>${monthsOfYear[this.month - 1]}</span>
                <span id="next-month-btn"><i class="fi fi-sr-caret-right"></i></span>
            </div>
            <div class="weekdays">
              ${daysOfWeek.map(day => `<div class="weekday">${day}</div>`).join('')}
            </div>
            <div class="days">
      `;

    // Add empty blocks for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarHtml += '<div class="day empty"></div>';
    }

    // Add blocks for each day of the month
    for (let day = 1; day <= numDays; day++) {
      const dayData = monthData ? monthData[day] : null;
      const isTodayClass = (day === this.today.getDate() && this.month === this.today.getMonth() + 1 && this.year === this.today.getFullYear()) ? 'today' : '';

      const tooltipHtml = dayData ? `
        <div class="tooltip">
          <h2>${dayData[0].title}</h2>
          <p>${dayData[0].description}</p>
        </div>
      ` : '';

      calendarHtml += `
        <div class="day${dayData ? ' has-data' : ''}">
          <div class="date ${isTodayClass}">${day}</div>
          ${tooltipHtml}
        </div>
      `;
    }

    const lastDay = new Date(this.year, this.month - 1, numDays).getDay();
    for (let i = lastDay; i < 6; i++) {
      calendarHtml += '<div class="day empty"></div>';
    }
    calendarHtml += `</div> </div> </div>`;

    this.container.innerHTML = calendarHtml;
  }

  getTodaysEvents() {
    const todaysData = this.data[this.year] && this.data[this.year][this.month] && this.data[this.year][this.month][this.today.getDate()];
    const todaysEvents = todaysData ? todaysData.map(event => `<div class="event"><span>${event.title}</span></div>`).join('') : '<div class="event"><span>No events today</span></div>';
    return todaysEvents;
  }

  getUpcomingEvents() {
    const upcomingEvents = [];
    const currentDate = new Date(this.year, this.month - 1, this.today.getDate());
  
    for (let i = 1; i <= this.upcomingEventCount; i++) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + i);
      const nextYear = nextDate.getFullYear();
      const nextMonth = nextDate.getMonth() + 1;
      const nextDay = nextDate.getDate();
  
      const eventData = this.data[nextYear] && this.data[nextYear][nextMonth] && this.data[nextYear][nextMonth][nextDay];
  
      if (eventData) {
        eventData.forEach(event => {
          upcomingEvents.push({
            date: `${nextDay}/${nextMonth}`,
            title: event.title
          });
        });
      }
    }
  
    const upcomingEventsHtml = upcomingEvents.map(event => `<div class="event"><span>${event.date}: ${event.title}</span></div>`).join('');
    return upcomingEventsHtml;
  }

  handleButtonClick(event) {
    const target = event.target;

    if (target.closest('#prev-month-btn')) {
      this.prevMonthHandler();
    } else if (target.closest('#next-month-btn')) {
      this.nextMonthHandler();
    }
  }

  prevMonthHandler = () => {
    this.changeMonth(-1);
    this.fetchData(() => {
      this.generateCalendar();
    });
  }

  nextMonthHandler = () => {
    this.changeMonth(1);
    this.fetchData(() => {
      this.generateCalendar();
    });
  }
}

// Instantiate a new Calendar object, passing the container ID
const calendar = new Calendar('calendar');
