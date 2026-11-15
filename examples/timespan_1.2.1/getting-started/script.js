// CodePen JS panel. CodePen loads this as a module when it sees the import.
import { Timespan } from 'https://esm.sh/@undercroft/timespan@1.2.1';

const releaseStart = new Date('2024-03-01T00:00:00.000Z');
const releaseEnd = new Date('2024-03-15T00:00:00.000Z');
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

function inspect(start, end) {
  try {
    const span = new Timespan(start, end);
    render([
      [
        'toString()',
        span.toString() === '' ? '(empty string)' : span.toString(),
      ],
      ['start', span.start.toISOString()],
      ['end', span.end.toISOString()],
      ['toTimeframe()', JSON.stringify(span.toTimeframe(), null, 2)],
      ['toMilliseconds()', String(span.toMilliseconds())],
      ['span.isZero()', String(span.isZero())],
      ['Timespan.isZero(span)', String(Timespan.isZero(span))],
    ]);
  } catch (caught) {
    showError(caught instanceof Error ? caught.message : String(caught));
  }
}

document.querySelector('#release').addEventListener('click', () => {
  inspect(releaseStart, releaseEnd);
});

document.querySelector('#empty').addEventListener('click', () => {
  inspect(releaseStart, releaseStart);
});

inspect(releaseStart, releaseEnd);
