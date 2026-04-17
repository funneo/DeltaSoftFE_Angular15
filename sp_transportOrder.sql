USE [DELTASOFT]
GO

-- ============================================================
-- TYPE: TypeTransportOrderSegment
-- ============================================================
IF TYPE_ID(N'TypeTransportOrderSegment') IS NOT NULL
    DROP TYPE [dbo].[TypeTransportOrderSegment];
GO
CREATE TYPE [dbo].[TypeTransportOrderSegment] AS TABLE (
    [Id]                 INT              NULL,
    [OrderIndex]         INT              NULL,
    [StartLocationId]    INT              NULL,
    [StartLocationName]  NVARCHAR(250)    NULL,
    [StartLat]           FLOAT            NULL,
    [StartLng]           FLOAT            NULL,
    [EndLocationId]      INT              NULL,
    [EndLocationName]    NVARCHAR(250)    NULL,
    [EndLat]             FLOAT            NULL,
    [EndLng]             FLOAT            NULL,
    [DistanceKm]         FLOAT            NULL,
    [PayloadWeight]      FLOAT            NULL,
    [FuelNorm]           FLOAT            NULL,
    [FuelAmountCalculated] FLOAT          NULL,
    [ETCCost]            FLOAT            NULL
);
GO

-- ============================================================
-- TYPE: TypeTransportOrderSegmentEtc
-- ============================================================
IF TYPE_ID(N'TypeTransportOrderSegmentEtc') IS NOT NULL
    DROP TYPE [dbo].[TypeTransportOrderSegmentEtc];
GO
CREATE TYPE [dbo].[TypeTransportOrderSegmentEtc] AS TABLE (
    [Id]           INT             NULL,
    [SegmentIndex] INT             NULL,  -- dùng để map với OrderIndex của Segment
    [StationId]    NVARCHAR(100)   NULL,
    [StationName]  NVARCHAR(250)   NULL,
    [Price]        FLOAT           NULL,
    [Note]         NVARCHAR(MAX)   NULL
);
GO

-- ============================================================
-- TYPE: TypeTransportOrderDetail
-- ============================================================
IF TYPE_ID(N'TypeTransportOrderDetail') IS NOT NULL
    DROP TYPE [dbo].[TypeTransportOrderDetail];
GO
CREATE TYPE [dbo].[TypeTransportOrderDetail] AS TABLE (
    [Id]            INT   NULL,
    [ShippingTaskId] INT  NULL
);
GO

-- ============================================================
-- TYPE: TypeTransportOrderFee
-- ============================================================
IF TYPE_ID(N'TypeTransportOrderFee') IS NOT NULL
    DROP TYPE [dbo].[TypeTransportOrderFee];
GO
CREATE TYPE [dbo].[TypeTransportOrderFee] AS TABLE (
    [Id]         INT             NULL,
    [FeeId]      INT             NULL,
    [FeeCode]    NVARCHAR(50)    NULL,
    [FeeName]    NVARCHAR(250)   NULL,
    [Quantity]   FLOAT           NULL,
    [ContentsId] INT             NULL,
    [Contents]   NVARCHAR(500)   NULL,
    [Cost]       FLOAT           NULL,
    [Vat]        FLOAT           NULL,
    [TotalCost]  FLOAT           NULL,
    [Note]       NVARCHAR(MAX)   NULL,
    [Type]       INT             NULL
);
GO


-- ============================================================
-- SP_TransportOrder_Create
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_TransportOrder_Create]
    @BranchId                    INT              = NULL,
    @ShortWay                    BIT              = 0,
    @ShippingUnitId              INT              = NULL,
    @ShippingUnitCode            NVARCHAR(50)     = NULL,
    @ShippingUnitName            NVARCHAR(250)    = NULL,
    @ReferCode                   NVARCHAR(50)     = NULL,
    @IsSubcontractors            BIT              = NULL,
    @VehicleId                   INT              = NULL,
    @VehicleLicensePlates        NVARCHAR(50)     = NULL,
    @VehicleType                 INT              = NULL,
    @VehicleTypeCharge           FLOAT            = NULL,
    @MoocId                      INT              = NULL,
    @MoocLicensePlates           NVARCHAR(50)     = NULL,
    @DriverId                    INT              = NULL,
    @DriverName                  NVARCHAR(200)    = NULL,
    @DriverTel                   NVARCHAR(50)     = NULL,
    @SecondDriverId              INT              = NULL,
    @SecondDriverName            NVARCHAR(200)    = NULL,
    @SecondDriverTel             NVARCHAR(50)     = NULL,
    @FuelDriverId                INT              = NULL,
    @Weight                      FLOAT            = NULL,
    @Volume                      FLOAT            = NULL,
    @IsExport                    BIT              = NULL,
    @ContType                    NVARCHAR(50)     = NULL,
    @FullRoute                   NVARCHAR(1000)   = NULL,
    @OilPrice                    FLOAT            = NULL,
    @OilCompensation             FLOAT            = 0,
    @ReasonOilCompensation       NVARCHAR(500)    = NULL,
    @LuotdiQuabai                BIT              = 0,
    @LuotveQuabai                BIT              = 0,
    @SubcontractorsQuoteCode     NVARCHAR(50)     = NULL,
    @SubcontractorsQuoteRouteCode NVARCHAR(50)    = NULL,
    @SubcontractorsPurchaseCost  FLOAT            = NULL,
    @SubcontractorsPurchaseVat   FLOAT            = NULL,
    @DispatchSummarize           NVARCHAR(1000)   = NULL,
    @InquiryTimeToTheFactory     DATETIME         = NULL,
    @InquiryTimeToThePorts       DATETIME         = NULL,
    @ContactInformation          NVARCHAR(500)    = NULL,
    @Note                        NVARCHAR(MAX)    = NULL,
    @TongKm                      FLOAT            = NULL,
    @Tongdau                     FLOAT            = NULL,
    @Chiphidau                   FLOAT            = NULL,
    @CreatedBy                   UNIQUEIDENTIFIER,
    @ListSegments                TypeTransportOrderSegment     READONLY,
    @ListSegmentEtcs             TypeTransportOrderSegmentEtc  READONLY,
    @ListDetails                 TypeTransportOrderDetail      READONLY,
    @ListFees                    TypeTransportOrderFee         READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRAN;
    BEGIN TRY

        -- Kiểm tra ShippingTask đã tồn tại trong lệnh khác chưa
        IF EXISTS (
            SELECT 1
            FROM Tbl_TransportOrders t
            INNER JOIN Tbl_TransportOrder_Details d ON t.Id = d.TransportOrderId
            WHERE t.Deleted = 0
              AND d.ShippingTaskId IN (SELECT ShippingTaskId FROM @ListDetails)
        )
        BEGIN
            RAISERROR(N'Một hoặc nhiều ShippingTask đã được gán vào lệnh vận chuyển chưa bị xóa.', 16, 1);
            RETURN;
        END

        -------------------------------------------------------
        -- Sinh RefNo: TO-{BranchCode}{yyMMdd}/{xxxx}
        -------------------------------------------------------
        DECLARE @RefNo    NVARCHAR(50),
                @cn       NVARCHAR(10),
                @yyMMdd   NVARCHAR(10) = FORMAT(GETDATE(), 'yyMMdd'),
                @prefix   NVARCHAR(30),
                @nextNum  INT;

        SELECT @cn = BranchCode FROM Branch WHERE Id = @BranchId;

        SET @prefix = 'TO-' + @cn + @yyMMdd + '/';

        SELECT @nextNum = ISNULL(MAX(CAST(RIGHT(RefNo, 4) AS INT)), 0) + 1
        FROM dbo.Tbl_TransportOrders
        WHERE RefNo LIKE @prefix + '%';

        SET @RefNo = @prefix + RIGHT('0000' + CAST(@nextNum AS VARCHAR), 4);

        -------------------------------------------------------
        -- Insert master
        -------------------------------------------------------
        DECLARE @NewId INT;

        INSERT INTO [dbo].[Tbl_TransportOrders] (
            [RefNo], [BranchId], [ShortWay],
            [ShippingUnitId], [ShippingUnitCode], [ShippingUnitName],
            [ReferCode], [IsSubcontractors],
            [VehicleId], [VehicleLicensePlates],
            [VehicleType], [VehicleTypeCharge],
            [MoocId], [MoocLicensePlates],
            [DriverId], [DriverName], [DriverTel],
            [SecondDriverId], [SecondDriverName], [SecondDriverTel],
            [FuelDriverId],
            [Weight], [Volume], [IsExport], [ContType], [FullRoute],
            [OilPrice], [OilCompensation], [ReasonOilCompensation],
            [LuotdiQuabai], [LuotveQuabai],
            [SubcontractorsQuoteCode], [SubcontractorsQuoteRouteCode],
            [SubcontractorsPurchaseCost], [SubcontractorsPurchaseVat],
            [DispatchSummarize],
            [InquiryTimeToTheFactory], [InquiryTimeToThePorts],
            [ContactInformation], [Note],
            [TongKm], [Tongdau], [Chiphidau],
            [Status], [Deleted],
            [IsFuelApproval], [IsRePaymentEtc], [IsEmployeeDebitClosing],
            [IsSummarized],
            [CreatedDate], [CreatedBy]
        )
        VALUES (
            @RefNo, @BranchId, @ShortWay,
            @ShippingUnitId, @ShippingUnitCode, @ShippingUnitName,
            @ReferCode, @IsSubcontractors,
            @VehicleId, @VehicleLicensePlates,
            @VehicleType, @VehicleTypeCharge,
            @MoocId, @MoocLicensePlates,
            @DriverId, @DriverName, @DriverTel,
            @SecondDriverId, @SecondDriverName, @SecondDriverTel,
            @FuelDriverId,
            @Weight, @Volume, @IsExport, @ContType, @FullRoute,
            @OilPrice, @OilCompensation, @ReasonOilCompensation,
            @LuotdiQuabai, @LuotveQuabai,
            @SubcontractorsQuoteCode, @SubcontractorsQuoteRouteCode,
            @SubcontractorsPurchaseCost, @SubcontractorsPurchaseVat,
            @DispatchSummarize,
            @InquiryTimeToTheFactory, @InquiryTimeToThePorts,
            @ContactInformation, @Note,
            @TongKm, @Tongdau, @Chiphidau,
            0, 0,           -- Status = 0 (Khởi tạo), Deleted = 0
            0, 0, 0,        -- IsFuelApproval, IsRePaymentEtc, IsEmployeeDebitClosing
            0,              -- IsSummarized
            GETDATE(), @CreatedBy
        );

        SET @NewId = SCOPE_IDENTITY();

        -------------------------------------------------------
        -- Insert Segments → lấy Id thực để map ETC
        -------------------------------------------------------
        -- Bảng tạm lưu mapping OrderIndex → SegmentId thực
        DECLARE @SegMap TABLE (OrderIndex INT, SegmentId INT);

        INSERT INTO [dbo].[Tbl_TransportOrder_Segments] (
            [TransportOrderId], [OrderIndex],
            [StartLocationId], [StartLocationName], [StartLat], [StartLng],
            [EndLocationId],   [EndLocationName],   [EndLat],   [EndLng],
            [DistanceKm], [PayloadWeight], [FuelNorm], [FuelAmountCalculated], [ETCCost]
        )
        OUTPUT inserted.OrderIndex, inserted.Id INTO @SegMap(OrderIndex, SegmentId)
        SELECT
            @NewId, s.OrderIndex,
            s.StartLocationId, s.StartLocationName, s.StartLat, s.StartLng,
            s.EndLocationId,   s.EndLocationName,   s.EndLat,   s.EndLng,
            s.DistanceKm, s.PayloadWeight, s.FuelNorm, s.FuelAmountCalculated, s.ETCCost
        FROM @ListSegments s;

        -------------------------------------------------------
        -- Insert Segment ETCs (map SegmentIndex → SegmentId thực)
        -------------------------------------------------------
        INSERT INTO [dbo].[Tbl_TransportOrder_Segment_Etcs] (
            [SegmentId], [StationId], [StationName], [Price], [Note]
        )
        SELECT
            sm.SegmentId,
            e.StationId, e.StationName, e.Price, e.Note
        FROM @ListSegmentEtcs e
        INNER JOIN @SegMap sm ON sm.OrderIndex = e.SegmentIndex;

        -------------------------------------------------------
        -- Insert Details (ShippingTask links)
        -------------------------------------------------------
        INSERT INTO [dbo].[Tbl_TransportOrder_Details] ([TransportOrderId], [ShippingTaskId])
        SELECT @NewId, ShippingTaskId
        FROM @ListDetails;

        -------------------------------------------------------
        -- Insert Fees
        -------------------------------------------------------
        INSERT INTO [dbo].[Tbl_TransportOrder_Fees] (
            [TransportOrderId], [FeeId], [FeeCode], [FeeName],
            [Quantity], [ContentsId], [Contents],
            [Cost], [Vat], [TotalCost], [Note], [Type]
        )
        SELECT
            @NewId, FeeId, FeeCode, FeeName,
            Quantity, ContentsId, Contents,
            Cost, Vat, TotalCost, Note, Type
        FROM @ListFees;

        -- Trả về Id vừa tạo
        SELECT @NewId AS NewId;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH;
END
GO


-- ============================================================
-- SP_TransportOrder_Update
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_TransportOrder_Update]
    @Id                          INT,
    @ShortWay                    BIT              = 0,
    @ShippingUnitId              INT              = NULL,
    @ShippingUnitCode            NVARCHAR(50)     = NULL,
    @ShippingUnitName            NVARCHAR(250)    = NULL,
    @ReferCode                   NVARCHAR(50)     = NULL,
    @IsSubcontractors            BIT              = NULL,
    @VehicleId                   INT              = NULL,
    @VehicleLicensePlates        NVARCHAR(50)     = NULL,
    @VehicleType                 INT              = NULL,
    @VehicleTypeCharge           FLOAT            = NULL,
    @MoocId                      INT              = NULL,
    @MoocLicensePlates           NVARCHAR(50)     = NULL,
    @DriverId                    INT              = NULL,
    @DriverName                  NVARCHAR(200)    = NULL,
    @DriverTel                   NVARCHAR(50)     = NULL,
    @SecondDriverId              INT              = NULL,
    @SecondDriverName            NVARCHAR(200)    = NULL,
    @SecondDriverTel             NVARCHAR(50)     = NULL,
    @FuelDriverId                INT              = NULL,
    @Weight                      FLOAT            = NULL,
    @Volume                      FLOAT            = NULL,
    @IsExport                    BIT              = NULL,
    @ContType                    NVARCHAR(50)     = NULL,
    @FullRoute                   NVARCHAR(1000)   = NULL,
    @OilPrice                    FLOAT            = NULL,
    @OilCompensation             FLOAT            = 0,
    @ReasonOilCompensation       NVARCHAR(500)    = NULL,
    @LuotdiQuabai                BIT              = 0,
    @LuotveQuabai                BIT              = 0,
    @SubcontractorsQuoteCode     NVARCHAR(50)     = NULL,
    @SubcontractorsQuoteRouteCode NVARCHAR(50)    = NULL,
    @SubcontractorsPurchaseCost  FLOAT            = NULL,
    @SubcontractorsPurchaseVat   FLOAT            = NULL,
    @DispatchSummarize           NVARCHAR(1000)   = NULL,
    @InquiryTimeToTheFactory     DATETIME         = NULL,
    @InquiryTimeToThePorts       DATETIME         = NULL,
    @ContactInformation          NVARCHAR(500)    = NULL,
    @Note                        NVARCHAR(MAX)    = NULL,
    @TongKm                      FLOAT            = NULL,
    @Tongdau                     FLOAT            = NULL,
    @Chiphidau                   FLOAT            = NULL,
    @UpdatedBy                   UNIQUEIDENTIFIER,
    @ListSegments                TypeTransportOrderSegment     READONLY,
    @ListSegmentEtcs             TypeTransportOrderSegmentEtc  READONLY,
    @ListDetails                 TypeTransportOrderDetail      READONLY,
    @ListFees                    TypeTransportOrderFee         READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRAN;
    BEGIN TRY

        -- Cập nhật master
        UPDATE [dbo].[Tbl_TransportOrders]
        SET
            [ShortWay]                    = @ShortWay,
            [ShippingUnitId]              = @ShippingUnitId,
            [ShippingUnitCode]            = @ShippingUnitCode,
            [ShippingUnitName]            = @ShippingUnitName,
            [ReferCode]                   = @ReferCode,
            [IsSubcontractors]            = @IsSubcontractors,
            [VehicleId]                   = @VehicleId,
            [VehicleLicensePlates]        = @VehicleLicensePlates,
            [VehicleType]                 = @VehicleType,
            [VehicleTypeCharge]           = @VehicleTypeCharge,
            [MoocId]                      = @MoocId,
            [MoocLicensePlates]           = @MoocLicensePlates,
            [DriverId]                    = @DriverId,
            [DriverName]                  = @DriverName,
            [DriverTel]                   = @DriverTel,
            [SecondDriverId]              = @SecondDriverId,
            [SecondDriverName]            = @SecondDriverName,
            [SecondDriverTel]             = @SecondDriverTel,
            [FuelDriverId]                = @FuelDriverId,
            [Weight]                      = @Weight,
            [Volume]                      = @Volume,
            [IsExport]                    = @IsExport,
            [ContType]                    = @ContType,
            [FullRoute]                   = @FullRoute,
            [OilPrice]                    = @OilPrice,
            [OilCompensation]             = @OilCompensation,
            [ReasonOilCompensation]       = @ReasonOilCompensation,
            [LuotdiQuabai]                = @LuotdiQuabai,
            [LuotveQuabai]                = @LuotveQuabai,
            [SubcontractorsQuoteCode]     = @SubcontractorsQuoteCode,
            [SubcontractorsQuoteRouteCode]= @SubcontractorsQuoteRouteCode,
            [SubcontractorsPurchaseCost]  = @SubcontractorsPurchaseCost,
            [SubcontractorsPurchaseVat]   = @SubcontractorsPurchaseVat,
            [DispatchSummarize]           = @DispatchSummarize,
            [InquiryTimeToTheFactory]     = @InquiryTimeToTheFactory,
            [InquiryTimeToThePorts]       = @InquiryTimeToThePorts,
            [ContactInformation]          = @ContactInformation,
            [Note]                        = @Note,
            [TongKm]                      = @TongKm,
            [Tongdau]                     = @Tongdau,
            [Chiphidau]                   = @Chiphidau,
            [UpdatedBy]                   = @UpdatedBy,
            [UpdatedDate]                 = GETDATE()
        WHERE Id = @Id AND Deleted = 0;

        -------------------------------------------------------
        -- Cập nhật Segments: xóa hết → insert lại
        -------------------------------------------------------
        -- Xóa ETC của các segment cũ trước
        DELETE e FROM [dbo].[Tbl_TransportOrder_Segment_Etcs] e
        INNER JOIN [dbo].[Tbl_TransportOrder_Segments] s ON s.Id = e.SegmentId
        WHERE s.TransportOrderId = @Id;

        DELETE FROM [dbo].[Tbl_TransportOrder_Segments] WHERE TransportOrderId = @Id;

        DECLARE @SegMap TABLE (OrderIndex INT, SegmentId INT);

        INSERT INTO [dbo].[Tbl_TransportOrder_Segments] (
            [TransportOrderId], [OrderIndex],
            [StartLocationId], [StartLocationName], [StartLat], [StartLng],
            [EndLocationId],   [EndLocationName],   [EndLat],   [EndLng],
            [DistanceKm], [PayloadWeight], [FuelNorm], [FuelAmountCalculated], [ETCCost]
        )
        OUTPUT inserted.OrderIndex, inserted.Id INTO @SegMap(OrderIndex, SegmentId)
        SELECT
            @Id, s.OrderIndex,
            s.StartLocationId, s.StartLocationName, s.StartLat, s.StartLng,
            s.EndLocationId,   s.EndLocationName,   s.EndLat,   s.EndLng,
            s.DistanceKm, s.PayloadWeight, s.FuelNorm, s.FuelAmountCalculated, s.ETCCost
        FROM @ListSegments s;

        INSERT INTO [dbo].[Tbl_TransportOrder_Segment_Etcs] (
            [SegmentId], [StationId], [StationName], [Price], [Note]
        )
        SELECT
            sm.SegmentId,
            e.StationId, e.StationName, e.Price, e.Note
        FROM @ListSegmentEtcs e
        INNER JOIN @SegMap sm ON sm.OrderIndex = e.SegmentIndex;

        -------------------------------------------------------
        -- Cập nhật Details
        -------------------------------------------------------
        DELETE FROM [dbo].[Tbl_TransportOrder_Details] WHERE TransportOrderId = @Id;
        INSERT INTO [dbo].[Tbl_TransportOrder_Details] ([TransportOrderId], [ShippingTaskId])
        SELECT @Id, ShippingTaskId FROM @ListDetails;

        -------------------------------------------------------
        -- Cập nhật Fees dùng MERGE (giống FCL)
        -------------------------------------------------------
        MERGE INTO [dbo].[Tbl_TransportOrder_Fees] AS Target
        USING @ListFees AS Source
        ON Target.TransportOrderId = @Id AND Target.Id = Source.Id
        WHEN MATCHED THEN
            UPDATE SET
                Target.Quantity   = Source.Quantity,
                Target.Cost       = Source.Cost,
                Target.Vat        = Source.Vat,
                Target.TotalCost  = Source.TotalCost,
                Target.Note       = Source.Note
        WHEN NOT MATCHED BY TARGET THEN
            INSERT ([TransportOrderId], [FeeId], [FeeCode], [FeeName], [Quantity], [ContentsId], [Contents], [Cost], [Vat], [TotalCost], [Note], [Type])
            VALUES (@Id, Source.FeeId, Source.FeeCode, Source.FeeName, Source.Quantity, Source.ContentsId, Source.Contents, Source.Cost, Source.Vat, Source.TotalCost, Source.Note, Source.Type)
        WHEN NOT MATCHED BY SOURCE AND Target.TransportOrderId = @Id THEN
            DELETE;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH;
END
GO


-- ============================================================
-- SP_TransportOrder_Delete (soft delete)
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_TransportOrder_Delete]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        UPDATE [dbo].[Tbl_TransportOrders]
        SET Deleted = 1
        WHERE Id = @Id;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH;
END
GO


-- ============================================================
-- SP_TransportOrder_UpdateStatus
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- SP_TransportOrder_UpdateStatus 1, 1, NULL, NULL, 0
CREATE PROCEDURE [dbo].[SP_TransportOrder_UpdateStatus]
    @Id          INT,
    @Status      INT,
    @UserId      UNIQUEIDENTIFIER = NULL,
    @Feedback    NVARCHAR(500)    = NULL,
    @IsRejection BIT              = 0
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @CurrentStatus INT;
    BEGIN TRANSACTION;
    BEGIN TRY
        SELECT @CurrentStatus = Status
        FROM [dbo].[Tbl_TransportOrders]
        WHERE Id = @Id AND Deleted = 0;

        IF @IsRejection = 1
        BEGIN
            UPDATE [dbo].[Tbl_TransportOrders]
            SET Status = 0, IsDeny = 1, Feedback = @Feedback
            WHERE Id = @Id AND Deleted = 0;
        END
        ELSE
        BEGIN
            IF @CurrentStatus <> @Status
            BEGIN
                UPDATE [dbo].[Tbl_TransportOrders]
                SET Status = @Status, IsDeny = 0, Feedback = N''
                WHERE Id = @Id AND Deleted = 0;
            END
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
        SELECT @ErrorMessage = ERROR_MESSAGE(),
               @ErrorSeverity = ERROR_SEVERITY(),
               @ErrorState = ERROR_STATE();
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END
GO


-- ============================================================
-- SP_TransportOrder_GetAll
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SP_TransportOrder_GetAll]
    @BranchId  INT              = NULL,
    @FromDate  VARCHAR(10),
    @ToDate    VARCHAR(10),
    @Keyword   NVARCHAR(128)   = NULL
WITH RECOMPILE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FromD DATE = TRY_CONVERT(DATE, @FromDate, 112);
    DECLARE @ToD   DATE = TRY_CONVERT(DATE, @ToDate,   112);

    IF (@FromD IS NULL OR @ToD IS NULL)
    BEGIN
        RAISERROR(N'FromDate/ToDate phải theo định dạng yyyymmdd (style 112).', 16, 1);
        RETURN;
    END

    DECLARE @Kw NVARCHAR(128) = NULL;
    IF (@Keyword IS NOT NULL)
    BEGIN
        SET @Kw = LTRIM(RTRIM(@Keyword));
        IF (@Kw = N'') SET @Kw = NULL;
    END

    -- Lọc master trước
    IF OBJECT_ID('tempdb..#TO') IS NOT NULL DROP TABLE #TO;

    SELECT t.*
    INTO #TO
    FROM [dbo].[Tbl_TransportOrders] t
    WHERE t.Deleted = 0
      AND t.CreatedDate >= @FromD
      AND t.CreatedDate <  DATEADD(DAY, 1, @ToD)
      AND (@BranchId IS NULL OR @BranchId = 0 OR t.BranchId = @BranchId);

    CREATE INDEX IX__TO_Id ON #TO(Id DESC);

    -- Aggregate ShippingTask locations
    IF OBJECT_ID('tempdb..#Agg') IS NOT NULL DROP TABLE #Agg;

    SELECT
        d.TransportOrderId,
        Locations = ISNULL(
            STUFF((
                SELECT DISTINCT CHAR(13)+CHAR(10) + N'*- ' + x.Location
                FROM (
                    SELECT st.PickupLocation   AS Location FROM [dbo].[Tbl_TransportOrder_Details] d2
                        INNER JOIN [dbo].[ShippingTask] st ON st.Id = d2.ShippingTaskId
                        WHERE d2.TransportOrderId = d.TransportOrderId
                    UNION
                    SELECT st2.DeliveryLocation AS Location FROM [dbo].[Tbl_TransportOrder_Details] d3
                        INNER JOIN [dbo].[ShippingTask] st2 ON st2.Id = d3.ShippingTaskId
                        WHERE d3.TransportOrderId = d.TransportOrderId
                ) x
                WHERE x.Location IS NOT NULL AND x.Location <> N''
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, N''), N'')
    INTO #Agg
    FROM (SELECT DISTINCT TransportOrderId FROM [dbo].[Tbl_TransportOrder_Details]
          WHERE TransportOrderId IN (SELECT Id FROM #TO)) d
    GROUP BY d.TransportOrderId;

    CREATE INDEX IX__Agg_Id ON #Agg(TransportOrderId);

    -- Query không keyword
    IF (@Kw IS NULL)
    BEGIN
        SELECT
            t.Id, t.RefNo, t.BranchId,
            t.ShippingUnitId, t.ShippingUnitCode, t.ShippingUnitName,
            t.IsSubcontractors,
            t.VehicleId, t.VehicleLicensePlates, t.VehicleType, t.VehicleTypeCharge,
            t.MoocId, t.MoocLicensePlates,
            t.DriverId, t.DriverName, t.DriverTel,
            t.SecondDriverId, t.SecondDriverName, t.SecondDriverTel,
            t.FuelDriverId,
            t.Weight, t.Volume, t.IsExport, t.ContType, t.FullRoute,
            t.OilPrice, t.OilCompensation,
            t.TongKm, t.Tongdau, t.Chiphidau,
            t.Status, t.IsDeny, t.Feedback,
            t.Note, t.DispatchSummarize,
            t.CreatedDate, t.CreatedBy, t.UpdatedDate, t.UpdatedBy,
            t.Deleted, t.IsFuelApproval, t.IsRePaymentEtc,
            t.IsEmployeeDebitClosing, t.IsSummarized, t.AccountingDate,
            b.BranchCode,
            u.EmployeeFullName AS CreatedByName,
            ISNULL(a.Locations, N'') AS Locations,
            CASE
                WHEN t.IsDeny = 1 AND t.Status = 0 THEN N'Từ chối'
                WHEN t.Status = 0 THEN N'Khởi tạo'
                WHEN t.Status = 1 THEN N'Gửi lệnh'
                WHEN t.Status = 2 THEN N'Đã nhận'
                WHEN t.Status = 3 THEN N'Duyệt B1'
                WHEN t.Status = 4 THEN N'Duyệt B2'
                WHEN t.Status = 5 THEN N'Chờ chốt'
                WHEN t.Status = 6 THEN N'ĐÃ CHỐT'
                ELSE N''
            END AS RStatus
        FROM #TO t
        INNER JOIN [dbo].[Branch] b ON b.Id = t.BranchId
        INNER JOIN [dbo].[V_Users] u ON u.Id = t.CreatedBy
        LEFT  JOIN #Agg a ON a.TransportOrderId = t.Id
        ORDER BY t.Id DESC;

        RETURN;
    END

    -- Query có keyword
    SELECT
        t.Id, t.RefNo, t.BranchId,
        t.ShippingUnitId, t.ShippingUnitCode, t.ShippingUnitName,
        t.IsSubcontractors,
        t.VehicleId, t.VehicleLicensePlates, t.VehicleType, t.VehicleTypeCharge,
        t.MoocId, t.MoocLicensePlates,
        t.DriverId, t.DriverName, t.DriverTel,
        t.SecondDriverId, t.SecondDriverName, t.SecondDriverTel,
        t.FuelDriverId,
        t.Weight, t.Volume, t.IsExport, t.ContType, t.FullRoute,
        t.OilPrice, t.OilCompensation,
        t.TongKm, t.Tongdau, t.Chiphidau,
        t.Status, t.IsDeny, t.Feedback,
        t.Note, t.DispatchSummarize,
        t.CreatedDate, t.CreatedBy, t.UpdatedDate, t.UpdatedBy,
        t.Deleted, t.IsFuelApproval, t.IsRePaymentEtc,
        t.IsEmployeeDebitClosing, t.IsSummarized, t.AccountingDate,
        b.BranchCode,
        u.EmployeeFullName AS CreatedByName,
        ISNULL(a.Locations, N'') AS Locations,
        CASE
            WHEN t.IsDeny = 1 AND t.Status = 0 THEN N'Từ chối'
            WHEN t.Status = 0 THEN N'Khởi tạo'
            WHEN t.Status = 1 THEN N'Gửi lệnh'
            WHEN t.Status = 2 THEN N'Đã nhận'
            WHEN t.Status = 3 THEN N'Duyệt B1'
            WHEN t.Status = 4 THEN N'Duyệt B2'
            WHEN t.Status = 5 THEN N'Chờ chốt'
            WHEN t.Status = 6 THEN N'ĐÃ CHỐT'
            ELSE N''
        END AS RStatus
    FROM #TO t
    INNER JOIN [dbo].[Branch] b ON b.Id = t.BranchId
    INNER JOIN [dbo].[V_Users] u ON u.Id = t.CreatedBy
    LEFT  JOIN #Agg a ON a.TransportOrderId = t.Id
    WHERE (
        t.RefNo              LIKE N'%' + @Kw + '%'
     OR t.DriverName         LIKE N'%' + @Kw + '%'
     OR t.VehicleLicensePlates LIKE N'%' + @Kw + '%'
     OR t.DispatchSummarize  LIKE N'%' + @Kw + '%'
     OR t.Note               LIKE N'%' + @Kw + '%'
    )
    ORDER BY t.Id DESC;
END
GO


-- ============================================================
-- SP_TransportOrder_GetById
-- Trả về multi-result set: Master | Segments | SegmentEtcs | Fees | Details
-- ============================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- EXEC SP_TransportOrder_GetById 1
CREATE PROCEDURE [dbo].[SP_TransportOrder_GetById]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Result 1: Master
    SELECT
        t.*,
        b.BranchCode,
        u.EmployeeFullName AS CreatedByName,
        CASE
            WHEN t.IsDeny = 1 AND t.Status = 0 THEN N'Từ chối'
            WHEN t.Status = 0 THEN N'Khởi tạo'
            WHEN t.Status = 1 THEN N'Gửi lệnh'
            WHEN t.Status = 2 THEN N'Đã nhận'
            WHEN t.Status = 3 THEN N'Duyệt B1'
            WHEN t.Status = 4 THEN N'Duyệt B2'
            WHEN t.Status = 5 THEN N'Chờ chốt'
            WHEN t.Status = 6 THEN N'ĐÃ CHỐT'
            ELSE N''
        END AS RStatus
    FROM [dbo].[Tbl_TransportOrders] t
    INNER JOIN [dbo].[Branch] b ON b.Id = t.BranchId
    INNER JOIN [dbo].[V_Users] u ON u.Id = t.CreatedBy
    WHERE t.Id = @Id AND t.Deleted = 0;

    -- Result 2: Segments
    SELECT *
    FROM [dbo].[Tbl_TransportOrder_Segments]
    WHERE TransportOrderId = @Id
    ORDER BY OrderIndex;

    -- Result 3: Segment ETCs
    SELECT e.*
    FROM [dbo].[Tbl_TransportOrder_Segment_Etcs] e
    INNER JOIN [dbo].[Tbl_TransportOrder_Segments] s ON s.Id = e.SegmentId
    WHERE s.TransportOrderId = @Id
    ORDER BY s.OrderIndex, e.Id;

    -- Result 4: Fees
    SELECT *
    FROM [dbo].[Tbl_TransportOrder_Fees]
    WHERE TransportOrderId = @Id;

    -- Result 5: Details (ShippingTask)
    SELECT d.*, st.ContainerNumber, st.PickupLocation, st.DeliveryLocation,
           st.CustomerCode, st.CustomerName
    FROM [dbo].[Tbl_TransportOrder_Details] d
    INNER JOIN [dbo].[ShippingTask] st ON st.Id = d.ShippingTaskId
    WHERE d.TransportOrderId = @Id;
END
GO
