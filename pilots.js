"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getPilots = exports.checkPilotPersistence = void 0;
var https = require("https");
var fast_xml_parser_1 = require("fast-xml-parser");
var parser = new fast_xml_parser_1.XMLParser();
var pilotsList = {};
function checkPilotPersistence() {
    var time = Date.now();
    for (var key in pilotsList) {
        if (pilotsList[key].persistUntil < time)
            delete pilotsList[key]; //Delete pilot records if time is due
        //Update Clients if pilots is changed
    }
}
exports.checkPilotPersistence = checkPilotPersistence;
function getResource(url) {
    return new Promise(function (resolve, reject) {
        https.get(url, function (response) {
            var resource = '';
            response.on('data', function (chunks) {
                resource += chunks;
            });
            response.on('end', function () {
                resolve(resource);
            });
            response.on('error', function (error) {
                reject(error);
            });
        });
    });
}
function getResources(urls) {
    return urls.map(function (url) { return getResource(url); });
}
function getPilots() {
    return __awaiter(this, void 0, void 0, function () {
        var persist, drones, _a, _b, pilots;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    persist = Date.now() + 600000;
                    _b = (_a = parser)
                        .parse;
                    return [4 /*yield*/, getResource('https://assignments.reaktor.com/birdnest/drones')];
                case 1:
                    drones = _b.apply(_a, [_c.sent()])
                        .report.capture.drone.filter(function (drone) {
                        return Math.sqrt(Math.pow((250000 - drone.positionX), 2) + Math.pow((250000 - drone.positionY), 2)) < 100000;
                    });
                    pilots = drones.map(function (drone) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, _b;
                        var _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _c = {};
                                    _b = (_a = JSON).parse;
                                    return [4 /*yield*/, getResource('https://assignments.reaktor.com/birdnest/pilots/' +
                                            drone.serialNumber)];
                                case 1: return [2 /*return*/, (_c.pilotData = _b.apply(_a, [_d.sent()]),
                                        _c.distance = Math.sqrt(Math.pow((250000 - drone.positionX), 2) + Math.pow((250000 - drone.positionY), 2)),
                                        _c.persistUntil = persist,
                                        _c)];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(pilots).then(function (resolvedPilots) {
                            return resolvedPilots.forEach(function (pilot) {
                                pilotsList[pilot.pilotData.pilotId] = pilot;
                            });
                        })];
                case 2:
                    _c.sent();
                    return [2 /*return*/, pilotsList];
            }
        });
    });
}
exports.getPilots = getPilots;
setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = console).log;
                return [4 /*yield*/, getPilots()];
            case 1:
                _b.apply(_a, [_c.sent()]);
                checkPilotPersistence();
                return [2 /*return*/];
        }
    });
}); }, 2000);
