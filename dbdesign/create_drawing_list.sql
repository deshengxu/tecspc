-- Table: Drawing_List

-- DROP TABLE Drawing_List;

CREATE TABLE Drawing_List
(
  drawingID SERIAL Primary Key,
  TCPN text NOT NULL,
  TCPN_REV text,
  INSPECTION_DOCUMENT_NAME text,
  INSPECTION_REVISION_CODE text,
  Drawingname text,
  Xsize real,
  Ysize real
);
ALTER TABLE Drawing_List
  OWNER TO postgres;
