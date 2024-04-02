IMAGE_NAME = lab4-docker

build:
    docker build -t $(IMAGE_NAME) .

run:
    docker run -p 3000:3000 $(IMAGE_NAME)

stop:
    docker stop $(IMAGE_NAME)

clean:
    docker rm $(IMAGE_NAME)

make -f makefile build run
