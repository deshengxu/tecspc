-- Table: Position_List

-- DROP TABLE Position_List;

CREATE TABLE Position_List
(
  positionID SERIAL Primary Key,
  drawingID integer REFERENCES drawing_list (drawingID),
  Feature_ID text NOT NULL,
  Xposition real,
  Yposition real
);
ALTER TABLE Position_List
  OWNER TO postgres;
