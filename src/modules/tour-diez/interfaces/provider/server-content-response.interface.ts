import { ServerHotelContentInterface } from './content.interface';

export interface ServerHotelDetailsResponse {
  hotelDetails: {
    result: {
      cod_result: string;
      des_result: string;
      type_message: string;
    };
    HotelDetailsBean: HotelDetailsBean;
  };
}

export interface HotelDetailsBean {
  anioConstrucion: string;
  anioRenovacion: string;
  categoria: { claveCategoria: string; nombre: string };
  codCiudad: string;
  ciudad: string;
  codPostal: string;
  descripcion: string;
  direccion: string;
  email: { nil: boolean };
  fax: string;
  imagenes: {
    nombreImagen: string[];
  };
  nhabitaciones: string;
  nombre: string;
  numPlantas: string;
  codPais: string;
  pais: string;
  codProvincia: string;
  provincia: string;
  restaurantes: string;
  salones: string;
  servicios: string;
  tfno: string;
}
