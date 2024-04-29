import {Exclude, Expose, Type} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";
import {CategoryOutputDto} from "../../category/dto";
import {TransformIntegerToPrice} from "../transformers";

export class ProductOutputDto {
    @ApiProperty({ example: 1, description: 'The unique identifier of the product' })
    @Expose()
    id: number;

    @ApiProperty({ example: 'Sony PlayStation 5', description: 'The name of the product' })
    @Expose()
    name: string;

    @ApiProperty({ example: 'Sony Interactive Entertainment', description: 'Description of the product' })
    @Expose()
    description: string;

    @ApiProperty({ example: 150, description: 'Stock quantity of the product' })
    @Expose()
    stockQuantity: number;

    @ApiProperty({ example: true, description: 'Whether the product is active or not' })
    @Expose()
    isActive: boolean;

    @ApiProperty({ example: 100.00, description: 'The price of the product' })
    @Expose()
    @TransformIntegerToPrice()
    price: number;

    @ApiProperty({ example: '2020-01-01T00:00:00.000Z', description: 'The date the category was created' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ example: '2021-01-01T00:00:00.000Z', description: 'The date the category was last updated' })
    @Expose()
    updatedAt: Date;

    @ApiProperty({ type: () => CategoryOutputDto, description: 'The category the product belongs to' })
    @Expose()
    @Type(() => CategoryOutputDto)
    category?: CategoryOutputDto;
}