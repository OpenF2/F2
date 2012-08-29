App_Class = function (app, appAssets) {
	this._app = app;
	this._appAssets = appAssets;
};

App_Class.prototype.init = function () {

	this._container = $("#" + this._app.instanceId);
	this._app.updateHeight();
	
	this.bindEvents();

	console.log("¡Vámonos! Flickr interestingness coming up...");

	this.getPhotos();
};

App_Class.prototype.bindEvents = function(){
	var self = this;

	// bind 'about this app' change event
	F2.Events.on(F2.Constants.Events.APP_VIEW_CHANGE + this._app.instanceId, $.proxy(this._handleViewChange, this));

	//bind 'back to home' event 
	$("div[data-f2-view='about'] a", this._container).bind("click",function(e){
		self._handleViewChange("home");
	});
}

App_Class.prototype._handleViewChange = function(view) {

	$("div." + F2.Constants.Css.APP_VIEW, this._container).addClass("hide");
	$("div." + F2.Constants.Css.APP_VIEW + "[data-f2-view='"+view+"']", this._container).removeClass("hide");

	this._app.updateHeight();
};

App_Class.prototype.getPhotos = function(){
	$.ajax({
		url: "http://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=40a949bcac34140aaf6321f9c384f4bd&per_page=1&page=1&format=json",
		data: {},
		jsonpCallback: "jsonFlickrApi",
		dataType: "jsonp",
		context:this
	}).done(function(jqxhr,txtStatus){
		//F2.log(jqxhr)
		this.loadPhoto(jqxhr.photos.photo[0]);
	}).fail(function(jqxhr,txtStatus){
		$("div.imgPlaceholder", this._container).html("Booof! Flickr or something failed.");
	});
}

App_Class.prototype.loadPhoto = function(photo){
	var url = this.makePhotoURL(photo);
	//F2.log(url);
	$("div.imgPlaceholder", this._container).html("<img src='"+url+"' class='img-polaroid' >");
}

App_Class.prototype.makePhotoURL = function(photo){
	//see: http://www.flickr.com/services/api/misc.urls.html
	return ["http://farm", photo.farm, ".staticflickr.com/", photo.server, "/",photo.id, "_" ,photo.secret, ".jpg"].join("");
}