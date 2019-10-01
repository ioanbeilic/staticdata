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

interface Room {
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
}

interface Facility {
  facilityCode: number;
  facilityGroupCode: number;
  description: {
    content: string;
  };
  order: number;
  distance: number;
  voucher: boolean;
}

interface Image {
  type: {
    code: string;
    description: {
      content: string;
    };
  };
  path: string;
  roomCode: string;
  roomType: string;
  characteristicCode: string;
  order: number;
  visualOrder: number;
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
  auditData: {
    processTime: string;
    timestamp: string;
    requestHost: string;
    serverId: string;
    environment: string;
    release: string;
  };
  hotel: {
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
      longitude: number;
      latitude: number;
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
      typeDescription: 'Hotel';
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
    facilities: Facility[];
    images: Image[];
    wildcards: Wildcard[];
    web: string;
    lastUpdate: string;
    S2C: string;
    ranking: number;
  };
}
