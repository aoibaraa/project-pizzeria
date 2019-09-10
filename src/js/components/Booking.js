import { templates, select, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';

export class Booking {

  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }
  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    //thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
  }

  getData(){
    const thisBooking = this;
  
    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);
  
    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];
  
    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };
  
    //console.log('getData params', params);
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };
    
    //console.log('getData urls', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};

    for (let event of eventsCurrent) {
      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }

    for (let booking of bookings) {
      booking.table.forEach(element => {
        thisBooking.makeBooked(booking.date, booking.hour, booking.duration, element);
      });

    }
    for (let eventRepeat of eventsRepeat) {
      for (let i = 0; i <= settings.datePicker.maxDaysInFuture; i++) {
        thisBooking.makeBooked(utils.dateToStr(utils.addDays(thisBooking.datePicker.minDate, i)), eventRepeat.hour, eventRepeat.duration, eventRepeat.table);
      }
    }
    console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();

  }

  makeBooked(date, hour, duration, tableId) {
    const thisBooking = this;
    const hourAsNum = utils.hourToNumber(hour);
    if (!thisBooking.booked.hasOwnProperty(date)) {
      thisBooking.booked[date] = {};
    }
    for (let i = 0; i < duration * 2; i++) {
      if (!thisBooking.booked[date].hasOwnProperty(hourAsNum + i * 0.5)) {
        thisBooking.booked[date][hourAsNum + i * 0.5] = [tableId.toString()];
      } else {
        thisBooking.booked[date][hourAsNum + i * 0.5].push(tableId.toString());
      }
    }
  }

  updateDOM() {
    const thisBooking = this;

    console.log('tekst');
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for (let table of thisBooking.dom.tables) {
      if (thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour] && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(table.getAttribute(settings.booking.tableIdAttribute))) {
        table.classList.add(classNames.booking.tableBooked);
      } 
      else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }
}