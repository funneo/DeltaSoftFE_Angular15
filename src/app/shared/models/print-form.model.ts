export interface PrintForm {
  id?: number;
  type?: number | null;
  name?: string;
  size?: string;
  content?: string;
  notes?: string;
  status?:boolean;
  checked?: boolean;
}
