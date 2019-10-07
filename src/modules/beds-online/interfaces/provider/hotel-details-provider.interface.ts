export interface HotelDetailsProviderResponse {
  auditData: {
    processTime: string;
    timestamp: string;
    requestHost: string;
    serverId: string;
    environment: string;
    release: string;
  };
  hotel: HotelDetailsProvider;
}

interface Board {
  code: string;
  description: {
    content: string;
  };
}

interface Segment {
  code: number;
  description: {
    content: string;
  };
}

interface Phone {
  phoneNumber: string;
  phoneType: string;
}

export interface Room {
  roomCode: string;
  description: string;
  type: {
    code: string;
    description: {
      content: string;
    };
  };
  characteristic: {
    code: string;
    description: {
      content: string;
    };
  };
  roomFacilities: RoomFacilities[];
  roomStays: RoomStays[];
}

interface RoomFacilities {
  facilityCode: number;
  facilityGroupCode: number;
  description: {
    content: string;
  };
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
  description: {
    content: string;
    number: number;
  };
}

interface Terminal {
  terminalCode: string;
  terminalType: string;
  distance: number;
  name: {
    content: string;
  };
  description: {
    content: string;
  };
}

export interface FacilityProvider {
  facilityCode: number;
  facilityGroupCode: number;
  description: {
    content: string;
  };
  order: number;
  indYesOrNo: boolean;
  number: number;
  voucher: boolean;
}

interface InterestPoint {
  facilityCode: number;
  facilityGroupCode: number;
  order: number;
  poiName: string;
  distance: string;
}

export interface ImageProvider {
  type: {
    code: string;
    description: {
      content: string;
    };
  };
  path: string;
  roomCode: string;
  roomType: string;
  characteristicCode?: string;
  order: number;
  visualOrder: string;
}

interface Wildcard {
  roomType: string;
  roomCode: string;
  characteristicCode: string;
  hotelRoomDescription: {
    content: string;
  };
}

export interface HotelDetailsProvider {
  code: number;
  name: {
    content: string;
  };
  description: {
    content: string;
  };

  country: {
    code: string;
    isoCode: string;
    description: {
      content: string;
    };
  };
  state: {
    code: string;
    name: string;
  };
  destination: {
    code: string;
    name: {
      content: string;
    };
    countryCode: string;
  };
  zone: {
    zoneCode: number;
    name: string;
    description: {
      content: string;
    };
  };
  coordinates: {
    longitude: string;
    latitude: string;
  };
  category: {
    code: string;
    description: {
      content: string;
    };
  };
  categoryGroup: {
    code: string;
    description: {
      content: string;
    };
  };
  chain: {
    code: string;
    description: {
      content: string;
    };
  };
  accommodationType: {
    code: string;
    typeMultiDescription: {
      content: string;
    };
    typeDescription: string;
  };
  boards: Board[];

  segments: Segment[];
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
  facilities: FacilityProvider[];
  terminals: Terminal[];
  interestPoints: InterestPoint[];
  images: ImageProvider[];
  wildcards: Wildcard[];
  web: string;
  lastUpdate: string;
  S2C: string;
  ranking: number;
}
