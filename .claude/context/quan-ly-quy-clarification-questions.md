# Bộ câu hỏi làm rõ — "Quy trình quản lý quỹ và thanh toán" (July 6 2026)

> **Mục đích:** làm rõ yêu cầu TRƯỚC khi viết SRS + code. Mỗi câu nêu **hiện trạng (Cũ)** trên hệ thống Delta hiện tại, **yêu cầu mới (July 6)**, rồi **Câu hỏi** cho người ra yêu cầu.
> **Nguồn:** `NewAPI/Quy trình quản lý quỹ và thanh toán_July 6 2026.docx` (đối chiếu `Tạm ứng Thanh toán_June 25 2026` + [[advance-payment-redesign-plan]]).
> **Cách dùng:** người ra yêu cầu trả lời trực tiếp vào từng câu → em tổng hợp thành **SRS** → anh duyệt SRS → mới code.
> **Ký hiệu ưu tiên:** 🔴 = quyết định nền tảng (phải chốt trước, chặn thiết kế) · 🟡 = quan trọng · ⚪ = chi tiết (chốt khi tới phần).
> Lập 2026-07-08.

---

## ★ TÓM TẮT — 7 quyết định NỀN TẢNG phải chốt trước (blocker)
Trả lời 7 câu này trước, vì chúng quyết định kiến trúc; các câu còn lại là chi tiết phái sinh.
1. **A1** — Bút toán đối ứng: chỉ giao dịch MỚI hay hồi tố lịch sử?
2. **A2** — Phụ lục 6.4 (bảng ánh xạ sự kiện → Nợ/Có TK) — ai cung cấp, khi nào?
3. **B1** — Bỏ hẳn "tạm ứng chuyển khoản" hay vẫn giữ phương thức CK?
4. **E1** — "Dư nợ nợ hóa đơn" là TK trung gian không lên báo cáo — xác nhận bản chất kế toán?
5. **A3** — Loại bỏ số âm: cơ chế sửa sai cuối kỳ cụ thể là gì?
6. **F1** — Đặt cọc: tái dùng ContBets/Deposit/Rebets hiện có hay dựng mới?
7. **H1** — Đích cuối là xuất sang Misa: mức độ tích hợp (thủ công/file/API)?

---

## A. Nguyên tắc & phạm vi chung

**🔴 A1 — Phạm vi thời gian của "ghi chép đối ứng"**
- *Cũ:* Delta 2.0 KHÔNG có ghi chép đối ứng → 100% báo cáo làm tay (tài liệu tự nêu, mục 4.9).
- *Mới:* mỗi sự kiện tiền tự sinh bút toán Nợ/Có → báo cáo tự động.
- **Hỏi:** Bút toán đối ứng chỉ áp cho giao dịch **mới từ ngày go-live**, hay phải **hồi tố** cả dữ liệu tạm ứng/thanh toán lịch sử? (Quyết định "tiến hóa tại chỗ" vs "phân hệ mới + cutover".)

**🔴 A2 — Bảng ánh xạ định khoản (Phụ lục 6.4)**
- *Cũ:* có model `AccountingDetail` (Nợ/Có) nhưng không tự sinh.
- *Mới:* mọi lưu đồ trỏ "Ghi chép đối ứng – Xem Phụ lục", nhưng **Phụ lục 6.4 để trống** (chỉ có quy tắc chung, không có bảng sự kiện→TK).
- **Hỏi:** Ai chịu trách nhiệm cung cấp **bảng ánh xạ đầy đủ** (mỗi sự kiện ghi Nợ TK nào / Có TK nào) và khi nào có? Em có thể soạn bản nháp để kế toán duyệt không?

**🔴 A3 — Loại bỏ số âm**
- *Cũ:* cho phép TT/TƯ **số âm** để sửa 3 loại sai: sai mã phí, sai số tiền, sai JobID.
- *Mới:* hướng **bỏ số âm**; sửa sai bằng "gom nhóm, ghi đối ứng sửa 1 lần cuối kỳ (tháng), có các bộ phận QL tham gia trước khi chốt số liệu".
- **Hỏi:** (a) Cơ chế "sửa sai cuối kỳ" vận hành thế nào — có màn gom lỗi + duyệt tập thể không? (b) Trong lúc chưa có cơ chế đó, tạm thời còn cho sửa bằng số âm không hay khóa luôn? (c) Phân biệt sai "liên quan chi trả hộ (đổi 131)" vs "không liên quan" xử lý khác nhau ra sao?

**🟡 A4 — Trạng thái go-live / thứ tự ưu tiên**
- **Hỏi:** Trong 8 quy trình (tạm ứng, TT có HĐ, TT không HĐ, nợ HĐ, trả HĐ, đặt cọc, phiếu chi, phiếu thu), phần nào **cần gấp nhất**? Có mốc thời gian bắt buộc không?

---

## B. Tạm ứng tiền mặt (Mục 4.2, 5.1)

**🔴 B1 — Còn "tạm ứng chuyển khoản" không?**
- *Cũ:* `Advances.IsTransfer` + 2 hạn mức tách `DebitLimit` (tiền mặt) / `DebitTransferLimit` (CK).
- *Mới (mâu thuẫn nội tại):* Mục 4.2 nói **hủy bỏ khái niệm "tạm ứng chuyển khoản"** (chỉ còn "tạm ứng tiền mặt")… nhưng **Tiêu chí 2** lại ghi "phương thức nhận là **tiền mặt hoặc chuyển khoản**".
- **Hỏi:** Chính xác là (a) **bỏ hẳn** tạm ứng CK — mọi tạm ứng là "tiền mặt" (dù nhận qua chuyển khoản từ TK Thủ quỹ/công ty), "phương thức nhận" chỉ là thuộc tính ghi nhận **không tách hạn mức**; hay (b) **vẫn 2 loại** với 2 hạn mức riêng như cũ?

**🟡 B2 — Thời hạn tạm ứng**
- *Cũ:* chưa có field thời hạn.
- *Mới:* mặc định **7 ngày** kể từ **ngày duyệt Phiếu chi** (kế hoạch cũ ghi nhầm 4 ngày). Hợp đồng/thỏa thuận → theo thỏa thuận.
- **Hỏi:** (a) 7 ngày là **ngày lịch** hay **ngày làm việc**? (b) Mốc bắt đầu chắc chắn là "ngày duyệt Phiếu chi" (không phải ngày tạo/ngày chi tiền)? (c) "Chi hải quan theo lô → công tác phí nhân viên" (Mục 4.2) — quy tắc kê khai cụ thể ra sao?

**🟡 B3 — Quá hạn → khóa tạo mới + gia hạn**
- *Cũ:* không có (ngoại lệ: ContBets đã chặn tạo mới khi có phiếu cược quá hạn chưa giải trình).
- *Mới:* quá hạn → **không được làm tạm ứng mới**; có **quy trình xin gia hạn** được duyệt.
- **Hỏi:** (a) "Khóa" chặn **chỉ tạo tạm ứng mới** hay chặn **cả làm thanh toán**? (b) Ai duyệt gia hạn? (c) Gia hạn 1 lần hay nhiều lần, có trần số ngày không?

**🟡 B4 — Hạn mức tạm ứng**
- *Cũ:* `EmployeeLimit` có sẵn; chưa chắc SP `Create` đã chặn "dư + mới ≤ hạn mức" (cần verify).
- *Mới:* hạn mức = tối đa để giải quyết mọi việc; do TP/GĐ CN đề xuất, GĐ công ty duyệt.
- **Hỏi:** (a) Xác nhận công thức chặn = **(dư nợ tạm ứng tiền mặt hiện tại + khoản mới) ≤ hạn mức**? (b) Có màn quản lý/lịch sử thay đổi hạn mức trong ERP không, hay nhập tay? (c) Xác nhận **nợ HĐ và đặt cọc KHÔNG tính vào hạn mức** (Mục 4.3)?

**⚪ B5 — Ngưỡng 5 triệu**
- *Mới:* chỉ cho tạm ứng tiền mặt với **chi trả hộ (kể cả phát sinh doanh thu trả hộ) < 5 triệu**.
- **Hỏi:** 5 triệu là ngưỡng **mỗi phiếu** hay **tổng dư nợ trả hộ**? Vượt ngưỡng thì chặn hay chỉ cảnh báo/tăng cấp duyệt?

---

## C. Nhóm phí & JobID (Mục 4.2, 4.4, Phụ lục JobID)

**🟡 C1 — JobID kế toán vs JobID nghiệp vụ**
- *Cũ:* Payment có `GroupFeeCode`; Advance chưa có nhóm phí (chỉ `AdvanceGroupId`).
- *Mới:* kê khai **JobID kế toán** để phân loại nhóm phí, trừ vài nhóm dùng **JobID nghiệp vụ** (hải quan theo lô, giấy phép/kiểm tra chuyên ngành, hoa hồng KH, trả hộ).
- **Hỏi:** (a) "JobID kế toán" và "JobID nghiệp vụ" khác nhau thế nào trong dữ liệu hiện có — có phải JobID nghiệp vụ = JobID của lô hàng/công việc thật, JobID kế toán = mã ảo để gom nhóm phí? (b) "Phụ lục JobID" đã có chưa, ở đâu?

**🟡 C2 — Bỏ mã phí cấp 3**
- *Cũ:* đang quản mã phí **cấp 3** (hàng trăm mã).
- *Mới:* bỏ cấp 3, chỉ còn **6 nhóm cấp 1 + <40 nhóm cấp 2**.
- **Hỏi:** Việc bỏ cấp 3 áp dụng **ngay trong đợt này** hay lộ trình riêng? Dữ liệu mã cấp 3 cũ xử lý sao (giữ đọc / ẩn / migrate)?

**⚪ C3 — Danh sách nhóm cấp 1 chuẩn**
- *Cũ (hệ thống):* 01 QL chung · 02 hàng bán · 03 trả hộ · 04 đầu tư · 05 CCDC · 06 khác.
- *Mới (July 6 liệt kê):* QL chung, hàng bán, hải quan theo lô, giấy phép, hoa hồng, trả hộ, đầu tư TSCĐ, CCDC, khác, vay cá nhân…
- **Hỏi:** Chốt lại **danh mục nhóm cấp 1 + cấp 2 chính thức** (July 6 liệt kê nhiều hơn 6 nhóm hiện có — cái nào là cấp 1, cái nào là cấp 2)?

---

## D. Thanh toán (Mục 4.4, 5.2, 5.3)

**🟡 D1 — Đối ứng 1 thanh toán ↔ N tạm ứng cùng nhóm**
- *Cũ:* `Payments.AdvancesRefNo` chỉ **1 chuỗi** (1 tạm ứng).
- *Mới:* khi làm TT, **mọi tạm ứng tiền mặt cùng nhóm phí còn tồn** của NV đó phải được đưa vào để quyết toán; không đối ứng tạm ứng **khác nhóm**.
- **Hỏi:** (a) Xác nhận bắt buộc **gom tất cả** tạm ứng cùng nhóm (NV không được chọn lọc)? (b) Nếu NV có tạm ứng nhóm A nhưng đi làm TT nhóm B thì tạm ứng nhóm A xử lý sao?

**🟡 D2 — Chênh lệch → Phiếu chi/Phiếu thu tự động**
- *Cũ:* phiếu chi/thu tạo **thủ công** (modal-phieu-chi/thu).
- *Mới:* duyệt TT xong → phần mềm **tự sinh** Phiếu chi (chi thêm) hoặc Phiếu thu (nộp lại) theo chênh lệch; bằng nhau → không phiếu; TT không tạm ứng → toàn bộ = Phiếu chi.
- **Hỏi:** Xác nhận công thức `chênh lệch = số duyệt chi − Σ tạm ứng đối ứng` → >0 Phiếu chi, <0 Phiếu thu, =0 đóng? Có trường hợp ngoại lệ nào không?

**🟡 D3 — Duyệt 2 bước & route theo nhóm phí**
- *Cũ:* có Step S0→S1→S2/S3 nhưng không route theo nhóm.
- *Mới (tạm ứng 5.1.2.2):* trả hộ/làm hàng → **TP chuyên môn** duyệt B1 → **bỏ qua B2**; nhóm khác → **Kế toán** B1 → **BGĐ/GĐ CN** B2. (Chi tiết phân quyền "để Phụ lục".)
- **Hỏi:** (a) Bảng phân quyền duyệt chi tiết (nhóm phí → ai B1, ai B2, ngưỡng tiền nếu có) đã có chưa? (b) Route duyệt **thanh toán** (5.2) có giống route **tạm ứng** (5.1) không? (c) `NeedExtraApproval` (hàng bán thiếu KH/JobID) có +1 cấp duyệt như dự kiến không?

**⚪ D4 — 5 trạng thái thanh toán**
- *Mới:* TT có 5 trạng thái (gồm "đã duyệt B2, **nợ hóa đơn**, chờ viết phiếu").
- **Hỏi:** Xác nhận đúng 5 trạng thái + điều kiện chuyển giữa các trạng thái (đặc biệt nhánh "nợ hóa đơn")?

---

## E. Nợ hóa đơn & Trả hóa đơn (Mục 4.3, 4.5, 4.6, 5.4, 5.5)

**🔴 E1 — Bản chất "dư nợ nợ hóa đơn" (rổ 2)**
- *Cũ:* `PaymentDetail.HasInvoice=2` + bảng `DebtInventory`; coi như 1 dạng công nợ.
- *Mới:* nợ HĐ là **dư nợ tạm ứng riêng**, **TK trung gian KHÔNG lên báo cáo kế toán, KHÔNG sang Misa**, chỉ dùng nội bộ; **không áp hạn mức**.
- **Hỏi:** Xác nhận với kế toán: một khoản đã **chi tiền thật** cho trả hộ mà **không hiện trên sổ** tới khi trả HĐ — đúng chủ đích? TK trung gian này là tài khoản nào (hay chỉ là số theo dõi nội bộ ngoài sổ)?

**🟡 E2 — Deadline nợ HĐ + khóa**
- *Mới:* hoàn HĐ trong **3 ngày làm việc** kể từ ngày TT nợ HĐ; quá hạn → **khóa tài khoản** (không tạo TT/TƯ mới). Nợ HĐ cuối tháng → khóa vào ngày làm việc đầu tháng sau.
- **Hỏi:** (a) "Ngày làm việc" dùng lịch nghỉ nào (dùng bảng Holiday F044 được không)? (b) "Khóa tài khoản" chặn **mọi thao tác** hay chỉ nợ HĐ mới? (c) Nợ HĐ **chỉ dùng cho chi phí trả hộ** — xác nhận không dùng cho loại khác?

**🟡 E3 — Trả hóa đơn: 4 trường hợp (5.5)**
- *Cũ:* có UI trả HĐ sơ khai, thiếu rule.
- *Mới:* 4 ca: (1) có HĐ = số tiền → ghi giảm rổ 2 + tăng phải thu KH (131); (2) có HĐ ≠ số tiền → giảm rổ 2 theo trị giá HĐ + tăng 131 + **chuyển quy trình xử lý chênh lệch**; (3) không HĐ + nhận lại tiền; (4) không HĐ + **bù trừ với HĐ trả hộ khác**. Hoàn nhiều lần tới hết dư nợ.
- **Hỏi:** (a) Ca (2) "chuyển quy trình xử lý chênh lệch" — chuyển sang quy trình nào, ai xử lý phần chênh? (b) Ca (4) "bù trừ HĐ trả hộ khác" nghĩa là lấy HĐ của lô/khách khác bù vào — quy tắc chọn HĐ bù? (c) Xác nhận trả HĐ do **Kế toán duyệt** (5.5.2.4)?

**⚪ E4 — Nguồn hóa đơn (AI01)**
- *Mới:* chọn HĐ từ danh mục **scanning AI01**.
- *Cũ:* đã có F043 PendingInvoice + đọc HĐ AI (Gemini).
- **Hỏi:** "AI01 Scanning" = tính năng F043/đọc HĐ AI hiện có, hay là hệ khác? Nếu là cái đang có thì trả HĐ lấy nguồn từ PendingInvoice đúng không?

---

## F. Đặt cọc (Mục 4.7, 5.6) — hệ thống ĐÃ có ContBets/Deposit/Rebets

**🔴 F1 — Tái dùng hay dựng mới**
- *Cũ:* đã có **cont-bets** (cược vỏ cont hãng tàu, có duyệt + sinh Phiếu chi + giải trình quá hạn + cảnh báo), **deposit** (đặt cọc NCC: dầu diesel/thuê VP/khác), **rebets** (hoàn cược).
- *Mới (5.6):* 5 loại đặt cọc; TK 244; hoàn trả nhiều lần; không đòi được → 811/1388; **không áp hạn mức**.
- **Hỏi:** Người ra yêu cầu có biết hệ thống **đã có sẵn** 3 module này không? Có đồng ý **nâng cấp tại chỗ** (thêm định khoản 244/811/1388 + chỉnh route duyệt) thay vì làm mới? Có điểm nào ở ContBets/Deposit hiện tại **chưa đúng** cần đổi?

**🟡 F2 — Route duyệt đặt cọc**
- *Mới (5.6):* cược vỏ cont hãng tàu → **bỏ qua B2**; đặt cọc khác → qua B2 (route theo **số tiền**). Có Duyệt 3 cho **hoàn cược**.
- *Cũ:* ContBets có `acceptStep` + quyền `BETS_ACCEPT`/`BETS_ACCOUNT`.
- **Hỏi:** Ngưỡng tiền để route B2 là bao nhiêu? Ai duyệt hoàn cược (Duyệt 3)?

**⚪ F3 — Không đòi được cọc**
- *Mới:* vẫn phải tạo "Hoàn tiền đặt cọc" rồi ghi đối ứng lần 2: **Nợ 811 (chi phí khác) / hoặc Nợ 1388 (phải thu khác)**.
- **Hỏi:** Khi nào ghi 811 (mất hẳn) vs 1388 (còn khả năng thu)? Ai quyết định?

---

## G. Phiếu chi / Phiếu thu & Quỹ (Mục 4.8, 5.7, 5.8)

**🟡 G1 — Chặn quỹ không đủ**
- *Cũ:* có `Tbl_Fund` + modal phiếu chi/thu; **không** check số dư quỹ.
- *Mới:* nguồn quỹ chọn không đủ → **không cho xác nhận (lưu) Phiếu chi**.
- **Hỏi:** (a) Xác nhận chặn cứng (không cho lưu) khi `số dư quỹ < số chi`? (b) Có nhiều quỹ/nguồn tiền (tiền mặt, TGNH…) — chọn nguồn khi chi/thu đúng không?

**🟡 G2 — Phiếu tự sinh vs Thủ quỹ tạo tay**
- *Mới:* hầu hết phiếu do phần mềm tự sinh từ quy trình nghiệp vụ (không cần duyệt lại); Thủ quỹ chỉ tạo tay **trường hợp đặc biệt** (qua 2 duyệt). Không viết phiếu lần 2. Ngày mặc định (số tiền/số phiếu/ngày chi) **khóa**; chỉ sửa **ngày hạch toán**.
- **Hỏi:** "Trường hợp đặc biệt" Thủ quỹ tạo tay gồm những gì (để phân quyền + route duyệt)?

**⚪ G3 — Soát xét kê khai bằng AI (5.7.2.5 / 5.8.2.5)**
- *Mới:* trước khi chuyển phiếu cho Thủ quỹ, có bước **AI soát nhóm phí**; nếu chưa có AI thì **Kế toán soát tay**.
- **Hỏi:** Giai đoạn đầu **bỏ qua** bước AI (kế toán soát tay), làm AI sau — đúng không?

**⚪ G4 — Phiếu thu cho tiền gửi ngân hàng (5.8)**
- *Mới:* tài liệu tự đặt câu hỏi "tiền gửi ngân hàng thì sao? cần quy trình viết Phiếu thu ghi nhận tiền đã thu".
- **Hỏi:** Có làm Phiếu thu cho khoản thu qua ngân hàng (không qua quỹ tiền mặt) trong đợt này không?

---

## H. Ghi chép đối ứng / Xuất Misa (Mục 4.9, Phụ lục 6.4)

**🔴 H1 — Đích tích hợp Misa**
- *Mới:* dư nợ đặt cọc (TK 244) "được chuyển sang **Misa**"; nợ HĐ thì không.
- **Hỏi:** Tích hợp Misa ở mức nào — (a) chỉ **xuất file/báo cáo** để nhập tay Misa, (b) **file import** đúng định dạng Misa, hay (c) **API** đồng bộ trực tiếp? Trong đợt này làm tới đâu?

**🟡 H2 — Danh mục tài khoản**
- **Hỏi:** Có **hệ thống tài khoản (chart of accounts)** chuẩn của công ty để em map không (111, 112, 131, 141, 133, 244, 641, 642, 627, 811, 1388…)? Ai là đầu mối kế toán để em làm việc chốt bảng 6.4?

---

## I. Tích hợp ngoài (API Banking, AI01, AI02)

**⚪ I1 — Thứ tự & scope**
- *Mới:* API Banking + Ủy nhiệm chi (Kế toán lập) là nhánh "nhận tiền từ TK công ty"; AI01 (scanning HĐ) + AI02 (tạo YC từ JobID) — đều ghi "phát triển sau".
- **Hỏi:** Xác nhận đợt này **chưa làm** API Banking/AI02, chỉ làm luồng qua Thủ quỹ (Phiếu chi/thu) + tận dụng AI01 (F043) sẵn có?

---

## J. Báo cáo (Mục 5.9)

**⚪ J1 — Danh mục báo cáo bắt buộc đợt này**
- *Cũ:* đã có báo cáo chi tiết TT + số dư tạm ứng cá nhân.
- *Mới:* số dư tạm ứng (thời điểm/thời gian/NV/KH/chi nhánh/toàn cty) + báo cáo thanh toán + **chi tiết nợ HĐ dở dang** + tiện ích tìm kiếm.
- **Hỏi:** Báo cáo nào **bắt buộc** ở giai đoạn 1, báo cáo nào để sau? Có mẫu/định dạng chuẩn không?

---

## K. Định danh & mã (Mục 4.2, 4.4)

**⚪ K1 — Cấu trúc số tạm ứng / số thanh toán**
- *Mới:* mỗi phiếu thể hiện mã NV + loại chi phí + phương thức, đánh số thứ tự — "**thiết kế sau khi hoàn thiện hệ thống mã nhân viên**".
- **Hỏi:** Hệ thống mã NV mới đã sẵn sàng chưa? Nếu chưa → tạm giữ cấu trúc số hiện hành, đổi sau — đúng không?

---

## Bước tiếp theo
1. Người ra yêu cầu trả lời (ưu tiên 7 câu 🔴).
2. Em tổng hợp → viết **SRS** (phạm vi, yêu cầu chức năng theo từng quy trình, mô hình dữ liệu, luồng trạng thái, bảng phân quyền, bảng định khoản, danh mục báo cáo, phần "ngoài phạm vi").
3. Anh duyệt SRS → em soạn SQL/BE/FE theo phase.
