function sendVideoForAnalysis(file, hoopLeft, hoopRight) {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('hoopLeft', JSON.stringify(hoopLeft));
    formData.append('hoopRight', JSON.stringify(hoopRight));
    formData.append('showAngle', sessionStorage.getItem("showAngle") === "true");

    $.ajax({
        url: 'http://localhost:5000/upload-and-analyze',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: (data) => {
            if (data.success) {
                $("#upload-button").text("COMPLETED").css("background-color", "#149D2F");

                // Display the results
                if (sessionStorage.getItem("showAngle") === "false") {
                    displayFGResults(data.data);
                } else {
                    displayAnalysisResults(data.data);
                }
            } else {
                $("#upload-button").text("ERROR").css("background-color", "#FF0000");
                console.error('Analysis failed:', data.error);
                alert('Analysis failed: ' + data.error);
            }
        },
        error: (error) => {
            $("#upload-button").text("ERROR").css("background-color", "#FF0000");
            console.error('Error:', error);
            alert('Error processing video: ' + error.message);
        }
    });
}