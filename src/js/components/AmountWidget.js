import { select, settings } from '../settings.js';

export class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();

    //console.log('AmountWidget: ', thisWidget);
    //console.log('constructor arguments:', element);
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    /* TODO: Add validation */

    thisWidget.value = newValue;
    thisWidget.announce();
    thisWidget.input.value = thisWidget.value;


    for (let input in thisWidget.value) {
      if (input <= settings.amountWidget.defaultMax) {
        newValue && thisWidget.announce();
      }
      else if (input >= settings.amountWidget.defaultMin) {
        newValue && thisWidget.announce();
      }
    }
  }

  initActions() {
    const thisWidget = this;
    //console.log('thisWidget', thisWidget);

    thisWidget.input.addEventListener('change', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }

}