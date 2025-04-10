// init-mongo.d/init.js

// Conectar a la base de datos 'devdb'
db.createCollection('test')
db = db.getSiblingDB('admin');

// Crear el usuario 'apiUser' con el rol 'readWrite' en 'devdb'
db.createUser(
  {
    user: "apiUser",
    pwd: "apiPassword",
    roles: [ { role: "readWrite", db: "admin" } ]
  }
);