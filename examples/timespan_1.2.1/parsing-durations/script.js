// CodePen JS panel. CodePen loads this as a module when it sees the import.
import { Timespan } from 'https://esm.sh/@undercroft/timespan@1.2.1';

const form = document.querySelector('#parse-form');
const durationInput = document.querySelector('#duration');
const startInput = document.querySelector('#start');
const useNowInput = document.querySelector('#use-now');
const output = document.querySelector('#output');
const error = document.querySelector('#error');

function showError(message) {
  error.hidden = false;
  error.textContent = message;
  output.replaceChildren();
}

function render(rows) {
  error.hidden = true;
  error.textContent = '';
  output.replaceChildren(
    ...rows.map(([term, value]) => {
      const row = document.createElement('div');
      row.className = 'row';
      const termElement = document.createElement('dt');
      termElement.textContent = term;
      const valueElement = document.createElement('dd');
      valueElement.textContent = value;
      row.append(termElement, valueElement);
      return row;
    }),
  );
}

function readStart() {
  const value = startInput.value.trim();
  const start = new Date(value);
  if (Number.isNaN(start.getTime())) {
    throw new Error(
      'Enter the start as an ISO instant, such as 2024-01-15T09:00:00.000Z.',
    );
  }
  return start;
}

function parseDuration() {
  const duration = durationInput.value.trim();
  if (duration === '') {
    showError('Enter a duration such as 3d 5h 30m.');
    return;
  }

  try {
    const span = useNowInput.checked
      ? Timespan.fromString(duration)
      : Timespan.fromString(duration, readStart());
    render([
      ['toString()', span.toString()],
      ['start', span.start.toISOString()],
      ['end', span.end.toISOString()],
      ['toTimeframe()', JSON.stringify(span.toTimeframe(), null, 2)],
      ['toMinutes()', String(span.toMinutes())],
    ]);
  } catch (caught) {
    showError(caught instanceof Error ? caught.message : String(caught));
  }
}

useNowInput.addEventListener('change', () => {
  startInput.disabled = useNowInput.checked;
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  parseDuration();
});

for (const button of form.querySelectorAll('[data-duration]')) {
  button.addEventListener('click', () => {
    durationInput.value = button.dataset.duration;
    parseDuration();
  });
}

parseDuration();
