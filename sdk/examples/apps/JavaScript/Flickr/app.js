App_Class = function (app, appAssets) {
	this._app = app;
	this._appAssets = appAssets;
};

App_Class.prototype.init = function () {

	this._container = $("#" + this._app.instanceId);
	this._app.updateHeight();
	
	console.log("¡Vamanos! Flickr...");
	this.getPhotos();
};

App_Class.prototype._handleViewChange = function() {

};

App_Class.prototype.getPhotos = function(){
	$.ajax({
		url: "http://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=aae088e057aaa1113de507d578453073&per_page=1&page=1&format=json",
		data: {},
		jsonpCallback: "jsonFlickrApi",
		dataType: "jsonp",
		context:this
	}).done(function(jqxhr,txtStatus){
		//F2.log(jqxhr)
		this.loadPhoto(jqxhr.photos.photo[0])
	}).fail(function(jqxhr,txtStatus){
		
	});
}

App_Class.prototype.loadPhoto = function(photo){
	var url = this.makePhotoURL(photo);
	//F2.log(url);
	$("#imgPlaceholder").html("<img src='"+url+"' class='img-polaroid' >");
}

//http://www.flickr.com/services/api/misc.urls.html
App_Class.prototype.makePhotoURL = function(photo){
	return ["http://farm", photo.farm, ".staticflickr.com/", photo.server, "/",photo.id, "_" ,photo.secret, ".jpg"].join("");
}