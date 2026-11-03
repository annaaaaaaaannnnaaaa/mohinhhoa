CREATE DATABASE ConcertTicket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ConcertTicket;

-- 1. USER_ACCOUNT -----------------------------------------------------
CREATE TABLE USER_ACCOUNT (
    UserID        VARCHAR(20)  NOT NULL,
    Email         VARCHAR(100) NOT NULL,
    PasswordHash  VARCHAR(255) NOT NULL,          
    Role          VARCHAR(20)  NOT NULL,
    CONSTRAINT PK_USER_ACCOUNT PRIMARY KEY (UserID),
    CONSTRAINT UK_USER_ACCOUNT_Email UNIQUE (Email),
    CONSTRAINT CK_USER_Role CHECK (Role IN ('Administrator', 'Ticket Checker','Customer'))
);

-- 2. CUSTOMER ---------------------------------------------------------
CREATE TABLE CUSTOMER (
    CustomerID   VARCHAR(20) NOT NULL,
    UserID       VARCHAR(20) NOT NULL,
    FullName     VARCHAR(50) NOT NULL,
    PhoneNumber  VARCHAR(20) NOT NULL,
    CONSTRAINT PK_CUSTOMER PRIMARY KEY (CustomerID),
    CONSTRAINT UK_CUSTOMER_User UNIQUE (UserID),   -- 1 tài khoản = 1 khách hàng
    CONSTRAINT FK_CUSTOMER_USER FOREIGN KEY (UserID) REFERENCES USER_ACCOUNT (UserID)
);

-- 3. CONCERT ----------------------------------------------------------
CREATE TABLE CONCERT (
    ConcertID    VARCHAR(20)  NOT NULL,
    ConcertName  VARCHAR(150) NOT NULL,
    Venue        VARCHAR(150) NOT NULL,
    Artist       VARCHAR(100) NOT NULL,
    StartTime    DATETIME     NOT NULL,
    Status       VARCHAR(20)  NOT NULL,
    CONSTRAINT PK_CONCERT PRIMARY KEY (ConcertID),
    CONSTRAINT CK_CONCERT_Status CHECK (Status IN ('Upcoming','OnSale','SoldOut','Cancelled','Finished')),
    INDEX IX_CONCERT_Status_Start (Status, StartTime)   
);

-- 4. TICKET_QUEUE
CREATE TABLE TICKET_QUEUE (
    QueueID      INT         NOT NULL AUTO_INCREMENT,
    CustomerID   VARCHAR(20) NOT NULL,
    ConcertID    VARCHAR(20) NOT NULL,
    QueueStatus  VARCHAR(20) NOT NULL DEFAULT 'Waiting',

    -- 1 khi lượt xếp hàng còn hiệu lực, NULL khi đã kết thúc
    ActiveKey    TINYINT GENERATED ALWAYS AS
                 (IF(QueueStatus IN ('Waiting','Admitted'), 1, NULL)) STORED,

    CONSTRAINT PK_TICKET_QUEUE PRIMARY KEY (QueueID),
    CONSTRAINT FK_QUEUE_CUSTOMER FOREIGN KEY (CustomerID)
        REFERENCES CUSTOMER (CustomerID),
    CONSTRAINT FK_QUEUE_CONCERT FOREIGN KEY (ConcertID)
        REFERENCES CONCERT (ConcertID),
    CONSTRAINT CK_QUEUE_Status
        CHECK (QueueStatus IN ('Waiting','Admitted')),

    -- Mỗi khách chỉ có 1 lượt xếp hàng đang hoạt động cho 1 concert
    CONSTRAINT UK_QUEUE_OneActive UNIQUE (CustomerID, ConcertID, ActiveKey)
);


-- 5. TICKET_CLASS -----------------------------------------------------
CREATE TABLE TICKET_CLASS (
    ClassID    VARCHAR(20)   NOT NULL,
    ConcertID  VARCHAR(20)   NOT NULL,
    ClassName  VARCHAR(50)   NOT NULL,
    Price      DECIMAL(12,2) NOT NULL,
    ColorCode  VARCHAR(20)   NOT NULL,
    CONSTRAINT PK_TICKET_CLASS PRIMARY KEY (ClassID),
    CONSTRAINT UK_CLASS_Concert UNIQUE (ClassID, ConcertID),   -- để ZONE tham chiếu ghép
    CONSTRAINT UK_CLASS_Name UNIQUE (ConcertID, ClassName),
    CONSTRAINT FK_CLASS_CONCERT FOREIGN KEY (ConcertID) REFERENCES CONCERT (ConcertID),
    CONSTRAINT CK_CLASS_Price CHECK (Price >= 0)
);

-- 6. ZONE -------------------------------------------------------------
CREATE TABLE ZONE (
    ZoneID     VARCHAR(20) NOT NULL,
    ConcertID  VARCHAR(20) NOT NULL,
    ClassID    VARCHAR(20) NOT NULL,
    ZoneName   VARCHAR(50) NOT NULL,
    Capacity   INT         NOT NULL,
    ZoneType   VARCHAR(20) NOT NULL,
    CONSTRAINT PK_ZONE PRIMARY KEY (ZoneID),
    CONSTRAINT FK_ZONE_CONCERT FOREIGN KEY (ConcertID) REFERENCES CONCERT (ConcertID),
    -- Hạng vé phải thuộc ĐÚNG concert của zone
    CONSTRAINT FK_ZONE_CLASS FOREIGN KEY (ClassID, ConcertID)
        REFERENCES TICKET_CLASS (ClassID, ConcertID),
    CONSTRAINT CK_ZONE_Capacity CHECK (Capacity > 0),
    CONSTRAINT CK_ZONE_Type CHECK (ZoneType IN ('Seating','Standing'))
);

-- 7. SEAT -------------------------------------------------------------
CREATE TABLE SEAT (
    SeatID      VARCHAR(20) NOT NULL,
    ZoneID      VARCHAR(20) NOT NULL,
    RowNumber   VARCHAR(20) NOT NULL,
    SeatNumber  INT         NOT NULL,
    Status      VARCHAR(20) NOT NULL DEFAULT 'Available',
    CONSTRAINT PK_SEAT PRIMARY KEY (SeatID),
    CONSTRAINT UK_SEAT_Position UNIQUE (ZoneID, RowNumber, SeatNumber),
    CONSTRAINT FK_SEAT_ZONE FOREIGN KEY (ZoneID) REFERENCES ZONE (ZoneID),
    CONSTRAINT CK_SEAT_Status CHECK (Status IN ('Available','Hold','Sold')),
    CONSTRAINT CK_SEAT_Number CHECK (SeatNumber > 0),
    INDEX IX_SEAT_Zone_Status (ZoneID, Status)
);

-- 8. SEAT_HOLD (giữ ghế 10 phút) --------------------------------------
CREATE TABLE SEAT_HOLD (
    HoldID      INT         NOT NULL AUTO_INCREMENT,
    SeatID      VARCHAR(20) NOT NULL,
    CustomerID  VARCHAR(20) NOT NULL,
    HoldStatus  VARCHAR(20) NOT NULL DEFAULT 'Active',
    HeldAt      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt   DATETIME    NOT NULL,
    -- Một ghế chỉ có tối đa 1 lượt giữ đang Active
    ActiveSeat  VARCHAR(20) GENERATED ALWAYS AS
                (IF(HoldStatus = 'Active', SeatID, NULL)) STORED,
    CONSTRAINT PK_SEAT_HOLD PRIMARY KEY (HoldID),
    CONSTRAINT FK_HOLD_SEAT     FOREIGN KEY (SeatID)     REFERENCES SEAT (SeatID),
    CONSTRAINT FK_HOLD_CUSTOMER FOREIGN KEY (CustomerID) REFERENCES CUSTOMER (CustomerID),
    CONSTRAINT CK_HOLD_Status CHECK (HoldStatus IN ('Active','Expired','Confirmed','Cancelled')),
    -- Thời gian giữ không quá 10 phút
    CONSTRAINT CK_HOLD_Time CHECK (ExpiresAt > HeldAt
                                   AND ExpiresAt <= HeldAt + INTERVAL 10 MINUTE),
    CONSTRAINT UK_HOLD_OneActivePerSeat UNIQUE (ActiveSeat),
    INDEX IX_HOLD_Expire (HoldStatus, ExpiresAt)
);

-- 9. BILL -------------------------------------------------------------
CREATE TABLE BILL (
    BillID       VARCHAR(20)   NOT NULL,
    CustomerID   VARCHAR(20)   NOT NULL,
    ConcertID    VARCHAR(20)   NOT NULL,
    TotalAmount  DECIMAL(15,2) NOT NULL,
    BillDate     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_BILL PRIMARY KEY (BillID),
    CONSTRAINT FK_BILL_CUSTOMER FOREIGN KEY (CustomerID) REFERENCES CUSTOMER (CustomerID),
    CONSTRAINT FK_BILL_CONCERT  FOREIGN KEY (ConcertID)  REFERENCES CONCERT (ConcertID),
    CONSTRAINT CK_BILL_Total CHECK (TotalAmount >= 0)
);

-- 10. BILL_ITEM -------------------------------------------------------
-- Bill chỉ được tạo SAU khi thanh toán thành công, nên UNIQUE(SeatID)
-- đảm bảo 1 ghế (vốn thuộc đúng 1 concert) không thể bán 2 lần.
CREATE TABLE BILL_ITEM (
    BillitemID  VARCHAR(20)   NOT NULL,
    BillID      VARCHAR(20)   NOT NULL,
    SeatID      VARCHAR(20)   NOT NULL,
    UnitPrice   DECIMAL(15,2) NOT NULL,
    ServiceFee  DECIMAL(15,2) NOT NULL DEFAULT 0,
    CONSTRAINT PK_BILL_ITEM PRIMARY KEY (BillitemID),
    CONSTRAINT UK_ITEM_Seat UNIQUE (SeatID),
    CONSTRAINT FK_ITEM_BILL FOREIGN KEY (BillID) REFERENCES BILL (BillID),
    CONSTRAINT FK_ITEM_SEAT FOREIGN KEY (SeatID) REFERENCES SEAT (SeatID),
    CONSTRAINT CK_ITEM_Price CHECK (UnitPrice >= 0 AND ServiceFee >= 0)
);

-- 11. PAYMENT ---------------------------------------------------------
CREATE TABLE PAYMENT (
    PaymentID      VARCHAR(20) NOT NULL,
    BillID         VARCHAR(20) NOT NULL,
    PaymentStatus  VARCHAR(20) NOT NULL,
    PaymentMethod  VARCHAR(30) NOT NULL,
    PaymentTime    DATETIME    NULL,   -- NULL khi chưa/không thanh toán thành công
    CONSTRAINT PK_PAYMENT PRIMARY KEY (PaymentID),
    CONSTRAINT FK_PAYMENT_BILL FOREIGN KEY (BillID) REFERENCES BILL (BillID),
    CONSTRAINT CK_PAYMENT_Status CHECK (PaymentStatus IN ('Pending','Success','Failed')),
    CONSTRAINT CK_PAYMENT_Time CHECK (PaymentStatus <> 'Success' OR PaymentTime IS NOT NULL)
);

-- 12. TICKET (QR + check-in) ------------------------------------------
CREATE TABLE TICKET (
    TicketID       VARCHAR(20) NOT NULL,
    BillitemID     VARCHAR(20) NOT NULL,
    UniqueCode     VARCHAR(64) NOT NULL,   -- token ngẫu nhiên (UUID/32 byte hex), QR chứa giá trị này
    CheckinStatus  VARCHAR(20) NOT NULL DEFAULT 'NotCheckedIn',
    CheckinTime    DATETIME    NULL,
    CheckedInBy    VARCHAR(20) NULL,       
    CONSTRAINT PK_TICKET PRIMARY KEY (TicketID),
    CONSTRAINT UK_TICKET_UniqueCode UNIQUE (UniqueCode),
    CONSTRAINT UK_TICKET_Item UNIQUE (BillitemID),   -- 1 vé / 1 ghế
    CONSTRAINT FK_TICKET_ITEM  FOREIGN KEY (BillitemID) REFERENCES BILL_ITEM (BillitemID),
    CONSTRAINT FK_TICKET_CHECKER FOREIGN KEY (CheckedInBy) REFERENCES USER_ACCOUNT (UserID),
    CONSTRAINT CK_TICKET_Status CHECK (CheckinStatus IN ('NotCheckedIn','CheckedIn')),
    CONSTRAINT CK_TICKET_Checkin CHECK (
        (CheckinStatus = 'CheckedIn' AND CheckinTime IS NOT NULL)
        OR (CheckinStatus = 'NotCheckedIn' AND CheckinTime IS NULL))
);

-- =====================================================================
-- TRIGGER
-- =====================================================================
DELIMITER $$

-- Làm mới trang / cập nhật không được gia hạn thời gian giữ ghế
CREATE TRIGGER trg_hold_no_extend BEFORE UPDATE ON SEAT_HOLD
FOR EACH ROW
BEGIN
    IF NEW.ExpiresAt <> OLD.ExpiresAt OR NEW.HeldAt <> OLD.HeldAt THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Khong duoc gia han thoi gian giu ghe';
    END IF;
END$$

-- Vé đã check-in không được check-in lại / reset trạng thái
CREATE TRIGGER trg_ticket_no_reuse BEFORE UPDATE ON TICKET
FOR EACH ROW
BEGIN
    IF OLD.CheckinStatus = 'CheckedIn' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ve da check-in, khong the thay doi';
    END IF;
END$$

-- Ghế trong bill phải thuộc đúng concert của bill
CREATE TRIGGER trg_item_same_concert BEFORE INSERT ON BILL_ITEM
FOR EACH ROW
BEGIN
    DECLARE v_seat_concert VARCHAR(20);
    DECLARE v_bill_concert VARCHAR(20);
    SELECT z.ConcertID INTO v_seat_concert
      FROM SEAT s JOIN ZONE z ON z.ZoneID = s.ZoneID WHERE s.SeatID = NEW.SeatID;
    SELECT ConcertID INTO v_bill_concert FROM BILL WHERE BillID = NEW.BillID;
    IF v_seat_concert <> v_bill_concert THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ghe khong thuoc concert cua hoa don';
    END IF;
END$$

-- =====================================================================
-- STORED PROCEDURE
-- =====================================================================

-- Giữ ghế 10 phút, chống 2 người cùng giữ 1 ghế (khóa dòng)
CREATE PROCEDURE sp_hold_seat(IN p_seat VARCHAR(20), IN p_customer VARCHAR(20))
BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

    START TRANSACTION;
    SELECT Status INTO v_status FROM SEAT WHERE SeatID = p_seat FOR UPDATE;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ghe khong ton tai';
    ELSEIF v_status <> 'Available' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ghe khong con trong';
    END IF;

    UPDATE SEAT SET Status = 'Hold' WHERE SeatID = p_seat;
    INSERT INTO SEAT_HOLD (SeatID, CustomerID, HoldStatus, HeldAt, ExpiresAt)
    VALUES (p_seat, p_customer, 'Active', NOW(), NOW() + INTERVAL 10 MINUTE);
    COMMIT;
END$$

-- Check-in nguyên tử: chỉ thành công nếu vé hợp lệ và chưa dùng
CREATE PROCEDURE sp_checkin(IN p_code VARCHAR(64), IN p_admin VARCHAR(20))
BEGIN
    UPDATE TICKET
       SET CheckinStatus = 'CheckedIn', CheckinTime = NOW(), CheckedInBy = p_admin
     WHERE UniqueCode = p_code AND CheckinStatus = 'NotCheckedIn';

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ve khong hop le hoac da check-in';
    END IF;
END$$

-- Tự động hủy giữ ghế quá hạn và trả ghế về Available
-- (cần: SET GLOBAL event_scheduler = ON;)
CREATE EVENT ev_release_expired_holds
ON SCHEDULE EVERY 30 SECOND
DO
BEGIN
    UPDATE SEAT s
      JOIN SEAT_HOLD h ON h.SeatID = s.SeatID
       SET s.Status = 'Available', h.HoldStatus = 'Expired'
     WHERE h.HoldStatus = 'Active' AND h.ExpiresAt <= NOW() AND s.Status = 'Hold';
END$$

DELIMITER ;
