import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";

import {
  farOptions,
  middleOptions,
  closeOptions,
  polylineOptions,
  MAP_STYLE_ID, DEFAULT_CENTER
} from "./options";

import { generateHouses } from "./generateHauses";
import namespaces from "../../namespaces";
import Places from "../places";
import Distance from "../distance";

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;
type GoogleMaps = google.maps.Map;


const Map = () => {
  const [office, setOffice] = useState<LatLngLiteral>();
  const [directions, setDirections] = useState<DirectionsResult>();
  const mapRef = useRef<GoogleMaps>();
  const center = useMemo<LatLngLiteral>(() => (DEFAULT_CENTER), []);
  const options = useMemo<MapOptions>(() => ({
    mapId: MAP_STYLE_ID,
    clickableIcons: false,
    disabledDefaultUI: true
  }), [])

  const onLoad = useCallback((map: GoogleMaps) => {
    mapRef.current = map;
  }, []);

  const houses = useMemo(() => generateHouses(office || center), [office, center]);


  const fetchDirection = (house: LatLngLiteral) => {
    if (!office) return;
    const service = new google.maps.DirectionsService();

    service.route({
      origin: house,
      destination: office,
      travelMode: google.maps.TravelMode.DRIVING
    },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          console.log(mapRef.current)
          setDirections(result);
        } else console.error('Something went wrong, fetchDirection fn');
      }
    )
  }

  return (
    <div className="container">
      <div className="controls">
        <h2>Commute?
          <Places
            setOffice={(position) => {
              setOffice(position);
              mapRef.current?.panTo(position);
            }} />
        </h2>
        {!office && <div>Please, enter you address</div>}
        {directions && <Distance leg={directions.routes[0].legs[0]} />}
      </div>
      <div className="map">
        <GoogleMap
          options={options}
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          onLoad={onLoad}
        >
          {directions &&
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  ...polylineOptions
                },
                preserveViewport: true,
                suppressMarkers: true,
              }} />
          }

          {office && (
            <>
              <Marker
                position={office}
                icon={namespaces.MARKER_FLAG_URL}
              />

              <MarkerClusterer>
                {(clusterer): any =>
                  houses.map((house) => (
                    <Marker
                      key={house.lat}
                      position={house}
                      clusterer={clusterer}
                      onClick={() => { fetchDirection(house) }}
                    />
                  ))
                }
              </MarkerClusterer>

              <Circle center={office} radius={5000} options={closeOptions} />
              <Circle center={office} radius={10000} options={middleOptions} />
              <Circle center={office} radius={15000} options={farOptions} />
            </>
          )}
        </GoogleMap>
      </div>
    </div>
  )
}

export default Map;