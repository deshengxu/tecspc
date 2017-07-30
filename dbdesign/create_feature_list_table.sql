-- Table: "Feature_List"

-- DROP TABLE "Feature_List";

CREATE TABLE "Feature_List"
(
  "TCPN" text NOT NULL,
  "TCPN_REV" text,
  "INSPECTION_DOCUMENT_NAME" text,
  "INSPECTION_REVISION_CODE" text,
  "LAST_DT" time with time zone,
  "Feature_ID" text,
  "Type" text,
  "Locked" boolean,
  "NOMINAL_DIM" real,
  "LOWER_TOLERANCE_DIM" real,
  "UPPER_TOLERANCE_DIM" real
)
WITH (
  OIDS=TRUE
);
ALTER TABLE "Feature_List"
  OWNER TO twadmin;
