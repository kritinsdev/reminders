import { Calendar } from "./inc/Calendar";
import { DataStore } from "./inc/DataStore";

const dataStore = new DataStore();
const calendar = new Calendar('calendar', dataStore);