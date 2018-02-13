// Require the AWS SDK and get the instance of our DynamoDB
var aws = require('aws-sdk');
var iot = new aws.Iot({region: 'us-east-1'});
var fs = require('fs');
// Set up the model for our the email
var model = {
  email: {"S" : ""},
};
var thing_string = "";

// This will be the function called when our Lambda function is exectued
exports.handler = (event, context, callback) => {
console.log("body  ", event.body);
  var email = event.body.email;
  var thing = event.body.thing;
  var method = event.body.method;


  // We'll use the same response we used in our Webtask
  const RESPONSE = {
    OK : {
      statusCode : 200,
      message: "You have successfully subscribed to the newsletter!",
      email: email,
        headers: {
         "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
         "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
        }
    },
    DUPLICATE : {
      status : 400,
      message : "You are already subscribed.",
        headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
        }
    },
    ERROR : {
      status : 400,
      message: "Something went wrong. Please try again.",
        headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
      }
    }
  };

  // Capture the email from our POST request
  // For now, we'll just set a fake email
  console.log("We got inside, let's do crazy shit!!!! ");
  console.log("Email: ", email);
  console.log("Thing: ", thing);
  console.log("Method: ", method);

  if(method == 'updateThings'){
  	var s3 = new aws.S3();
  	var things = event.body.thingArray;
  	var thing_string = things.join(":IOT_ENDPOINT,");
  	thing_string += ':IOT_ENDPOINT'; 
  	console.log('thing string', thing_string );
  	var split_email = email.replace(/\./g,'');
  	var thing_file_name = split_email+'_leds.txt';
  	var at_split = split_email.split('@');
  	var upcase_email = at_split[0]+at_split[1].toUpperCase();
  	var file_in_s3 = thing_file_name;
  	console.log("File Name: ", file_in_s3);
  	aws.config.update({region: 'us-east-1'});
  	var params = {
  	  thingName: upcase_email, /* required */
  	  attributePayload: {
  	    attributes: {
  	      'onTheFlyCreation': thing_file_name,
  	      /* '<AttributeName>': ... */
  	    },
  	    merge: true || false
  	  }
  	};
  	var iot_endpoint = IOT_ENDPOINT;
  	var region = 'us-east-1';
  	var thing_name = upcase_email;
  	var file_save = "tempfile";
  	fs.writeFile("/tmp/thing.txt", file_save, function(err) {
  	    if(err) {
  	        return console.log(err);
  	    }
  	    var params = {Bucket: 'mrcatnapsthings', Key: thing_file_name, Body: thing_string};
  	    s3.putObject(params, function(err, data) {
  	      if (err) console.log(err, err.stack); // an error occurred
  	      else {
  	      	console.log("thing stuff from creation: ", thing_string);
  			 const RESPONSE = {
  			    thingSuccess : {
  			      statusCode : 200,
  			      message: "Heres your thing",
  			      thing_string: things,
  			      email: email,
  			        headers: {
  			         "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
  			         "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
  			        }
  			    }
  			  };
  	      	callback(null, RESPONSE.thingSuccess);
  	      }           // successful response
  	    });
  	});
  	callback(null, RESPONSE.sceneSuccess);
  };

  if(method == 'createThing'){
  	var s3 = new aws.S3();
  	var things = event.body.thingArray;
  	var things_arr_length = things.length;
  	var thing_string = things.join(":IOT_ENDPOINT,");
  	var split_email = email.replace(/\./g,'');
  	var thing_file_name = split_email+'_leds.txt';
  	var at_split = split_email.split('@');
  	var upcase_email = at_split[0]+at_split[1].toUpperCase();
  	var file_in_s3 = thing_file_name;
  	var new_thing_name = upcase_email + '_' + things_arr_length;
  	thing_string += ':IOT_ENDPOINT,NewThing:' + new_thing_name +':IOT_ENDPOINT';
  	console.log("Thing String: ", thing_string);
  	aws.config.update({region: 'us-east-1'});
  	var params = {
  	  thingName: new_thing_name, /* required */
  	  attributePayload: {
  	    attributes: {
  	      'onTheFlyCreation': thing_file_name,
  	      /* '<AttributeName>': ... */
  	    },
  	    merge: true || false
  	  }
  	};
  	iot.createThing(params, function(err, data) {
  	  if (err) console.log(err, err.stack); // an error occurred
  	  else     console.log(data);           // successful response
  	});
  	var iot_endpoint = IOT_ENDPOINT;
  	var region = 'us-east-1';
  	var thing_name = upcase_email;
  	var file_save = "tempfile";
  	fs.writeFile("/tmp/thing.txt", file_save, function(err) {
  	    if(err) {
  	        return console.log(err);
  	    }
  	    var params = {Bucket: 'mrcatnapsthings', Key: thing_file_name, Body: thing_string};
  	    s3.putObject(params, function(err, data) {
  	      if (err) console.log(err, err.stack); // an error occurred
  	      else {
  	      	console.log("thing stuff from creation: ", thing_string);
  			 const RESPONSE = {
  			    thingSuccess : {
  			      statusCode : 200,
  			      message: "Heres your thing",
  			      thing_string: things,
  			      email: email,
  			        headers: {
  			         "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
  			         "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
  			        }
  			    }
  			  };
  	      	callback(null, RESPONSE.thingSuccess);
  	      }           // successful response
  	    });
  	});
  	callback(null, RESPONSE.sceneSuccess);
  };

  
  if(method == "getThing"){
	  var split_email = email.replace(/\./g,'');
	  console.log("split emaiml: ", split_email);
	  var thing_file_name = split_email+'_leds.txt';
	  var at_split = split_email.split('@');
	  var upcase_email = at_split[0]+at_split[1].toUpperCase();
	  var file_in_s3 = thing_file_name;
	  aws.config.update({region: 'us-east-1', accessKeyId: ACCESS_KEY,secretAccessKey: SECRET_KEY});
	  var s3 = new aws.S3();
	  var getParams = {
	    Bucket: 'mrcatnapsthings', // your bucket name,
	    Key: file_in_s3 // path to the object you're looking for
	  };
  	s3.getObject(getParams, function(err, data) {
	  if (err){
	  	aws.config.update({region: 'us-east-1'});
	  	var params = {
	  	  thingName: upcase_email, /* required */
	  	  attributePayload: {
	  	    attributes: {
	  	      'onTheFlyCreation': thing_file_name,
	  	      /* '<AttributeName>': ... */
	  	    },
	  	    merge: true || false
	  	  }
	  	};
	  	iot.createThing(params, function(err, data) {
	  	  if (err) console.log(err, err.stack); // an error occurred
	  	  else     console.log(data);           // successful response
	  	});
	  	var iot_endpoint = IOT_ENDPOINT;
	  	var region = 'us-east-1';
	  	var thing_name = upcase_email;
	  	var file_save = 'NewThing:' + thing_name +':IOT_ENDPOINT';
	  	fs.writeFile("/tmp/thing.txt", file_save, function(err) {
	  	    if(err) {
	  	        return console.log(err);
	  	    }
	  	    var params = {Bucket: 'mrcatnapsthings', Key: thing_file_name, Body: file_save};
	  	    s3.putObject(params, function(err, data) {
	  	      if (err) console.log(err, err.stack); // an error occurred
	  	      else {
	  	      	console.log([thing_name, iot_endpoint, region]);
	  	      	thing_string = thing_name;
	  	    	var things = {};
	  	    	things[0]=file_save;
	  	    	
	  	      	console.log("thing stuff from creation: ", file_save);
				 const RESPONSE = {
				    thingSuccess : {
				      statusCode : 200,
				      message: "Heres your thing",
				      thing_string: things,
				      email: email,
				        headers: {
				         "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
				         "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
				        }
				    }
				  };
	  	      	callback(null, RESPONSE.thingSuccess);
	  	      }           // successful response
	  	    });
	  	});
	  }else{
	  	var getParams = {
	  	    Bucket: 'mrcatnapsthings', // your bucket name,
	  	    Key: thing_file_name // path to the object you're looking for
	  	};
	  	s3.getObject(getParams, function(err, data) {
	  	  if (err){return console.log(err);}
	  	  let thingKey = data.Body.toString('utf-8'); // Use the encoding necessary
	  	  console.log("THING KEY=", thingKey);
	  	  var key_vals = thingKey.split(",");
	  	  var iot_endpoint = key_vals[0];
	  	  var region = key_vals[1];
	  	  var key_length = key_vals.length;
	  	  var things = {};
	  	  for(var i = 0; i < key_length; i++){
	  	  	things[i] = key_vals[i];
	  	  }
  	      	console.log([thing_name, iot_endpoint, region]);
  	      	thing_string = thing_name;
    		const RESPONSE = {
		    thingSuccess : {
		      statusCode : 200,
		      message: "Heres your thing",
		      thing_string: things,
		      email: email,
		        headers: {
		         "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
		         "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
		        }
		    }
		  };
  	    	callback(null, RESPONSE.thingSuccess);
	  	});
	  }
	});
  }
  
  
if(method == "solidColor"){
	var color = event.body.color;
	var send_text = "solid="+color;
	send_to_lights(thing, send_text, callback);
}

if(method == "setSliderValues"){
	var sendValueString = event.body.sendValueString;
	send_to_lights(thing, sendValueString, callback);
}

if(method == "sceneSelect"){
	var scene = event.body.scene;
	send_to_lights(thing, scene, callback);
}

if(method == "specialScene"){
	var json_arr = event.body.json_arr;
	send_to_lights(thing, json_arr, callback);
}
  
  // Insert the email into the database, but only if the email does not already exist.
};

var send_to_lights = function(thing_entry, send_text, callback){
	var config = {};
	config.IOT_BROKER_ENDPOINT      = IOT_ENDPOINT;
	config.IOT_BROKER_REGION        = 'us-east-1';
	config.IOT_THING_NAME           = thing_entry;
	aws.config.region = config.IOT_BROKER_REGION;
	var iotData = new aws.IotData({endpoint: config.IOT_BROKER_ENDPOINT});
    var payloadObj={ "state":
                          { "desired":
                                   {"scene":send_text}
                          }
                 };
    var paramsUpdate = {
        "thingName" : config.IOT_THING_NAME,
        "payload" : JSON.stringify(payloadObj)
    };
    iotData.updateThingShadow(paramsUpdate, function(err, data) {
      if (err){
      	console.log(err);
      }
      else {
		const RESPONSE = {
		  sceneSuccess : {
			statusCode : 200,
			message: "Change Successful",
			sent_text: send_text,
			headers: {
				"Access-Control-Allow-Origin" : "*", // Required for CORS support to work
				 "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
			}
		  }
	    };
	  	callback(null, RESPONSE.sceneSuccess);
      }    
    });
};

//":IOT_ENDPOINT," means to add the iot endpoint into that string ":alksjdflkajsdflkas.aksjdflkasjfl.askfjlk,"