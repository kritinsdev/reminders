import { Event } from "./Event";
import { DataStore } from "./DataStore";

export class Calendar {
  constructor(containerId) {
    this.daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this.monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.dataStore = new DataStore();
    this.container = document.getElementById(containerId);
    this.prevMonthBtn = document.getElementById('prev-month-btn');
    this.nextMonthBtn = document.getElementById('next-month-btn');
    this.eventsBtn = document.querySelector('#swap');
    this.today = new Date();
    this.year = this.today.getUTCFullYear();
    this.month = this.today.getUTCMonth() + 1;

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
    const calendarWrap = document.createElement('div');
    calendarWrap.classList.add('calendar-wrap');
  
    calendarWrap.innerHTML = `
      <div class="calendar-info"></div>
      <div class="calendar-body"></div>
    `;
  
    this.container.appendChild(calendarWrap);
  
    this.generateCalendarInfo();
    this.generateCalendarBody();
  }

  generateCalendarBody() {
    const firstDay = new Date(Date.UTC(this.year, this.month - 1, 1)).getUTCDay();
    const numDays = this.daysInMonth(this.year, this.month);
    const monthData = this.dataStore.data && this.dataStore.data[this.year] && this.dataStore.data[this.year][this.month] ? this.dataStore.data[this.year][this.month] : null;

    let calendarBodyHtml = `
      <div class="switcher">
          <span id="prev-month-btn"><i class="fi fi-sr-caret-left"></i></span>
          <span class="months">${this.monthsOfYear[this.month - 1]} ${this.year}</span>
          <span id="next-month-btn"><i class="fi fi-sr-caret-right"></i></span>
      </div>
      <div class="weekdays">
        ${this.daysOfWeek.map(day => `<div class="weekday">${day}</div>`).join('')}
      </div>
      <div class="days">
      `;

    for (let i = 0; i < firstDay; i++) {
      calendarBodyHtml += '<div class="day empty"></div>';
    }

    for (let day = 1; day <= numDays; day++) {
      const dayData = monthData ? monthData[day] : null;
      const isTodayClass = (day === this.today.getDate() && this.month === this.today.getMonth() + 1 && this.year === this.today.getFullYear()) ? 'today' : '';

      const tooltipHtml = dayData ? ` 
        <div class="tooltip">
          <h2>${dayData[0].title}</h2>
          <p>${dayData[0].description}</p>
        </div>
      ` : '';

      calendarBodyHtml += `
        <div class="day${dayData ? ' has-data' : ''} ${isTodayClass}">
          <div class="date">
            ${day}
            <div class="dots">
            ${dayData && dayData.length > 0 ? dayData.map(item => `
            <div data-type="${item.type}"></div>
          `).join('') : ''}
          </div>
          </div>
          ${tooltipHtml}
        </div>
      `;
    }

    const lastDay = new Date(this.year, this.month - 1, numDays).getDay();
    for (let i = lastDay; i < 6; i++) {
      calendarBodyHtml += '<div class="day empty"></div>';
    }
    calendarBodyHtml += `</div></div>`;

    const calendarBody = this.container.querySelector('.calendar-body');
    calendarBody.innerHTML = calendarBodyHtml;
  }

  generateCalendarInfo() {
      const calendarInfo = this.container.querySelector('.calendar-info');

      calendarInfo.innerHTML = `
      <div class='swap' id='swap'><i class="fi fi-sr-list"></i></div>
      <div class='calendar-info-wrap' id="eventsInfo">
      <div class='current-date'>
        <span>${this.today.getDate()}</span>
        <span>${this.daysOfWeek[this.today.getDay()]}</span>
      </div>
      <div class="events">
        <div class="events-title">Today's reminders</div>
        <div class="events-wrap">
          ${this.todaysEventsHtml()}
        </div>
      </div>
      <div class="events">
        <div class="events-title">Upcoming events</div>
        <div class="events-wrap">
          ${this.upcomingEventsHtml()}
        </div>
      </div>
      <div class="create-event" id="add-new-event">
      Create new <i class="fi fi-sr-add"></i>
      </div>
      </div>
      <div class='all-events hidden' id="eventsAll">
        <span>All events</span>
        <div class='calendar-all-events'>
        ${this.allEventsHtml()}
        </div>
      </div>`;
  }

  generateEventForm() {
    const form = document.createElement('form');
    form.classList.add('event-form');
    form.setAttribute('id', 'eventForm');

    form.innerHTML = `
      <label>Date <input type="date" name="eventDate" required></label>
      <label>Type
        <select name="eventType" required>
          <option value="">Select event type</option>
          <option value="payment">Payment</option>
          <option value="celebration">Celebration</option>
          <option value="reminder">Reminder</option>
        </select>
      </label>
      <div class="form-options">
        <label class="title">Title <input type="text" name="eventTitle" required></label>
        <label class="description">Description <textarea name="eventDescription"></textarea></label>
        <label class="repeat">Repeat 
          <select name="eventRepeat" required>
            <option value="">Select option</option>
            <option value="no-repeat">No repeat</option>
            <option value="every-month">Every month</option>
            <option value="every-year">Every year</option>
          </select>
        </label>
      </div>
      <button type="submit">Add event</button>
    `;

    return form;
  }

  handleFormSubmit(form) {
    const formData = new FormData(form);
    const eventDateObject = new Date(formData.get('eventDate'));
    const eventType = formData.get('eventType');
    const eventTitle = formData.get('eventTitle');
    const eventDescription = formData.get('eventDescription') || null;
    const eventRepeat = formData.get('eventRepeat');
  
    const event = new Event(eventDateObject, eventType, eventTitle, eventDescription, eventRepeat);
    this.dataStore.addEvent(event);
  
    this.generateCalendarInfo();
    this.generateCalendarBody();
    document.querySelector('.modal').remove();
    document.body.classList.remove('modal-open');
  }

  todaysEventsHtml() {
    const todaysData = this.dataStore.getTodaysEvents(this.today);
    
    const todaysEvents = (todaysData.length > 0) ? todaysData.map(event => `
    <div class="event" data-type="${event.type}">${event.title}</div>
    `).join('') : '<span class="info">No events for today</span>';
    return todaysEvents;
  }

  upcomingEventsHtml() {
    const upcomingEvents = this.dataStore.getUpcomingEvents(5, this.year, this.month, this.today);
    
    const upcomingEventsHtml = (upcomingEvents.length > 0) ? upcomingEvents.map(event => `<div class="event">${event.date}: ${event.title} <div data-type="${event.type}"></div></div>`).join('') : '<span class="info">No events added</span>';
    return upcomingEventsHtml;
  }

  allEventsHtml() {
    const upcomingEvents = this.dataStore.getUpcomingEvents(999, this.year, this.month, this.today);
    
    const upcomingEventsHtml = (upcomingEvents.length > 0) ? upcomingEvents.map(event => `<div class="event">${event.date}: ${event.title} <i data-id="${event.id}" class="fi fi-sr-trash"></i></div>`).join('') : '<p class="info">No events added</p>';
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
    } else if (target.closest('#swap')) {
      const allEvents = document.querySelector('#eventsAll');
      const eventsInfo = document.querySelector('#eventsInfo');

      if(allEvents.classList.contains('hidden')) {
        allEvents.classList.remove('hidden');
        eventsInfo.classList.add('hidden');
      } else {
        allEvents.classList.add('hidden');
        eventsInfo.classList.remove('hidden');
      }
    }
  }

  prevMonthHandler = () => {
    this.changeMonth(-1);
    this.generateCalendarBody();
  }

  nextMonthHandler = () => {
    this.changeMonth(1);
    this.generateCalendarBody();
  }
}