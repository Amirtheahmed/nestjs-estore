import { Transform } from 'class-transformer';

export function TransformIntegerToPrice() {
  return Transform(
    ({ value }) => {
      return (value / 100).toFixed(2); // Converts cents back to dollars
    },
    { toClassOnly: true },
  );
}
