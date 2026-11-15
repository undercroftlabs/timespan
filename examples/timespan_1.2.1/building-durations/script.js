// CodePen JS panel. CodePen loads this as a module when it sees the import.
import { Timespan } from 'https://esm.sh/@undercroft/timespan@1.2.1';

const unitForm = document.querySelector('#unit-form');
const objectForm = document.querySelector('#object-form');
const amountInput = document.querySelector('#amount');
const unitInput = document.querySelector('#unit');
const startInput = document.querySelector('#start');
const timeframeInput = document.querySelector('#timeframe');
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

function fromNamedUnit(unit, amount, start) {
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

function buildFromUnit() {
  const amount = Number(amountInput.value);
  if (amountInput.value.trim() === '' || !Number.isFinite(amount)) {
    showError('Enter an amount, such as 1.5 or 90.');
    return;
  }

  try {
    const start = readStart();
    const unit = unitInput.value;
    const fromFactory = fromNamedUnit(unit, amount, start);
    const fromUnits = Timespan.fromUnits(amount, unit, start);
    render([
      [
        `from${unit[0].toUpperCase()}${unit.slice(1)}(${amount}).toString()`,
        fromFactory.toString(),
      ],
      [`fromUnits(${amount}, '${unit}').toString()`, fromUnits.toString()],
      ['same start and end', String(fromFactory.equals(fromUnits, 'range'))],
      ['end', fromFactory.end.toISOString()],
    ]);
  } catch (caught) {
    showError(caught instanceof Error ? caught.message : String(caught));
  }
}

function buildFromAlias() {
  try {
    const start = readStart();
    const span = Timespan.fromUnits(90, 'mins', start);
    render([
      ['fromUnits(90, "mins").toString()', span.toString()],
      ['start', span.start.toISOString()],
      ['end', span.end.toISOString()],
    ]);
  } catch (caught) {
    showError(caught instanceof Error ? caught.message : String(caught));
  }
}

function buildMonthEnd() {
  startInput.value = '2024-01-31T00:00:00.000Z';
  amountInput.value = '1';
  unitInput.value = 'months';
  buildFromUnit();
}

function buildFromObject() {
  let timeframe;
  try {
    timeframe = JSON.parse(timeframeInput.value);
  } catch (caught) {
    showError(caught instanceof Error ? caught.message : String(caught));
    return;
  }

  try {
    const span = Timespan.fromObject(timeframe, readStart());
    render([
      ['fromObject(timeframe).toString()', span.toString()],
      ['start', span.start.toISOString()],
      ['end', span.end.toISOString()],
    ]);
  } catch (caught) {
    showError(caught instanceof Error ? caught.message : String(caught));
  }
}

unitForm.addEventListener('submit', (event) => {
  event.preventDefault();
  buildFromUnit();
});

objectForm.addEventListener('submit', (event) => {
  event.preventDefault();
  buildFromObject();
});

document.querySelector('#alias').addEventListener('click', buildFromAlias);
document.querySelector('#month-end').addEventListener('click', buildMonthEnd);

buildFromUnit();
