import * as https from 'https';
import { XMLParser } from 'fast-xml-parser';
const parser = new XMLParser();

export interface PilotList {
  [name: string]: Pilot;
}
interface Drone {
  positionX: number;
  positionY: number;
  serialNumber: string;
}

interface PilotData {
  pilotId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdDt: string;
  email: string;
}

interface Pilot {
  pilotData: PilotData;
  distance: number;
  persistUntil: number;
}

export function checkPilotPersistence(pilotsList: PilotList) {
  const time: number = Date.now();
  for (const key in pilotsList) {
    if (pilotsList[key].persistUntil < time) delete pilotsList[key]; //Delete pilot records if time is due
  }
  return pilotsList;
}

function droneDistanceFromOrigin(drone: Drone) {
  return Math.sqrt((250000 - drone.positionX) ** 2 + (250000 - drone.positionY) ** 2);
}

function getResource(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let resource = '';
      if (response.statusCode! < 200 || response.statusCode! > 299) reject(response.statusCode);
      response.on('data', (chunks: string) => {
        resource += chunks;
      });
      response.on('end', () => {
        resolve(resource);
      });
      response.on('error', (error) => {
        reject(error);
      });
    });
  });
}
/*
function getResources(urls: string[]): Promise<string>[] {
  return urls.map((url: string) => getResource(url));
}
*/
export async function getPilots(pilotsList: PilotList) {
  const persist = Date.now() + 600000;
  try {
    const drones: Drone[] = parser
      .parse(await getResource('https://assignments.reaktor.com/birdnest/drones'))
      .report.capture.drone.filter((drone: Drone) => droneDistanceFromOrigin(drone) < 100000);
    try {
      const pilots = drones
        .filter((drone) => {
          const distance = droneDistanceFromOrigin(drone);
          //only get pilots, whose information we don't already have
          if (drone.serialNumber in pilotsList) {
            pilotsList[drone.serialNumber].persistUntil = persist;
            pilotsList[drone.serialNumber].distance =
              distance > pilotsList[drone.serialNumber].distance ? pilotsList[drone.serialNumber].distance : distance;
          }
          return drone;
        })
        .map(async (drone) => {
          return {
            droneSN: drone.serialNumber,
            pilotData: JSON.parse(
              await getResource('https://assignments.reaktor.com/birdnest/pilots/' + drone.serialNumber)
            ),
            distance: droneDistanceFromOrigin(drone),
            persistUntil: persist,
          };
        });
      await Promise.all(pilots)
        .then((resolvedPilots) =>
          resolvedPilots.forEach((pilot) => {
            if (pilotsList[pilot.droneSN]) {
              pilot.distance =
                pilotsList[pilot.droneSN].distance > pilot.distance
                  ? pilot.distance
                  : pilotsList[pilot.droneSN].distance;
            }
            pilotsList[pilot.droneSN] = pilot;
          })
        )
        .catch((error) => console.log(error));
      return pilotsList;
    } catch (err2) {
      console.log(err2);
    }
  } catch (err1) {
    console.log(err1);
  }
}
