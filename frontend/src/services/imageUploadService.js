import api from './api';

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
};

export const uploadProductImage = async (productId, file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post(`/products/${productId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload product image');
  }
};
