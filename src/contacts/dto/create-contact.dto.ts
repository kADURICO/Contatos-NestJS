import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório' })
    name: string;

    @IsEmail({}, { message: 'O email deve ser válido' })
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;
}
