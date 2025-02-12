import { isEmpty, isNullOrUndefined } from "../utils";

export {};

declare global {
  interface String {
    isPalindrome(): boolean;
    addSpacesToCamelCase(): string;
    convertFirstLetterToUpper(seperator: string): string;
    isNullOrUndefined(): boolean;
    isNullOrUndefinedEmpty(): boolean;
  }
}

String.prototype.isPalindrome = function (): boolean {
  const str = this.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
  const reversed = str.split('').reverse().join('');
  return str === reversed;
};

String.prototype.addSpacesToCamelCase = function (): string {
  return this.replace(/([A-Z])/g, ' $1').trim();
};

String.prototype.convertFirstLetterToUpper = function (seperator = ' '): string {
  return this
    ? this
        .split(`${seperator}`)
        .map((s) => (s ? s[0].toUpperCase() : ''))
        .join('')
    : ``;
};

String.prototype.isNullOrUndefined = function (): boolean {
  return this === null || this === undefined;
};

String.prototype.isNullOrUndefinedEmpty = function (): boolean {
  return isNullOrUndefined(this) || isEmpty(this);
};


