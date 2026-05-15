// Redis đã bị vô hiệu hóa hoàn toàn theo yêu cầu của người dùng
const connectRedis = async () => {
  console.log('ℹ️ Redis has been disabled.');
  return;
};

const getClient = () => null;

const getCache = async (key) => {
  return null;
};

const setCache = async (key, value, ttl = 3600) => {
  return;
};

const clearCache = async (pattern) => {
  return;
};

module.exports = { connectRedis, getClient, getCache, setCache, clearCache };
