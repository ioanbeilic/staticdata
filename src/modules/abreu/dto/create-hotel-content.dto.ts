export class CreateHotelDetailsDto {
  public hotelId!: string;
  public name!: string;
  public description!: string;
  public location!: Location;
  public city!: string;
  public address!: string;
  public province!: string;
  public country!: string;
  public postalCode!: string;
  public web!: string;
  public phones!: Phone[];
  public email!: string;
  public category!: Category;
  public photos!: Image[];
  public facilities!: Facility[];
  public currency!: string;
}

export interface Phone {
  number: string;
  type: string;
}

export interface Category {
  name: string;
  value: string;
}

export interface Location {
  latitude: string;
  longitude: string;
}

export interface Description {
  description: string;
  type: string;
}

export interface Image {
  type: string;
  fileName: string;
  title: string;
}

export interface Facility {
  id: number;
  description: string;
  groupId: number;
}
