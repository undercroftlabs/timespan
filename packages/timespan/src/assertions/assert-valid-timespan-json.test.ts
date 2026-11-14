import { assertValidTimespanJson } from './assert-valid-timespan-json';

const invalidTimespanJson = 'Invalid Timespan JSON.';

const validJson = {
  $type: 'Timespan',
  start: '2022-01-01T06:24:00.000Z',
  end: '2023-02-21T10:52:00.123Z',
};

describe('assertValidTimespanJson', () => {
  describe('accepted values', () => {
    const nullPrototype = Object.create(null) as {
      $type: string;
      start: string;
      end: string;
    };
    nullPrototype.$type = 'Timespan';
    nullPrototype.start = '1970-01-01T00:00:00.000Z';
    nullPrototype.end = '1970-01-01T00:00:00.000Z';

    test.each`
      label                     | value
      ${'both instants'}        | ${validJson}
      ${'zero-length span'}     | ${{ $type: 'Timespan', start: '1970-01-01T00:00:00.000Z', end: '1970-01-01T00:00:00.000Z' }}
      ${'pre-epoch instant'}    | ${{ $type: 'Timespan', start: '1969-12-31T23:59:59.999Z', end: '1970-01-01T00:00:00.000Z' }}
      ${'empty strings'}        | ${{ $type: 'Timespan', start: '', end: '' }}
      ${'non-date strings'}     | ${{ $type: 'Timespan', start: 'not-a-date', end: 'also-not-a-date' }}
      ${'start later than end'} | ${{ $type: 'Timespan', start: '2024-01-02T00:00:00.000Z', end: '2024-01-01T00:00:00.000Z' }}
      ${'extra fields'}         | ${{ ...validJson, label: 'kept', milliseconds: 1 }}
      ${'null prototype'}       | ${nullPrototype}
    `('accepts $label', ({ value }: { value: object }) => {
      expect(assertValidTimespanJson(value)).toBeUndefined();
    });
  });

  describe('rejected values', () => {
    const bigintValue = Function('return 1n')();
    const arrayWithFields = ['not-an-object'];
    Object.assign(arrayWithFields, validJson);

    test.each`
      label                            | value
      ${'null'}                        | ${null}
      ${'undefined'}                   | ${undefined}
      ${'zero'}                        | ${0}
      ${'positive number'}             | ${1}
      ${'NaN'}                         | ${Number.NaN}
      ${'bigint'}                      | ${bigintValue}
      ${'true'}                        | ${true}
      ${'false'}                       | ${false}
      ${'json text'}                   | ${JSON.stringify(validJson)}
      ${'empty string'}                | ${''}
      ${'empty object'}                | ${{}}
      ${'array'}                       | ${[]}
      ${'array with the fields'}       | ${arrayWithFields}
      ${'date'}                        | ${new Date(0)}
      ${'symbol'}                      | ${Symbol('Timespan')}
      ${'function'}                    | ${() => validJson}
      ${'missing type'}                | ${{ start: validJson.start, end: validJson.end }}
      ${'missing start'}               | ${{ $type: 'Timespan', end: validJson.end }}
      ${'missing end'}                 | ${{ $type: 'Timespan', start: validJson.start }}
      ${'lowercase type'}              | ${{ ...validJson, $type: 'timespan' }}
      ${'type with surrounding space'} | ${{ ...validJson, $type: ' Timespan' }}
      ${'numeric type'}                | ${{ ...validJson, $type: 1 }}
      ${'null type'}                   | ${{ ...validJson, $type: null }}
      ${'numeric start'}               | ${{ ...validJson, start: 0 }}
      ${'null start'}                  | ${{ ...validJson, start: null }}
      ${'date start'}                  | ${{ ...validJson, start: new Date(0) }}
      ${'numeric end'}                 | ${{ ...validJson, end: 0 }}
      ${'null end'}                    | ${{ ...validJson, end: null }}
      ${'date end'}                    | ${{ ...validJson, end: new Date(0) }}
      ${'string object start'}         | ${{ ...validJson, start: new String(validJson.start) }}
    `(
      'throws "Invalid Timespan JSON." for $label',
      ({ value }: { value: unknown }) => {
        expect(() => assertValidTimespanJson(value)).toThrow(
          new TypeError(invalidTimespanJson),
        );
      },
    );
  });

  it('still accepts a valid object after rejecting an invalid one', () => {
    expect(() => assertValidTimespanJson(null)).toThrow(
      new TypeError(invalidTimespanJson),
    );
    expect(assertValidTimespanJson(validJson)).toBeUndefined();
    expect(assertValidTimespanJson(validJson)).toBeUndefined();
  });
});
