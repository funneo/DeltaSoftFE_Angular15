import Action from "./action.model";

export default interface Functions {
  id?: string;
  name?: string;
  url?: string;
  parentId?: string;
  cssClass?: string;
  checked?: boolean;
  children?: Functions[];
  actions?: Action[],
  sortOrder?: number;
  isMenu?: boolean;
  status?: boolean;
  nameClass?: string;

  expanded?: boolean;
  level?: number;
  isChildren?: boolean;
  parentExpanded?: boolean;
}
