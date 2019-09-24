export class CreateHotelDto {
  readonly jPCode!: string;
  readonly hasSynonyms!: boolean;
  readonly name!: string;
  readonly zone!: string;
  readonly address!: string;
  readonly zipCode!: number;
  readonly latitude!: number;
  readonly longitude!: number;
  readonly hotelCategory!: string;
  readonly city!: string;
}
