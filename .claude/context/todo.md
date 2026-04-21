# Pending / In-Progress Work

## Transport Order — SQL (bạn tự chạy trên SQL Server)

Script đầy đủ đã được soạn sẵn trong session. Thứ tự chạy:

1. **ALTER TABLE** `Tbl_TransportOrder_Segments` — thêm `StartLocationType TINYINT NOT NULL DEFAULT 1`, `EndLocationType TINYINT NOT NULL DEFAULT 1`, `RoutePolyline NVARCHAR(MAX) NULL`
2. **CREATE TABLE** `Tbl_TransportOrder_Segment_Waypoints` (Id, SegmentId FK, OrderIndex, Lat, Lng, Name, DistanceM)
3. **DROP** `SP_TransportOrder_Create` + `SP_TransportOrder_Update`
4. **DROP TYPE** `TypeTransportOrderSegment` → **CREATE lại** với 3 cột mới
5. **CREATE TYPE** `TypeTransportOrderSegmentWaypoint` (mới hoàn toàn)
6. **CREATE** `SP_TransportOrder_Create` — thêm `@ListSegmentWaypoints`, INSERT segments với cột mới, INSERT waypoints qua SegMap
7. **CREATE** `SP_TransportOrder_Update` — thêm `@ListSegmentWaypoints`, xóa waypoints trước khi xóa segments, INSERT lại
8. **ALTER** `SP_TransportOrder_GetById` — thêm Result 4 (waypoints); Fees → Result 5; Details → Result 6
9. **CREATE SP** `SP_GetAllLocations` — UNION ALL CustomerLocations + Ports với locationType, filter `@ListCust varchar(100) = NULL`

## Transport Order — FE còn TODO
- `onAttachFileChanged()` — upload ảnh hiện trường là stub, cần S3 logic

## Backend — SQL còn lại (không liên quan transport order)
- `SP_CustomerLocations_UpdateGeocode (@Id int, @Latitude decimal(10,6), @Longtitude decimal(10,6))`
- `SP_Ports_UpdateGeocode (@Code varchar, @Latitude decimal(9,6), @Longtitude decimal(9,6))`
- Các SP getBy* của ShippingTask: JOIN thêm `PickupLatitude`, `PickupLongitude`, `DeliveryLatitude`, `DeliveryLongitude` từ bảng CustomerLocations

## Other Known Pending
- Claude AI controller — endpoint exists, không có frontend
- `appsettings.json` ClaudeApiKey còn trống
