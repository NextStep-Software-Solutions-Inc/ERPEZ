
import 'react-leaflet';

declare module 'react-leaflet' {
  export interface MapContainerProps {
    center?: [number, number] | { lat: number; lng: number };
    zoom?: number;
    maxZoom?: number;
    minZoom?: number;
    zoomControl?: boolean;
    scrollWheelZoom?: boolean;
    style?: React.CSSProperties | any;
  }
  export interface TileLayerProps {
    attribution?: string;
  }
  export interface CircleMarkerProps {
    color?: string;
    radius?: number;
  }
  export interface PolylineProps {
    color?: string;
  }
  export interface PolygonProps {
    color?: string;
  }
  export interface RectangleProps {
    color?: string;
  }
  export interface GeoJSONProps {
    style?: any;
    pointToLayer?: any;
  }
}
