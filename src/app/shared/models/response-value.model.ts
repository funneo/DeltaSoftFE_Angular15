export interface ResponseValue<T> {
  code?: string;
  message?: string;
  data?: T;
}
