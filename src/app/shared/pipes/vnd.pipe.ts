import { Pipe } from '@angular/core';

@Pipe({
    name: 'VND'
})
export class VNDFormat {
    transform(value: any,
        currencySign: string = '',//tên tiền tệ
        decimalLength: number = 0,
        chunkDelimiter: string = ',',
        decimalDelimiter: string = '.',
        chunkLength: number = 3): string {
        // console.log(value);
        // debugger
        if (value !== null && value !== undefined) {
            let numericValue: number;
            if (typeof value === 'string') {
                numericValue = parseFloat(value.replace(/[.]+/g, ','));
            } else {
                numericValue = value as number;
            }
            
            // Handle NaN if parsing fails
            if (isNaN(numericValue)) return "0";
            
            let result = '\\d(?=(\\d{' + chunkLength + '})+' + (decimalLength > 0 ? '\\D' : '$') + ')'
            let num = numericValue.toFixed(Math.max(0, ~~decimalLength));
            let so = currencySign + (decimalDelimiter ? num.replace(',', decimalDelimiter) : num).replace(new RegExp(result, 'g'), '$&' + chunkDelimiter);
            return so;
        }
        return "";
    }
}
