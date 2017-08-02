-- Table: Feature_List

-- DROP TABLE Feature_List;

CREATE TABLE Feature_List
(
  ID SERIAL Primary Key,
  TCPN text NOT NULL,
  TCPN_REV text,
  INSPECTION_DOCUMENT_NAME text,
  INSPECTION_REVISION_CODE text,
  LAST_DT timestamp,
  Feature_ID text,
  Type text,
  Locked boolean,
  NOMINAL_DIM real,
  LOWER_TOLERANCE_DIM real,
  UPPER_TOLERANCE_DIM real,
  Filename text,
  Cp real,
  Cpk real,
  LCL real,
  UCL real,
  LSL real,
  USL real
);
ALTER TABLE Feature_List
  OWNER TO postgres;
