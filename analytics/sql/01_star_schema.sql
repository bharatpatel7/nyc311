-- Star schema for NYC 311 analytics in Azure SQL Database.
-- One fact row per complaint, joined to small dimension tables that Power BI
-- slices by. Safe to re-run: every object is created only if it's missing.

IF OBJECT_ID('dbo.dim_date') IS NULL
CREATE TABLE dbo.dim_date (
    date_key        INT          NOT NULL PRIMARY KEY,  -- yyyymmdd
    [date]          DATE         NOT NULL,
    [year]          SMALLINT     NOT NULL,
    month_number    TINYINT      NOT NULL,
    month_name      VARCHAR(10)  NOT NULL,
    day_of_month    TINYINT      NOT NULL,
    day_of_week     TINYINT      NOT NULL,              -- 1 = Monday
    day_name        VARCHAR(10)  NOT NULL,
    is_weekend      BIT          NOT NULL
);

IF OBJECT_ID('dbo.dim_borough') IS NULL
CREATE TABLE dbo.dim_borough (
    borough_key     INT IDENTITY NOT NULL PRIMARY KEY,
    borough_name    VARCHAR(50)  NOT NULL UNIQUE
);

IF OBJECT_ID('dbo.dim_agency') IS NULL
CREATE TABLE dbo.dim_agency (
    agency_key      INT IDENTITY NOT NULL PRIMARY KEY,
    agency_code     VARCHAR(100) NOT NULL UNIQUE,
    agency_name     VARCHAR(200) NOT NULL
);

IF OBJECT_ID('dbo.dim_complaint_type') IS NULL
CREATE TABLE dbo.dim_complaint_type (
    complaint_type_key INT IDENTITY NOT NULL PRIMARY KEY,
    complaint_type     VARCHAR(255) NOT NULL UNIQUE,
    category           VARCHAR(50)  NOT NULL
);

IF OBJECT_ID('dbo.fact_complaint') IS NULL
CREATE TABLE dbo.fact_complaint (
    unique_key          VARCHAR(50)   NOT NULL PRIMARY KEY,
    created_date_key    INT           NOT NULL REFERENCES dbo.dim_date (date_key),
    closed_date_key     INT           NULL     REFERENCES dbo.dim_date (date_key),
    borough_key         INT           NOT NULL REFERENCES dbo.dim_borough (borough_key),
    agency_key          INT           NULL     REFERENCES dbo.dim_agency (agency_key),
    complaint_type_key  INT           NOT NULL REFERENCES dbo.dim_complaint_type (complaint_type_key),
    created_at          DATETIME2(0)  NOT NULL,
    closed_at           DATETIME2(0)  NULL,
    created_hour        TINYINT       NOT NULL,
    [status]            VARCHAR(50)   NOT NULL,
    is_closed           BIT           NOT NULL,
    resolution_hours    DECIMAL(10,2) NULL,
    latitude            FLOAT         NULL,
    longitude           FLOAT         NULL
);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_fact_created_date')
CREATE INDEX ix_fact_created_date ON dbo.fact_complaint (created_date_key);

IF OBJECT_ID('dbo.etl_run_log') IS NULL
CREATE TABLE dbo.etl_run_log (
    run_id          INT IDENTITY NOT NULL PRIMARY KEY,
    started_at      DATETIME2(0) NOT NULL,
    finished_at     DATETIME2(0) NULL,
    rows_loaded     INT          NULL,
    [status]        VARCHAR(20)  NOT NULL
);
