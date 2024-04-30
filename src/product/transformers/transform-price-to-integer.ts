import { Transform } from 'class-transformer';

export function TransformPriceToInteger() {
  return Transform(({ value }) => {
    return Math.round(parseFloat(value) * 100); // Converts dollars to cents
  });
}
