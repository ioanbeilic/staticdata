export interface HotelProviderResponse {
  from: number;
  to: number;
  total: number;
  auditData: {
    processTime: string;
    timestamp: string;
    requestHost: string;
    serverId: string;
    environment: string;
    release: string;
  };
  hotels: HotelProvider[];
}

interface Phone {
  phoneNumber: string;
  phoneType: string;
}

interface Room {
  roomCode: string;
  roomType: string;
  characteristicCode: string;
  roomFacilities: RoomFacilities[];
  roomStays: RoomStays[];
}

interface RoomFacilities {
  facilityCode: number;
  facilityGroupCode: number;
  number: number;
  indYesOrNo: boolean;
  voucher: boolean;
}

interface RoomStays {
  stayType: string;
  order: number;
  description: string;
  roomStayFacilities: RoomStayFacilities[];
}

interface RoomStayFacilities {
  facilityCode: number;
  facilityGroupCode: number;
  number: number;
}

interface Terminal {
  terminalCode: string;
  distance: number;
}

interface InterestPoint {
  facilityCode: number;
  facilityGroupCode: number;
  order: number;
  poiName: string;
  distance: string;
}

interface Image {
  imageTypeCode: string;
  path: string;
  order: number;
  visualOrder: number;
  roomCode: string;
  roomType: string;
  characteristicCode: string;
}

interface Wildcard {
  roomType: string;
  roomCode: string;
  characteristicCode: string;
  hotelRoomDescription: {
    content: string;
  };
}

interface HotelProvider {
  code: number;
  name: {
    content: string;
  };
  description: {
    content: string;
  };
  countryCode: string;
  stateCode: string;
  destinationCode: string;
  zoneCode: number;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  categoryCode: string;
  categoryGroupCode: string;
  chainCode: string;
  accommodationTypeCode: string;
  boardCodes: string[];
  segmentCodes: number[];
  address: {
    content: string;
  };
  postalCode: string;
  city: {
    content: string;
  };
  email: string;
  license: string;
  phones: Phone[];
  rooms: Room[];

  terminals: Terminal[];
  interestPoints: InterestPoint[];
  images: Image[];
  wildcards: Wildcard[];
  web: string;
  lastUpdate: string;
  S2C: string;
  ranking: number;
}
