import { BaseWidget } from "./BaseWidget";

class DatePicker extends BaseWidget{
    constructor(wrapper){
        super(wrapper, utils.dateToStr(newDate()));
        const thisWidget = this;

        thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

        thisWidget.initPlugin();
    }

    initPlugin();

    initPlugin(){
        thisWidget = this;

        thiswidget.minDate = new Date(thisWidget.value);
        thisWidget.maxDate = thisWidget.addDays(thisWiidget.minDate, settings.datePicker.maxDaysInFuture);
    }
}