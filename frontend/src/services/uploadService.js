import { toast } from 'react-toastify';
import axios from 'axios';

export const uploadImage = async event => {
  let toastId = null;

  const image = await getImage(event);
  if (!image) return null;

  const formData = new FormData();
  formData.append('image', image, image.name);
  const response = await axios.post('/api/upload', formData, {
    onUploadProgress: ({ progress }) => {
      if (toastId) toast.update(toastId, { progress });
      else toastId = toast.success('Uploading...', { progress });
    },
  });
  toast.dismiss(toastId);
  return response.data.imageUrl;
};

const getImage = async event => {
  const files = event.target.files;

  if (!files || files.length <= 0) {
    toast.warning('Upload file is not selected!', 'File Upload');
    return null;
  }

  const file = files[0];

  // Accept both jpeg and png
  if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
    toast.error('Only JPG or PNG type is allowed', 'File Type Error');
    return null;
  }

  return file;
};