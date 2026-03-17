import { Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appResizableColumn]'
})
export class ResizableColumnDirective implements OnDestroy {
  private startX: number;
  private startWidth: number;
  private column: HTMLElement;
  private table: HTMLElement;
  private resizer: HTMLElement;

  private documentMouseMove: () => void;
  private documentMouseUp: () => void;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.column = this.el.nativeElement;
    this.table = this.column.closest('table');
    this.resizer = this.renderer.createElement('div');
    this.renderer.addClass(this.resizer, 'resizer');
    this.renderer.appendChild(this.column, this.resizer);

    this.renderer.listen(this.resizer, 'mousedown', this.onMouseDown);
  }

  onMouseDown = (event: MouseEvent) => {
    this.startX = event.pageX;
    this.startWidth = this.column.offsetWidth;
    event.preventDefault();
    this.renderer.addClass(this.table, 'resizing');

    this.documentMouseMove = this.renderer.listen('document', 'mousemove', this.onMouseMove);
    this.documentMouseUp = this.renderer.listen('document', 'mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent) => {
    const diff = event.pageX - this.startX;
    this.renderer.setStyle(this.column, 'width', `${this.startWidth + diff}px`);
  }

  onMouseUp = () => {
    this.renderer.removeClass(this.table, 'resizing');
    this.documentMouseMove();
    this.documentMouseUp();
  }

  ngOnDestroy() {
    if (this.documentMouseMove) {
      this.documentMouseMove();
    }
    if (this.documentMouseUp) {
      this.documentMouseUp();
    }
  }
}