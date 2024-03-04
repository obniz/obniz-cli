/* global $ */

$(() => {
  const update_device_list = device_info => {
    const devices = device_info.ports;
    $('#device').html('');
    if (devices) {
      devices.forEach(dev => {
        if (device_info.selected && dev.path === device_info.selected) {
          $('#device').append(
            `<option value="${dev.path}" selected>${dev.path}</option>`
          );
        } else {
          $('#device').append(
            `<option value="${dev.path}">${dev.path}</option>`
          );
        }
      });
    }
  };

  window.electron.deviceUpdated(update_device_list);
  const device_info = window.electron.devicePorts();

  const hardwares = window.electron.hardwares();
  if (hardwares) {
    $('#hardware').html('');
    hardwares.forEach(hw => {
      $('#hardware').append(
        `<option value="${hw.hardware}">${hw.hardware}</option>`
      );
    });

    const versions = window.electron.versions(hardwares[0].hardware);
    if (versions) {
      $('#os_ver').html('');
      versions.forEach(ver => {
        $('#os_ver').append(
          `<option value="${ver.version}">${hardwares[0].hardware}  - ${
            ver.version
          } ${ver.isPublic ? '' : '( Prerelease version )'}</option>`
        );
      });
    }
  }

  $('#hardware').on('change', () => {
    const hardware = $('#hardware').val();
    const versions = window.electron.versions(hardware);
    if (versions) {
      $('#os_ver').html('');
      versions.forEach(ver => {
        $('#os_ver').append(
          `<option value="${ver.version}">${hardware} - ${ver.version}</option>`
        );
      });
    }
  });
});
