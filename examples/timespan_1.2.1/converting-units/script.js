// CodePen JS panel. CodePen loads this as a module when it sees the import.
import { Timespan } from 'https://esm.sh/@undercroft/timespan@1.2.1';

const form = document.querySelector('#convert-form');
const amountInput = document.querySelector('#amount');
const unitInput = document.querySelector('#unit');
const startInput = document.querySelector('#start');
const asUnitInput = document.querySelector('#as-unit');
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
  const start = new Date(startInput.value.trim());
  if (Number.isNaN(start.getTime())) {
    throw new Error(
      'Enter the start as an ISO instant, such as 2024-01-15T00:00:00.000Z.',
    );
  }
  return start;
}

function createSpan(unit, amount, start) {
  switch (unit) {
    case 'milliseconds':
      return Timespan.fromMilliseconds(amount, start);
    case 'seconds':
      return Timespan.fromSeconds(amount, start);
    case 'minutes':
      return Timespan.fromMinutes(amount, start);
    case 'hours':
      return Timespan.fromHours(amount, start);
    case 'days':
      return Timespan.fromDays(amount, start);
    case 'weeks':
      return Timespan.fromWeeks(amount, start);
    case 'months':
      return Timespan.fromMonths(amount, start);
    case 'years':
      return Timespan.fromYears(amount, start);
    default:
      throw new Error('Choose a unit.');
  }
}

function convert() {
  const amount = Number(amountInput.value);
  if (amountInput.value.trim() === '' || !Number.isFinite(amount)) {
    showError('Enter an amount, such as 90.');
    return;
  }

  const requestedUnit = asUnitInput.value.trim();
  if (requestedUnit === '') {
    showError('Enter a unit for toUnit, such as hours or hr.');
    return;
  }

  try {
    const span = createSpan(unitInput.value, amount, readStart());
    render([
      ['toString()', span.toString()],
      ['toTimeframe()', JSON.stringify(span.toTimeframe(), null, 2)],
      ['toMilliseconds()', String(span.toMilliseconds())],
      ['toSeconds()', String(span.toSeconds())],
      ['toMinutes()', String(span.toMinutes())],
      ['toHours()', String(span.toHours())],
      ['toDays()', String(span.toDays())],
      ['toWeeks()', String(span.toWeeks())],
      ['toMonths()', String(span.toMonths())],
      ['toYears()', String(span.toYears())],
      [`toUnit('${requestedUnit}')`, String(span.toUnit(requestedUnit))],
    ]);
  } catch (caught) {
    showError(caught instanceof Error ? caught.message : String(caught));
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  convert();
});

convert();
