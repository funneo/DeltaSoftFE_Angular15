import { Component, Input, OnInit } from '@angular/core';
import { Workflow } from '@app/shared/models';

@Component({
  selector: 'print-delivery-op-page',
  templateUrl: './delivery-op-page.component.html',
  styleUrls: ['./delivery-op-page.component.css']
})
export class PrintDeliveryOpPageComponent implements OnInit {

  datenow:Date;
  
  @Input() item: Workflow;

  constructor() { }

  ngOnInit(): void {
    this.datenow=new Date();
    this.item.placeOfLoading="JAPAN";
  }

}
