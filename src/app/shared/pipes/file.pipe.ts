import { Pipe } from '@angular/core';

@Pipe({
    name: 'FileName'
})
export class FileName {
    transform(value: string): string {
        //console.log(value);
        let fileName = value.split('.');
        let file = fileName[fileName.length-1];
        switch(file){
            case 'pdf':
                return 'fa-file-pdf-o';;
            case 'xls': case 'xlsx':
                return 'fa-file-excel-o';
            case 'doc': case 'docx':
                return 'fa-file-word-o';
            case 'zip': case 'rar':
                return 'fa-file-zip-o';
            case 'jpg': case 'png': case 'gif':
                return 'fa-file-image-o';
            default:
                return ' fa-file-o';
        }
    }
}