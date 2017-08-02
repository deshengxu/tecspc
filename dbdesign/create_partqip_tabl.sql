-- Table: PartQip

-- DROP TABLE PartQip;

CREATE TABLE PartQip
(
  ID SERIAL Primary Key,
  TCPN text NOT NULL,
  TCPN_REV text,
  QIP text,
  QIP_Code text,
  LAST_DT timestamp,
  Locked boolean
);
ALTER TABLE PartQip
  OWNER TO postgres;
