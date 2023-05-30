import { configTypeorm } from '@main/config/typeorm';

const config = async () => {
  await configTypeorm();
};

export default config;