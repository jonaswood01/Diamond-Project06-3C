import { server } from './hosts';

export const getCustomBlock = async () => {
const response = await axios.get(`${server}/api/custom-block-models`);
return response;
};

export const getCustomBlockCount = async () => {
const response = await axios.get(`${server}/api/custom-block-models/count`);
return response;
};
export const getCustomBlockIds = async (id) => {
const response = await axios.get(`${server}/api/custom-block-models`, id);
return response;
};
export const PostCustomBlock = async (body) => {
const response = await axios.post(`${server}/api/custom-block-models`, body);
return response;
};
export const PutCustomBlock = async (id,body) => {
const response = await axios.put(`${server}/api/custom-block-models/`, id, body);
return response;
};
export const DeleteCustomBlock = async (id) => {
const response = await axios.delete(`${server}/api/custom-block-models/`,id);
return response;
};
