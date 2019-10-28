import { expect } from 'chai';

import { runNode } from '../src/runNode';
import { createCircuitDefinition, createPropertySet, PropertyValues, ValidationErrorSet } from '../src/CircuitDefinition';

describe('runNode', function() {
  it('throws when extra properties are given', function() {
    const definition = createCircuitDefinition(
      createPropertySet({}),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test}`;
      },
    );
    try {
      runNode(definition, { test: 1 })
    } catch (e) {
      expect(e.validationErrors[0].errorCode).to.be.equal(1);
    }
  });

  it('throws when null properties are given for non-nullables', function() {
    const definition = createCircuitDefinition(
      createPropertySet({
        test: {
          typeName: 'string',
          nullable: false,
        },
      }),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test}`;
      },
    );
    try {
      runNode(definition, { test: null })
    } catch (e) {
      expect(e.validationErrors[0].errorCode).to.be.equal(2);
    }
  });

  it('throws when a nothing is given for a non-nullable property', function() {
    const definition = createCircuitDefinition(
      createPropertySet({
        test: {
          typeName: 'string',
          nullable: false,
        },
      }),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test}`;
      },
    );
    try {
      runNode(definition, {})
    } catch (e) {
      expect(e.validationErrors[0].errorCode).to.be.equal(2);
    }
  });

  it('throws when properties are not of a valid type', function() {
    const definition = createCircuitDefinition(
      createPropertySet({
        test: {
          typeName: 'string',
          nullable: false,
        },
      }),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test}`;
      },
    );
    try {
      runNode(definition, { test: 1 })
    } catch (e) {
      expect(e.validationErrors[0].errorCode).to.be.equal(3);
    }
  });

  it('runs a node with properties injected', function() {
    const definition = createCircuitDefinition(
      createPropertySet({
        test: {
          typeName: 'string',
          nullable: false,
        },
      }),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test}`;
      },
    );
    expect(runNode(definition, { test: 'hi' })).equal('hello world hi');
  });
});
