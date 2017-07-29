create user mesoracle identified by mesoracle 
       temporary tablespace TEMP 
       default tablespace USERS       
/
grant connect, resource to mesoracle
/
grant create sequence, create view, query rewrite, unlimited tablespace, select any dictionary to mesoracle;