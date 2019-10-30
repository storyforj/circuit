abstract class TypeDef {
  abstract simplifiedTypeName: string;
  public isRequired: boolean = false;
  required(): TypeDef {
    this.isRequired = true;
    return this;
  }
  abstract validFor(value: any): boolean;
}

class StringType extends TypeDef {
  public simplifiedTypeName = 'string';
  validFor(value: string): boolean {
    if (this.isRequired && (value === null || value === undefined)) { return false; }
    if (typeof value === 'string') { return true; }
    return false;
  }
  toString() { return this.simplifiedTypeName; }
}
class NumberType extends TypeDef  {
  public simplifiedTypeName = 'number';
  validFor(value: string): boolean {
    if (this.isRequired && (value === null || value === undefined)) { return false; }
    if (typeof value === 'number') { return true; }
    return false;
  }
  toString() { return this.simplifiedTypeName; }
}
class BooleanType extends TypeDef {
  public simplifiedTypeName = 'boolean';
  validFor(value: string): boolean {
    if (this.isRequired && (value === null || value === undefined)) { return false; }
    if (typeof value === 'boolean') { return true; }
    return false;
  }
  toString() { return this.simplifiedTypeName; }
}
class ArrayType extends TypeDef {
  public simplifiedTypeName = 'array';
  private validTypes: TypeDef | Array<TypeDef> | null = null;
  of(type: TypeDef | Array<TypeDef>): ArrayType {
    this.validTypes = type;
    return this;
  }
  validFor(values: Array<TypeDef>): boolean {
    if (!this.isRequired && (values === null || values === undefined)) { return true; }
    if (!this.validTypes && values instanceof Array) { return true; }
    return values.reduce((valid: boolean, value: any) => {
      if (!valid) { return valid; }
      if (this.validTypes instanceof Array) {
        return this.validTypes.reduce((oneOfThemIsValid, currentType) => {
          if (oneOfThemIsValid) { return oneOfThemIsValid; }
          return (currentType as TypeDef).validFor(value);
        }, false);
      }
      return (this.validTypes as TypeDef).validFor(value);
    }, true);
  }
  toString() {
    if (!this.validTypes) { return '[]'}
    const types = (this.validTypes instanceof Array) ? (
      this.validTypes.map((type) => {
        return type.toString();
      }, '').join(', ')
    ) : this.validTypes.toString();
    return `[ ${types} ]`;
  }
}

interface Shape { [key: string]: TypeDef };

function allKeysExist(shape: Shape, obj: InputValues): boolean {
  if (!shape) { return true; }
  return Object.keys(shape).reduce((memo: boolean, key: string) => {
    if (!memo) { return memo; }
    if (shape[key].isRequired && !obj[key]) { return false; }
    if (shape[key] instanceof ObjectType) { return allKeysExist((shape[key] as ObjectType).shape, obj[key]); }
    if (obj[key]) { return true; }
    return false;
  }, true)
}
class ObjectType extends TypeDef {
  public simplifiedTypeName = 'object';
  public shape: Shape = ({} as Shape);
  private exact: boolean = false;
  constructor(exact: boolean = false) {
    super();
    this.exact = exact;
  }
  of(type: Shape): ObjectType {
    this.shape = type;
    return this;
  }
  validFor(values: InputValues): boolean {
    if (!this.isRequired && (values === null || values === undefined)) { return true; }
    if (!this.shape && values instanceof Object) { return true; }

    // all values match their types
    return (
      Object.keys(values).reduce((valid: boolean, key: string) => {
        if (!valid) { return valid; }
        if (this.exact && !this.shape[key]) { return false; }
        if (this.shape[key]) { this.shape[key].validFor(values[key]); }
        return valid;
      }, true) && (
      // all keys in shape exist
      allKeysExist(this.shape, values)
    ));
  }
  toString() {
    const keys = Object.keys(this.shape).map((key) => {
      return `string: ${this.shape[key].toString()}`;
    }).join(' ');
    return `{ ${this.shape ? keys : '' } }`;
  }
}

export const Types = {
  string: () => new StringType(),
  number: () => new NumberType(),
  bool: () => new BooleanType(),
  array: () => new ArrayType(),
  shape: () => new ObjectType(false),
  exactShape: () => new ObjectType(true),
};

export type PropertyName = string;
export type InputSet = Record<PropertyName, TypeDef>;
export type InputValues = Record<PropertyName, any>;

export type ValidationError = {
  propertyName: 'string',
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

export function validatePropertyValues(propertySet: InputSet, propertyValues: InputValues) {
  const propertySetKeys: Array<string> = Object.keys(propertySet);
  const propertyValuesKeys: Array<string> = Object.keys(propertyValues);

  const errors: Array<ValidationError> = [];

  propertyValuesKeys.forEach((key) => {
    if (!propertySet[key]) {
      errors.push(
        {
          errorCode: 1,
          propertyName: key,
          problem: `Extra property given '${key}': the circuit was asked to run with a value not included in its properties`
        } as ValidationError
      );
      return; // all other tests expect that propertySet[key] exists
    }
    if (propertySet[key].isRequired && (propertyValues[key] === null || propertyValues[key] === undefined)) {
      errors.push(
        {
          errorCode: 2,
          propertyName: key,
          problem: `Unexpected null property for '${key}': the circuit was run with a null value for non-nullable property`
        } as ValidationError
      );
    }
    if (!propertySet[key].validFor(propertyValues[key])) {
      let stringifiedValue = '';
      try {
        stringifiedValue = JSON.stringify(propertyValues);
      } catch(_) {
        stringifiedValue =  propertySet[key] instanceof ObjectType ? 'circular object' : 'circular array';
      }

      errors.push(
        {
          errorCode: 3,
          propertyName: key,
          problem: propertySet[key] instanceof ObjectType || propertySet[key] instanceof ArrayType ?
            `Mismatched type for '${key}': the circuit was run with an invalid shape expected ${propertySet[key].toString()} for ${stringifiedValue}` :
            `Mismatched type for '${key}': the circuit was run with a mismatched type got '${typeof propertyValues[key]}' expected '${propertySet[key].simplifiedTypeName}'`
        } as ValidationError
      );
    }
  });

  propertySetKeys.forEach((key) => {
    if (propertySet[key].isRequired && (propertyValues[key] === null || propertyValues[key] === undefined)) {
      errors.push(
        {
          errorCode: 2,
          propertyName: key,
          problem: `Unexpected null property for '${key}': the circuit was run with a null value for non-nullable property`
        } as ValidationError
      );
    }
  });

  if (errors.length > 0) {
    throw new ValidationErrorSet(errors);
  }
}

export class CodeTemplate {
  constructor(
    public properties: InputSet,
    public template: (properties: InputValues) => any,
    public outputType: TypeDef,
  ){}
  run(propertyValues: InputValues | object) {
    validatePropertyValues(this.properties, propertyValues as InputValues);
    return this.template(propertyValues as InputValues);
  }
}

export function createInputDefinition(properties: object): InputSet {
  return properties as InputSet;
}

export function createCodeTemplate(inputProperties: InputSet | object, template: (properties: InputValues) => any, type: TypeDef): CodeTemplate {
  return new CodeTemplate(inputProperties as InputSet, template, type);
}
