-- Table: Feature

-- DROP TABLE Feature;

CREATE TABLE Feature
(
  ID SERIAL Primary Key,
  PARTQIPID integer REFERENCES PartQip (ID),
  FEATURE text,
  TYPE text,
  LOCKED boolean,
  LASTUPDATE timestamp,
  NOMINAL real,
  LTL real,
  UTL real,
  Filename text,
  CP real,
  CPK real,
  LCL real,
  UCL real,
  LSL real,
  USL real,
  PASSRATE real,
  PICTURENAME text
);
ALTER TABLE Feature
  OWNER TO postgres;
