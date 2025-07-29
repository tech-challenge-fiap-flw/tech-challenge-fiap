import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function UniqueBy(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'uniqueBy',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any[], args: ValidationArguments) {
          if (!Array.isArray(value)) return false;

          const prop = args.constraints[0];
          const extractedValues = value.map((item) => item?.[prop]);
          const uniqueValues = new Set(extractedValues);

          return extractedValues.length === uniqueValues.size;
        },
        defaultMessage(args: ValidationArguments) {
          const prop = args.constraints[0];
          return `Valores duplicados não são permitidos para a propriedade '${prop}'.`;
        },
      },
    });
  };
}
