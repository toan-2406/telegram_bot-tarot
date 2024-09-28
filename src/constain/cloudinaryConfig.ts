import { Cloudinary } from 'cloudinary-core';

const cloudinary = new Cloudinary({
  cloud_name: 'imt-media',
  secure: true,
});

export default cloudinary;
