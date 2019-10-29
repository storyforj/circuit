import { expect } from 'chai';

import { createCircuitDefinition, createPropertySet, PropertyValues, Types } from '../src/CircuitDefinition';

describe('runNode', function() {
  it('throws when extra properties are given', function() {
    const definition = createCircuitDefinition(
      createPropertySet({}),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test}`;
      },
      Types.string(),
    );
    try {
      definition.run({ test: 1 })
    } catch (e) {
      expect(e.validationErrors[0].errorCode).to.be.equal(1);
    }
  });

  it('throws when null properties are given for non-nullables', function() {
    const definition = createCircuitDefinition(
      createPropertySet({
        test: Types.string().required(),
      }),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test}`;
      },
      Types.string(),
    );
    try {
      definition.run({ test: null })
    } catch (e) {
      expect(e.validationErrors[0].errorCode).to.be.equal(2);
    }
  });

  it('throws when a nothing is given for a non-nullable property', function() {
    const definition = createCircuitDefinition(
      createPropertySet({
        test: Types.string().required(),
      }),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test}`;
      },
      Types.string(),
    );
    try {
      definition.run({})
    } catch (e) {
      expect(e.validationErrors[0].errorCode).to.be.equal(2);
    }
  });

  it('throws when properties are not of a valid type', function() {
    const definition = createCircuitDefinition(
      createPropertySet({
        test: Types.string(),
      }),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test}`;
      },
      Types.string(),
    );
    try {
      definition.run({ test: 1 })
    } catch (e) {
      expect(e.validationErrors[0].errorCode).to.be.equal(3);
    }
  });

  it('runs a node with properties injected', function() {
    const definition = createCircuitDefinition(
      createPropertySet({
        test: Types.string().required(),
      }),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test}`;
      },
      Types.string(),
    );
    expect(definition.run({ test: 'hi' })).equal('hello world hi');
  });

  it('runs a node that has an array type', function() {
    const definition = createCircuitDefinition(
      createPropertySet({
        test: Types.array().of(
          Types.string().required()
        ).required(),
      }),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test.toString()}`;
      },
      Types.string(),
    );
    expect(() => definition.run({ test: ['hi', 'hi'] })).not.to.throw();
  });

  it('throws when a node has a complex type that does not match', function() {
    const definition = createCircuitDefinition(
      createPropertySet({
        test: Types.shape().of({
          hello: Types.shape().of({
            testing: Types.array().of(Types.string().required()).required(),
          }).required()
        }).required(),
      }),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test.toString()}`;
      },
      Types.string(),
    );
    try {
      definition.run({ test: ['hi', 'hi'] });
    } catch (e) {
      expect(e.validationErrors[0].errorCode).to.be.equal(3);
      expect(e.validationErrors[0].problem).to.contain('{ string: [ string ] } }');
    }
  });

  it('does not throw when a node has a complex type that does match', function() {
    const definition = createCircuitDefinition(
      createPropertySet({
        test: Types.shape().of({
          hello: Types.shape().of({
            testing: Types.array().of(Types.string().required()).required(),
          }).required()
        }).required(),
      }),
      (properties: PropertyValues) : string => {
        return `hello world ${properties.test.toString()}`;
      },
      Types.string(),
    );
    expect(() => definition.run({ test: { hello: { testing: ['hi', 'hi'] } } })).not. to.throw();
  });
});
