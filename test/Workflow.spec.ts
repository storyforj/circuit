import { expect } from 'chai';

import { run } from '../src/Workflow';
import { createCodeTemplate, createInputDefinition, InputValues, Types } from '../src/CodeTemplate';

describe('Board', () => {
  it('runs a program tree', function() {
    const addition = createCodeTemplate(
      createInputDefinition({
        a: Types.number().required(),
        b: Types.number().required(),
      }),
      (properties: InputValues) : number => {
        return properties.a + properties.b;
      },
      Types.number()
    );

    const numberToString = createCodeTemplate(
      createInputDefinition({
        input: Types.number().required(),
      }),
      (properties: InputValues) : string => {
        return `${properties.input}`;
      },
      Types.string()
    );

    const concatStrings = createCodeTemplate(
      createInputDefinition({
        a: Types.string().required(),
        b: Types.string().required(),
      }),
      (properties: InputValues) : string => {
        return `${properties.a}${properties.b}`;
      },
      Types.string()
    )

    expect(
      run(
        {
          steps: [
            { template: 'addition', input: { a: 1, b: 2 }, connections: null, pos: { x: 0, y: 0 } },
            { template: 'numberToString', input: null, connections: { input: 0 }, pos: { x: 0, y: 100 } },
            { template: 'concatStrings', input: { a: 'Our result is: ' }, connections: { b: 1 }, pos: { x: 0, y: 100 } },
          ],
          resultStep: 2,
        },
        { addition, numberToString, concatStrings },
      ),
    ).equal('Our result is: 3');
  });
});
