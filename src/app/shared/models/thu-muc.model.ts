export default interface ThuMuc {
    id?: number;
    idThuMucCha?: number;
    tenThuMuc?: string;
    ghiChu?: string;
    expanded?: boolean;
    checked?: boolean;
    children?: ThuMuc[];
}