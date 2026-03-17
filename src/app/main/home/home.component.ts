import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Branch, PrintForm, ReportViewModel, ResponseValue } from '@app/shared/models';
import { AuthService, BranchService, NotificationService, ReportsService, UtilityService } from '@app/shared/services';
import { PrintFormService } from '@app/shared/services/print-form.service';
import { Chart, ChartDataset, ChartOptions, ChartType } from 'chart.js';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Subscription, Observable } from 'rxjs';

Chart.register(ChartDataLabels);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  listBranchs: Branch[];
  listType = [
    { id: 1, text: 'Theo tháng' },
    { id: 2, text: 'Theo tuần' },
    { id: 3, text: 'Theo Ngày' },
  ]
  listNam = UtilityService.ListNam();
  listDatas: ReportViewModel[];
  _branchId: number;
  _year: number = new Date().getFullYear();
  _type = 2;
  _quyen = 3;
  busy: Subscription;
  barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        position: 'top',
        text: '',
        display: true
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        display: 'true',
        rotation: -90,
        formatter: function (value) {
          return Math.round(value);
        },
        font: {
          size: 12,
          weight: 'normal',
        }
      }
    },
    scales: {
      x: {},
      y: {
        beginAtZero: true
      }
    },
  };
  public barChartLabels: string[] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [ChartDataLabels];
  public barChartData: ChartDataset[] = [];


  constructor(private branchService: BranchService, private reportsService: ReportsService, authService: AuthService, private notificationService: NotificationService,
    private printFormService: PrintFormService, private http: HttpClient) {
    let user = authService.getLoggedInUser();

    this._branchId = Number.parseInt(user.branchId);
    this._quyen = Number.parseInt(user.authorisationLevel);
    this.getSetting().subscribe(res => {
      if (res) {
        localStorage.removeItem(SystemContstants.APPSETTING)
        localStorage.setItem(SystemContstants.APPSETTING, JSON.stringify(res.list));

        // Lấy mặc định số bản ghi/trang
        if (res.list != null) {
          let list: any[] = res.list;
          let i = list?.findIndex(x => x.id == 'PAGESIZE');
          if (i != -1) {
            SystemContstants.PAGESIZE = list[i].value;
          }
        }
      }
    });
  }

  ngOnInit(): void {
    if (this._quyen == 0)
      this._branchId = null;
    this.loadBranch();
    this.loadData();
    this.loadMauIn();
  }

  loadBranch(): void {
    this.busy = this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranchs = res.data;
    });
  }

  loadMauIn() {
    this.busy = this.printFormService.getAll().subscribe((res: ResponseValue<PrintForm[]>) => {
      localStorage.removeItem(SystemContstants.LISTMAUIN)
      localStorage.setItem(SystemContstants.LISTMAUIN, JSON.stringify(res.data));
    });
  }

  getSetting(): Observable<any> {
    return this.http.get("./assets/data/appsetting.json");
  }

  timKiem(): void {
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('branchId', this._branchId == null ? '' : this._branchId.toString())
      .set('type', this._type == null ? '1' : this._type.toString())
      .set('year', this._year == null ? '' : this._year.toString());
    this.busy = this.reportsService.count(params).subscribe((res: ResponseValue<ReportViewModel[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDatas = res.data;
        let item1: number[] = [];
        let item2: number[] = [];
        let item3: number[] = [];
        let item4: number[] = [];
        let item5: number[] = [];
        let item6: number[] = [];
        this.barChartData = [];
        this.barChartLabels = [];


        this.listDatas.filter(x => x.type == 'Job').forEach(z => {
          item1.push(z.n);
          this.barChartLabels.push(z.name);
        });
        this.listDatas.filter(x => x.type == 'Deb').forEach(z => {
          item2.push(z.n);
        });
        this.listDatas.filter(x => x.type == 'Adv').forEach(z => {
          item3.push(z.n);
        });
        this.listDatas.filter(x => x.type == 'Pay').forEach(z => {
          item4.push(z.n);
        });
        this.listDatas.filter(x => x.type == 'Wof').forEach(z => {
          item5.push(z.n);
        });
        this.listDatas.filter(x => x.type == 'Tru').forEach(z => {
          item6.push(z.n);
        });
        this.barChartData = [
          { data: item1, label: '#Lô hàng', backgroundColor: 'rgba(29, 177, 111, 0.7)' },
          { data: item5, label: '#Công việc', backgroundColor: 'rgba(34, 30, 136, 0.67)' },
          { data: item6, label: '#Lệnh VC', backgroundColor: 'rgba(253, 68, 13, 0.83)' },
          { data: item2, label: '#Debit', backgroundColor: 'rgba(51, 151, 229, 0.8)' },
          { data: item3, label: '#Tạm ứng', backgroundColor: 'rgba(247, 223, 63, 0.8)' },
          { data: item4, label: '#Thanh toán', backgroundColor: 'rgba(13, 90, 117, 0.89)' },
        ];
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
      }
    });
  }

  markerDragEnd(m: any, $event: any) {
    console.log('dragEnd', m, $event);
  }

  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`)
  }

  mapClicked(event: any) {
    console.log(event);

    // this.markers.push({
    //   lat: $event.coords.lat,
    //   lng: $event.coords.lng,
    //   draggable: true
    // });
  }

}
