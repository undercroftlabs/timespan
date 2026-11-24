// CodePen JS panel. CodePen loads this as a module when it sees the import.
import { Timespan } from 'https://esm.sh/@undercroft/timespan@1.3.0';

const start = new Date('2024-07-01T00:00:00.000Z');
const end = new Date('2024-07-10T00:00:00.000Z');
const original = new Timespan(start, end);
const output = document.querySelector('#output');
const error = document.querySelector('#error');
let stolenStart = null;

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

function showCopies() {
  try {
    const copy = original.clone();
    const staticCopy = Timespan.clone(original);
    const rows = [
      ['original.toString()', original.toString()],
      ['original.clone().toString()', copy.toString()],
      ['copy === original', String(copy === original)],
      [
        'copy.equals(original, "range")',
        String(copy.equals(original, 'range')),
      ],
      [
        'Timespan.clone(original).equals(original, "range")',
        String(staticCopy.equals(original, 'range')),
      ],
      ['original.start !== copy.start', String(original.start !== copy.start)],
      ['original.start', original.start.toISOString()],
      ['original.end', original.end.toISOString()],
    ];

    if (stolenStart) {
      rows.push(
        [
          'Date object returned by the earlier start read',
          stolenStart.toISOString(),
        ],
        [
          'original.start after changing that Date',
          original.start.toISOString(),
        ],
      );
    }

    render(rows);
  } catch (caught) {
    showError(caught instanceof Error ? caught.message : String(caught));
  }
}

document.querySelector('#shift').addEventListener('click', () => {
  stolenStart = original.start;
  stolenStart.setUTCFullYear(1990);
  showCopies();
});

document.querySelector('#reset').addEventListener('click', () => {
  stolenStart = null;
  showCopies();
});

showCopies();
