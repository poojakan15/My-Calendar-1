import React, { Component } from 'react';
import moment from "moment";
import './Calendar.css'

var CLIENT_ID = '594687122878-ke25lnr7a5qfivethln16ua4l21rl484.apps.googleusercontent.com';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
var SCOPES = "https://www.googleapis.com/auth/calendar";
var CALENDAR_ID = 'fk765birljiou3i7njv358n700@group.calendar.google.com';
var API_KEY = 'AIzaSyCdC4elPM1IHb1Ct_sZw7D2XIC5tb8tmJo';

// For making gapi object passed as props to our component
const mapScriptToProps = state => ({
    // gapi will be this.props.gapi
    gapi: {
        globalPath: 'gapi',
        url: DISCOVERY_DOCS,
    }
});

// function load the calendar api and make the api call
export function makeApiCall(input) {
    var eventResponse = document.getElementById('event-response');
    window.gapi.client.load('calendar', 'v3', function () {	// load the calendar api (version 3)

    //data = [inputValue, inputDay, exportMonth, inputYear, inputTime]
    
    //splice inputTime to hours and minutes
    var longTime = input[4];
    var time = longTime.split(":");

    //set date
    var d = new Date();
    d.setFullYear(input[3]);
    d.setDate(input[1]);
    d.setMonth(input[2]-1);
    d.setHours(time[0]);
    d.setMinutes(time[1]);

    var eventDeets = {
        'summary': input[0],
        'start': {'date': d},
    }

    var request = window.gapi.client.calendar.events.insert
        ({
            'calendarId': 'fk765birljiou3i7njv358n700@group.calendar.google.com', // calendar ID
            "resource": 'CHANGE', // pass event details with api call*************
        });

        // handle the response from our api call
        request.execute(function (resp) {
            if (resp.status == 'confirmed') {
                eventResponse.innerHTML = "Event created successfully. View it <a href='" + resp.htmlLink + "'>online here</a>.";
                eventResponse.className += ' panel-success';
                //refreshICalendarframe();
            } else {
                document.getElementById('event-response').innerHTML = "There was a problem. Reload page and try again.";
                eventResponse.className += ' panel-danger';
            }
        });
    });
}

class Calendar extends Component {
    // define a state variable named 'events' as an array
    constructor(props) {
        super(props);
        // this.state = {
        this.events = [];
        this.gapi = null;
        this.getEvents = this.getEvents.bind(this);
        this.appendPre = this.appendPre.bind(this);
        this.listUpcomingEvents = this.listUpcomingEvents.bind(this);
        this.refreshICalendarframe = this.refreshICalendarframe.bind(this);

        var today = new Date();
        today = today.toISOString();

        var twoHoursLater = new Date(today.getTime() + (2 * 1000 * 60 * 60));
        twoHoursLater = twoHoursLater.toISOString();

        var resource = {
            "summary": "",
            "start": {
                "dateTime": today
            },
            "end": {
                "dateTime": twoHoursLater
            },
        };
        // }
    }

    /**
     * Handle response from authorization server.
     *
     * @param {Object} authResult Authorization result.
     */
    handleAuthResult(authResult) {
        var Maincalendar = document.getElementById('Maincalendar');

        Maincalendar.style.display = 'block';
        //this.gapi.load('client', start);
        //this.gapi.client.load('calendar', 'v3', this.listUpcomingEvents);
        this.getEvents();
    }

    /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
    listUpcomingEvents() {
        var request = this.gapi.client.calendar.events.list({
            'calendarId': 'primary', /* Can be 'primary' or a given calendarid */
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime'
        });

        request.execute(function (resp) {
            var events = resp.items;
            this.appendPre('Upcoming events:');
            // Once the request promise is resolved we will get the list of events as response. 
            // Then we will call setState method of React to store data to the app state.
            this.setState({ events }, () => {
                console.log(this.state.events);
            })

            if (this.state.events.length > 0) {
                for (var i = 0; i < this.state.events.length; i++) {
                    var event = this.state.events[i];
                    var when = event.start.dateTime;
                    if (!when) {
                        when = event.start.date;
                    }
                    this.appendPre(event.summary + ' (' + when + ')')
                }
            } else {
                this.appendPre('No upcoming events found.');
            }
        });
    }


    componentDidMount = () => {
        // Check is gapi loaded?
        if (this.props.gapi !== null) {
            this.getEvents();
            var moment = require('moment');
            moment().format();
        }
    }

    componentWillReceiveProps({ gapi }) {
        if (this.props.gapi !== null) {
            this.getEvents();
        }
    }

    // refreshICalendarframe() {
    //     var iframe = document.getElementById('divifm')
    //     iframe.innerHTML = iframe.innerHTML;
    // }

    // // function load the calendar api and make the api call
    // makeApiCall({ input }) {
    //     console.log(input);
    //     var eventResponse = document.getElementById('event-response');

    //     this.gapi.client.load('calendar', 'v3', function () {	// load the calendar api (version 3)

    //         // start assigning values to resource on top here *******************************

    //         var request = this.gapi.client.calendar.events.insert
    //             ({
    //                 'calendarId': 'fk765birljiou3i7njv358n700@group.calendar.google.com', // calendar ID
    //                 "resource": this.resource	// pass event details with api call
    //             });

    //         // handle the response from our api call
    //         request.execute(function (resp) {
    //             if (resp.status == 'confirmed') {
    //                 eventResponse.innerHTML = "Event created successfully. View it <a href='" + resp.htmlLink + "'>online here</a>.";
    //                 eventResponse.className += ' panel-success';
    //                 this.refreshICalendarframe();
    //             } else {
    //                 document.getElementById('event-response').innerHTML = "There was a problem. Reload page and try again.";
    //                 eventResponse.className += ' panel-danger';
    //             }
    //         });
    //     });
    // }

    // make call to Google Calendar API and update the state with response
    getEvents() {
        this.gapi = window.gapi;
        let that = this;
        function start() {
            that.gapi.client.init({
                'apiKey': API_KEY
            }).then(function () {
                return that.gapi.client.request({
                    'path': `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`,
                })
            })
            // }).then((response) => {
            //     // Once the request promise is resolved we will get the list of events as response. 
            //     // Then we will call setState method of React to store data to the app state.
            //     let events = response.result.items
            //     that.setState({ events }, () => {
            //         console.log(that.state.events);
            //     })
            // }, function (reason) {
            //     console.log(reason);
            // });
        }
        // The function gapi.load is used to load gapi libraries.
        // First one for libraries and second one is a callback function
        // which can be triggered once the requested libraries are loaded.

        that.gapi.load('client', start)
    }

    /**
       * Append a pre element to the body containing the given message
       * as its text node.
       *
       * @param {string} message Text to be placed in pre element.
       */
    appendPre(message) {
        var pre = document.getElementById('output');
        var textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
    }

    render() {
        const { events } = this.events;
        // console.log(events);
        let eventsList = this.events.map(function (event) {
            return (
                <a
                    className="list-group-item"
                    href={event.htmlLink}
                    target="_blank"
                    key={event.id}
                >
                </a>
            );
        });

        return (
            <div id="divifm">

                {/*<div id="authorize-div" styles="display: none">
                    <span>Authorize access to Google Calendar API</span>*/}
                {/*Button for the user to click to initiate auth sequence*/}
                {/*<div id="AuthButton">
                        <button id="authorize-button" onClick={(e) => this.handleAuthClick(e)}>
                            Authorize
                        </button>
                    </div>
                </div>*/}

                <div id="Maincalendar" styles="display: inline">
                    <iframe id="ifmCalendar"
                        src="https://calendar.google.com/calendar/embed?src=fk765birljiou3i7njv358n700%40group.calendar.google.com&ctz=America%2FNew_York"
                        styles="border-width: 0"
                        width="1000"
                        height="600"
                        frameBorder="0"
                        scrolling="no">
                    </iframe>
                </div>
            </div>
        );
    }
}

export default Calendar;