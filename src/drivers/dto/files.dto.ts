export interface filesUploadDTO {
    avatar?: Express.Multer.File[];
    vehicleImage?: Express.Multer.File[];
    Cavet_f?: Express.Multer.File[];
    Cavet_b?: Express.Multer.File[];
    identification_card_f?: Express.Multer.File[];
    identification_card_b?: Express.Multer.File[];
    license_image_f?: Express.Multer.File[];
    license_image_b?: Express.Multer.File;
}