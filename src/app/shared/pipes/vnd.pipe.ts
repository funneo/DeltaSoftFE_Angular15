import { Pipe } from '@angular/core';

@Pipe({
    name: 'VND'
})
export class VNDFormat {
    transform(value: number,
        currencySign: string = '',//tên tiền tệ
        decimalLength: number = 0,
        chunkDelimiter: string = ',',
        decimalDelimiter: string = '.',
        chunkLength: number = 3): string {
        // console.log(value);
        // debugger
        if (value) {
            if (value != null) {
                // let valueString = value.toString().replace(/[.]+/g, '');
                let valueString = value.toString();
                value = parseFloat(valueString.replace(/[.]+/g, ','));
            }
            //value /= 100;
            let result = '\\d(?=(\\d{' + chunkLength + '})+' + (decimalLength > 0 ? '\\D' : '$') + ')'
            let num = value.toFixed(Math.max(0, ~~decimalLength));
            let so = currencySign + (decimalDelimiter ? num.replace(',', decimalDelimiter) : num).replace(new RegExp(result, 'g'), '$&' + chunkDelimiter);
            // return so.replace(',00', '');
            return so;
        }
        return "";
    }
}
