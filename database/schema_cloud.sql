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
    CONSTRAINT UK_CUSTOMER_User UNIQUE (UserID),   -- 1 tÃ i khoáº£n = 1 khÃ¡ch hÃ ng
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

    -- 1 khi lÆ°á»£t xáº¿p hÃ ng cÃ²n hiá»‡u lá»±c, NULL khi Ä‘Ã£ káº¿t thÃºc
    ActiveKey    TINYINT GENERATED ALWAYS AS
                 (IF(QueueStatus IN ('Waiting','Admitted'), 1, NULL)) STORED,

    CONSTRAINT PK_TICKET_QUEUE PRIMARY KEY (QueueID),
    CONSTRAINT FK_QUEUE_CUSTOMER FOREIGN KEY (CustomerID)
        REFERENCES CUSTOMER (CustomerID),
    CONSTRAINT FK_QUEUE_CONCERT FOREIGN KEY (ConcertID)
        REFERENCES CONCERT (ConcertID),
    CONSTRAINT CK_QUEUE_Status
        CHECK (QueueStatus IN ('Waiting','Admitted')),

    -- Má»—i khÃ¡ch chá»‰ cÃ³ 1 lÆ°á»£t xáº¿p hÃ ng Ä‘ang hoáº¡t Ä‘á»™ng cho 1 concert
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
    CONSTRAINT UK_CLASS_Concert UNIQUE (ClassID, ConcertID),   -- Ä‘á»ƒ ZONE tham chiáº¿u ghÃ©p
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
    -- Háº¡ng vÃ© pháº£i thuá»™c ÄÃšNG concert cá»§a zone
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

-- 8. SEAT_HOLD (giá»¯ gháº¿ 10 phÃºt) --------------------------------------
CREATE TABLE SEAT_HOLD (
    HoldID      INT         NOT NULL AUTO_INCREMENT,
    SeatID      VARCHAR(20) NOT NULL,
    CustomerID  VARCHAR(20) NOT NULL,
    HoldStatus  VARCHAR(20) NOT NULL DEFAULT 'Active',
    HeldAt      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt   DATETIME    NOT NULL,
    -- Má»™t gháº¿ chá»‰ cÃ³ tá»‘i Ä‘a 1 lÆ°á»£t giá»¯ Ä‘ang Active
    ActiveSeat  VARCHAR(20) GENERATED ALWAYS AS
                (IF(HoldStatus = 'Active', SeatID, NULL)) STORED,
    CONSTRAINT PK_SEAT_HOLD PRIMARY KEY (HoldID),
    CONSTRAINT FK_HOLD_SEAT     FOREIGN KEY (SeatID)     REFERENCES SEAT (SeatID),
    CONSTRAINT FK_HOLD_CUSTOMER FOREIGN KEY (CustomerID) REFERENCES CUSTOMER (CustomerID),
    CONSTRAINT CK_HOLD_Status CHECK (HoldStatus IN ('Active','Expired','Confirmed','Cancelled')),
    -- Thá»i gian giá»¯ khÃ´ng quÃ¡ 10 phÃºt
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
-- Bill chá»‰ Ä‘Æ°á»£c táº¡o SAU khi thanh toÃ¡n thÃ nh cÃ´ng, nÃªn UNIQUE(SeatID)
-- Ä‘áº£m báº£o 1 gháº¿ (vá»‘n thuá»™c Ä‘Ãºng 1 concert) khÃ´ng thá»ƒ bÃ¡n 2 láº§n.
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
    PaymentTime    DATETIME    NULL,   -- NULL khi chÆ°a/khÃ´ng thanh toÃ¡n thÃ nh cÃ´ng
    CONSTRAINT PK_PAYMENT PRIMARY KEY (PaymentID),
    CONSTRAINT FK_PAYMENT_BILL FOREIGN KEY (BillID) REFERENCES BILL (BillID),
    CONSTRAINT CK_PAYMENT_Status CHECK (PaymentStatus IN ('Pending','Success','Failed')),
    CONSTRAINT CK_PAYMENT_Time CHECK (PaymentStatus <> 'Success' OR PaymentTime IS NOT NULL)
);

-- 12. TICKET (QR + check-in) ------------------------------------------
CREATE TABLE TICKET (
    TicketID       VARCHAR(20) NOT NULL,
    BillitemID     VARCHAR(20) NOT NULL,
    UniqueCode     VARCHAR(64) NOT NULL,   -- token ngáº«u nhiÃªn (UUID/32 byte hex), QR chá»©a giÃ¡ trá»‹ nÃ y
    CheckinStatus  VARCHAR(20) NOT NULL DEFAULT 'NotCheckedIn',
    CheckinTime    DATETIME    NULL,
    CheckedInBy    VARCHAR(20) NULL,       
    CONSTRAINT PK_TICKET PRIMARY KEY (TicketID),
    CONSTRAINT UK_TICKET_UniqueCode UNIQUE (UniqueCode),
    CONSTRAINT UK_TICKET_Item UNIQUE (BillitemID),   -- 1 vÃ© / 1 gháº¿
    CONSTRAINT FK_TICKET_ITEM  FOREIGN KEY (BillitemID) REFERENCES BILL_ITEM (BillitemID),
    CONSTRAINT FK_TICKET_CHECKER FOREIGN KEY (CheckedInBy) REFERENCES USER_ACCOUNT (UserID),
    CONSTRAINT CK_TICKET_Status CHECK (CheckinStatus IN ('NotCheckedIn','CheckedIn')),
    CONSTRAINT CK_TICKET_Checkin CHECK (
        (CheckinStatus = 'CheckedIn' AND CheckinTime IS NOT NULL)
        OR (CheckinStatus = 'NotCheckedIn' AND CheckinTime IS NULL))
);

-- =====================================================================
