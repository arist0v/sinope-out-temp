(function() {
    console.log("extension.js loaded");
    class sinopeOutTemp extends window.Extension {
        constructor(){
            super('sinope-out-temp');
            this.addMenuEntry('Sinope');
			this.sinopeMacOUI = "500b914"
			
            this.all_things = [];
            this.content = '';
			fetch(`/extensions/${this.id}/views/content.html`)
			.then((res) => res.text())
			.then((text) => {
				this.content = text;
				if( document.location.href.endsWith("sinope-out-temp") ){
					this.show();
				}
			})
			.catch((e) => console.error('Failed to fetch content:', e));
        }

        show(){
			if(this.content == ''){
				console.log("no content yet");
				return;
			}
			else{
                console.log("content available");
                this.view.innerHTML = this.content;
            
                API.getThings().then((things) => {
					const jwt = localStorage.getItem('jwt')
                	this.all_things = things;
                    console.log("things.length: ", things.length);
                
    				window.API.postJson(`${this.id}/api/load_links`,{'jwt': jwt})
    				.then((body) => {
                        
                        console.log('load_links response: ', body);
                    
    					if (body['state'] == 'ok'){
                            console.log("body['links']: ", body['links']);
    						if (body['links'] !== null){
                                this.sinope_link = JSON.parse(body['links']);
                				console.log("typeof this.sinope_link: ", typeof this.sinope_link);
                                console.log("this.sinope_link.length: ", this.sinope_link.length);
                                
                				let warningDiv = 'extension-sinope-out-temp-warning';
                				let listDiv = 'extension-sinope-out-temp-list';
                				let buttonDiv = 'extension-sinope-out-save-button'

                				this.sinope_thermostats = this.get_sinope_thermostat(things);
                				this.temperature_property = this.get_temp_property(things);
                				
                				if(this.sinope_thermostats.length < 1){
                					document.getElementById(warningDiv)
                					.innerHTML = 'No sinope Thermostat found. Did you have any on the gateway?'
                					return;
                				}

                				if(this.temperature_property.length < 1){
                					document.getElementById(warningDiv)
                					.innerHTML = 'No Temperature Property found on other devices.'
                					return;
                				}
                                
                                console.log("document.getElementById(listDiv): ", document.getElementById(listDiv));
                                
                				document.getElementById(listDiv)
                				.innerHTML = this.show_list(things);

                				document.getElementById(buttonDiv)
                				.innerHTML = '<button type=\'button\' id=\'extension-sinope-out-temp-save-button\'>Save</button></form>'
				
                				document.getElementById('extension-sinope-out-temp-save-button')
                				.addEventListener('click', () => {
                					this.save_config();
                				})
                            
    							
    						}else{
    							console.log("Warning, body links was null");
    						}
    					}else{
    						console.log("api responded with not ok state");
    					}
    				})
                    
				
    				

    				/*
    				window.API.postJson(
    					`/extensions/${this.id}]/api/init`,
    					{'action':'init' }
    				).then((body) => { 
    					console.log("init response: ");
    					console.log(body);
					
    					if( body['state'] != true ){
    						console.log("response was OK");
    					}
    					else{
    						console.log("response was not OK");
    					}

    				}).catch((e) => {
    					alert("connection error");
    				});*/
    			})
    			
            }
        }

		save_config(){
			let data = {}
			document.forms['thermostat_form'].forEach((formData) => {				
				data[formData.name] = formData.value
			})
			console.log(JSON.stringify(data))
			window.API.postJson(`${this.id}/api/save_links`,
			 {'links':JSON.stringify(data)}
			 ).then((body) => {
				 if (body['state'] != 'ok'){

				 }
			 }).catch((e)=>{

			 })

		}

		show_list(things){
			let i = 0;
			let listContent = "<form name=\'thermostat_form\'>";
			let thingName;
			let dropDown;
			this.sinope_thermostats.forEach((thingsID) => {
				for (let thing in things){
					if (things[thing]['id'] == thingsID){
						thingName = things[thing]['title']
					}
				}
				dropDown= this.get_dropDown(things, thingsID);
				listContent = listContent + '<div id =\'extension-sinope-out-temp-list-element\'>'
				 + 
				 'Sinope Thermostat : <span id=\'extension-sinope-out-temp-thing-name\'>' 
				 + 
				 thingName 
				 + 
				 '</span> will display Outside Temperature from source: <select name=\'sensor_' + thingsID + '\' id=\'sensor_' + thingsID + '\'>'
				 + 
				 dropDown 
				 +				 
				 '</div>';
				 i++;
			});

			return listContent;
		}

		get_dropDown(things, sinopeID){
			let selected = '';
			let tempDropdown = `
			<option value=\'none\'>None</option>
			`
			this.temperature_property.forEach((property) => {
				for (let thing in things){
					if (property[0] == things[thing]['id']){
						let thingName = things[thing]['title']
						for (let thingProperty in things[thing]['properties']){
							if (property[1] == things[thing]['properties'][thingProperty]['title']){
								
								if (this.sinope_link !== undefined){
									if (this.sinope_link.hasOwnProperty('sensor_'+ sinopeID)){
										
										if (this.sinope_link['sensor_'+ sinopeID] == thingName 
										+'_'
										+ property[1]){
											selected = 'selected'
										}
									}
								}
								tempDropdown = tempDropdown +
								'<option value=\'' 
								+ thingName 
								+'_'
								+ property[1] 
								+'\' '+ selected +'>' + thingName + ' > ' + property[1] 
								+ '</option>'
							}
						}
					}
				}
			})
			tempDropdown = tempDropdown + '</select>'
			return tempDropdown
		}

		get_sinope_thermostat(things){
			let sinopeTheromstats = []
			for (let key in things){
				if ((things[key]['@type'] == "Thermostat") && (things[key]['id']
				.indexOf(this.sinopeMacOUI) >= 0)){
					if (!sinopeTheromstats.includes(things[key]['id'])){
						//console.log('thermostats id: ' + things[key]['id'])
						sinopeTheromstats.push(things[key]['id']);
					}
				}
			}
			return sinopeTheromstats;
		};

		get_temp_property(things){
			let tempProperty = []
			for (let thing in things){
				let thingID = things[thing]['id']
				for (let property in things[thing]['properties']){
						let propertyTitle = things[thing]['properties'][property]['title']
						if (things[thing]['properties'][property]['@type'] == "TemperatureProperty"){
							if (!tempProperty.includes([thingID, propertyTitle])){
								if (thingID.indexOf(this.sinopeMacOUI) < 0){
									tempProperty.push([thingID, propertyTitle]);
								}
							}
						}
				}
			}
			return tempProperty;
		};
    }
    new sinopeOutTemp();
})();