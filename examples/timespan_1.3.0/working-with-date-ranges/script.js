// CodePen JS panel. CodePen loads this as a module when it sees the import.
import { Timespan } from 'https://esm.sh/@undercroft/timespan@1.3.0';

const form = document.querySelector('#range-form');
const startInput = document.querySelector('#start');
const endInput = document.querySelector('#end');
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

function readDate(input, label) {
  const value = input.value.trim();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Enter the ${label} as an ISO instant.`);
  }
  return date;
}

function calculate() {
  try {
    const span = new Timespan(
      readDate(startInput, 'kickoff'),
      readDate(endInput, 'launch'),
    );
    render([
      ['toString()', span.toString()],
      ['start', span.start.toISOString()],
      ['end', span.end.toISOString()],
      ['toTimeframe()', JSON.stringify(span.toTimeframe(), null, 2)],
      ['toDays()', String(span.toDays())],
      ['toMonths()', String(span.toMonths())],
    ]);
  } catch (caught) {
    showError(caught instanceof Error ? caught.message : String(caught));
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  calculate();
});

calculate();
