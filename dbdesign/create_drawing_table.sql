-- Table: Feature

-- DROP TABLE Drawing;

CREATE TABLE Drawing
(
  ID SERIAL Primary Key,
  PARTQIPID integer REFERENCES PartQip (ID),
  DRAWINGNOTE text,
  DRAWINGFILENAME text,
  SIZEX real,
  SIZEY real
);
ALTER TABLE Drawing
  OWNER TO postgres;
