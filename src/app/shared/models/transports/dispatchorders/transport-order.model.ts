import { ShippingTask } from "@app/shared/models/transports/shipping-task.model";

export interface TransportOrder {
    id?: number;
    refNo?: string;
    branchId?: number;
    shortWay?:boolean;
    shippingUnitId?: number;
    shippingUnitCode?: string;
    shippingUnitName?: string;
    referCode?: string;
    isSubcontractors?: boolean;
    vehicleId?: number;
    vehiclelLicensePlates?: string;
    vehicleType?: number;
    vehicleTypeCharge?: number;
    moocId?: number;
    moocLicensePlates?: string;
    driverId?: number;
    driverName?: string;
    driverTel?: string;
    secondDriverId?: number;
    secondDriverName?: string;
    secondDriverTel?: string;
    fuelDriverId?: number;
    weight?: number;
    volume?: number;
    contType?: string;
    fullRoute?: string;
    oilPrice?: number;
    oilCompensation?: number;
    reasonOilCompensation?: string;
    subcontractorsQuoteCode?: string;
    subcontractorsQuoteRouteCode?: string;
    subcontractorsPurchaseCost?: number;
    subcontractorsPurchaseVat?: number;
    dispatchSummarize?: string;
    inquiryTimeToTheFactory?: string;
    inquiryTimeToThePorts?: string;
    contactInformation?: string;
    note?: string;
    startVehicleOdor?: number;
    startEupOdor?: number;
    finishVehicleOdor?: number;
    finishEupOdor?: number;
    gradeSubcontractors?: number;
    evaluationSubcontractors?: string;
    gradeDriver?: number;
    evaluationDriver?: string;
    startedDate?: Date;
    finished?: boolean;
    noteFinished?: string;
    finishedDate?: Date;
    status?: number;
    isDeny?: boolean;
    feedback?:string;
    createdDate?: string;
    createdBy?: string;
    createdByName?: string;
    closingBy?: string;
    closingDate?: string;
    updatedBy?: string;
    updatedDate?: string;
    deleted?: boolean;
    isFuelApproval?: boolean;
    isRePaymentEtc?: boolean;
    isEmployeeDebitClosing?: boolean;

    // Computed totals
    tongKm?:number;
    tongdau?: number;
    chiphidau?: number;
    isSummarized?: boolean;
    accountingDate?: string;

    // Child Collections
    listFee?: TransportOrderFee[];
    listDetailed?: TransportOrderDetail[];
    segments?: TransportOrderSegment[];

    // UI Helper properties (from FCL)
    checked?:boolean;
    rStatus?:string;
    containerNumbers?: string;
    locations?: string;
    containerList?: string[];
    locationList?: string[];
    hawB_HBL?: string;
    mawB_MBL?: string;
    bookingNo?: string;
}

export interface TransportOrderDetail {
    id?: number;
    transportOrderId?: number;
    shippingTaskId?: number;
    shippingTaskItem?: ShippingTask;
    // Flat fields từ SP_TransportOrder_GetById (khi edit)
    customerCode?: string;
    customerName?: string;
    jobId?: string;
    contType?: string;
    containerNumber?: string;
    sealNumber?: string;
    referCode?: string;
    pickupLocation?: string;
    deliveryLocation?: string;
    pickupTime?: string;
    portOfLiftingName?: string;
    portOfLiftOffName?: string;
}

export interface UnifiedLocation {
    id: number;
    locationType: number; // 1=CustomerLocation, 2=Port
    address: string;
    googleLocations?: string;
    latitude: number;
    longtitude: number;
}

export interface TransportOrderSegment {
    id?: number;
    transportOrderId?: number;
    orderIndex?: number;
    startLocationId?: number;
    startLocationType?: number; // 1=CustomerLocation, 2=Port
    startLocationName?: string;
    startLat?: number;
    startLng?: number;
    endLocationId?: number;
    endLocationType?: number; // 1=CustomerLocation, 2=Port
    endLocationName?: string;
    endLat?: number;
    endLng?: number;
    distanceKm?: number;
    payloadWeight?: number;
    fuelNorm?: number;
    fuelAmountCalculated?: number;
    etcCost?: number;
    // Full polyline GeoJSON coordinates [[lng,lat],...] để vẽ đường mượt
    routePolyline?: string;

    // Trạm phí từ Vietmap (id thật + allPrices 5 loại xe)
    listStations?: SegmentStation[];
    // Turn-by-turn steps (để hiển thị & sync Google Maps)
    listWaypoints?: TransportOrderSegmentWaypoint[];
    // Filled by GetSegmentHistory only
    waypointsJson?: string;
    isDefault?: boolean;
    note?: string;
}

export interface RouteSegmentDefault {
    startLocationId?: number;
    startLocationType?: number;
    endLocationId?: number;
    endLocationType?: number;
    distanceKm?: number;
    fuelNorm?: number;
    fuelAmountCalculated?: number;
    etcCost?: number;
    routePolyline?: string;
    waypointsJson?: string;
    listStations?: SegmentStation[];
}

export interface TransportOrderSegmentWaypoint {
    id?: number;
    segmentId?: number;
    orderIndex?: number;
    lat: number;
    lng: number;
    name?: string;    // Tên đường / chỉ dẫn: "Rẽ phải QL.10"
    distanceM?: number; // Khoảng cách đến điểm tiếp theo (mét)
}

export interface SegmentStation {
    vietmapId?: number;    // id trạm từ Vietmap API (77, 168, ...)
    stationName?: string;
    price?: number;        // giá áp dụng theo loại xe của lệnh
    allPrices?: string;    // JSON: {"1":216000,"2":309000,"3":412000,"4":659000,"5":849000}
    isAvoided?: boolean;
}

export interface TransportOrderSegmentEtc {
    id?: number;
    segmentId?: number;
    stationId?: string; // Tương ứng mã trạm thu phí (VD: lấy từ VietMap)
    stationName?: string;
    price?: number;
    note?: string; // Điều vận có thể note thêm
    isAvoided?: boolean; // Lái xe trốn trạm
}

export interface TransportOrderFee {
    id?: number;
    refNo?: string;
    transportOrderId?: number;
    feeId?: number;
    feeCode?: string;
    feeName?: string;
    quantity?: number;
    contentsId?: number;
    contents?: string;
    cost?: number;
    vat?: number;
    totalCost?: number;
    note?: string;
    checked?: boolean;
    type?: number;
}
