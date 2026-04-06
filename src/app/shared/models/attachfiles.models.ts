export interface Attachfiles {
    id?: number;
    title?: string;
    fileName?: string;
    functionName?: string;
    frmName?: string;
    refNo?: string;
    attachFileTypeId?: number;
    userId?: string;
    initialTime?: Date | string;
    branchId?: number;
    jobId?: string;
    size?: number;
    pathFile?: string;
    type?: string;
    attachFileTypeName?: string;
    userName?: string;
    fullName?: string;
    readOnly?: boolean;
    checked?:boolean;
    listFiles?:File[];
    createdDate?:Date;
}
