# Define variables
REGISTRY=localhost:5001
RELEASE_NAME=fleetman-node

# Build images and push them to registry 
CLIENT_TAG="$REGISTRY/$RELEASE_NAME-client:latest"
docker build -t $CLIENT_TAG -f ./client/Dockerfile ./client
docker push $CLIENT_TAG

POSITION_TRACKER_TAG="$REGISTRY/$RELEASE_NAME-position-tracker:latest"
docker build -t $POSITION_TRACKER_TAG -f ./position-tracker/Dockerfile ./position-tracker
docker push $POSITION_TRACKER_TAG

POSITION_SIMULATOR_TAG="$REGISTRY/$RELEASE_NAME-position-simulator:latest"
docker build -t $POSITION_SIMULATOR_TAG -f ./position-simulator/Dockerfile ./position-simulator
docker push $POSITION_SIMULATOR_TAG

# Deploy to k8s cluster
# helm upgrade "$RELEASE_NAME" ./k8s/helm --install
kubectl create namespace $RELEASE_NAME
kubectl apply -f ./k8s -n $RELEASE_NAME

# Restart deployments
kubectl rollout restart "deployment/client" -n $RELEASE_NAME
kubectl rollout restart "deployment/position-tracker" -n $RELEASE_NAME
kubectl rollout restart "deployment/position-simulator" -n $RELEASE_NAME
kubectl rollout restart "deployment/redis" -n $RELEASE_NAME