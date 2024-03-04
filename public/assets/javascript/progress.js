/* global $ */
$(() => {
  const getSummary = () => {
    let settings = {};

    settings.whether_write = $('#whether_write').is(':checked');
    settings.whether_config = $('#whether_configure').is(':checked');
    settings.device = $('#device').val();
    settings.baudrate = parseInt($('#baudrate').val());
    if (settings.whether_write) {
      settings.hardware = $('#hardware').val();
      settings.os_ver = $('#os_ver').val();

      settings.target_device = $(
        '#write_options input[name="target_device"]:checked'
      ).val();

      switch (settings.target_device) {
        case 'new':
          settings.qrcode = $('#qrcode').val();
          break;

        case 'pregenerated':
          settings.obniz_id = $('#obniz_id').val();
          break;

        case 'os_only':
          break;
      }
    }

    settings.automatic_type = $(
      '#automatic_options input[name="setting_type"]:checked'
    ).val();

    let filename;
    switch (settings.automatic_type) {
      case 'same':
        settings.opname = $('#op_name').val();
        settings.indication_id = $('#indication_id').val();
        break;
      case 'individual':
        settings.description = $('#description').val();
        filename = $('#filename').html();
        if (filename !== 'No File Chosen') {
          settings.config_json = filename;
        }
        break;
    }
    // console.log(settings);
    return settings;
  };

  $('#write_options').on('change', () => {
    updateProgressBar();
  });

  let progressCount = 4;
  const updateProgressBar = () => {
    const settings = getSummary();
    if (settings.target_device === 'os_only') {
      $('#progress-step-3 > .progress').addClass('progress-w50');
      $('#progress-step-4').hide();
      progressCount = 3;
      console.log('hide step 4');
    } else {
      $('#progress-step-3 > .progress').removeClass('progress-w50');
      $('#progress-step-4').show();
      progressCount = 4;
      console.log('show step 4');
    }
  };

  const proceed = progres_number => {
    switch (progres_number) {
      case 1:
        $('.bs-wizard-step:nth-child(1)').addClass('complete');
        break;

      case 2:
        $('.bs-wizard-step:nth-child(2)').addClass('active');
        break;

      case 3:
        $('.bs-wizard-step:nth-child(2)').removeClass('active');
        $('.bs-wizard-step:nth-child(2)').addClass('complete');
        break;

      case 4:
        $('.bs-wizard-step:nth-child(3)').addClass('active');
        if (progressCount === 3) {
          $('.bs-wizard-step:nth-child(3) .progress .progress-bar').addClass(
            'progress-bar-w100'
          );
        } else {
          $('.bs-wizard-step:nth-child(3) .progress .progress-bar').removeClass(
            'progress-bar-w100'
          );
        }
        break;

      case 5:
        $('.bs-wizard-step:nth-child(3)').removeClass('active');
        $('.bs-wizard-step:nth-child(3)').addClass('complete');
        break;

      case 6:
        $('.bs-wizard-step:nth-child(4)').addClass('active');
        break;

      case 7:
        $('.bs-wizard-step:nth-child(4)').removeClass('active');
        $('.bs-wizard-step:nth-child(4)').addClass('complete');
        break;
    }
  };
  window.electron.proceed(proceed);
});
