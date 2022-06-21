import { useLoadScript } from '@react-google-maps/api';
import Map from './components/map/map';
import Loader from './components/loader';

import './App.css';


function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: (process.env.REACT_APP_API_KEY as string),
    libraries: ["places"]
  })

  if (!isLoaded) return <Loader />;

  return (
    <div className="App">
      Key: {process.env.REACT_APP_API_KEY}
      <Map />
    </div>
  );
}

export default App;
