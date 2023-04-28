import { Calendar } from "./inc/Calendar";
import { DataStore } from "./inc/DataStore";

const dataStore = new DataStore();

new Calendar('calendar', dataStore);