import { Pipe } from '@angular/core';

@Pipe({
  name: 'Accept'
})
export class Accept {
  transform(value: number): string {
    switch (value) {
      case 1:
        return "Bước 1";
      case 2 || 3:
        return "Bước 2";
      case -1:
        return "Từ chối"
      default:
        return "Kích hoạt"
    }
  }
}
