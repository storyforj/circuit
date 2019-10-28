export type PropertyName = string;
export type PropertyType = {
  typeName: string,
  nullable: boolean,
};
export type PropertySet = Record<PropertyName, PropertyType>;
export type PropertyValues = Record<PropertyName, any>;

export type ValidationError = {
  typeName: 'string',
  problem: 'string'
  errorCode: number,
};

function validationErrorsToMessage(validationErrors: Array<ValidationError>) : string {
  return `ValidationErrors:\n${validationErrors.map((error: ValidationError) => error.problem).join('\n  ')}`;
}
export class ValidationErrorSet extends Error {
  public validationErrors: Array<ValidationError>;

  constructor(validationErrors: Array<ValidationError>) {
    super(validationErrorsToMessage(validationErrors));
    Object.setPrototypeOf(this, new.target.prototype);
    this.validationErrors = validationErrors;
  }

  toString() {
    return validationErrorsToMessage(this.validationErrors);
  }
}

export function validatePropertyValues(propertySet: PropertySet, propertyValues: PropertyValues) {
  const propertySetKeys: Array<string> = Object.keys(propertySet);
  const propertyValuesKeys: Array<string> = Object.keys(propertyValues);

  const errors: Array<ValidationError> = [];

  propertyValuesKeys.forEach((key) => {
    if (!propertySet[key]) {
      errors.push(
        {
          errorCode: 1,
          typeName: key,
          problem: `Extra property given '${key}': the circuit was asked to run with a value not included in its properties`
        } as ValidationError
      );
      return; // all other tests expect that propertySet[key] exists
    }
    if (!propertySet[key].nullable && (propertyValues[key] === null || propertyValues[key] === undefined)) {
      errors.push(
        {
          errorCode: 2,
          typeName: key,
          problem: `Unexpected null property for '${key}': the circuit was run with a null value for non-nullable property`
        } as ValidationError
      );
    }
    if (propertySet[key].typeName !== typeof propertyValues[key]) {
      errors.push(
        {
          errorCode: 3,
          typeName: key,
          problem: `Mismatched type for '${key}': the circuit was run with a mismatched type got '${typeof propertyValues[key]}' expected '${propertySet[key].typeName}'`
        } as ValidationError
      );
    }
  });

  propertySetKeys.forEach((key) => {
    if (!propertySet[key].nullable && (propertyValues[key] === null || propertyValues[key] === undefined)) {
      errors.push(
        {
          errorCode: 2,
          typeName: key,
          problem: `Unexpected null property for '${key}': the circuit was run with a null value for non-nullable property`
        } as ValidationError
      );
    }
  });

  if (errors.length > 0) {
    throw new ValidationErrorSet(errors);
  }
}

export class CircuitDefinition {
  constructor(
    public properties: PropertySet,
    public template: (properties: PropertyValues) => string,
  ){}
  run(propertyValues: PropertyValues | object) {
    validatePropertyValues(this.properties, propertyValues as PropertyValues);
    return this.template(propertyValues as PropertyValues);
  }
}

export function createPropertySet(properties: object): PropertySet {
  return properties as PropertySet;
}

export function createPropertyValues(properties: object): PropertySet {
  return properties as PropertyValues;
}

export function createCircuitDefinition(properties: PropertySet | object, template: (properties: PropertyValues) => string): CircuitDefinition {
  return new CircuitDefinition(properties as PropertySet, template);
}
