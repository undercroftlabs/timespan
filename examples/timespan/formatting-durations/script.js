// CodePen JS panel. CodePen loads this as a module when it sees the import.
import { Timespan } from 'https://esm.sh/@undercroft/timespan@1.3.0';

const start = new Date('2023-06-01T00:00:00.000Z');
const span = new Timespan(start, new Date(start.getTime() + 1483506123));
const form = document.querySelector('#format-form');
const formatInput = document.querySelector('#format');
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

function applyFormat() {
  const format = formatInput.value;
  try {
    render([
      ['span.format(format)', span.format(format)],
      ['Timespan.format(format, span)', Timespan.format(format, span)],
      ['toString()', span.toString()],
      ['toTimeframe()', JSON.stringify(span.toTimeframe(), null, 2)],
    ]);
  } catch (caught) {
    showError(caught instanceof Error ? caught.message : String(caught));
  }
}

formatInput.addEventListener('input', applyFormat);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  applyFormat();
});

for (const button of form.querySelectorAll('[data-format]')) {
  button.addEventListener('click', () => {
    formatInput.value = button.dataset.format;
    applyFormat();
  });
}

applyFormat();
