'use strict';
var https = require( 'https' );
var readline = require('linebyline');
var AWS = require('aws-sdk');

exports.handler = function (request, context) {
    log("first:",  JSON.stringify(request));
    if (request.directive.header.namespace === 'Alexa.Discovery' && request.directive.header.name === 'Discover') {
        log("DEBUG:", "Discover request",  JSON.stringify(request));
        handleDiscovery(request, context, "");
    }
    else if (request.directive.header.namespace === 'Alexa.PowerController') {
             var a = {
                         "context": {
                             "properties": [ {
                                "namespace": "Alexa.PowerController",
                                 "name": "powerState",
                                 "value": "ON",
                                 "timeOfSample": "2017-02-03T16:20:50.52Z",
                                 "uncertaintyInMilliseconds": 5000
                             } ]
                         },
                        "event": {
                            "header": {
                                "namespace": "Alexa",
                                "name": "Response",
                                "payloadVersion": request.directive.header.payloadVersion,
                                "messageId": request.directive.header.messageId,
                                "correlationToken": request.directive.header.correlationToken
                            },
                            "endpoint": {
                                 "scope": {
                                 "type": "BearerToken",
                                 "token" :request.directive.endpoint.scope.token
                                 },
                                "endpointId": request.directive.endpoint.endpointId
                            },
                            "payload": {}
                        }
                    };
        if (request.directive.header.name === 'TurnOn' || request.directive.header.name === 'TurnOff') {
            log("DEBUG:", "TurnOn or TurnOff Request", JSON.stringify(request));
            handlePowerControl(request, a);
        }
    } else if (request.directive.header.namespace === 'Alexa.BrightnessController') {
             var a = {
                         "context": {
                             "properties": [ {
                                "namespace": "Alexa.BrightnessController",
                                 "name": "brightness",
                                 "value": request.directive.payload.brightness,
                                 "timeOfSample": "2017-02-03T16:20:50.52Z",
                                 "uncertaintyInMilliseconds": 5000
                             } ]
                         },
                        "event": {
                            "header": {
                                "namespace": "Alexa",
                                "name": "Response",
                                "payloadVersion": request.directive.header.payloadVersion,
                                "messageId": request.directive.header.messageId,
                                "correlationToken": request.directive.header.correlationToken
                            },
                            "endpoint": {
                                 "scope": {
                                 "type": "BearerToken",
                                 "token" :request.directive.endpoint.scope.token
                                 },
                                "endpointId": request.directive.endpoint.endpointId
                            },
                            "payload": {}
                        }
                    };
            log("DEBUG:", "Brightness Request", JSON.stringify(request));
            handleBrightnessControl(request, a);
    } else if (request.directive.header.namespace === 'Alexa.ColorController') {
             var a = {
                         "context": {
                             "properties": [ {
                                "namespace": "Alexa.ColorController",
                                 "name": "color",
                                 "value": {
                                                "hue": 350.5,
                                                "saturation": 0.7138,
                                                "brightness": 0.6524
                                            },
                                 "timeOfSample": "2017-02-03T16:20:50.52Z",
                                 "uncertaintyInMilliseconds": 5000
                             } ]
                         },
                        "event": {
                            "header": {
                                "namespace": "Alexa",
                                "name": "Response",
                                "payloadVersion": request.directive.header.payloadVersion,
                                "messageId": request.directive.header.messageId,
                                "correlationToken": request.directive.header.correlationToken
                            },
                            "endpoint": {
                                 "scope": {
                                 "type": "BearerToken",
                                 "token" :request.directive.endpoint.scope.token
                                 },
                                "endpointId": request.directive.endpoint.endpointId
                            },
                            "payload": {}
                        }
                    };
            log("DEBUG:", "Color Request", JSON.stringify(request));
            handleColorControl(request, a);
    } else if (request.directive.header.namespace === 'Alexa.SceneController') {
             var a = {
                         "context": {
                             "properties": [ {
                                "namespace": "Alexa.SceneController",
                                 "name": "scene",
                                 "timeOfSample": "2017-02-03T16:20:50.52Z",
                                 "uncertaintyInMilliseconds": 5000
                             } ]
                         },
                        "event": {
                            "header": {
                                "namespace": "Alexa",
                                "name": "Response",
                                "payloadVersion": request.directive.header.payloadVersion,
                                "messageId": request.directive.header.messageId,
                                "correlationToken": request.directive.header.correlationToken
                            },
                            "endpoint": {
                                 "scope": {
                                 "type": "BearerToken",
                                 "token" :request.directive.endpoint.scope.token
                                 },
                                "endpointId": request.directive.endpoint.endpointId
                            },
                            "payload": {}
                        }
                    };
            log("DEBUG:", "Color Request", JSON.stringify(request));
            handleSceneControl(request, a);
    }

    function handleDiscovery(request, context) {
        var url="https://api.amazon.com/user/profile?access_token=" +request.directive.payload.scope.token;
        https.get(url, res => {
                res.setEncoding("utf8");
                let body = "";
                 res.on("data", data => {
                    body += data;
                });
                res.on("end", () => {
                    body = JSON.parse(body);
                    var email = body.email;
                    var split_email = email.replace(/\./g,'');
                    var file_in_s3 = split_email+'_leds.txt'
                    console.log("file_in_s3=", file_in_s3)
                        AWS.config.update({region: 'us-east-1', accessKeyId: AWS_KEY ,secretAccessKey: SECRET_KEY})
                    var s3 = new AWS.S3();
                     var getParams = {
                        Bucket: 'mrcatnapsthings', // your bucket name,
                        Key: file_in_s3 // path to the object you're looking for
                    }
                    s3.getObject(getParams, function(err, data) {
                        if (err){return console.log(err);}
                            let thingKey = data.Body.toString('utf-8'); // Use the encoding necessary
                             var key_vals = thingKey.split(",");
                             var payload = {};
                             payload["endpoints"] = [];
                             var count = 1;
                             for(var i = 0; i < key_vals.length; i++){
                                var current_key = key_vals[i].split(":");
                                var current_name = current_key[0];
                                var current_thing = current_key[1];
                                var iot_endpoint = current_key[2];
                                    var current_endpoint = {
                                        "endpointId": count.toString(),
                                        "manufacturerName": "Mr. CatNaps Imagination",
                                        "friendlyName": current_name,
                                        "description": "Smart Device Switch",
                                        "displayCategories": ["SWITCH"],
                                        "cookie": {
                                            "key1": current_thing,
                                            "key2": iot_endpoint,
                                            "key3": "but they should only be used for reference purposes.",
                                            "key4": "This is not a suitable place to maintain current endpoint state."
                                        },
                                        "capabilities":
                                        [
                                            {
                                              "type": "AlexaInterface",
                                              "interface": "Alexa",
                                              "version": "3"
                                            },
                                            {
                                                "interface": "Alexa.PowerController",
                                                "version": "3",
                                                "type": "AlexaInterface",
                                                "properties": {
                                                    "supported": [{
                                                        "name": "powerState"
                                                    }],
                                                     "retrievable": true
                                                }
                                            },
                                            {
                                                "interface": "Alexa.BrightnessController",
                                                "version": "3",
                                                "type": "AlexaInterface",
                                                "properties": {
                                                    "supported": [{
                                                        "name": "SetBrightness"
                                                    }],
                                                     "retrievable": true
                                                }
                                            },
                                            {
                                                "interface": "Alexa.ColorController",
                                                "version": "3",
                                                "type": "AlexaInterface",
                                                "properties": {
                                                    "supported": [{
                                                        "name": "SetColor"
                                                    }],
                                                     "retrievable": true
                                                }
                                            }
                                        ]
                                    }
                                    payload["endpoints"].push(current_endpoint);
                                    count += 1;
                             }
                             var header = request.directive.header;
                             header.name = "Discover.Response";
                             log("DEBUG", "Discovery Response: ", JSON.stringify({ header: header, payload: payload }));
                             context.succeed({ event: { header: header, payload: payload } });
                     });
                });
        });

    }

    function log(message, message1, message2) {
        console.log(message + message1 + message2);
    }

    function handlePowerControl(request, a){
        var endpointy = request.directive.endpoint.cookie.key2;
        var iotData = new AWS.IotData({endpoint: endpointy});
        var scene;
        var requestMethod = request.directive.header.name;
        var thingy = request.directive.endpoint.cookie.key1;
        if(requestMethod == 'TurnOff'){
            scene = 'solid=#000000';
        }else if (requestMethod == 'TurnOn'){
            scene = 'solid=#ffffff';
        }
        var payloadObj={ "state":
                              { "desired":
                                       {"scene": scene}
                              }
                     };
        var paramsUpdate = {
            "thingName" : thingy,
            "payload" : JSON.stringify(payloadObj)
        };          
        iotData.updateThingShadow(paramsUpdate, function(err, data) {
          if (err){
              console.log(err);
          }
          else {
            console.log(data);
            context.succeed(a);
          }
        });
        // get user token pass in request
    }
    function handleBrightnessControl(request, a){
        var endpointy = request.directive.endpoint.cookie.key2;
        var iotData = new AWS.IotData({endpoint: endpointy});
        var requestMethod = request.directive.header.name;
        var brightness_val = request.directive.payload.brightness;
        var set_brightness = (brightness_val/100)*255
        var thingy = request.directive.endpoint.cookie.key1;
        var final_brightness = 'brightness='+set_brightness;
        console.log(final_brightness);
        var payloadObj={ "state":
                              { "desired":
                                       {"scene": final_brightness}
                              }
                     };
        var paramsUpdate = {
            "thingName" : thingy,
            "payload" : JSON.stringify(payloadObj)
        };          
        iotData.updateThingShadow(paramsUpdate, function(err, data) {
          if (err){
              console.log(err);
          }
          else {
            console.log(data);
            context.succeed(a);
          }
        });
        // get user token pass in request
    }
    function handleSceneControl(request, a){
        var endpointy = request.directive.endpoint.cookie.key2;
        var iotData = new AWS.IotData({endpoint: endpointy});
        var scene;
        var requestMethod = request.directive.header.name;
        var thingy = request.directive.endpoint.cookie.key1;
        context.succeed(a);
    }
    function handleColorControl(request, a){
        var endpointy = request.directive.endpoint.cookie.key2;
        var iotData = new AWS.IotData({endpoint: endpointy});
        var scene;
        var requestMethod = request.directive.header.name;
        var thingy = request.directive.endpoint.cookie.key1;
        var hue = request.directive.payload.color.hue;
        var saturation = request.directive.payload.color.saturation;
        var brightness = request.directive.payload.color.brightness;
        var rgb = hsvToRgb(hue, saturation*100, brightness*100);
        var hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
        var scene = 'solid=' + hex;
        var payloadObj={ "state":
                              { "desired":
                                        {"scene": scene}
                              }
                     };
        var paramsUpdate = {
            "thingName" : thingy,
            "payload" : JSON.stringify(payloadObj)
        };          
        iotData.updateThingShadow(paramsUpdate, function(err, data) {
          if (err){
              console.log(err);
          }
          else {
            console.log(data);
            context.succeed(a);
          }
        });
        // get user token pass in request
    }
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    function hsvToRgb(h, s, v) {
        var r, g, b;
        var i;
        var f, p, q, t;
        h = Math.max(0, Math.min(360, h));
        s = Math.max(0, Math.min(100, s));
        v = Math.max(0, Math.min(100, v));
        s /= 100;
        v /= 100;
        if(s == 0) {
            // Achromatic (grey)
            r = g = b = v;
            return [
                Math.round(r * 255), 
                Math.round(g * 255), 
                Math.round(b * 255)
            ];
        }
        h /= 60; // sector 0 to 5
        i = Math.floor(h);
        f = h - i; // factorial part of h
        p = v * (1 - s);
        q = v * (1 - s * f);
        t = v * (1 - s * (1 - f));
        switch(i) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
         
            case 1:
                r = q;
                g = v;
                b = p;
                break;
         
            case 2:
                r = p;
                g = v;
                b = t;
                break;
         
            case 3:
                r = p;
                g = q;
                b = v;
                break;
         
            case 4:
                r = t;
                g = p;
                b = v;
                break;
         
            default: // case 5:
                r = v;
                g = p;
                b = q;
        }
        return [
            Math.round(r * 255), 
            Math.round(g * 255), 
            Math.round(b * 255)
        ];
    }
};
