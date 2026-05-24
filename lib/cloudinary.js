export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'vitloop');
  formData.append('cloud_name', 'dfj5tpod9');

  const res = await fetch('https://api.cloudinary.com/v1_1/dfj5tpod9/image/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  return data.secure_url;
};