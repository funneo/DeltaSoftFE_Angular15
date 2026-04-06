import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-confirm-deny-closing-fcl',
  templateUrl: './modal-confirm-deny-closing-fcl.component.html',
  styleUrls: ['./modal-confirm-deny-closing-fcl.component.css']
})
export class ModalConfirmDenyClosingFclComponent implements OnInit {
  valueReturn?:number;
  feedback?:string;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalConfirm', { static: false }) modalConfirm: ModalDirective;
  constructor(

  ) { }


  ngOnInit(): void {
  }

  edit(){
    this.feedback="";
    this.valueReturn=0;
    this.modalConfirm.show();
  }

  click(value:number){
    this.valueReturn=value;
    if(this.feedback?.length<1)return;
      let data:any={
        valueReturn:this.valueReturn,
        feedback:this.feedback
      }
      this.SaveSuccess.emit(data);
      this.modalConfirm.hide();
  }
}
