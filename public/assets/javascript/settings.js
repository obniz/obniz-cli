/* global $,ejs */

$(() => {
  const checkBothSwitcherDisabled = () => {
    const sw1 = $('#whether_write').is(':checked');
    const sw2 = $('#whether_configure').is(':checked');

    if (!sw1 && !sw2) {
      $('[id=write_btn]').addClass('disabled');
    } else {
      $('[id=write_btn]').removeClass('disabled');
    }
  };
  $('#whether_write').on('change', e => {
    const state = $('#whether_write').is(':checked');
    if (state) {
      $('#write_switcher.switch-container').removeClass('disabled');
      $('#write_switcher.switch-container input').removeAttr('disabled');
      $('#write_switcher.switch-container select').removeAttr('disabled');
    } else {
      $('#write_switcher.switch-container').addClass('disabled');
      $('#write_switcher.switch-container input').attr('disabled', true);
      $('#write_switcher.switch-container select').attr('disabled', true);
    }
    checkBothSwitcherDisabled();
  });

  $('#whether_configure').on('change', e => {
    const state = $('#whether_configure').is(':checked');
    if (state) {
      $('#config_switcher.switch-container').removeClass('disabled');
      $('#config_switcher.switch-container input').removeAttr('disabled');
      $('#config_switcher.switch-container select').removeAttr('disabled');
    } else {
      $('#config_switcher.switch-container').addClass('disabled');
      $('#config_switcher.switch-container input').attr('disabled', true);
      $('#config_switcher.switch-container select').attr('disabled', true);
    }
    checkBothSwitcherDisabled();
  });

  $('#write_options').on('change', () => {
    const setting = $(
      '#write_options input[name="target_device"]:checked'
    ).val();
    switch (setting) {
      case 'new':
        $('#targetDeviceTab #existingDevice').removeClass('active');
        $('#targetDeviceTab #newDevice').addClass('active');
        $('#specific_settings').removeAttr('hidden');
        break;

      case 'pregenerated':
        $('#targetDeviceTab #newDevice').removeClass('active');
        $('#targetDeviceTab #existingDevice').addClass('active');
        $('#specific_settings').removeAttr('hidden');
        break;

      case 'os_only':
        $('#targetDeviceTab #newDevice').removeClass('active');
        $('#targetDeviceTab #existingDevice').removeClass('active');
        $('#specific_settings').attr('hidden', true);
        break;
    }
  });

  $('#automatic_options').on('change', () => {
    const setting = $(
      '#automatic_options input[name="setting_type"]:checked'
    ).val();
    switch (setting) {
      case 'same':
        $('#automatic_settings #individual').removeClass('active');
        $('#automatic_settings #same').addClass('active');
        break;

      case 'individual':
        $('#automatic_settings #same').removeClass('active');
        $('#automatic_settings #individual').addClass('active');
        break;
    }
  });

  const writeStart = () => {
    $('#writeModal').modal('hide');
    $('#main_tab #settings_tab').removeClass('active');
    $('#main_tab #terminal_tab').addClass('active');

    $('.bs-wizard-step').removeClass('complete');
    $('.bs-wizard-step').removeClass('active');
    $('.bs-wizard-step').addClass('disabled');

    window.onresize();
    let settings = getSummary();

    if (settings.target_device === 'os_only') {
      window.electron.flash(settings);
    } else if (settings.whether_write) {
      window.electron.create(settings);
    } else if (settings.whether_config) {
      //ToDo: Config
      window.electron.config(settings);
    }

    $('[id=erase_btn]').addClass('disabled');
    $('[id=write_btn]').addClass('disabled');
    $('#back_to_setting').addClass('disabled');
    window.electron.finished(() => {
      $('[id=erase_btn]').removeClass('disabled');
      $('[id=write_btn]').removeClass('disabled');
      $('#back_to_setting').removeClass('disabled');
    });

    $('#config_specification').html('');
    $('#config_specification').html(
      ejs.render(
        `
      <li>Hardware: <%= settings.hardware %></li>
      <li>Version: <%= settings.os_ver %></li>
      <% if (settings.target_device === "new") {%>
        <li>Create new device</li>
        <% if (settings.qrcode) {%>
        <li>Link to QR Code</li>
        <% } %>
      <% } else if (settings.target_device === "pregenerated" ) { %>
        <li>Assign existing obniz</li>
      <% } else if (settings.target_device === "os_only") { %>
        <li>Flash OS only</li>
      <% } %>
      <% if(settings.automatic_type === "same") {%>
        <li>Automatic Settings: Using Operation</li>
        <li>Operation name: <%= settings.opname %></li>
        <li>Indication ID: <%= settings.indication_id %></li>
      <% } else {%>
        <li>Automatic Settings: Set Individually</li>
        <li>Description: <%= settings.description %></li>
        <li>Config File: <%= settings.config_json %></li>
      <% } %>
    `,
        { settings }
      )
    );
  };

  $('[id=write_btn]').on('click', () => {
    // const setting = $(
    //   '#write_options input[name="target_device"]:checked'
    // ).val();
    if (
      $('#new_device').is(':checked', true) &&
      $('#using_qr').is(':checked', true)
    ) {
      $('#writeModal').modal('show');
      $('#qrcode').val('');
    } else {
      writeStart();
    }
  });

  $('#writeModal').on('shown.bs.modal', () => {
    $('#qrcode').focus();
  });
  $('#write_start').on('click', writeStart);

  $('#config_json').on('click', event => {
    event.preventDefault();
    const filename = window.electron.opendialog();
    if (filename) {
      $('#filename').html(filename);
    }
  });

  $('#back_to_setting').on('click', event => {
    $('#main_tab #settings_tab').addClass('active');
    $('#main_tab #terminal_tab').removeClass('active');
  });

  $('#wifi_config_btn').on('click', () => {
    $('#wifiConfigModal').modal('show');
    window.terminalResize();
    setTimeout(() => {
      window.electron.configViaWifi({
        config: $('#wifi_config_filename').html(),
      });
    }, 1000);
  });

  $('#wifi_config_json').on('click', event => {
    event.preventDefault();
    const filename = window.electron.opendialog();
    if (filename) {
      $('#wifi_config_filename').html(filename);
      $('#wifi_config_btn').removeAttr('disabled');
    } else {
      $('#wifi_config_filename').html('No File Chosen');
      $('#wifi_config_btn').addAttr('disabled');
    }
  });

  $('#wifiConfigJsonCancel').on('click', () => {
    // hide modal
    $('#wifiConfigModal').modal('hide');
    window.electron.configViaWifiCancel();
  });

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
    console.log(settings);
    return settings;
  };
});
