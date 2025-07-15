import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (!value) return true;
          const inputDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return inputDate <= today;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Date of birth cannot be in the future';
        },
      },
    });
  };
} 