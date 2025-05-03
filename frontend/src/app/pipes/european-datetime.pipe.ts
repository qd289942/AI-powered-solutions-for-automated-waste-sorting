import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'europeanDatetime',
  standalone: true
})
export class EuropeanDatetimePipe implements PipeTransform {

  transform(value: number): unknown {
    if (!value) return '';

    const date = new Date(value);

    const day = this.pad(date.getDate());
    const month = this.pad(date.getMonth() + 1); // Months are zero-based
    const year = date.getFullYear();
    const hours = this.pad(date.getHours());
    const minutes = this.pad(date.getMinutes());
    const seconds = this.pad(date.getSeconds());

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  }

  pad(number: number): string {
    return number < 10 ? '0' + number : number.toString();
  }
}
