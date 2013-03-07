(function($){

	//ensure this is run from http://localhost
	if (location.protocol === "file:"){
		return;
	}

	// grab apps from storage
	var requestedApps = F2.Storage.getItem('requestedApps') || [];

	// setup modal
	var $modal = $('#languageSelect').modal({
		backdrop: 'static',
		keyboard: false, 
		show: false
	});

	// bind select apps
	$('#btnSelectApps').on('click', function() {
		$modal.modal('show');
	});

	// bind checkbox events
	$modal.on('change', 'input:checkbox', function() {
		if ($('input:checkbox:checked', $modal).length) {
			$('button.btn-primary', $modal).removeClass('disabled');
		} else {
			$('button.btn-primary', $modal).addClass('disabled');
		}
	});

	// bind save button
	$modal.on('click', 'button.btn-primary:not(.disabled)', function() {
		var apps = [];
		var storageItems = [];

		$('input:checked', $modal).map(function(i, el) {
			apps.push($(el).data('f2-app'));
			storageItems.push($(el).val());
		});

		$modal.modal('hide');

		// save apps to storage
		F2.Storage.setItem('requestedApps', storageItems);

		// remove all apps and add only the selected ones
		F2.removeAllApps();
		F2.registerApps(apps);
	});

	// show a loading mask and the modal if there were no requested apps
	if (!requestedApps.length) {
		F2.UI.showMask('', $('#languageSelect'), true);
		$modal.modal('show');
	}

	// load in app json
	$.getJSON('./js/sampleApps.js', function(allApps) {
		$.each(allApps, function(language, apps) {
			$('[data-language="' + language + '"]', $modal).append(
				$.map(apps, function(app, i) {
					return $('<label class="checkbox"></label>').append(
						$('<input type="checkbox" name="app" value="' + app.appId + '">').data('f2-app', app),
						' ' + app.name + (app.isSecure ? ' (Secure)' : '')
					);
				})
			);
		})

		// if no requested apps, hide the loader, otherwise register the apps
		if (!requestedApps.length) {
			F2.UI.hideMask('', $modal);

		} else {
			// check the appropriate boxes
			$.each(requestedApps, function(i, a) {
				$('input[name="app"][value="' + a + '"]', $modal).prop('checked', true);
			});

			// fire change event which should enable the Save button
			$('input:checkbox:first', $modal).change();

			// click the Save button
			$('button.btn-primary', $modal).click();
		}
	});

})(window.jQuery);