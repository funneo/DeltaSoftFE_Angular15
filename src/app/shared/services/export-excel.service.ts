import { UtilityService } from "./utility.service";
import { DatePipe } from "@angular/common";
import { Injectable } from "@angular/core";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

@Injectable({
  providedIn: "root",
})
export class ExportService {
  constructor(private _utilService: UtilityService) {}

  fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  fileExtension = ".xlsx";

  public exportExcel(jsonData: any[], fileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const wb: XLSX.WorkBook = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer: any = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });
    this.saveExcelFile(excelBuffer, fileName);
  }

  private saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: this.fileType });
    FileSaver.saveAs(data, fileName + this.fileExtension);
  }

  //Không tính tổng
  async exportMisa(data: any[]): Promise<void> {
    try {
      // Đọc file mẫu từ thư mục assets/templates
      const response = await fetch("assets/templates/MisaTemplate.xlsx");
      const arrayBuffer = await response.arrayBuffer();

      // Load workbook từ file mẫu
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets["Sheet1"]; // Chọn sheet cần điền dữ liệu

      // Bắt đầu từ dòng 4
      const startRow = 4;
      const columnMapping: { [key: string]: string } = {
        K: "customerCode",
        AY: "customerCode",
        F: "debitNo",
        D: "accountingDate",
        X: "maPhi",
        y: "tenPhi",
        AD: "unit",
        AE: "quantity",
        AF: "price",
        AG: "soTien",
        AO: "vat",
        V: "tienTe",
        I: "soHoaDonDelta",
        E: "ngayHoaDon",
        J: "ngayHoaDon",
        AB: "debitAccount",
        AC: "creditAccount",
        Q: "ghiChu",
        R: "employeeCode",
        S: "employeeName",
        AN: "rVat",
        BA:'debitBranch'
      };
      // Ghi dữ liệu vào worksheet
      for (const [index, item] of data.entries()) {
        const row = startRow + index;
        for (const [column, key] of Object.entries(columnMapping)) {
          worksheet[`${column}${row}`] = {
            v: item[key] ?? (typeof item[key] === "number" ? 0 : ""),
          };
        }
      }

      // Cập nhật lại phạm vi dữ liệu để tránh lỗi chỉ ghi 10 dòng
      const lastRow = startRow + data.length + 20;
      worksheet["!ref"] = `A1:ZZ${lastRow}`; // Chỉnh lại phạm vi dữ liệu

      // Xuất file Excel
      const exportFileName = `ChiTietDebitNoteMisa-${new Date()
        .toISOString()
        .replace(/[-T:.Z]/g, "")}.xlsx`;
      XLSX.writeFileXLSX(workbook, exportFileName);
    } catch (error) {
      console.error("Lỗi khi xuất Excel từ template: ", error);
    }
  }

  //Tính tổng
  public async exportMisaTotal(data: any[]): Promise<void> {
    try {
      // ✅ BƯỚC 1: Nhóm dữ liệu theo mã phí, số hóa đơn delta và ngày hóa đơn
      const groupedData = data.reduce((acc, item) => {
        const key = `${item.maPhi}-${item.soHoaDonDelta}-${item.ngayHoaDon}`;

        if (!acc[key]) {
          acc[key] = {
            ...item, // Sao chép tất cả thông tin của item
            soTien: 0,
            vat: 0,
            tongTien: 0,
          };
        }

        // ✅ Cộng dồn giá trị số học
        acc[key].soTien += item.soTien || 0;
        acc[key].vat += item.vat || 0;
        acc[key].tongTien += item.tongTien || 0;

        return acc;
      }, {} as Record<string, any>);

      // ✅ Chuyển đổi đối tượng thành mảng
      const aggregatedData = Object.values(groupedData);

      // ✅ BƯỚC 2: Đọc file mẫu từ thư mục assets/templates
      const response = await fetch("assets/templates/MisaTemplate.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets["Sheet1"]; // Chọn sheet cần điền dữ liệu

      // ✅ BƯỚC 3: Xác định cột và map dữ liệu
      const startRow = 4;
      const columnMapping: { [key: string]: string } = {
        K: "customerCode",
        AY: "customerCode",
        F: "debitNo",
        D: "accountingDate",
        X: "maPhi",
        y: "tenPhi",
        AD: "unit",
        AE: "quantity",
        AF: "price",
        AG: "soTien",
        AO: "vat",
        V: "tienTe",
        I: "soHoaDonDelta",
        E: "ngayHoaDon",
        J: "ngayHoaDon",
        AB: "debitAccount",
        AC: "creditAccount",
        Q: "ghiChu",
        R: "employeeCode",
        S: "employeeName",
        AN: "rVat",
        BA:'debitBranch'
      };

      // ✅ Ghi dữ liệu vào worksheet
      aggregatedData.forEach((item, index) => {
        const row = startRow + index;
        for (const [column, key] of Object.entries(columnMapping)) {
            worksheet[`${column}${row}`] = {
              v: item[key] ?? (typeof item[key] === "number" ? 0 : ""),
            };
          }
      });

      // ✅ Cập nhật phạm vi dữ liệu để tránh lỗi chỉ ghi 10 dòng
      const lastRow = startRow + aggregatedData.length + 20;
      worksheet["!ref"] = `A1:ZZ${lastRow}`; // Chỉnh lại phạm vi dữ liệu

      // ✅ BƯỚC 4: Xuất file Excel
      const exportFileName = `ChiTietDebitNoteMisa-${new Date()
        .toISOString()
        .replace(/[-T:.Z]/g, "")}.xlsx`;
      XLSX.writeFileXLSX(workbook, exportFileName);
    } catch (error) {
      console.error("Lỗi khi xuất Excel từ template: ", error);
    }
  }
}
