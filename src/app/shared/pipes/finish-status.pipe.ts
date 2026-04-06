import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'finishStatus'
})
export class FinishStatusPipe implements PipeTransform {

  transform(value: boolean): string {
    if (value) return "Đang thực hiện";
    return "Hoàn thành";
  }

}
