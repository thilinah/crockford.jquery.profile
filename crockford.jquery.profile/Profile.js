function openMonitor(url){
		var w = screen.width-20;
		var h = (screen.height/3);
		var left = 0;
		var top = (screen.height/2);
		
		//var wnd = window.open(url, "Profiler - "+window.document.title, "width="+w+",height="+h+",left="+left+",top="+top);
	    var wnd = window.open(url);
	    
}

(function getScriptPath(){
	//Comment this if you are manually providing popup path due to cross domain issues
	
	var scripts= document.getElementsByTagName('script');
	
	for(index in scripts){
		script = scripts[index];
		if(script.src && script.src.indexOf("Profile.js") > -1){
			scriptPath = script.src.split("Profile.js")[0];
			break;
		}
	}
	var monitorHtmlPath = scriptPath+"monitor.html";
	openMonitor(monitorHtmlPath);
})();

//Define status vars

jQuery.accumulatedTime = {};
jQuery.lastTime = {};

//End

jQuery["setAccumulatedTime"] = function (table,label,timeDiff){
	
	if(jQuery.lastTime[table] == undefined || jQuery.lastTime[table] == null){
		jQuery.lastTime[table] = {};
	}
	
	if(jQuery.accumulatedTime[table] == undefined || jQuery.accumulatedTime[table] == null){
		jQuery.accumulatedTime[table] = {};
	}
	
	jQuery.lastTime[table][label] = timeDiff; 
	if(jQuery.accumulatedTime[table][label] == undefined || jQuery.accumulatedTime[table][label] == null){
		jQuery.accumulatedTime[table][label] = timeDiff;
	}else{
		jQuery.accumulatedTime[table][label] += timeDiff;
	}
}

jQuery["getAccumulatedTime"] = function (table,label){
	
	if(jQuery.lastTime[table] == undefined || jQuery.lastTime[table] == null){
		jQuery.lastTime[table] = {};
	}
	
	if(jQuery.accumulatedTime[table] == undefined || jQuery.accumulatedTime[table] == null){
		jQuery.accumulatedTime[table] = {};
	}
	
	if(jQuery.accumulatedTime[table][label] == undefined || jQuery.accumulatedTime[table][label] == null){
		return 0;
	}else{
		return jQuery.accumulatedTime[table][label];
	}
}

Function.prototype.method = function (name, func) {
    this.prototype[name] = function (){
    	var start = (new Date).getTime();
    	var res = func.apply(this,arguments);
    	var diff = (new Date).getTime() - start;
    	var methodName = name;
    	jQuery.setAccumulatedTime('methods',methodName, diff);
    	//console.log("Method:"+methodName+":"+ diff + "|"+ jQuery.getAccumulatedTime('methods',methodName));
    	if(res != undefined){
    		return res;
    	}
    };
    return this;
};


jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}
		
		
		var that = this;
		var start = (new Date).getTime();
		
		var newCallback = function(){
			var diff = (new Date).getTime() - start;
	    	var methodName = data['a'];
	    	jQuery.setAccumulatedTime('actions', methodName, diff);
	    	//console.log("Action:"+methodName + diff + "|" + jQuery.getAccumulatedTime('actions', methodName) );
	    	
	    	if(jQuery.isFunction(callback)){
	    		start = (new Date).getTime();
	    		callback.apply(that,arguments);
	    		diff = (new Date).getTime() - start;
	    		jQuery.setAccumulatedTime('actionCallbacks', methodName, diff);
	    	}
		};

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: newCallback
		});
	};
});


//Send data to monotor

function getData(table){
	var values;
	var data = {};
	var list = jQuery.lastTime[table];
	for(index in list){
		values = [];
		values.push({name:"last",value:jQuery.lastTime[table][index]});
		values.push({value:"accu",value:jQuery.accumulatedTime[table][index]});
		data[index] = values;
	}
	
	return data;
}


