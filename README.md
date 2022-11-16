# Intro

This is a rewrite of the fleetman application written by Dick Chesterwood as part of his courses (in this case Istio). The java version does not seem to work on arm64, so I decided to reverse engineer the application using NodeJs.

# Run locally

Make sure you created a k8s cluster using the k8s-certs project.

The install this app in local cluster:

```
./deploy_local.sh
```

Add to /etc/hosts file:

```
127.0.0.1 fleetman.dotnet-works.com
```

The browse to:

```
https://fleetman.dotnet-works.com
```

# Some useful reading:

https://github.com/DickChesterwood/k8s-fleetman/blob/3da54eea4a713132622e81697926ea942ca26d0b/
k8s-fleetman-position-simulator/src/main/java/com/virtualpairprogrammers/simulator/journey/Journey.java#L18ackoverflow.com/questions/34631839/how-to-get-all-the-latitude-and-longitude-of-a-route-from-location-astart-point

https://stackoverflow.com/questions/34631839/how-to-get-all-the-latitude-and-longitude-of-a-route-from-location-astart-point
