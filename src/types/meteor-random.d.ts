declare module "meteor-random" {
  export function id(numberOfChars?: number): string;

  export function secret(numberOfChars?: number): string;

  export function fraction(): number;
  // @param numberOfDigits, @returns a random hex string of the given length
  export function hexString(numberOfDigits: number): string;
  // @param array, @return a random element in array
  export function choice(array: any[]): string;
  // @param str, @return a random char in str
  export function choice(str: string): string;
}