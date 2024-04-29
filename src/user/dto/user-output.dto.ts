import {ApiProperty} from "@nestjs/swagger";
import {Expose} from "class-transformer";

export class UserOutputDto {
    @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
    @Expose()
    id: number;

    @ApiProperty({ example: 'user@example.com', description: 'The user\'s email address' })
    @Expose()
    email: string;

    @ApiProperty({ example: 'John', description: 'The user\'s first name' })
    @Expose()
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'The user\'s last name' })
    @Expose()
    lastName: string;

    @ApiProperty({ example: '2020-01-01T00:00:00.000Z', description: 'The date the user was created' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ example: '2021-01-01T00:00:00.000Z', description: 'The date the user was last updated' })
    @Expose()
    updatedAt: Date;
}