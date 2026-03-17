import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import jsQR from 'jsqr';
import { firstValueFrom } from 'rxjs';

export interface VietQrData {
  bankBin?: string;
  bankName?: string;
  bankShortName?: string;
  accountNumber?: string;
  amount?: number;
  content?: string;
  merchantName?: string;
  isValid: boolean;
  rawString?: string;
  network?: string; // e.g., 'NAPAS'
}

@Injectable({
  providedIn: 'root'
})
export class VietQrService {
  private banks: any[] = [];

  constructor(private http: HttpClient) { 
    this.loadBanks();
  }

  async loadBanks() {
    try {
      // Tải danh sách ngân hàng từ API công khai của VietQR
      const res: any = await firstValueFrom(this.http.get('https://api.vietqr.io/v2/banks'));
      if (res && res.data) {
        this.banks = res.data;
      }
    } catch (e) {
      console.error('Không thể tải danh sách ngân hàng', e);
    }
  }

  /**
   * Parse VietQR string (EMVCo standard)
   * Example string: 00020101021238580010A00000072701240006970415011011336666880208QRIBFTTA53037045408100000005802VN62110807PAYMENT6304BF95
   */
  parse(qrString: string): VietQrData {
    const data: VietQrData = { isValid: false, rawString: qrString };

    try {
      if (!qrString) return data;
      
      // If we got here, we successfully scanned a QR code or text
      data.isValid = true;

      // Basic check for EMVCo format (VietQR starts with 000201)
      if (qrString.startsWith('000201')) {
        const tags = this.parseTags(qrString);

        // Tag 38: Merchant Account Information
        if (tags['38']) {
          const subTags38 = this.parseTags(tags['38']);
          
          // Tag 38 -> Sub-tag 00: GUID
          if (subTags38['00'] === 'A000000727') {
            data.network = 'NAPAS';
          }

          // Tag 38 -> Sub-tag 01: Contains BIN and Account Number
          if (subTags38['01']) {
            const subTagsAccount = this.parseTags(subTags38['01']);
            data.bankBin = subTagsAccount['00'];
            data.accountNumber = subTagsAccount['01'];

            // Map BIN to Bank Name
            if (this.banks.length > 0 && data.bankBin) {
              const bank = this.banks.find(b => b.bin === data.bankBin);
              if (bank) {
                data.bankName = bank.name;
                data.bankShortName = bank.shortName;
              }
            }
          }
        }

        // Tag 54: Transaction Amount
        if (tags['54']) {
          data.amount = parseFloat(tags['54']);
        }

        // Tag 59: Merchant Name (Optional)
        if (tags['59']) {
          data.merchantName = tags['59'];
        }

        // Tag 62: Additional Data Field Template
        if (tags['62']) {
          const subTags62 = this.parseTags(tags['62']);
          // Sub-tag 08: Purpose of Transaction
          if (subTags62['08']) {
            data.content = subTags62['08'];
          }
        }
      } else {
        // Generic QR code - use whole string as content
        data.content = qrString;
      }
    } catch (error) {
      console.error('Error parsing QR content:', error);
      // Still valid as a scan result even if deep parsing failed
      data.isValid = !!qrString;
    }

    return data;
  }

  /**
   * Generic EMVCo tag parser
   * Format: [Tag(2)][Length(2)][Value(Length)]
   */
  private parseTags(content: string): { [key: string]: string } {
    const tags: { [key: string]: string } = {};
    let offset = 0;

    while (offset < content.length - 4) {
      const tag = content.substring(offset, offset + 2);
      const length = parseInt(content.substring(offset + 2, offset + 4));
      const value = content.substring(offset + 4, offset + 4 + length);
      
      tags[tag] = value;
      offset += 4 + length;
    }

    return tags;
  }

  /**
   * Scan QR Code from an image file using jsQR (more stable than BarcodeDetector)
   */
  async scanImage(file: File): Promise<VietQrData> {
    try {
      // 1. Convert File to ImageBitmap
      const bitmap = await createImageBitmap(file);
      
      // 2. Extract ImageData using Canvas
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // 3. Scan with jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        return this.parse(code.data);
      } else {
        // Try falling back to native BarcodeDetector if available
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          const results = await barcodeDetector.detect(bitmap);
          if (results && results.length > 0) {
            return this.parse(results[0].rawValue);
          }
        }
      }
      
      return { isValid: false, rawString: '' };
    } catch (error) {
      console.error('Error scanning QR image:', error);
      return { isValid: false, rawString: '' };
    }
  }
}

