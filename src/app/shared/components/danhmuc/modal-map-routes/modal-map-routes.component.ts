import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NotificationService, OpenSourceMapService } from '@app/shared/services';
import { ResponseValue } from '@app/shared/models';

@Component({
  selector: 'modal-map-routes',
  templateUrl: './modal-map-routes.component.html',
  styleUrls: ['./modal-map-routes.component.css']
})
export class ModalMapRoutesComponent {
  @ViewChild('modalRoutes', { static: false }) modalRoutes: ModalDirective;
  @Output() RouteSelected: EventEmitter<any> = new EventEmitter();

  public lstRoutes: any[] = [];
  public flagGettingRoutes: boolean = false;
  public expandedRouteIndex: number | null = null;
  public isGoogleSource: boolean = true; 
  public googleRoutesCopy: any[] = []; 

  public get math() {
    return Math;
  }

  public originLat: number;
  public originLng: number;
  public destLat: number;
  public destLng: number;
  public mapIframeUrl: SafeResourceUrl;

  constructor(
    private openSourceService: OpenSourceMapService, 
    private _notificationService: NotificationService,
    private sanitizer: DomSanitizer
  ) {}

  show(lat: number, lng: number, destLat: number, destLng: number) {
    this.flagGettingRoutes = true;
    this.lstRoutes = [];
    this.expandedRouteIndex = null;
    this.originLat = lat;
    this.originLng = lng;
    this.destLat = destLat;
    this.destLng = destLng;
    this.mapIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://maps.google.com/maps?saddr=${lat},${lng}&daddr=${destLat},${destLng}&output=embed`);
    this.modalRoutes.show();

    // Gọi Backend C# để proxy request sang OSRM (Tránh lỗi CORS/Firewall trình duyệt)
    this.openSourceService.getRoutesOSRM(lat, lng, destLat, destLng).subscribe((res: ResponseValue<any>) => {
      this.flagGettingRoutes = false;
      this.isGoogleSource = false;
      // Giả định backend C# trả về dữ liệu OSRM (mảng routes) vào res.data
      if ((res.code === '200' || res.code === '201') && res.data && res.data.length > 0) {
         // Nếu C# trả về nguyên cục JSON của OSRM thì res.data.routes sẽ chứa lịch trình
         this.lstRoutes = res.data.routes || res.data;
      } else {
         let errMsg = res.message || "Không tìm thấy lộ trình (OSRM)!";
         this._notificationService.printErrorMessage("Lỗi: " + errMsg);
         this.modalRoutes.hide();
      }
    }, (err: any) => {
       console.error("OSRM Backend Proxy Error:", err);
       this.flagGettingRoutes = false;
       this._notificationService.printErrorMessage("Kết nối API C# OpenSourceMap thất bại! Vui lòng kiểm tra lại dịch vụ Backend.");
       this.modalRoutes.hide();
    });
  }

  // Hàm dự phòng lưu lại cách gọi cho Google sau này (có api key hợp pháp)
  showGoogle(originalGoogleResponse: any[], lat: number, lng: number, destLat: number, destLng: number) {
      this.flagGettingRoutes = false;
      this.isGoogleSource = true;
      this.lstRoutes = originalGoogleResponse || [];
      this.expandedRouteIndex = null;
      this.mapIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://maps.google.com/maps?saddr=${lat},${lng}&daddr=${destLat},${destLng}&output=embed`);
      this.modalRoutes.show();
  }

  toggleRoute(index: number, event: Event) {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'button' || target.closest('button')) {
      return;
    }
    if (this.expandedRouteIndex === index) {
      this.expandedRouteIndex = null;
    } else {
      this.expandedRouteIndex = index;
    }
  }

  getRouteSteps(route: any): any[] {
    if (!route) return [];

    if (!this.isGoogleSource) {
       // OSRM Format
       if (route.legs && route.legs.length > 0 && route.legs[0].steps) {
          return route.legs[0].steps.map((step: any) => {
             // Dịch và format lại các bước đi của OSRM
             let modifier = step.maneuver?.modifier ? step.maneuver.modifier.replace('left', 'trái').replace('right', 'phải').replace('straight', 'thẳng') : '';
             let type = step.maneuver?.type ? step.maneuver.type.replace('turn', 'Rẽ').replace('depart', 'Xuất phát').replace('arrive', 'Đến đích').replace('continue', 'Tiếp tục') : '';
             let inst = `${type} ${modifier} ${step.name ? 'vào ' + step.name : ''}`.trim();
             
             let dist = step.distance >= 1000 ? (step.distance/1000).toFixed(1) + ' km' : Math.round(step.distance || 0) + ' m';
             return { instructions: inst, distance: dist };
          });
       }
    } else {
        // Lưu cho Google Format
        if (route.legs && route.legs.length > 0 && route.legs[0].steps) {
            return route.legs[0].steps.map((step: any) => {
                let inst = '';
                if (step.navigationInstruction && step.navigationInstruction.instructions) {
                    inst = step.navigationInstruction.instructions;
                } else if (step.htmlInstructions) {
                    inst = step.htmlInstructions;
                } else if (step.html_instructions) {
                    inst = step.html_instructions;
                }
                let dist = step.distanceText || (step.distanceMeters ? (step.distanceMeters >= 1000 ? (step.distanceMeters / 1000).toFixed(1) + ' km' : step.distanceMeters + ' m') : '');
                if (!dist && step.distance?.text) dist = step.distance.text;
                return { instructions: inst, distance: dist };
            });
        }
        if (route.steps && route.steps.length > 0) {
            return route.steps.map((step: any) => ({
                instructions: step.html_instructions || step.htmlInstructions || step.instructions || '',
                distance: step.distance?.text || step.distanceText || ''
            }));
        }
    }
    return [];
  }

  selectRoute(route: any) {
    let km = 0;
    let sum = 'Lộ trình OSRM';
    if (!this.isGoogleSource) {
       km = route.distance ? Math.round(route.distance / 1000) : 0;
    } else {
       sum = route.summary;
       if (route && route.distanceValue) {
          km = Math.round(route.distanceValue / 1000);
       } else if (route && route.distanceText) {
          km = Math.round(parseFloat(route.distanceText?.replace(/[^\d.,]/g, '')?.replace(',','.')));
       }
    }
    this.RouteSelected.emit({ summary: sum, km: km });
    this.modalRoutes.hide();
  }
}
