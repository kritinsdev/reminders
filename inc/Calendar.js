import { Event } from "./Event";

export class Calendar {
  constructor(containerId, dataStore) {
    this.dataStore = dataStore;
    this.container = document.getElementById(containerId);
    this.prevMonthBtn = document.getElementById('prev-month-btn');
    this.nextMonthBtn = document.getElementById('next-month-btn');
    this.today = new Date();
    this.year = this.today.getUTCFullYear();
    this.month = this.today.getUTCMonth() + 1;
    this.data = JSON.parse(localStorage.getItem('calendarData'));
    this.upcomingEventCount = 5;

    this.events();
  }

  events() {
    document.addEventListener('click', this.handleEvent.bind(this));
    document.addEventListener('submit', this.formSubmit.bind(this));

    this.generateCalendar();
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

  generateCalendar() {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const firstDay = new Date(Date.UTC(this.year, this.month - 1, 1)).getUTCDay();
    const numDays = this.daysInMonth(this.year, this.month);
    const monthData = this.data && this.data[this.year] && this.data[this.year][this.month] ? this.data[this.year][this.month] : null;

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
            <div class="create-event" id="add-new-event">
            Create new <i class="fi fi-sr-add"></i>
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

  generateEventForm() {
    const form = document.createElement('form');
    form.classList.add('event-form');
    form.setAttribute('id', 'eventForm');

    form.innerHTML = `
      <label>Date: <input type="date" name="eventDate" required></label>
      <label>Type:
        <select name="eventType" required>
          <option value="">Select event type</option>
          <option value="payment">Payment</option>
          <option value="celebration">Celebration</option>
          <option value="reminder">Reminder</option>
          <option value="todo">To-Do</option>
        </select>
      </label>
      <div class="form-options">
        <label class="title">Title: <input type="text" name="eventTitle" required></label>
        <label class="description">Description: <textarea name="eventDescription"></textarea></label>
        <label class="payment">Payment Sum: <input type="number" name="eventValue" step="0.01"></label>
        <label class="paymentTo">Payment to who: <input type="text" name="eventPaymentTo"></label>
        <label class="time">Time: <input type="time" name="eventTime"></label>
        <label class="repeat">Repeat: <input type="time" name="eventTime"></label>
      </div>
      <button type="submit">Add event</button>
    `;

    return form;
  }

  handleFormSubmit(form) {
    const formData = new FormData(form);
    const eventDate = formData.get('eventDate');
    const eventType = formData.get('eventType');
    const eventTitle = formData.get('eventTitle');
    const eventDescription = formData.get('eventDescription') || null;
    const eventValue = formData.get('eventValue') || null;
    const eventPaymentTo = formData.get('eventPaymentTo') || null;
    const eventTime = formData.get('eventTime') || null;
  
    const eventDateObj = new Date(eventDate);
    const eventYear = eventDateObj.getUTCFullYear();
    const eventMonth = eventDateObj.getUTCMonth() + 1;
    const eventDay = eventDateObj.getUTCDate();
  
    const newEvent = {
      date: eventDate,
      type: eventType,
      title: eventTitle,
      description: eventDescription,
      value: eventValue,
      paymentTo: eventPaymentTo,
      time: eventTime,
    };

    if (!this.data) {
      this.data = {};
    }
  
    if (!this.data[eventYear]) {
      this.data[eventYear] = {};
    }
  
    if (!this.data[eventYear][eventMonth]) {
      this.data[eventYear][eventMonth] = {};
    }
  
    if (!this.data[eventYear][eventMonth][eventDay]) {
      this.data[eventYear][eventMonth][eventDay] = [];
    }
  
    this.data[eventYear][eventMonth][eventDay].push(newEvent);
  
    localStorage.setItem('calendarData', JSON.stringify(this.data));
  
    this.generateCalendar();
    document.querySelector('.modal').remove();
    document.body.classList.remove('modal-open');
  }

  getTodaysEvents() {
    const todaysData = this.dataStore.getTodaysEvents();

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

    const upcomingEventsHtml = upcomingEvents.map(event => `<div class="event"><span>${event.date}: ${event.title}</span></div>`).join('');
    return upcomingEventsHtml;
  }

  openAddEventModal() {
    const modal = document.createElement('div');
    modal.classList.add('modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const form = this.generateEventForm();

    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
      }
    });
  }

  formSubmit(e) {
    e.preventDefault();
    if (e.target.closest('#eventForm')) {
      this.handleFormSubmit(e.target.closest('#eventForm'));
    }
  }

  handleEvent(event) {
    const target = event.target;

    if (target.closest('#prev-month-btn')) {
      this.prevMonthHandler();
    } else if (target.closest('#next-month-btn')) {
      this.nextMonthHandler();
    } else if (target.closest('#add-new-event')) {
      this.openAddEventModal();
    }
  }

  prevMonthHandler = () => {
    this.changeMonth(-1);
    this.generateCalendar();
  }

  nextMonthHandler = () => {
    this.changeMonth(1);
    this.generateCalendar();
  }
}