import { ValidationArguments } from 'class-validator';
import { UniqueBy } from './unique-by.decorator';

const validatorHolder = { validator: undefined as any };

jest.mock('class-validator', () => {
  const originalModule = jest.requireActual('class-validator');
  return {
    ...originalModule,
    registerDecorator: (args: any) => {
      validatorHolder.validator = args.validator;
      return;
    },
  };
});

describe('UniqueBy decorator', () => {
  const decoratorFn = UniqueBy('id');

  const mockTarget = {};
  const mockPropertyName = 'testProp';

  beforeAll(() => {
    decoratorFn(mockTarget, mockPropertyName);
  });

  const getValidator = () => validatorHolder.validator;

  describe('validator.validate', () => {
    it('deve retornar false se o valor não for array', () => {
      const validator = getValidator();
      const args: ValidationArguments = {
        constraints: ['id'],
      } as any;

      expect(validator.validate(null, args)).toBe(false);
      expect(validator.validate({}, args)).toBe(false);
      expect(validator.validate('string', args)).toBe(false);
    });

    it('deve retornar true se array não possuir valores duplicados na propriedade', () => {
      const validator = getValidator();
      const args: ValidationArguments = {
        constraints: ['id'],
      } as any;

      const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
      expect(validator.validate(arr, args)).toBe(true);
    });

    it('deve retornar false se array possuir valores duplicados na propriedade', () => {
      const validator = getValidator();
      const args: ValidationArguments = {
        constraints: ['id'],
      } as any;

      const arr = [{ id: 1 }, { id: 2 }, { id: 1 }];
      expect(validator.validate(arr, args)).toBe(false);
    });

    it('deve considerar undefined e null na propriedade', () => {
      const validator = getValidator();
      const args: ValidationArguments = {
        constraints: ['id'],
      } as any;

      const arr = [{ id: 1 }, { id: undefined }, { id: null }, { id: undefined }];
      expect(validator.validate(arr, args)).toBe(false);
    });

    it('deve funcionar para outra propriedade', () => {
      const validator = getValidator();
      const args: ValidationArguments = {
        constraints: ['name'],
      } as any;

      const arr = [{ name: 'a' }, { name: 'b' }, { name: 'a' }];
      expect(validator.validate(arr, args)).toBe(false);
    });
  });

  describe('validator.defaultMessage', () => {
    it('deve retornar mensagem padrão com propriedade correta', () => {
      const validator = getValidator();
      const args: ValidationArguments = {
        constraints: ['id'],
      } as any;

      expect(validator.defaultMessage(args)).toBe(
        "Valores duplicados não são permitidos para a propriedade 'id'.",
      );
    });
  });
});
