
document.addEventListener('DOMContentLoaded', () => {
  const availableEventsSelect = document.getElementById('availableEvents');
  const selectedEventsSelect = document.getElementById('selectedEvents');
  const btnAdd = document.getElementById('btnAdd');
  const btnRemove = document.getElementById('btnRemove');
  const btnSave = document.getElementById('btnSave');

  const eventData = [
    { idevent: "338187", eventname: "mark's space", idsession: "506281", linkname: "mark's space", dateofsessionstart: "2023-12-23 14:51:00", HasMeetingURL: "0", currentevent: "1" },
    { idevent: "5406", eventname: "How to Use GoBrunch for Webinars and Meetings: Live Tutorial with Q&A", idsession: "8175", linkname: "Using GoBrunch: Best Practices, Tips and Tricks", dateofsessionstart: "2019-04-02 15:30:00", HasMeetingURL: "0", currentevent: "0" },
    { idevent: "5406", eventname: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam ea dolore tenetur rerum. Expedita, iure! Quod perspiciatis quisquam asperiores sed.", idsession: "8175", linkname: "    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam ea dolore tenetur rerum. Expedita, iure! Quod perspiciatis quisquam asperiores sed.", dateofsessionstart: "2019-04-02 15:30:00", HasMeetingURL: "0", currentevent: "0" },

  ];

  function processEventData(rawData) {
    const eventsMap = new Map();

    rawData.forEach(data => {
      if (!eventsMap.has(data.idevent)) {
        eventsMap.set(data.idevent, {
          idevent: data.idevent,
          eventname: data.eventname,
          sessions: []
        });
      }
      eventsMap.get(data.idevent).sessions.push({
        idsession: data.idsession,
        linkname: data.linkname,
        dateofsessionstart: data.dateofsessionstart,
        hasMeetingURL: data.HasMeetingURL === "1",
        currentevent: data.currentevent === "1"
      });
    });

    return Array.from(eventsMap.values());
  }

  function populateSelect(select, events) {
    select.innerHTML = '';

    events.forEach(event => {
      const optGroup = document.createElement('optgroup');
      optGroup.label = event.eventname;
      optGroup.id = `event-${event.idevent}`;

      event.sessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session.idsession;
        option.textContent = session.linkname;
        optGroup.appendChild(option);
      });

      select.appendChild(optGroup);
    });
  }

  function moveSessions(sourceSelect, destinationSelect, eventId) {
    const optGroup = sourceSelect.querySelector(`#event-${eventId}`);
    if (optGroup) {
      destinationSelect.appendChild(optGroup.cloneNode(true));
      optGroup.remove();
    }
  }

  availableEventsSelect.addEventListener('dblclick', event => {
    if (event.target.tagName === 'OPTGROUP') {
      moveSessions(availableEventsSelect, selectedEventsSelect, event.target.id.split('-')[1]);
    }
  });

  selectedEventsSelect.addEventListener('dblclick', event => {
    if (event.target.tagName === 'OPTGROUP') {
      moveSessions(selectedEventsSelect, availableEventsSelect, event.target.id.split('-')[1]);
    }
  });

  btnAdd.addEventListener('click', () => {
    Array.from(availableEventsSelect.selectedOptions).forEach(option => {
      moveSessions(availableEventsSelect, selectedEventsSelect, option.parentNode.id.split('-')[1]);
    });
  });

  btnRemove.addEventListener('click', () => {
    Array.from(selectedEventsSelect.selectedOptions).forEach(option => {
      moveSessions(selectedEventsSelect, availableEventsSelect, option.parentNode.id.split('-')[1]);
    });
  });

  btnSave.addEventListener('click', () => {
    const selectedSessions = Array.from(selectedEventsSelect.querySelectorAll('option')).map(opt => opt.value);
    console.log('Selected Sessions:', selectedSessions);
  });

  populateSelect(availableEventsSelect, processEventData(eventData));
});
