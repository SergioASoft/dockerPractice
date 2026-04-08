# dockerPractice

## Cómo levantar la app con Docker

### 1. Construir las imágenes
Ubicarse en la carpeta raiz de donde se clonó el proyecto
```bash
docker build -t tasks-back ./back
docker build -t tasks-front ./front
```

### 2. Crear redes y volumen

```bash
docker network create front-back
docker network create back-bd
docker volume create mysql-data
```

### 3. Levantar los contenedores

```bash
# Base de datos
docker run -d --name bd --network back-bd \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=tasksdb \
  -v mysql-data:/var/lib/mysql \
  mysql:8
```

En caso de que la terminal no entienda "\" (Windows):
 ```bash
# Base de datos
docker run -d --name bd --network back-bd -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=tasksdb -v mysql-data:/var/lib/mysql mysql:8
```


> Esperar hasta que MySQL arranque y después:

```bash
# Backend
docker run -d --name back --network back-bd \
  -e DB_HOST=bd -e DB_USER=root \
  -e DB_PASSWORD=rootpassword -e DB_NAME=tasksdb \
  tasks-back

docker network connect front-back back

# Frontend
docker run -d --name front --network front-back \
  -p 80:80 tasks-front
```

En caso de que la terminal no entienda "\" (Windows):
```bash
# Backend
docker run -d --name back --network back-bd -e DB_HOST=bd -e DB_USER=root -e DB_PASSWORD=rootpassword -e DB_NAME=tasksdb tasks-back

docker network connect front-back back

# Frontend
docker run -d --name front --network front-back -p 80:80 tasks-front
```

### 4. Abrir en el navegador

**http://localhost**

---

## Apagar y limpiar todo

```bash
docker stop front back bd
docker rm front back bd
docker network rm front-back back-bd
docker volume rm mysql-data
docker rmi tasks-front tasks-back
```