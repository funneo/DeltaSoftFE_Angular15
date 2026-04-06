import { Pipe } from '@angular/core';

@Pipe({
    name: 'Status'
})
export class Status {
    transform(value: boolean): string {
        if (value) return "Kích hoạt";
        return "Khóa";
    }
}
