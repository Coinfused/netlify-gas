function netlify_test() {

  // NETLIFY_TOKEN_PUT ( "f01242e3103882eff6704afbc4e638a794eda9cf97b472de65b483fec486c8da" );
  /*
  Logger.log ( NETLIFY_USER_GET ( ) );

  Logger.log ( NETLIFY_ACCOUNTS_GET ( ) );
  
  Logger.log ( NETLIFY_SITES_GET ( ) );
  
  var id = NETLIFY_SITES_GET ( ) [ 0 ] [ "id" ];
  Logger.log( NETLIFY_SITE_GET ( id ) );
  
  var url = NETLIFY_SITES_GET ( ) [ 0 ] [ "url" ];
  Logger.log( NETLIFY_SITE_GET ( url ) );

  Logger.log( NETLIFY_TOKEN_NEW ( "foo" ) );
  
  Logger.log( NETLIFY_TOKEN_REMOVE ( "foo" ) );
  
  Logger.log( NETLIFY_TOKEN_REMOVE ( "bar" ) );
  */
}

function test () {
   var netlify = new NETLIFY_LIB ( );
   // Logger.log(netlify.getHooksTypes( "9d853411-dc74-486d-9920-2691854dd399" ))
   Logger.log(netlify.snippets.remove ("9d853411-dc74-486d-9920-2691854dd399", 0));
           /*
   Logger.log(netlify.snippets.add ("9d853411-dc74-486d-9920-2691854dd399", JSON.stringify({
     general: "\u003Cscript\u003Ealert(\“Hello\“)\u003C/script\u003E",
     general_position: "head",
     title : "testapi"
   })));
   */
   var foo = netlify.snippets.get("9d853411-dc74-486d-9920-2691854dd399")
   Logger.log ( foo );
}