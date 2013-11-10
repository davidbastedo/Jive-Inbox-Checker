var transform = 
		{"tag":"div","class":"Inbox Entries", "html": "Jive CollectionID: ${jive.collection} | ObjectID: ${jive.objectID}", "children":[
			{"tag":"div","html":"${content}<br><br>"}
		]
		};
	
	 //Callback Function
     function process(json) {
        
    	if(json !== undefined )

      console.log("Before: " + json.list.length);
      json.list.filter(function(item, index, foo){
      console.log(json.list.length);
      console.log(json.list);
      if (index != 0 )
        console.log ("Checking entry " + index)
        while(json.list[index-1].jive.collection == json.list[index].jive.collection){
          console.log ("Need to remove entry " + index)
          json.list.splice(index, 1)
        }
      }else{
        console.log ("Skipping entry 0 check")
      }

    });
    console.log("After: " + json.list.length);

	        
			$('#inboxlist').json2html(json.list,transform);
    
	}


//process(jsn);

window.onload = function(){ runAPIcall(); }