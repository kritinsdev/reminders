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
      ${this.generateCalendarInfo()}
      <div class="calendar-body">
      </div>
    `;
  
    this.container.innerHTML = '';
    this.container.appendChild(calendarWrap);
  
    this.generateCalendarBody();
  }

  generateCalendarInfo() {
      return `<div class="calendar-info">
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
    </div>`
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
  
    this.generateCalendar();
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