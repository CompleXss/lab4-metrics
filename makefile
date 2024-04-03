IMAGE_NAME = lab4-docker
CONTAINER_NAME = lab4

build:
    docker build -t $(IMAGE_NAME) .

run:
    docker run -it -p 3000:3000 -v /proc:/proc --rm --name $(CONTAINER_NAME) $(IMAGE_NAME)

stop:
    docker stop $(CONTAINER_NAME)

clean:
    docker image rm $(IMAGE_NAME)
