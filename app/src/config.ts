const dev = process.env.NODE_ENV === "development";
const baseUrl = dev ? "http://192.168.1.59:80" : "";

export {
  dev,
  baseUrl
};