$(document).ready(function () {
    // Init
    $('.image-section').hide();
    $('.loader').hide();
    $('#result').hide();
    var chart = null;
    var form_data = null;

    // Chart.js dark theme defaults
    Chart.defaults.color = '#a1a1aa';
    Chart.defaults.borderColor = '#27272a';

    $("#imageUpload").change(function () {
        handleFile(this.files[0]);
    });

    // Drag and drop
    var $uploadArea = $('#upload-area');

    $uploadArea.on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('drag-over');
    });

    $uploadArea.on('dragleave drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('drag-over');
    });

    $uploadArea.on('drop', function (e) {
        var file = e.originalEvent.dataTransfer.files[0];
        if (file && file.type.match(/image\/(png|jpe?g)/)) {
            // Set the file on the input so FormData picks it up
            var dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            $('#imageUpload')[0].files = dataTransfer.files;
            handleFile(file);
        }
    });

    function handleFile(file) {
        if (!file) return;
        // Hide upload area, show image + action buttons
        $('#upload-area').hide();
        $('.image-section').show();
        $('#btn-predict').show();
        $('#pred-label').text('');
        $('#result').hide();
        // Preview
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
            $('#imagePreview').hide();
            $('#imagePreview').fadeIn(650);
        }
        reader.readAsDataURL(file);
        form_data = new FormData($('#upload-file')[0]);
    }

    // Upload new image — restore dropzone
    $('#btn-upload-new').click(function () {
        $('.image-section').hide();
        $('#result').hide();
        $('#upload-area').show();
        $('#imageUpload').val('');
        form_data = null;
    });

    // Predict
    $('#btn-predict').click(function () {
        $(this).hide();
        $('.loader').show();

        $.ajax({
            type: 'POST',
            url: '/predict',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            async: true,
            success: function (data) {
                $('.loader').hide();
                $('#btn-predict').show();
                $('#result').fadeIn(600);
                $('#pred-label').text(data.prediction);

                var percentages = data.percentages;
                var labels = Object.keys(percentages);
                var values = Object.values(percentages);

                if (chart) {
                    chart.destroy();
                }

                chart = new Chart($('#chart'), {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Confidence (%)',
                            data: values,
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            borderColor: 'rgba(34, 197, 94, 0.8)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                max: 100,
                                grid: { color: '#27272a' },
                                ticks: { color: '#a1a1aa' }
                            },
                            y: {
                                grid: { display: false },
                                ticks: { color: '#a1a1aa', font: { size: 11 } }
                            }
                        }
                    }
                });
            },
        });
    });
});
