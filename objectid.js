function makeid()
{
    var text = "";
    var possible = "0123456789abcdef";

    for( var i=0; i < 24; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var echoliot = function (){
	console.log(makeid());
	setTimeout(echoliot, 500);
};

echoliot();