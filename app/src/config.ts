const dev = process.env.NODE_ENV === "development";
const baseUrl = dev ? "http://localhost:80" : "";

export {
  dev,
  baseUrl
};