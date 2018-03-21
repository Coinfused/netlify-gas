'use strict';

var _ = lodash.load(); 

var NETLIFY_LIB = ( function ( ) {
  
  function NETLIFY_LIB ( ) {
    
    this.scriptId_ =  function () {
      
      return ScriptApp.getScriptId ( );
      
    };
  
    this.scriptUser_ = function () {
      
      return Session.getActiveUser ( ).getEmail ( );
      
    };
    
    this.NetlifyUser_ = function ( ) {
      
      return this.fetch_ ( "get", "accounts" ) [0] [ "slug" ];
      
    }; 
            
    this.defineEndpoint_ = function ( site, endpoint ) {
      
      if ( _.isNil ( site ) ) return endpoint
      
      else return "sites/" + site.replace("https://","").replace("http://","") + "/" + endpoint;
      
    };
        
    this.defineContentType_ = function ( payload, contentType ) {
      
      if ( !_.isNil ( contentType ) ) return contentType
      
      else if ( typeof payload === "object" || _.isNil ( payload ) ) return "application/json"
      
      else return "application/zip";
      
    };
    
    this.defineResponse_ = function ( request, contentType ) {
      
      if ( contentType === "application/vnd.bitballoon.v1.raw" ) return request.getBlob ( )
      
      else return JSON.parse ( request.getContentText ( ) );
      
    };
    
    this.definePayload_ = function ( method, payload ) {
      
      if ( method.toLowerCase() === "get" ) return null
      
      else if ( typeof payload === "object" ) return JSON.stringify ( payload )
      
      else return payload;
      
    };
    
    this.fetch_ = function ( method, endpoint, payload, contentType ) {
      
      var options_ = {
        
        method : method,
        
        payload : this.definePayload_ ( method, payload ),
        
        headers : {
          
          "User-Agent" : "Google Apps Script ID: " + this.scriptId_() + " User: " + this.scriptUser_(),
          
          "Authorization" :  "Bearer " + this.key.get(),
                    
          "Content-Type" : this.defineContentType_ ( payload, contentType )
        }
        
      };
      
      Logger.log(endpoint)
      Logger.log(options_.headers)
      var request = UrlFetchApp.fetch ( "https://api.netlify.com/api/v1/" + endpoint, options_ );
      
      return this.defineResponse_ ( request, contentType )
            
    };
        
    this.key = new store.APIKEY_LIB ( "netlify_" + this.scriptId_(), "max" );
    
    // this.dns = new DNS_LIB ( this, this.NetlifyUser_ ( ) );
    
    this.snippets = new OBJECT_LIB ( this, "snippets" );
    
    this.hooks = new OBJECT_LIB ( this, "hooks" );
    
    this.deploys = new OBJECT_LIB ( this, "deploys" );
    
    this.files = new OBJECT_LIB ( this, "files" );
    
  }
  
  NETLIFY_LIB.prototype.site_get = function ( site ) {

    return {
      snippets : this.snippets.get( site ),
      hooks : this.hooks.get( site ),
      deploys : this.deploys.get( site ),
      files: this.files.get( site )
    }
    
  };
  
  
  NETLIFY_LIB.prototype.user_get = function ( ) {

    return this.fetch_ ( "get", "user" );
    
  };
  
  NETLIFY_LIB.prototype.accounts_get = function ( ) {

    return this.fetch_ ( "get", "accounts" );
    
  };
  
  return NETLIFY_LIB;

}());


var SITE_LIB = (function ( dns ) {
  
  function RECORDS_LIB ( dns ) {
  
  };
  
  return RECORDS_LIB;
  
}());



var DNS_LIB = (function ( ) {
  
  function DNS_LIB ( ) {
      
    this.endpoint_ = "dns_zones";
    
    this.self = this;
        
  };
  
  DNS_LIB.prototype.get = function ( ) {
      
    this.self.fetch_.call ( this.self, "get", this.endpoint_ + "?account_slug=" + this.user_ );
    
  };
  
  DNS_LIB.prototype.add = function ( name ) {
  
    this.cb ( "post", this.endpoint_, {"account_slug" : this.user_, name : name} );
    
  };
  
  DNS_LIB.prototype.remove = function ( name ) {
          
    this.cb ( "delete", this.endpoint_ +  "/" + _.find ( this.get(), [ "name", name ] ) [ "id" ] );
    
  }
  
  return DNS_LIB;
  
}());




var RECORDS_LIB = (function ( dns ) {
  
  function RECORDS_LIB ( dns ) {
  
  };
  
  return RECORDS_LIB;
  
}());




var OBJECT_LIB = (function ( self, string ) {
  
  function OBJECT_LIB ( self, string ) {
    
    this.self = self;
    
    this.string = string;
    
    this.validateMethod_ = function ( method ) {
      switch ( _.toLower ( method ) ) {
        case 'get':
          var allowed = [ "snippets", "deploys", "files", "hooks", "forms" ];
          break;
        case 'add':
          var allowed = [ "snippets", "deploys", "files", "hooks" ];
          break;
        case 'update':
          var allowed = [ "snippets", "deploys", "files", "hooks" ];
          break;
        case 'destroy':
          var allowed = [ "sites", "submissions", "hooks" ];
          break;
        case 'restore':
          var allowed = [ "deploys" ];
          break;
        case 'types_get':
          var allowed = [ "hooks" ];
          break;
        case 'blob_get':
          var allowed = [ "files" ];
          break;
        default:
          var allowed = [];
      };
      
      if ( !_.includes(allowed, this.string ) ) throw this.string + " object doesn't support this method.";
    
    }
    
    this.defineObject = function () {
      switch ( _.toLower ( this.string ) ) {
        case 'snippets':
          var supportedMethos = ["gets", "get", "add", "update", "destroy"]
          var properties = [ "title", "general", "general_position", "goal", "goal_position" ];
          break;
        case 'hooks':
          var supportedMethos = ["gets", "get", "add", "update", "destroy", "types_get"]
          var properties = ["form_id", "type", "event", "data"];
          break;
        default:
          return;
      };    
    }
          
  };
  
    
  OBJECT_LIB.prototype.get = function ( site, id ) {
    
    this.validateMethod_("get")
                
    var endpoint = _.isNil ( id )  ? "sites/" + site + "/" + this.string : "sites/" + site + "/" + this.string + "/" + id;
    
    return this.self.fetch_ ( "get", endpoint );
    
  };
  
  OBJECT_LIB.prototype.blob_get = function ( site, id ) {
    
    this.validateMethod_("blob_get")
                        
    var blob = this.self.fetch_ ( "get", "sites/" + site + "/" + this.string + "/" + id, null, "application/vnd.bitballoon.v1.raw" );
    
    // return blob.getAs("image/png")
    
    var file = {
      title: id,
      mimeType: 'image/png'
    };
    
    file = Drive.Files.insert(file, blob);
    
  };
  
  
  OBJECT_LIB.prototype.destroy = function ( site, id ) {
    
    this.validateMethod_("destroy");
        
    return this.self.fetch_ ( "delete", "sites/" + site + "/" + this.string + "/" + id );
    
  };
  
  
  OBJECT_LIB.prototype.add = function ( site, payload ) {
        
    // var payload = _.zip ( this.argsNames, argsValues );
                
    return this.self.fetch_ ( "post", "sites/" + site + "/" + this.string, payload );
    
  };
  
  
  OBJECT_LIB.prototype.update = function ( site, id, payload ) {
                        
    return this.self.fetch_ ( "put", "sites/" + site + "/" + this.string + "/" + id , payload );
    
  };
  
  // For deploys only.
  OBJECT_LIB.prototype.restore = function ( site, id ) {
    
    if ( this.string !== "deploys" ) throw "Restore method works with deploys only";
            
    return this.self.fetch_ ( "post", "sites/" + site + "/deploys/" + id + "/restore" );
    
  };
  
  // For hooks only
  OBJECT_LIB.prototype.types_get = function ( site ) {
    
    this.validateMethod_("types_get");
        
    return this.self.fetch_ ( "get",  _.isNil ( site ) ? "hooks/types" : "hooks/types?site_id=" + site );
    
  };
    
  return OBJECT_LIB;
  
}());




function netlify_test () {
  
  var netlify = new NETLIFY_LIB ();
  
  // Logger.log(netlify.key.put("YOUR_NETLIFY_APIKEY_HERE"))
  // Logger.log(netlify.key.get())
  
  // Logger.log(netlify.user_get());
  // Logger.log(netlify.accounts_get());
  
  // Logger.log(netlify.site_get());
  
  // Logger.log(netlify.hooks.get("bitman.ga"));
  // Logger.log(netlify.hooks.types_get("bitman.ga"));
  
  Logger.log(netlify.files.get("sunsea.netlify.com", "sunsea.png"));
  Logger.log(netlify.files.blob_get("sunsea.netlify.com", "sunsea.png"));
  
}