export interface DbsShipmentListAttachFiles {
  id?:number;
  ediReference?: string;
  title?: string;
  fileName?: string;
  size?: number;
  pathFile?: string;
  isPod?: boolean;
  createdBy?:string;
  createdDate?:Date | string;
  createdByName?:string;
}
