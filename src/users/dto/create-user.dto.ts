import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    name: string;

    @IsEmail({}, { message: 'O email deve ser válido' })
    @IsNotEmpty({ message: 'O email é obrigatório' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
    password: string;
}
