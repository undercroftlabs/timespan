// CodePen JS panel. CodePen loads this as a module when it sees the import.
import { Timespan } from 'https://esm.sh/@undercroft/timespan@1.3.0';

const form = document.querySelector('#compare-form');
const output = document.querySelector('#output');
const error = document.querySelector('#error');
const verdict = document.querySelector('#verdict');

function showError(message) {
  error.hidden = false;
  error.textContent = message;
  verdict.hidden = true;
  verdict.textContent = '';
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

function readDate(id, label) {
  const value = document.querySelector(id).value.trim();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Enter the ${label} as an ISO instant.`);
  }
  return date;
}

function compare() {
  try {
    const migration = new Timespan(
      readDate('#migration-start', 'migration start'),
      readDate('#migration-end', 'migration end'),
    );
    const reportExport = new Timespan(
      readDate('#export-start', 'export start'),
      readDate('#export-end', 'export end'),
    );
    const order = migration.compareTo(reportExport);

    if (order < 0) {
      verdict.textContent = 'The migration took less time.';
    } else if (order > 0) {
      verdict.textContent = 'The migration took longer.';
    } else {
      verdict.textContent = 'Both operations took the same amount of time.';
    }
    verdict.hidden = false;

    render([
      ['migration.toString()', migration.toString()],
      ['migration.toMinutes()', String(migration.toMinutes())],
      ['export.toString()', reportExport.toString()],
      ['export.toMinutes()', String(reportExport.toMinutes())],
      ['migration.compareTo(export)', String(order)],
      [
        'Timespan.compareTo(migration, export)',
        String(Timespan.compareTo(migration, reportExport)),
      ],
      ['migration.equals(export)', String(migration.equals(reportExport))],
      [
        "migration.equals(export, 'range')",
        String(migration.equals(reportExport, 'range')),
      ],
      [
        'Timespan.equals(migration, export)',
        String(Timespan.equals(migration, reportExport)),
      ],
      [
        "Timespan.equals(migration, export, 'range')",
        String(Timespan.equals(migration, reportExport, 'range')),
      ],
    ]);
  } catch (caught) {
    showError(caught instanceof Error ? caught.message : String(caught));
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  compare();
});

document.querySelector('#same-length').addEventListener('click', () => {
  document.querySelector('#migration-start').value = '2024-04-01T08:00:00.000Z';
  document.querySelector('#migration-end').value = '2024-04-01T09:15:00.000Z';
  document.querySelector('#export-start').value = '2024-04-02T13:00:00.000Z';
  document.querySelector('#export-end').value = '2024-04-02T14:15:00.000Z';
  compare();
});

compare();
