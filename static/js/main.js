$(document).ready(function () {
    // Init
    $('.image-section').hide();
    $('.loader').hide();
    $('#result').hide();
    var chart = null;//Used to store the chart object
    var form_data = null;//Used to store the form data

    // Upload Preview
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
                $('#imagePreview').hide();
                $('#imagePreview').fadeIn(650);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    $("#imageUpload").change(function () {
        // Show image section and predict button if some image is uploaded in the form
        $('.image-section').show();
        $('#btn-predict').show();
        $('#pred-label').text('');
        $('#result').hide();
        readURL(this);
        form_data = new FormData($('#upload-file')[0]);
    });

    // Predict
    $('#btn-predict').click(function () {

        // Show loading animation
        $(this).hide();
        $('.loader').show();

        // Make prediction by calling api /predict
        $.ajax({
            type: 'POST',
            url: '/predict',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            async: true,
            success: function (data) {
                // Get and display the result
                $('.loader').hide();
                $('#btn-predict').show();
                $('#result').fadeIn(600);
                $('#pred-label').text(' Result:  ' + data.prediction);

                // Extract percentages data
                var percentages = data.percentages;

                // Prepare labels and values for the chart
                var labels = Object.keys(percentages);
                var values = Object.values(percentages);

                // Destroy existing chart if it exists
                if (chart) {
                    chart.destroy();
                }

                // Create chart
                chart = new Chart($('#chart'), {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Percentages',
                            data: values,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            },
        });
    });

});
