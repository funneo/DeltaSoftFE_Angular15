import { Pipe } from '@angular/core';

@Pipe({
    name: 'List'
})
export class List {
    transform(value: string, list: any[]): string {
        if(value == null){
            value = '';
        }
        if(list){
            let index = list.findIndex(x=>x.id == value);
            if(index != -1){
                return list[index].text;
            }
        }
        return '';
    }
}
