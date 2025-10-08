export class User {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    public password: string,
    public type: string,
    public active: boolean,
    public creationDate: Date,
    public cpf: string,
    public cnpj?: string | null,
    public phone?: string,
    public address?: string | null,
    public city?: string | null,
    public state?: string | null,
    public zipCode?: string | null
  ) {}
}
