"use strict";

var _ = lodashGas.load(); 


var NETLIFY_LIB = (function ( ) {
  
  function NETLIFY_LIB ( ) {
    
    this.snippets = new OBJECT_LIB ( "snippets" );

    this.scriptId_ = ScriptApp.getScriptId ( );
    
    this.token = new credentialsGas.APIKEY_LIB ( "netlify_" + this.scriptId_, "max" );

    this.baseUrl_ = "https://api.netlify.com/api/v1/";

    this.userAgent_ = "Google Apps Script " + this.scriptId_ + " " + Session.getActiveUser ( ).getEmail ( );
    
    this.service_ = "netlify_" + this.scriptId_;
        
    this.credentials_ = new credentialsGas.APIKEY_LIB ( this.service_, "max" );
    
    this.defineEndpoint_ = function ( site, endpoint ) {
      
      if ( _.isNil ( site ) ) return endpoint
      else return "sites/" + site.replace("https://","").replace("http://","") + "/" + endpoint;
    
    };
    
    this.defineContentType_ = function ( payload, contentType ) {

      if ( !_.isNil ( contentType ) ) return contentType
      else if ( typeof payload === "object" || _.isNil ( payload ) ) return "application/json"
      else return "application/zip";
    
    }; 
    
    this.definePayload_ = function ( method, payload ) {
      
      if ( method.toLowerCase() === "get" ) return null
      else if ( typeof payload === "object" ) JSON.stringify ( payload );
      else return payload;
    
    };
            
    this.fetch_ = function ( method, endpoint, payload, contentType ) {
      
      var contenttype =  this.defineContentType_ ( payload, contentType );
      
      var url = this.baseUrl_ + endpoint;
      
      var options = {
        muteHttpExceptions : true,
        followRedirects: true,
        validateHttpsCertificates: true,
        method : method,
        headers : {
          "User-Agent" : this.userAgent_,
          "Authorization" :  "Bearer " + this.credentials_.get ( ),
          "Accept" : this.defineContentType_ ( payload, contentType ),
          "Content-Type" : this.defineContentType_ ( payload, contentType )
        },
        payload : this.definePayload_ ( method, payload )
      }
      var response = UrlFetchApp.fetch ( url, options );
      var code = response.getResponseCode().toString().charAt(0)
      if ( ( code === "2" ) && response.getContentText ( ) === "") return
      else if ( code === "2" ) return JSON.parse ( response.getContentText ( ) )
      else throw response.getResponseCode() + " " + response.getContentText();
      
    };
    
    
  };
  
  NETLIFY_LIB.prototype.setToken = function ( name ) {
                
    var token = this.fetch_ ( "post", "oauth/applications/create_token",  { name : name } ) [ "token" ] [ "access_token" ];
                    
    return this.credentials_.put ( name, token )
    
  };
  
  
  NETLIFY_LIB.prototype.removeToken = function ( name ) {
     
     this.credentials_.remove ( name );
                    
     var key_id = _.find( this.fetch_ ( "get", "oauth/applications" ), [ 'name', name ] );
     
     if ( key_id ) var client_id = key_id [ "client_id" ]
     else throw name + " doesn't exist";
          
     this.fetch_ ( "DELETE", "oauth/applications/" + client_id );
     
     return name + " removed";
                        
  }; 
  

  NETLIFY_LIB.prototype.user = function ( ) {

    return this.fetch_ ( "get", "user" );
    
  };
  
  
  NETLIFY_LIB.prototype.accounts = function ( ) {

    return this.fetch_ ( "get", "accounts" );
    
  };
  
  NETLIFY_LIB.prototype.getSites = function ( site ) {
    
    return this.fetch_ ( "get", this.defineEndpoint_ ( site, "sites" ) );
    
  };
  
  
  NETLIFY_LIB.prototype.createSite = function ( name, custom_domain, password, force_ssl, processing_settings, repo ) {
        
    return this.fetch_ ( "post", "sites", argumentsGas.zipArguments ( arguments.callee, arguments , argumentsGas.removeNil_ ) );
    
  };
  
  
  NETLIFY_LIB.prototype.removeSite = function ( name ) {
        
    return this.fetch_ ( "delete", "sites/" + name );
    
  };
  
  
  NETLIFY_LIB.prototype.setSsl = function ( name ) {
        
    return this.fetch_ ( "post", "sites/" + name + "/ssl" );
    
  };
  
  
  NETLIFY_LIB.prototype.getForms = function ( site ) {
    
    return this.fetch_ ( "get", this.defineEndpoint_ ( site, "forms" ) );
    
  };
  
  
  NETLIFY_LIB.prototype.getSubmissions = function ( site ) {
    
    return this.fetch_ ( "get", this.defineEndpoint_ ( site, "submissions" ) );
    
  };

  
  NETLIFY_LIB.prototype.removeSubmission = function ( id ) {
    
    return this.fetch_ ( "delete", "submissions/" + id );
    
  };
  
  
  NETLIFY_LIB.prototype.getHooks = function ( site ) {
    
    return this.fetch_ ( "get",  _.isNil ( site ) ? "hooks" : "hooks?site_id=" + site );
    
  };
  
  
  NETLIFY_LIB.prototype.getHooksTypes = function ( site ) {
    
    return this.fetch_ ( "get",  _.isNil ( site ) ? "hooks/types" : "hooks/types?site_id=" + site );
    
  };
  
  
  NETLIFY_LIB.prototype.setHook = function ( site, form_id, type, event, data ) {
    
    var payload = _.omit ( argumentsGas.zipArguments ( arguments.callee, arguments , argumentsGas.removeNil_ ), [ "site" ] );
    
    return this.fetch_ ( "post", payload );
    
  };
  
  
  NETLIFY_LIB.prototype.removeHook = function ( hook_id ) {
    
    return this.fetch_ ( "delete", "hooks/" + hook_id );
    
  };
  

  NETLIFY_LIB.prototype.getFile = function ( site, file_path ) {
    
    return this.fetch_ ( "get", _.isNil ( file_path )  ? "sites/" + site + "/files" : "sites/" + site + "/files/" + file_path );
    
  };

  
  NETLIFY_LIB.prototype.getFileRaw = function ( site, file_path ) {
    
    return this.fetch_ ( "get", "sites/" + site + "/files/" + file_path, null, "application/vnd.bitballoon.v1.raw" );
    
  };
  
  
  NETLIFY_LIB.prototype.getSnippet = function ( site, id ) {
    
    return this.fetch_ ( "get", _.isNil ( id )  ? "sites/" + site + "/snippets" : "sites/" + site + "/snippets/" + id );
    
  };
  
  
  NETLIFY_LIB.prototype.setSnippet = function ( site, title, general, general_position, goal, goal_position ) {
    
    var payload = _.omit ( argumentsGas.zipArguments ( arguments.callee, arguments , argumentsGas.removeNil_ ), [ "site" ] );
    
    return this.fetch_ ( "post", "sites/" + site + "/snippets", payload );
    
  };
  
  
  NETLIFY_LIB.prototype.updateSnippet = function ( site, snippet_id, title, general, general_position, goal, goal_position ) {
    
    var payload = _.omit ( argumentsGas.zipArguments ( arguments.callee, arguments , argumentsGas.removeNil_ ), [ "site_id", "snippet_id" ] );
    
    return this.fetch_ ( "put", "sites/" + site + "/snippets/" + snippet_id, payload );
    
  };
  
  
  NETLIFY_LIB.prototype.removeSnippet = function ( snippet_id ) {
    
    return this.fetch_ ( "delete", "hooks/" + snippet_id );
    
  };
  
  
  NETLIFY_LIB.prototype.getMetadata = function ( site ) {
        
    return this.fetch_ ( "get", "sites/" + site + "/metadata" );
    
  };
  
  NETLIFY_LIB.prototype.updateMetadata = function ( site ) {
        
    return this.fetch_ ( "put", "sites/" + site + "/metadata" );
    
  };
  
  
  NETLIFY_LIB.prototype.getDeploy = function ( site, id ) {
            
    return this.fetch_ ( "get", _.isNil ( id )  ? "sites/" + site + "/deploys" : "sites/" + site + "/deploys/" + id );
    
  };
  
  
  NETLIFY_LIB.prototype.restoreDeploy = function ( site, id ) {
            
    return this.fetch_ ( "post", "sites/" + site + "/deploys/" + id + "/restore" );
    
  };
      
  return NETLIFY_LIB;
  

}());


  // add, update, remove, get




var OBJECT_LIB = (function ( string ) {
  
  function OBJECT_LIB ( string ) {
    
    this.string = string;
    
    this.argsNames = function () {
    
      if ( this.string === "snippets" ) return [ "title", "general", "general_position", "goal", "goal_position" ]
    }
          
  };
  
  
  OBJECT_LIB.prototype.get = function ( site, id ) {
    
    var endpoint = _.isNil ( id )  ? "sites/" + site + "/" + this.string : "sites/" + site + "/" + this.string + "/" + id;
    
    return new NETLIFY_LIB ( ).fetch_ ( "get", endpoint );
    
  };
  
  
  OBJECT_LIB.prototype.remove = function ( site, id ) {
        
    return new NETLIFY_LIB ( ).fetch_ ( "delete", "sites/" + site + "/" + this.string + "/" + id );
    
  };
  
  
  OBJECT_LIB.prototype.add = function ( site, payload ) {
        
    // var payload = _.zip ( this.argsNames, argsValues );
                
    return new NETLIFY_LIB ( ).fetch_ ( "post", "sites/" + site + "/" + this.string, payload );
    
  };
  
  
  OBJECT_LIB.prototype.update = function ( site, id, payload ) {
                        
    return new NETLIFY_LIB ( ).fetch_ ( "post", "sites/" + site + "/" + this.string + "/" + id , payload );
    
  };
    
  return OBJECT_LIB;
  
}());