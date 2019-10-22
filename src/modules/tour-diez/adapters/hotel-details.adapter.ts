import t from 'typy';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { CreateHotelDetailsDto } from '../dto/create-hotel-details.dto';
import path from 'path';
import _ from 'lodash';
import { Hotel } from '../interfaces/hotel.interface';
import { HotelDetailsBean } from '../interfaces/provider/server-content-response.interface';

@Injectable()
export class CreateHotelDetailsAdapter {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  async transform(originalData: HotelDetailsBean, hotel: Hotel) {
    const hotelDetails = new CreateHotelDetailsDto();

    try {
      hotelDetails.hotelId = hotel.hotelId;
      hotelDetails.name = t(originalData, 'nombre').safeObject || '';
      hotelDetails.address = t(originalData, 'direccion').safeObject || '';

      hotelDetails.description =
        t(originalData, 'descripcion').safeObject || '';

      hotelDetails.postalCode = t(originalData, 'codPostal').safeObject || '';

      hotelDetails.location = {
        latitude: hotel.latitude,
        longitude: hotel.longitude,
      };

      hotelDetails.postalCode = hotel.zipCode;

      hotelDetails.city = t(originalData, 'ciudad').safeObject || '';

      hotelDetails.province = t(originalData, 'provincia').safeObject || '';

      hotelDetails.web = '';

      hotelDetails.phones = [
        {
          number: t(originalData, 'ContactInfo.PhoneNumbers').safeObject || '',
          info: '',
        },
      ];

      hotelDetails.email = '';

      hotelDetails.category = {
        name: t(originalData, 'categoria.nombre').safeObject || '',
        value: t(originalData, 'categoria.claveCategoria').safeObject || '',
      };

      if (
        t(originalData, 'imagenes.nombreImagen').isArray ||
        t(originalData, 'imagenes.nombreImagen').isString
      ) {
        try {
          hotelDetails.photos = await this.getImages(
            t(originalData, 'imagenes.nombreImagen').safeObject,
          );
        } catch (error) {
          this.logger.error(
            path.resolve(__filename) +
              ' ---> ' +
              `hotelDetails.image, ${hotelDetails.hotelId}`,
          );
        }
      } else {
        hotelDetails.photos = [];
      }

      hotelDetails.facilities = [];
      hotelDetails.currency = '';
    } catch (error) {
      this.logger.error(
        path.resolve(__filename) + ' ---> ' + `${hotelDetails.hotelId}`,
      );
    }

    return hotelDetails;
  }

  async getImages(images: string | string[]) {
    const photos = [];
    if (Array.isArray(images)) {
      images.forEach(img => {
        const newImg = {
          info: '',
          fileName: img,
          title: '',
        };

        photos.push(newImg);
      });
    } else {
      const newImg = {
        info: '',
        fileName: images,
        title: '',
      };
      photos.push(newImg);
    }
    return photos;
  }
}
