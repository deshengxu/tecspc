-- Table: Position

-- DROP TABLE Position;

CREATE TABLE Position
(
  ID SERIAL Primary Key,
  DRAWINGID integer REFERENCES Drawing (ID),
  FEATUREID integer REFERENCES Feature (ID),
  Xposition real,
  Yposition real
);
ALTER TABLE Position
  OWNER TO postgres;
