export interface DHTSensorData {
  temperature: number;
  humidity: number;
}

export default interface DHTSensor {
  getData(): Promise<DHTSensorData> | DHTSensorData;
}