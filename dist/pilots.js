"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPilots = exports.checkPilotPersistence = void 0;
const https = __importStar(require("https"));
const fast_xml_parser_1 = require("fast-xml-parser");
const parser = new fast_xml_parser_1.XMLParser();
function checkPilotPersistence(pilotsList) {
    const time = Date.now();
    for (const key in pilotsList) {
        if (pilotsList[key].persistUntil < time)
            delete pilotsList[key]; //Delete pilot records if time is due
    }
    return pilotsList;
}
exports.checkPilotPersistence = checkPilotPersistence;
function droneDistanceFromOrigin(drone) {
    return Math.sqrt((250000 - drone.positionX) ** 2 + (250000 - drone.positionY) ** 2);
}
function getResource(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let resource = '';
            if (response.statusCode < 200 || response.statusCode > 299)
                reject(response.headers);
            response.on('data', (chunks) => {
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
function getPilots(pilotsList) {
    return __awaiter(this, void 0, void 0, function* () {
        const persist = Date.now() + 600000;
        try {
            const drones = parser
                .parse(yield getResource('https://assignments.reaktor.com/birdnest/drones'))
                .report.capture.drone.filter((drone) => droneDistanceFromOrigin(drone) < 100000);
            try {
                const newDrones = drones.filter((drone) => !(drone.serialNumber in pilotsList));
                drones //update data of pilots whose drones are already in the list
                    .filter((drone) => drone.serialNumber in pilotsList)
                    .forEach((drone) => {
                    const distance = droneDistanceFromOrigin(drone);
                    pilotsList[drone.serialNumber].persistUntil = persist;
                    pilotsList[drone.serialNumber].distance =
                        distance > pilotsList[drone.serialNumber].distance ? pilotsList[drone.serialNumber].distance : distance;
                });
                if (newDrones.length > 0) {
                    const pilots = newDrones.map((drone) => __awaiter(this, void 0, void 0, function* () {
                        return {
                            droneSN: drone.serialNumber,
                            pilotData: JSON.parse(yield getResource('https://assignments.reaktor.com/birdnest/pilots/' + drone.serialNumber)),
                            distance: droneDistanceFromOrigin(drone),
                            persistUntil: persist,
                        };
                    }));
                    yield Promise.all(pilots)
                        .then((resolvedPilots) => resolvedPilots.forEach((pilot) => {
                        if (pilotsList[pilot.droneSN]) {
                            pilot.distance =
                                pilotsList[pilot.droneSN].distance > pilot.distance
                                    ? pilot.distance
                                    : pilotsList[pilot.droneSN].distance;
                        }
                        pilotsList[pilot.droneSN] = pilot;
                    }))
                        .catch((error) => {
                        console.log('Promise: ' + new Date(Date.now()).toUTCString());
                        console.log(error);
                    });
                    return pilotsList;
                }
            }
            catch (err2) {
                console.log('Pilots: ' + new Date(Date.now()).toUTCString());
                console.log(err2);
            }
        }
        catch (err1) {
            console.log('Drones: ' + new Date(Date.now()).toUTCString());
            console.log(err1);
        }
    });
}
exports.getPilots = getPilots;
