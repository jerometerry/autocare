(function() {
	$(document).ready(function(){
		wireUpControls();
		refreshFileList();
	});

	function wireUpControls() {
		$("#upload_file_btn").click(function(e) {
			e.preventDefault();
			var file = getSelectedFile();
			uploadFile(file);
			return false;
		});

		$("#refresh_files_btn").click(function(e) {
			e.preventDefault();
			refreshFileList();
			return false;
		});

		$(document).on("click", ".s3-file-link", function(e) {
			e.preventDefault();
			var filename = $(this).text();
			downloadFile(filename);
			return false;
		});
	}

	function uploadFile(file) {
		if (!file) {
			alert('No file selected');
			return;
		}

		onUploadStarted();
		getUploadUrl(file)
	}
	
	function getUploadUrl(file) {
		$.ajax({
			dataType: 'json',
			url: "/api/files/uploadurl",
			data: {
				file_name: file.name,
				file_type: file.type
			},
			success: function(response) {
				handleGetUploadUrlResponse(response, file);
			}, 
			error: function() {
				onUploadError();
			}
		});
	}
	
	function handleGetUploadUrlResponse(response, file) {
		if (response) {
			if (response.error) {
				onUploadError();
			} else if (response.url) {
				uploadDirectToS3(response.url, file);
			} else {
				onUploadError();
			}
		} else {
			onUploadError();
		}
	}

	function uploadDirectToS3(signedS3UploadUrl, file) {
		var xhr = new XMLHttpRequest();
		xhr.open("PUT", signedS3UploadUrl);
		xhr.setRequestHeader('x-amz-acl', 'public-read');
		xhr.onload = function() {
			if (xhr.status === 200) {
				onUploadSuccess(file);
			} else {
				onUploadError();
			}
		};
		xhr.onerror = function() {
			onUploadError();
		};
		xhr.send(file);
	}

	function downloadFile(filename) {
		$.ajax({
			dataType: 'json',
			url: '/api/files/downloadurl',
			data: {
				file_name: filename
			},
			success: function(response) {
				window.open(response.url, '_blank');
			}
		});
	}

	function refreshFileList() {
		var files$ = $("#file_list").empty();
		$.ajax({
			dataType: 'json',
			url: '/api/metadata',
			success: function(response) {
				handleGetMetadataResponse(response);
			}
		});
	}
	
	function handleGetMetadataResponse(response) {
		if (response && response.results && response.results.Items && Array.isArray(response.results.Items)) {
			var files$ = $("#file_list");
			response.results.Items.forEach(function(element, index) {
				var download_link$ = $("<a class='s3-file-link' href='#'/>").text(element.ObjectKey);
				var item$ = $("<li/>").append(download_link$);
				files$.append(item$);
			});
		}
	}

	function addMetadata(file) {
		$.ajax({
			dataType: 'json',
			url: '/api/metadata',
			method: 'PUT',
			data: { file_name: file.name },
			success: function(response) {
			}
		});
	}
	
	function onUploadError() {
		hideWaitDialog();
	}

	function onUploadStarted() {
		showWaitDialog();
	}

	function onUploadSuccess(file) {
		addMetadata(file);
		refreshFileList();
		hideWaitDialog();
	}

	function showWaitDialog() {
		$('#myPleaseWait').modal('show');
	}

	function hideWaitDialog() {
		$('#myPleaseWait').modal('hide');
	}
	
	function getSelectedFile() {
		return document.getElementById('file_input').files[0];
	}
})();