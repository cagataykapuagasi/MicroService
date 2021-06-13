var geodist = require("geodist");

function closestLocation(targetLocation, locationData) {
  function vectorDistance(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
  }

  function locationDistance(location1, location2) {
    var dx = location1.latitude - location2.latitude,
      dy = location1.longitude - location2.longitude;

    return vectorDistance(dx, dy);
  }

  if (!locationData?.length) {
    return [];
  }

  locationData.map((item) => {
    //const distance = locationDistance(targetLocation, item.location);
    const distance = geodist(
      { lat: targetLocation.latitude, lon: targetLocation.longitude },
      { lat: item.location.latitude, lon: item.location.longitude }
    );
    console.log(distance);
  });

  // return locationData.reduce(function (prev, curr) {
  //   var prevDistance = locationDistance(targetLocation, prev.location),
  //     currDistance = locationDistance(targetLocation, curr.location);

  //   console.log("prev", prevDistance);
  //   console.log("cur", currDistance);
  //   return prevDistance < currDistance ? prev : curr;
  // });
}

module.exports = { closestLocation };
