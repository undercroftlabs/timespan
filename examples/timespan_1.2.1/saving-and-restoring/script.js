// CodePen JS panel. CodePen loads this as a module when it sees the import.
import { Timespan } from 'https://esm.sh/@undercroft/timespan@1.2.1';

const original = new Timespan(
  new Date('2024-05-01T15:00:00.000Z'),
  new Date('2024-05-03T18:30:00.000Z'),
);
const nestedDocument = {
  label: 'on-call shift',
  span: original,
};
const form = document.querySelector('#restore-form');
const jsonInput = document.querySelector('#json');
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

function savedRows() {
  return [
    ['original.toJSON()', JSON.stringify(original.toJSON(), null, 2)],
    [
      'Timespan.toJSON(original)',
      JSON.stringify(Timespan.toJSON(original), null, 2),
    ],
    ['Timespan.stringify(original)', Timespan.stringify(original)],
    ['JSON.stringify(original)', JSON.stringify(original)],
    [
      'Timespan.isTimespanJSON(original)',
      String(Timespan.isTimespanJSON(original)),
    ],
    [
      'Timespan.isTimespanJSON(original.toJSON())',
      String(Timespan.isTimespanJSON(original.toJSON())),
    ],
  ];
}

function describeSpan(span) {
  return `${span.toString()} (${span.start.toISOString()} → ${span.end.toISOString()})`;
}

function restore() {
  const text = jsonInput.value;
  let value;
  try {
    value = JSON.parse(text);
  } catch (caught) {
    showError(caught instanceof Error ? caught.message : String(caught));
    return;
  }

  try {
    if (Timespan.isTimespanJSON(value)) {
      const parsed = Timespan.parse(text);
      const fromJson = Timespan.fromJSON(value);
      render([
        ...savedRows(),
        [
          'Timespan.isTimespanJSON(edited)',
          String(Timespan.isTimespanJSON(value)),
        ],
        ['Timespan.parse(text)', describeSpan(parsed)],
        ['Timespan.fromJSON(value)', describeSpan(fromJson)],
        [
          'parsed.equals(fromJSON, "range")',
          String(parsed.equals(fromJson, 'range')),
        ],
        [
          'parsed.equals(original, "range")',
          String(parsed.equals(original, 'range')),
        ],
      ]);
      return;
    }

    const revived = JSON.parse(text, Timespan.reviver);
    const rows = [
      ...savedRows(),
      ['Timespan.isTimespanJSON(root)', String(Timespan.isTimespanJSON(value))],
    ];
    if (
      revived &&
      typeof revived === 'object' &&
      revived.span instanceof Timespan
    ) {
      rows.push(
        ['revived.label', String(revived.label)],
        ['revived.span', describeSpan(revived.span)],
        [
          'revived.span.equals(original, "range")',
          String(revived.span.equals(original, 'range')),
        ],
      );
    } else if (revived instanceof Timespan) {
      rows.push(['JSON.parse(text, Timespan.reviver)', describeSpan(revived)]);
    } else {
      rows.push([
        'JSON.parse(text, Timespan.reviver)',
        JSON.stringify(revived),
      ]);
    }
    render(rows);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught);
    showError(
      `Timespan.isTimespanJSON(value) is ${Timespan.isTimespanJSON(value)}. ${message}`,
    );
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  restore();
});

document.querySelector('#single').addEventListener('click', () => {
  jsonInput.value = JSON.stringify(original, null, 2);
  restore();
});

document.querySelector('#nested').addEventListener('click', () => {
  jsonInput.value = JSON.stringify(nestedDocument, null, 2);
  restore();
});

document.querySelector('#invalid-dates').addEventListener('click', () => {
  jsonInput.value = JSON.stringify(
    { $type: 'Timespan', start: 'nope', end: 'nope' },
    null,
    2,
  );
  restore();
});

jsonInput.value = JSON.stringify(original, null, 2);
restore();
